'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, Plus, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Player, PlayerPosition } from './types'
import { getInitials } from './types'

interface Props {
  players: Player[]
  onAddPlayer: () => void
  onOpenPlayer: (player: Player) => void
}

const positionOptions: Array<'All positions' | PlayerPosition> = [
  'All positions',
  'Goalkeeper',
  'Defender',
  'Midfielder',
  'Forward',
]

export function PlayersView({ players, onAddPlayer, onOpenPlayer }: Props) {
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState<'All positions' | PlayerPosition>('All positions')

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return players.filter((player) => {
      const matchesSearch =
        !normalizedSearch ||
        player.name.toLowerCase().includes(normalizedSearch) ||
        String(player.number).includes(normalizedSearch)
      const matchesPosition = position === 'All positions' || player.position === position
      return matchesSearch && matchesPosition
    })
  }, [players, position, search])

  const availableCount = players.filter((player) => player.availability === 'Available').length

  return (
    <section className="page-section" aria-labelledby="players-heading">
      <div className="page-intro">
        <div>
          <p className="section-kicker">SQUAD DIRECTORY</p>
          <h2 id="players-heading" className="page-intro-title">Know your players.</h2>
          <p className="page-intro-copy">Profiles, availability, and performance notes for the people behind the badge.</p>
        </div>
        <Button type="button" size="lg" onClick={onAddPlayer}>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Add player
        </Button>
      </div>

      <div className="roster-summary-row">
        <div className="roster-summary">
          <strong>{players.length}</strong><span>players in squad</span>
        </div>
        <span className="summary-divider" aria-hidden="true" />
        <div className="roster-summary">
          <strong>{availableCount}</strong><span>available for selection</span>
        </div>
        <div className="roster-summary-note">Select a player to open their profile.</div>
      </div>

      <section className="content-card roster-card" aria-label="Player roster">
        <div className="roster-toolbar">
          <div>
            <h3 className="card-title">First team</h3>
            <p className="card-copy">A clear view of your current squad.</p>
          </div>
          <div className="toolbar-controls">
            <label className="input-with-icon">
              <Search aria-hidden="true" />
              <span className="sr-only">Search players</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search players"
              />
            </label>
            <label className="select-control">
              <span className="sr-only">Filter by position</span>
              <select value={position} onChange={(event) => setPosition(event.target.value as typeof position)}>
                {positionOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="roster-empty">
            <span className="empty-icon"><Users aria-hidden="true" /></span>
            <h3>Your roster starts with one player.</h3>
            <p>Add a profile to track squad numbers, position, availability, and notes.</p>
            <Button type="button" variant="outline" onClick={onAddPlayer}>
              <Plus data-icon="inline-start" aria-hidden="true" />
              Add your first player
            </Button>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="roster-empty roster-empty--compact">
            <h3>No players match that search.</h3>
            <p>Try another name, squad number, or position.</p>
          </div>
        ) : (
          <div className="roster-table-wrap">
            <table className="roster-table">
              <thead>
                <tr>
                  <th scope="col">Player</th>
                  <th scope="col">Position</th>
                  <th scope="col">Availability</th>
                  <th scope="col" className="numeric-cell">Apps</th>
                  <th scope="col" className="numeric-cell">G / A</th>
                  <th scope="col"><span className="sr-only">Open profile</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <button type="button" className="player-cell-button" onClick={() => onOpenPlayer(player)}>
                        <span className="player-number">{String(player.number).padStart(2, '0')}</span>
                        <span className="player-initials">{getInitials(player.name)}</span>
                        <span className="player-cell-copy">
                          <strong>{player.name}</strong>
                          <small>{player.preferredFoot} foot</small>
                        </span>
                      </button>
                    </td>
                    <td><span className="position-label">{player.position}</span></td>
                    <td>
                      <span className={`status-pill status-pill--${player.availability.toLowerCase()}`}>
                        <span />{player.availability}
                      </span>
                    </td>
                    <td className="numeric-cell">{player.appearances}</td>
                    <td className="numeric-cell">{player.goals} / {player.assists}</td>
                    <td className="row-action-cell">
                      <Button type="button" variant="ghost" size="icon" aria-label={`Open ${player.name} profile`} onClick={() => onOpenPlayer(player)}>
                        <ChevronRight aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
