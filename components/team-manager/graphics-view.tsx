'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Image, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Lineup, MatchRecord, Player, Team } from './types'
import type { GraphicType } from './lineup-view'

interface Props {
  team: Team | null
  players: Player[]
  lineup: Lineup
  graphicType: GraphicType
  matches: MatchRecord[]
  onSaveMatch: (match: MatchRecord) => void
}

type GraphicFormat = 'landscape' | 'square' | 'story'
type GraphicTheme = 'night' | 'paper'
const dimensions: Record<GraphicFormat, { width: number; height: number; label: string }> = {
  landscape: { width: 1200, height: 675, label: 'Landscape · 16:9' },
  square: { width: 1080, height: 1080, label: 'Square · 1:1' },
  story: { width: 1080, height: 1920, label: 'Story · 9:16' },
}

function drawScoreline(
  canvas: HTMLCanvasElement,
  values: {
    teamName: string
    teamShortName: string
    teamColor: string
    opponent: string
    competition: string
    matchDate: string
    venue: 'Home' | 'Away'
    teamScore: string
    opponentScore: string
    format: GraphicFormat
    theme: GraphicTheme
  },
) {
  const { width, height } = dimensions[values.format]
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return

  const accent = values.teamColor || '#EF233C'
  const isPaper = values.theme === 'paper'
  const background = context.createLinearGradient(0, 0, width, height)
  background.addColorStop(0, isPaper ? '#F2F1E8' : '#13271F')
  background.addColorStop(1, isPaper ? '#DFE5D6' : '#263D31')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  context.save()
  context.globalAlpha = isPaper ? 0.12 : 0.16
  context.fillStyle = accent
  context.beginPath()
  context.arc(width * 0.92, height * 0.12, height * 0.24, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.arc(width * 0.04, height * 0.9, height * 0.32, 0, Math.PI * 2)
  context.fill()
  context.restore()

  const inset = width * 0.075
  context.strokeStyle = isPaper ? 'rgba(24,53,43,.22)' : 'rgba(255,255,255,.22)'
  context.lineWidth = Math.max(2, width * 0.002)
  context.strokeRect(inset, inset, width - inset * 2, height - inset * 2)

  const textColor = isPaper ? '#18352B' : '#F6F7EF'
  const mutedColor = isPaper ? '#52645A' : 'rgba(246,247,239,.68)'
  const topY = values.format === 'story' ? height * 0.2 : height * 0.21
  const cardY = values.format === 'story' ? height * 0.31 : height * 0.31
  const cardHeight = values.format === 'story' ? height * 0.3 : height * 0.38
  const centerY = cardY + cardHeight * 0.58

  context.textBaseline = 'middle'
  context.textAlign = 'left'
  context.fillStyle = accent
  context.font = `800 ${Math.round(width * 0.019)}px Arial, sans-serif`
  context.fillText('TOUCHLINE  /  MATCHDAY', inset + width * 0.045, topY - height * 0.07)

  context.fillStyle = mutedColor
  context.font = `700 ${Math.round(width * 0.014)}px Arial, sans-serif`
  const competition = values.competition.trim().toUpperCase() || 'MATCH RESULT'
  context.fillText(competition.slice(0, 42), inset + width * 0.045, topY)
  if (values.matchDate) {
    context.textAlign = 'right'
    context.fillText(new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(`${values.matchDate}T00:00:00`)), width - inset - width * 0.045, topY)
  }

  context.fillStyle = isPaper ? 'rgba(255,255,255,.82)' : 'rgba(255,255,255,.075)'
  context.fillRect(inset + width * 0.035, cardY, width - 2 * (inset + width * 0.035), cardHeight)
  context.strokeStyle = isPaper ? 'rgba(24,53,43,.12)' : 'rgba(255,255,255,.11)'
  context.strokeRect(inset + width * 0.035, cardY, width - 2 * (inset + width * 0.035), cardHeight)

  const leftLabel = values.teamShortName.trim().toUpperCase() || values.teamName.trim().toUpperCase() || 'YOUR CLUB'
  const rightLabel = values.opponent.trim().toUpperCase() || 'OPPONENT'
  const labelY = cardY + cardHeight * 0.28
  context.fillStyle = textColor
  context.font = `800 ${Math.round(width * 0.031)}px Arial, sans-serif`
  context.textAlign = 'left'
  context.fillText(leftLabel.slice(0, 18), inset + width * 0.085, labelY, width * 0.27)
  context.textAlign = 'right'
  context.fillText(rightLabel.slice(0, 18), width - inset - width * 0.085, labelY, width * 0.27)

  const scoreText = values.teamScore || values.opponentScore
    ? `${values.teamScore || '0'}  —  ${values.opponentScore || '0'}`
    : '—  :  —'
  context.textAlign = 'center'
  context.fillStyle = textColor
  context.font = `900 ${Math.round(width * 0.09)}px Arial, sans-serif`
  context.fillText(scoreText, width / 2, centerY, width * 0.73)

  context.fillStyle = accent
  context.fillRect(width / 2 - width * 0.035, cardY + cardHeight * 0.84, width * 0.07, Math.max(4, height * 0.006))

  context.textAlign = 'left'
  context.fillStyle = mutedColor
  context.font = `700 ${Math.round(width * 0.014)}px Arial, sans-serif`
  context.fillText(values.venue.toUpperCase(), inset + width * 0.045, height - inset - height * 0.055)
  context.textAlign = 'right'
  context.fillText('BUILT FOR THE NEXT 90', width - inset - width * 0.045, height - inset - height * 0.055)
}

