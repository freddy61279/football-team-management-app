'use client'

import { useMemo, useState } from 'react'
import { ArrowUp, Check, Plus, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getFormationSlots } from './formation-data'
import type { Formation, Lineup, LineupSlot, Player } from './types'
import { getInitials } from './types'

export type GraphicType = 'scoreline' | 'starting-xi'

interface Props {
  players: Player[]
  lineup: Lineup
  graphicType: GraphicType
  onGraphicTypeChange: (type: GraphicType) => void
  onSave: (lineup: Lineup) => void
  onAddPlayer: () => void
}

const formationOptions: Formation[] = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2']

export function LineupView({ players, lineup, graphicType, onGraphicTypeChange, onSave, onAddPlayer }: Props) {
  const [formation, setFormation] = useState<Formation>(lineup.formation)
  const [slots, setSlots] = useState<LineupSlot[]>(() => getFormationSlots(lineup.formation, lineup.slots))
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const assignedIds = useMemo(
    () => new Set(slots.flatMap((slot) => slot.playerId ? [slot.playerId] : [])),
    [slots],
  )
  const assignedCount = assignedIds.size
  const selectedSlot = slots.find((slot) => slot.id === activeSlotId) ?? null
  const selectedPlayer = selectedSlot?.playerId
    ? players.find((player) => player.id === selectedSlot.playerId) ?? null
    : null
  const availablePlayers = players.filter((player) => {
    const isAssignedElsewhere = slots.some((slot) => slot.id !== activeSlotId && slot.playerId === player.id)
    return player.availability === 'Available' && !isAssignedElsewhere
  })
  const benchPlayers = players.filter((player) => !assignedIds.has(player.id))

  function changeFormation(nextFormation: Formation) {
    setFormation(nextFormation)
    setSlots((current) => getFormationSlots(nextFormation, current))
    setActiveSlotId(null)
    setSaved(false)
  }

  function assignPlayer(playerId: string | null) {
    if (!activeSlotId) return
    setSlots((current) => current.map((slot) => ({
      ...slot,
      playerId: slot.id === activeSlotId ? playerId : slot.playerId === playerId ? null : slot.playerId,
    })))
    setSaved(false)
  }

  function saveLineup() {
    onSave({ formation, slots })
    setSaved(true)
  }

  return (
    <section className="page-section" aria-labelledby="lineup-heading">
      <div className="page-intro">
        <div>
          <p className="section-kicker">TACTICAL BOARD</p>
          <h2 id="lineup-heading" className="page-intro-title">Pick your shape.</h2>
          <p className="page-intro-copy">Choose a formation, then tap a position to build your starting eleven.</p>
        </div>
        <div className="lineup-header-actions">
          <label className="formation-select">
            <span>Formation</span>
            <select value={formation} onChange={(event) => changeFormation(event.target.value as Formation)}>
              {formationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <Button type="button" onClick={saveLineup} disabled={assignedCount === 0}>
            <Check data-icon="inline-start" aria-hidden="true" />
            {saved ? 'Lineup saved' : 'Save selection'}
          </Button>
        </div>
      </div>

      <fieldset className="graphic-theme-fieldset lineup-graphic-type-fieldset">
        <legend>Lineup graphic</legend>
        <div className="theme-choice-row">
          <label className={`theme-choice${graphicType === 'scoreline' ? ' theme-choice--active' : ''}`}>
            <input type="radio" name="lineup-graphic-type" checked={graphicType === 'scoreline'} onChange={() => onGraphicTypeChange('scoreline')} />
            <span className="theme-swatch theme-swatch--scoreline" />
            <span><strong>Scoreline</strong><small>Existing match card</small></span>
          </label>
          <label className={`theme-choice${graphicType === 'starting-xi' ? ' theme-choice--active' : ''}`}>
            <input type="radio" name="lineup-graphic-type" checked={graphicType === 'starting-xi'} onChange={() => onGraphicTypeChange('starting-xi')} />
            <span className="theme-swatch theme-swatch--lineup" />
            <span><strong>Starting XI</strong><small>Attached poster style</small></span>
          </label>
        </div>
      </fieldset>

      <div className="lineup-layout">
        <section className="content-card lineup-board-card" aria-label={`${formation} formation pitch`}>
          <div className="lineup-board-header">
            <div>
              <p className="section-kicker">STARTING XI</p>
              <h3>{assignedCount}<span> / 11 selected</span></h3>
            </div>
            <div className="attack-direction"><ArrowUp aria-hidden="true" /><span>ATTACK</span></div>
          </div>
          <div className="pitch-wrap">
            <div className="pitch-lines" aria-hidden="true">
              <span className="pitch-half-line" />
              <span className="pitch-center-circle" />
              <span className="pitch-box pitch-box--top" />
              <span className="pitch-box pitch-box--bottom" />
              <span className="pitch-goal pitch-goal--top" />
              <span className="pitch-goal pitch-goal--bottom" />
            </div>
            {slots.map((slot) => {
              const player = slot.playerId ? players.find((item) => item.id === slot.playerId) : null
              return (
                <button
                  key={slot.id}
                  type="button"
                  className={`pitch-player${player ? ' pitch-player--filled' : ' pitch-player--empty'}${activeSlotId === slot.id ? ' pitch-player--active' : ''}`}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                  aria-label={player ? `${slot.label}, ${player.name}. Select to change.` : `Assign a player to ${slot.label}`}
                  aria-pressed={activeSlotId === slot.id}
                  onClick={() => setActiveSlotId((current) => current === slot.id ? null : slot.id)}
                >
                  <span className="pitch-player-number">{player ? String(player.number).padStart(2, '0') : <Plus aria-hidden="true" />}</span>
                  <span className="pitch-player-name">{player ? player.name.split(' ')[0] : slot.label}</span>
                </button>
              )
            })}
          </div>
          <div className="lineup-board-footer">
            <span><span className="legend-dot legend-dot--selected" /> Selected</span>
            <span><span className="legend-dot legend-dot--open" /> Open position</span>
            <span>{players.length} squad {players.length === 1 ? 'player' : 'players'}</span>
          </div>
        </section>

        <aside className="lineup-side-column">
          <section className="content-card slot-picker-card" aria-live="polite">
            <div className="side-card-heading">
              <span className="side-card-icon"><Shield aria-hidden="true" /></span>
              <div>
                <p className="section-kicker">POSITION DETAILS</p>
                <h3>{selectedSlot ? selectedSlot.label : 'Select a position'}</h3>
              </div>
            </div>
            {selectedSlot ? (
              <>
                <p className="card-copy">{selectedPlayer ? `${selectedPlayer.name} is assigned here.` : 'Choose an available player for this spot.'}</p>
                {selectedPlayer ? (
                  <div className="selected-player-card">
                    <span className="player-initials">{getInitials(selectedPlayer.name)}</span>
                    <span><strong>{selectedPlayer.name}</strong><small>{selectedPlayer.position} · #{selectedPlayer.number}</small></span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => assignPlayer(null)}>Clear</Button>
                  </div>
                ) : null}
                <div className="slot-candidate-list">
                  {availablePlayers.length > 0 ? availablePlayers.map((player) => (
                    <button key={player.id} type="button" className="slot-candidate" onClick={() => assignPlayer(player.id)}>
                      <span className="slot-candidate-number">{String(player.number).padStart(2, '0')}</span>
                      <span className="slot-candidate-copy"><strong>{player.name}</strong><small>{player.position}</small></span>
                      <Plus aria-hidden="true" />
                    </button>
                  )) : (
                    <div className="slot-empty-copy">
                      <p>{players.length === 0 ? 'Add players before filling your lineup.' : 'No unassigned available players.'}</p>
                      {players.length === 0 ? <Button type="button" variant="outline" size="sm" onClick={onAddPlayer}>Add a player</Button> : null}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="slot-empty-copy slot-empty-copy--center">
                <p>Tap any marker on the pitch to assign or change a player.</p>
              </div>
            )}
          </section>

          <section className="content-card bench-card">
            <div className="side-card-heading">
              <span className="side-card-icon side-card-icon--muted"><Users aria-hidden="true" /></span>
              <div><p className="section-kicker">SQUAD</p><h3>Not in the XI <span>{benchPlayers.length}</span></h3></div>
            </div>
            {benchPlayers.length ? (
              <div className="bench-list">
                {benchPlayers.slice(0, 6).map((player) => (
                  <div key={player.id} className="bench-list-row">
                    <span className="bench-number">{String(player.number).padStart(2, '0')}</span>
                    <span><strong>{player.name}</strong><small>{player.position}</small></span>
                  </div>
                ))}
                {benchPlayers.length > 6 ? <p className="bench-more">+{benchPlayers.length - 6} more in the squad</p> : null}
              </div>
            ) : (
              <p className="card-copy bench-empty">Your bench will fill as you add players to the lineup.</p>
            )}
          </section>
        </aside>
      </div>
    </section>
  )
}
