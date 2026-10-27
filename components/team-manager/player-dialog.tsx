'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  PLAYER_AVAILABILITY,
  PLAYER_POSITIONS,
  getInitials,
  type Player,
  type PlayerAvailability,
  type PlayerPosition,
  type PreferredFoot,
} from './types'

interface Props {
  open: boolean
  player: Player | null
  onOpenChange: (open: boolean) => void
  onSave: (player: Player) => void
  onDelete: (playerId: string) => void
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return null
  const birthday = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(birthday.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birthday.getFullYear()
  const beforeBirthday =
    now.getMonth() < birthday.getMonth() ||
    (now.getMonth() === birthday.getMonth() && now.getDate() < birthday.getDate())
  if (beforeBirthday) age -= 1
  return age
}

export function PlayerDialog({ open, player, onOpenChange, onSave, onDelete }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editing, setEditing] = useState(!player)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    if (open) {
      setEditing(!player)
      setConfirmDelete(false)
    }
  }, [open, player?.id])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const name = String(values.get('name') ?? '').trim()
    if (!name) return

    onSave({
      id: player?.id ?? globalThis.crypto.randomUUID(),
      name,
      number: Number(values.get('number') ?? 0),
      position: String(values.get('position') ?? 'Midfielder') as PlayerPosition,
      availability: String(values.get('availability') ?? 'Available') as PlayerAvailability,
      preferredFoot: String(values.get('preferredFoot') ?? 'Right') as PreferredFoot,
      dateOfBirth: String(values.get('dateOfBirth') ?? ''),
      appearances: Number(values.get('appearances') ?? 0),
      goals: Number(values.get('goals') ?? 0),
      assists: Number(values.get('assists') ?? 0),
      notes: String(values.get('notes') ?? '').trim(),
    })
  }

  function confirmRemove() {
    if (!player) return
    onDelete(player.id)
    setConfirmDelete(false)
  }

  const age = player ? calculateAge(player.dateOfBirth) : null

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog player-dialog"
      aria-labelledby="player-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        onOpenChange(false)
      }}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) onOpenChange(false)
      }}
    >
      <div className="modal-content">
        <header className="modal-header">
          <div>
            <p className="section-kicker">SQUAD PROFILE</p>
            <h2 id="player-dialog-title" className="modal-title">
              {player ? (editing ? 'Edit player' : 'Player profile') : 'Add a player'}
            </h2>
            <p className="modal-copy">
              {player ? 'Keep the details that help you make the next selection.' : 'Add a player to your squad.'}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="icon-button"
            aria-label="Close player profile"
            onClick={() => onOpenChange(false)}
          >
            <span aria-hidden="true">×</span>
          </Button>
        </header>

        {player && !editing ? (
          <div className="profile-view">
            <div className="profile-header">
              <span className="profile-avatar">{getInitials(player.name)}</span>
              <div className="profile-heading">
                <p className="player-number-large">{String(player.number).padStart(2, '0')}</p>
                <h3>{player.name}</h3>
                <p>{player.position}{age !== null ? ` · ${age} years old` : ''}</p>
              </div>
              <span className={`status-pill status-pill--${player.availability.toLowerCase()}`}>
                <span />
                {player.availability}
              </span>
            </div>
            <div className="profile-stats">
              <div className="profile-stat"><strong>{player.appearances}</strong><span>Appearances</span></div>
              <div className="profile-stat"><strong>{player.goals}</strong><span>Goals</span></div>
              <div className="profile-stat"><strong>{player.assists}</strong><span>Assists</span></div>
              <div className="profile-stat"><strong>{player.preferredFoot}</strong><span>Preferred foot</span></div>
            </div>
            <section className="profile-note">
              <p className="section-kicker">COACH&apos;S NOTES</p>
              <p>{player.notes || 'No notes added yet.'}</p>
            </section>
            {confirmDelete ? (
              <div className="delete-confirmation" role="alert">
                <p>Remove {player.name} from this roster?</p>
                <div className="button-row">
                  <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>Keep player</Button>
                  <Button type="button" variant="destructive" onClick={confirmRemove}>Remove player</Button>
                </div>
              </div>
            ) : null}
            <footer className="form-actions form-actions--split">
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>Remove</Button>
              <div className="button-row">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
                <Button type="button" onClick={() => setEditing(true)}>Edit profile</Button>
              </div>
            </footer>
          </div>
        ) : (
          <form key={`${player?.id ?? 'new'}-${open}-${editing}`} onSubmit={handleSubmit}>
            <fieldset className="form-fieldset">
              <legend className="sr-only">Player details</legend>
              <div className="form-grid">
                <label className="form-field form-field--wide">
                  <span>Full name</span>
                  <input className="form-control" name="name" defaultValue={player?.name ?? ''} placeholder="Player name" autoComplete="name" maxLength={80} required />
                </label>
                <label className="form-field">
                  <span>Squad number</span>
                  <input className="form-control" name="number" type="number" min={1} max={99} defaultValue={player?.number ?? ''} required />
                </label>
                <label className="form-field">
                  <span>Position</span>
                  <select className="form-control" name="position" defaultValue={player?.position ?? 'Midfielder'}>
                    {PLAYER_POSITIONS.map((position) => <option key={position}>{position}</option>)}
                  </select>
                </label>
                <label className="form-field">
                  <span>Availability</span>
                  <select className="form-control" name="availability" defaultValue={player?.availability ?? 'Available'}>
                    {PLAYER_AVAILABILITY.map((availability) => <option key={availability}>{availability}</option>)}
                  </select>
                </label>
                <label className="form-field">
                  <span>Preferred foot</span>
                  <select className="form-control" name="preferredFoot" defaultValue={player?.preferredFoot ?? 'Right'}>
                    <option>Right</option><option>Left</option><option>Both</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>Date of birth</span>
                  <input className="form-control" name="dateOfBirth" type="date" defaultValue={player?.dateOfBirth ?? ''} />
                </label>
                <label className="form-field">
                  <span>Appearances</span>
                  <input className="form-control" name="appearances" type="number" min={0} max={1000} defaultValue={player?.appearances ?? 0} />
                </label>
                <label className="form-field">
                  <span>Goals</span>
                  <input className="form-control" name="goals" type="number" min={0} max={1000} defaultValue={player?.goals ?? 0} />
                </label>
                <label className="form-field">
                  <span>Assists</span>
                  <input className="form-control" name="assists" type="number" min={0} max={1000} defaultValue={player?.assists ?? 0} />
                </label>
                <label className="form-field form-field--wide">
                  <span>Coach&apos;s notes</span>
                  <textarea className="form-control form-textarea" name="notes" defaultValue={player?.notes ?? ''} placeholder="Strengths, focus areas, or anything to remember…" maxLength={500} rows={4} />
                </label>
              </div>
            </fieldset>
            <footer className="form-actions">
              <Button type="button" variant="outline" onClick={() => player ? setEditing(false) : onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save player profile</Button>
            </footer>
          </form>
        )}
      </div>
    </dialog>
  )
}