function drawStartingXI(
  canvas: HTMLCanvasElement,
  values: { teamName: string; teamShortName: string; teamColor: string; lineup: Lineup; players: Player[] },
) {
  const width = 1080
  const height = 1350
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return

  const accent = values.teamColor || '#EF233C'
  const background = context.createLinearGradient(0, 0, width, height)
  background.addColorStop(0, '#3b0b12')
  background.addColorStop(0.55, '#8f1428')
  background.addColorStop(1, '#24070d')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  context.globalAlpha = 0.2
  context.fillStyle = '#ff5266'
  context.beginPath()
  context.arc(width * 0.12, height * 0.82, height * 0.3, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.arc(width * 0.88, height * 0.24, height * 0.22, 0, Math.PI * 2)
  context.fill()
  context.globalAlpha = 1

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = 'rgba(246,247,239,.72)'
  context.font = '700 22px Arial, sans-serif'
  context.fillText(values.teamShortName.trim().toUpperCase() || values.teamName.trim().toUpperCase() || 'YOUR CLUB', width / 2, 108)
  context.fillStyle = '#f5f7ff'
  context.font = '900 78px Arial, sans-serif'
  context.fillText('STARTING ', width / 2 - 46, 220)
  context.fillStyle = '#ef202f'
  context.fillText('XI', width / 2 + 225, 220)
  context.fillStyle = 'rgba(246,247,239,.62)'
  context.font = '700 24px Arial, sans-serif'
  context.fillText(values.lineup.formation, width / 2, 274)

  const selected = values.lineup.slots.filter((slot) => slot.playerId).map((slot) => ({
    slot,
    player: values.players.find((player) => player.id === slot.playerId),
  })).filter((entry): entry is { slot: typeof entry.slot; player: Player } => Boolean(entry.player))
  const rowStart = 370
  const rowGap = 72
  context.strokeStyle = '#ef202f'
  context.lineWidth = 5
  context.beginPath()
  context.moveTo(width / 2 - 190, rowStart - 34)
  context.lineTo(width / 2 - 190, rowStart + rowGap * 10 + 20)
  context.stroke()
  context.textAlign = 'left'
  selected.slice(0, 11).forEach(({ slot, player }, index) => {
    const y = rowStart + index * rowGap
    context.fillStyle = accent
    context.font = '800 28px Arial, sans-serif'
    context.fillText(String(player.number).padStart(2, '0'), width / 2 - 180, y)
    context.fillStyle = '#f6f7ef'
    context.font = '800 30px Arial, sans-serif'
    context.fillText(player.name.toUpperCase().slice(0, 24), width / 2 - 115, y)
    context.fillStyle = 'rgba(246,247,239,.42)'
    context.font = '700 17px Arial, sans-serif'
    context.fillText(slot.label.toUpperCase(), width / 2 + 230, y)
    context.strokeStyle = 'rgba(255,255,255,.12)'
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(width / 2 - 180, y + 27)
    context.lineTo(width / 2 + 270, y + 27)
    context.stroke()
  })

  context.textAlign = 'center'
  context.fillStyle = accent
  context.font = '800 18px Arial, sans-serif'
  const bench = values.players.filter((player) => !values.lineup.slots.some((slot) => slot.playerId === player.id)).slice(0, 5)
  context.fillText(`SUBS  /  ${bench.map((player) => player.name.toUpperCase()).join('  ·  ') || 'ADD SQUAD PLAYERS'}`, width / 2, height - 105)
  context.fillStyle = 'rgba(246,247,239,.46)'
  context.font = '700 16px Arial, sans-serif'
  context.fillText('MATCHDAY LINEUP', width / 2, height - 62)
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'matchday'
}

export function GraphicsView({ team, players, lineup, graphicType, matches, onSaveMatch }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [opponent, setOpponent] = useState('')
  const [competition, setCompetition] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [venue, setVenue] = useState<'Home' | 'Away'>('Home')
  const [teamScore, setTeamScore] = useState('')
  const [opponentScore, setOpponentScore] = useState('')
  const [format, setFormat] = useState<GraphicFormat>('landscape')
  const [theme, setTheme] = useState<GraphicTheme>('night')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    if (graphicType === 'list') {
      drawStartingXI(canvasRef.current, {
        teamName: team?.name ?? '',
        teamShortName: team?.shortName ?? '',
        teamColor: team?.primaryColor ?? '#18d978',
        lineup,
        players,
      })
      return
    }
    drawScoreline(canvasRef.current, {
      teamName: team?.name ?? '',
      teamShortName: team?.shortName ?? '',
      teamColor: team?.primaryColor ?? '#EF233C',
      opponent,
      competition,
      matchDate,
      venue,
      teamScore,
      opponentScore,
      format,
      theme,
    })
  }, [team?.name, team?.shortName, team?.primaryColor, players, lineup, opponent, competition, matchDate, venue, teamScore, opponentScore, format, graphicType, theme])

  const hasOneScoreOnly = Boolean(teamScore) !== Boolean(opponentScore)
  const canSaveMatch = opponent.trim().length > 0 && !hasOneScoreOnly

  function downloadGraphic() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${slug(team?.shortName || team?.name || 'club')}-${slug(opponent || (graphicType === 'list' ? 'starting-xi' : 'scoreline'))}.png`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }

  function saveMatch() {
    if (!canSaveMatch) return
    const hasScore = Boolean(teamScore && opponentScore)
    onSaveMatch({
      id: globalThis.crypto.randomUUID(),
      opponent: opponent.trim(),
      competition: competition.trim(),
      matchDate,
      venue,
      status: hasScore ? 'Final' : 'Upcoming',
      teamScore: hasScore ? Number(teamScore) : null,
      opponentScore: hasScore ? Number(opponentScore) : null,
    })
    setSaved(true)
  }

  const recentMatches = [...matches].sort((a, b) => b.matchDate.localeCompare(a.matchDate)).slice(0, 4)

  return (
    <section className="page-section" aria-labelledby="graphics-heading">
      <div className="page-intro">
        <div>
          <p className="section-kicker">MATCHDAY STUDIO</p>
          <h2 id="graphics-heading" className="page-intro-title">Make the score the story.</h2>
          <p className="page-intro-copy">Build a matchday graphic, preview it live, and export a crisp PNG for your channels.</p>
        </div>
        <span className="studio-badge"><Sparkles aria-hidden="true" /> PNG EXPORT</span>
      </div>

      <div className="graphics-layout">
        <section className="content-card graphics-controls" aria-label="Scoreline graphic settings">
          <div className="card-section-heading">
            <div>
              <p className="section-kicker">GRAPHIC DETAILS</p>
              <h3 className="card-title">Set the scene</h3>
            </div>
            <span className="step-badge">01</span>
          </div>

          <div className="form-grid">
            <label className="form-field form-field--wide">
              <span>Opponent</span>
              <input className="form-control" value={opponent} onChange={(event) => { setOpponent(event.target.value); setSaved(false) }} placeholder="Enter opponent name" maxLength={48} />
            </label>
            <label className="form-field form-field--wide">
              <span>Competition or occasion</span>
              <input className="form-control" value={competition} onChange={(event) => { setCompetition(event.target.value); setSaved(false) }} placeholder="League, cup, friendly…" maxLength={48} />
            </label>
            <label className="form-field">
              <span>Date</span>
              <input className="form-control" type="date" value={matchDate} onChange={(event) => { setMatchDate(event.target.value); setSaved(false) }} />
            </label>
            <label className="form-field">
              <span>Venue</span>
              <select className="form-control" value={venue} onChange={(event) => setVenue(event.target.value as 'Home' | 'Away')}>
                <option value="Home">Home</option>
                <option value="Away">Away</option>
              </select>
            </label>
            <label className="form-field">
              <span>Your score</span>
              <input className="form-control" type="number" min={0} max={99} inputMode="numeric" value={teamScore} onChange={(event) => { setTeamScore(event.target.value); setSaved(false) }} placeholder="—" />
            </label>
            <label className="form-field">
              <span>Opponent score</span>
              <input className="form-control" type="number" min={0} max={99} inputMode="numeric" value={opponentScore} onChange={(event) => { setOpponentScore(event.target.value); setSaved(false) }} placeholder="—" />
            </label>
          </div>

          <fieldset className="graphic-theme-fieldset">
            <legend>Graphic style</legend>
            <div className="theme-choice-row">
              <label className={`theme-choice theme-choice--night${theme === 'night' ? ' theme-choice--active' : ''}`}>
                <input type="radio" name="graphic-theme" checked={theme === 'night'} onChange={() => setTheme('night')} />
                <span className="theme-swatch" />
                <span><strong>Floodlights</strong><small>Deep green</small></span>
              </label>
              <label className={`theme-choice theme-choice--paper${theme === 'paper' ? ' theme-choice--active' : ''}`}>
                <input type="radio" name="graphic-theme" checked={theme === 'paper'} onChange={() => setTheme('paper')} />
                <span className="theme-swatch" />
                <span><strong>Touchline</strong><small>Warm paper</small></span>
              </label>
            </div>
          </fieldset>

          <label className="form-field format-select">
            <span>Export size</span>
            <select className="form-control" value={format} onChange={(event) => setFormat(event.target.value as GraphicFormat)}>
              {(Object.keys(dimensions) as GraphicFormat[]).map((key) => <option key={key} value={key}>{dimensions[key].label}</option>)}
            </select>
          </label>

          <div className="graphics-actions">
            <Button type="button" size="lg" onClick={downloadGraphic}>
              <Download data-icon="inline-start" aria-hidden="true" />
              Download PNG
            </Button>
            <Button type="button" size="lg" variant="outline" disabled={!canSaveMatch} onClick={saveMatch}>
              <Plus data-icon="inline-start" aria-hidden="true" />
              {saved ? 'Saved to match list' : 'Save match'}
            </Button>
          </div>
          {hasOneScoreOnly ? <p className="form-hint form-hint--error">Enter both scores or leave both blank.</p> : null}
          <p className="form-hint">The graphic updates as you edit. Match details stay in this preview for now.</p>
        </section>

        <section className="content-card graphics-preview-card" aria-label="Live scoreline preview">
          <div className="preview-card-header">
            <div>
              <p className="section-kicker">LIVE PREVIEW</p>
              <h3 className="card-title">{graphicType === 'list' ? 'Your Starting XI list poster' : 'Your matchday card'}</h3>
            </div>
            <span className="live-dot"><span /> Updating</span>
          </div>
          <div className={`graphic-preview-shell graphic-preview-shell--${format}`}>
            <canvas
              ref={canvasRef}
              className="graphic-preview-canvas"
              role="img"
              aria-label={`Scoreline graphic preview: ${team?.name || 'Your club'} against ${opponent || 'opponent'}, ${teamScore || '—'} to ${opponentScore || '—'}`}
            >
              Scoreline graphic preview.
            </canvas>
          </div>
          <div className="graphic-preview-caption">
            <span><span className="preview-caption-dot" /> {dimensions[format].label}</span>
            <span>{team?.shortName || 'YOUR CLUB'} <span aria-hidden="true">·</span> {opponent.trim() || 'OPPONENT'}</span>
          </div>
        </section>
      </div>

      <section className="content-card match-history-card" aria-labelledby="match-history-heading">
        <div className="roster-toolbar">
          <div><p className="section-kicker">ARCHIVE</p><h3 id="match-history-heading" className="card-title">Match list</h3></div>
          <span className="small-count">{matches.length} {matches.length === 1 ? 'match' : 'matches'}</span>
        </div>
        {recentMatches.length ? (
          <div className="match-history-list">
            {recentMatches.map((match) => (
              <div key={match.id} className="match-history-row">
                <div className="match-date-block">
                  <strong>{match.matchDate ? new Intl.DateTimeFormat('en', { day: '2-digit' }).format(new Date(`${match.matchDate}T00:00:00`)) : '—'}</strong>
                  <small>{match.matchDate ? new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(`${match.matchDate}T00:00:00`)) : 'DATE TBC'}</small>
                </div>
                <div className="match-history-copy"><strong>{match.opponent}</strong><small>{match.competition || 'Matchday'} · {match.venue}</small></div>
                <span className={`match-status match-status--${match.status.toLowerCase()}`}>{match.status}</span>
                <strong className="match-history-score">{match.teamScore === null ? 'vs' : `${match.teamScore} — ${match.opponentScore}`}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="match-history-empty"><Image aria-hidden="true" /><span>Your saved match details will appear here.</span></div>
        )}
      </section>
    </section>
  )
}
