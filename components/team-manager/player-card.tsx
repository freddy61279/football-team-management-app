'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { ArrowUpRight, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Player } from './types'
import { getInitials } from './types'

const HEADSHOT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_HEADSHOT_BYTES = 5 * 1024 * 1024

interface Props {
  player: Player
  onOpenPlayer: (player: Player) => void
  onUploadHeadshot: (playerId: string, headshot: string) => void
}

async function createHeadshotDataUrl(file: File) {
  if (typeof createImageBitmap !== 'function') {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Image could not be read'))
      reader.onerror = () => reject(new Error('Image could not be read'))
      reader.readAsDataURL(file)
    })
  }

  const bitmap = await createImageBitmap(file)
  try {
    const maxEdge = 512
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image could not be processed')
    context.drawImage(bitmap, 0, 0, width, height)
    return canvas.toDataURL('image/webp', 0.84)
  } finally {
    bitmap.close()
  }
}

export function PlayerCard({ player, onOpenPlayer, onUploadHeadshot }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const jerseyNumber = String(player.number).padStart(2, '0')

  async function handleHeadshotChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    setUploadError('')
    if (!HEADSHOT_TYPES.has(file.type)) {
      setUploadError('Choose a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_HEADSHOT_BYTES) {
      setUploadError('Choose an image smaller than 5 MB.')
      return
    }

    setIsProcessing(true)
    try {
      const headshot = await createHeadshotDataUrl(file)
      onUploadHeadshot(player.id, headshot)
    } catch {
      setUploadError('This image could not be opened. Try another file.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <article className="player-card">
      <div className="player-card-media">
        {player.headshot ? (
          <img
            className="player-card-headshot"
            src={player.headshot}
            alt={`${player.name} headshot`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="player-card-fallback" aria-hidden="true">
            <span className="player-card-fallback-number">{jerseyNumber}</span>
            <span className="player-card-fallback-initials">{getInitials(player.name)}</span>
          </div>
        )}
        <div className="player-card-media-gradient" aria-hidden="true" />
        <span className="player-card-number">#{jerseyNumber}</span>
        <span className={`status-pill player-card-availability status-pill--${player.availability.toLowerCase()}`}>
          <span />{player.availability}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="player-card-photo-button"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          aria-label={`${player.headshot ? 'Change' : 'Upload'} ${player.name}'s headshot`}
        >
          <Camera data-icon="inline-start" aria-hidden="true" />
          {isProcessing ? 'Processing' : player.headshot ? 'Change photo' : 'Upload headshot'}
        </Button>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-hidden="true"
          onChange={handleHeadshotChange}
          tabIndex={-1}
        />
      </div>

      <div className="player-card-content">
        <div className="player-card-title-row">
          <div className="player-card-title-copy">
            <p className="player-card-position">{player.position}</p>
            <h3>{player.name}</h3>
            <p className="player-card-meta">{player.preferredFoot} foot · Squad #{jerseyNumber}</p>
          </div>
          <span className="player-card-marker" aria-hidden="true">TL</span>
        </div>

        <div className="player-card-stats" aria-label={`${player.appearances} appearances, ${player.goals} goals, ${player.assists} assists`}>
          <div><strong>{player.appearances}</strong><span>Appearances</span></div>
          <div><strong>{player.goals}</strong><span>Goals</span></div>
          <div><strong>{player.assists}</strong><span>Assists</span></div>
        </div>

        {uploadError ? <p className="player-card-upload-error" role="alert">{uploadError}</p> : null}

        <Button type="button" variant="ghost" size="sm" className="player-card-profile-action" onClick={() => onOpenPlayer(player)}>
          View player profile
          <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
    </article>
  )
}
