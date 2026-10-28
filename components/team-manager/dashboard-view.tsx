'use client'

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Image,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getInitials, type Lineup, type MatchRecord, type Player, type Team, type ViewKey } from './types'

interface Props {
  team: Team | null
  players: Player[]
  lineup: Lineup
  matches: MatchRecord[]
  onCreateTeam: () => void
  onAddPlayer: () => void
  onOpenPlayer: (player: Player) => void
  onNavigate: (section: ViewKey) => void
}

function formatMatchDate(value: string) {
  if (!value) return 'Date to be confirmed'
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function StatCard({ label, value, detail, icon: Icon, accent }: {
  label: string
  value: number
  detail: string
  icon: typeof Users
  accent: 'lime' | 'orange' | 'blue' | 'dark'
}) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className={`stat-icon stat-icon--${accent}`}><Icon aria-hidden="true" /></span>
        <span className="stat-card-label">{label}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      <span className="stat-footnote">{detail}</span>
    </article>
  )
}

export function DashboardView({ team, players, lineup, matches, onCreateTeam, onAddPlayer, onOpenPlayer, onNavigate }: Props) {
  const available = players.filter((player) => player.availability === 'Available').length
  const injured = players.filter((player) => player.availability === 'Injured').length
  const unavailable = players.filter((player) => player.availability === 'Unavailable').length
  const selectedCount = lineup.slots.filter((slot) => slot.playerId).length
  const nextMatch = matches
    .filter((match) => match.status === 'Upcoming')
    .sort((a, b) => a.matchDate.localeCompare(b.matchDate))[0]
  const recentPlayers = players.slice(0, 4)
  const recentMatches = [...matches].sort((a, b) => b.matchDate.localeCompare(a.matchDate)).slice(0, 3)

  return (
    <section className="page-section" aria-labelledby="overview-heading">
      <div className="page-intro">
        <div>
          <p className="section-kicker">CLUB OPERATIONS</p>
          <h2 id="overview-heading" className="page-intro-title">A better view of every matchday.</h2>
          <p className="page-intro-copy">Keep your squad, selection, and matchday story moving in the same direction.</p>
        </div>
        <div className="page-intro-actions">
          <Button type="button" variant="outline" size="lg" onClick={() => onNavigate('lineup')}>
            Open lineup <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
          <Button type="button" size="lg" onClick={onAddPlayer}>
            <Plus data-icon="inline-start" aria-hidden="true" />Add player
          </Button>
        </div>
      </div>

      <section className={`hero-card${team ? '' : ' hero-card--setup'}`} aria-label="Club setup">
        <div className="hero-copy">
          <p className="hero-eyebrow"><span /> THE TOUCHLINE, AT A GLANCE</p>
          <h3>{team?.name || 'Make this your club.'}</h3>
          <p>{team ? 'Your squad hub is ready. Add player profiles and shape your next starting eleven.' : 'Set your club name and colors, then start building a squad workspace that feels like yours.'}</p>
          <Button type="button" variant="secondary" size="lg" onClick={onCreateTeam}>
            {team ? 'Edit club profile' : 'Set up your club'}
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
        <div className="hero-graphic" aria-label={team?.emblemUrl ? `${team.name} club emblem` : 'Club emblem not uploaded'}>
          <div className="hero-ring hero-ring--outer" aria-hidden="true" />
          <div className="hero-ring hero-ring--inner" aria-hidden="true" />
          <div
            className="hero-club-mark"
            style={{ '--club-accent': team?.primaryColor ?? '#B8E95B' } as React.CSSProperties}
          >
            {team?.emblemUrl ? (
              <img src={team.emblemUrl} alt={`${team.name} club emblem`} />
            ) : (
              <span aria-hidden="true">+</span>
            )}
          </div>
          <span className="hero-coordinate" aria-hidden="true">00° 00&apos; / TEAM HQ</span>
        </div>
        <span className="hero-index">01</span>
      </section>

      <div className="stats-grid" aria-label="Team summary">
        <StatCard label="Squad size" value={players.length} detail={players.length === 1 ? 'player profile' : 'player profiles'} icon={Users} accent="lime" />
        <StatCard label="Available" value={available} detail={players.length ? `${injured} injured · ${unavailable} unavailable` : 'ready for selection'} icon={ShieldCheck} accent="orange" />
        <StatCard label="Starting XI" value={selectedCount} detail="positions filled" icon={Activity} accent="blue" />
        <StatCard label="Match list" value={matches.length} detail={matches.length === 1 ? 'saved match' : 'saved matches'} icon={CalendarDays} accent="dark" />
      </div>

      <div className="dashboard-grid">
        <section className="content-card readiness-card" aria-labelledby="readiness-heading">
          <div className="card-heading-row">
            <div><p className="section-kicker">SQUAD STATUS</p><h3 id="readiness-heading" className="card-title">Availability at a glance</h3></div>
            <Button type="button" variant="ghost" size="icon" aria-label="Open player roster" onClick={() => onNavigate('players')}><ArrowUpRight aria-hidden="true" /></Button>
          </div>
          {players.length ? (
            <div className="availability-breakdown">
              <div className="availability-total"><strong>{available}</strong><span>available today</span></div>
              <div className="availability-track" aria-label={`${available} of ${players.length} players available`}>
                <span className="availability-fill availability-fill--available" style={{ width: `${(available / players.length) * 100}%` }} />
                <span className="availability-fill availability-fill--injured" style={{ width: `${(injured / players.length) * 100}%` }} />
                <span className="availability-fill availability-fill--unavailable" style={{ width: `${(unavailable / players.length) * 100}%` }} />
              </div>
              <div className="availability-legend">
                <span><i className="legend-dot legend-dot--available" />Available <b>{available}</b></span>
                <span><i className="legend-dot legend-dot--injured" />Injured <b>{injured}</b></span>
                <span><i className="legend-dot legend-dot--unavailable" />Unavailable <b>{unavailable}</b></span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => onNavigate('players')}>View full roster <ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
            </div>
          ) : (
            <div className="card-empty card-empty--row">
              <span className="empty-icon empty-icon--small"><Users aria-hidden="true" /></span>
              <div><strong>No players added yet</strong><p>Start a roster to see availability and selection readiness.</p></div>
              <Button type="button" variant="outline" size="sm" onClick={onAddPlayer}>Add player</Button>
            </div>
          )}
        </section>

        <section className="content-card next-match-card" aria-labelledby="next-match-heading">
          <div className="card-heading-row">
            <div><p className="section-kicker">NEXT UP</p><h3 id="next-match-heading" className="card-title">Matchday</h3></div>
            <span className="matchday-tag">{team?.shortName || 'CLUB'}</span>
          </div>
          {nextMatch ? (
            <div className="next-match-detail">
              <span className="match-date-tile"><CalendarDays aria-hidden="true" /><small>{formatMatchDate(nextMatch.matchDate)}</small></span>
              <div className="next-match-versus"><span>{team?.shortName || 'Your club'}</span><b>vs</b><span>{nextMatch.opponent}</span></div>
              <p>{nextMatch.competition || 'Matchday'} <span>·</span> {nextMatch.venue}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => onNavigate('graphics')}>Open match studio <ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
            </div>
          ) : (
            <div className="card-empty card-empty--center">
              <span className="empty-icon empty-icon--small"><CalendarDays aria-hidden="true" /></span>
              <strong>No fixture on the board.</strong>
              <p>Add a match in the studio to keep the schedule close at hand.</p>
              <Button type="button" variant="outline" size="sm" onClick={() => onNavigate('graphics')}>Create match graphic <ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-lower-grid">
        <section className="content-card squad-preview-card" aria-labelledby="squad-preview-heading">
          <div className="card-heading-row">
            <div><p className="section-kicker">FIRST TEAM</p><h3 id="squad-preview-heading" className="card-title">Squad profiles</h3></div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate('players')}>View roster <ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
          </div>
          {recentPlayers.length ? (
            <div className="squad-preview-list">
              {recentPlayers.map((player) => (
                <button type="button" className="squad-preview-row" key={player.id} onClick={() => onOpenPlayer(player)}>
                  <span className="player-initials">{getInitials(player.name)}</span>
                  <span className="squad-preview-copy"><strong>{player.name}</strong><small>{player.position}</small></span>
                  <span className="squad-preview-number">{String(player.number).padStart(2, '0')}</span>
                  <ArrowRight aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : (
            <div className="card-empty card-empty--row">
              <span className="empty-icon empty-icon--small"><Users aria-hidden="true" /></span>
              <div><strong>Your player profiles live here.</strong><p>Track numbers, roles, availability, and coaching notes.</p></div>
              <Button type="button" variant="outline" size="sm" onClick={onAddPlayer}><Plus data-icon="inline-start" aria-hidden="true" />Add first player</Button>
            </div>
          )}
        </section>

        <section className="content-card match-preview-card" aria-labelledby="match-preview-heading">
          <div className="card-heading-row">
            <div><p className="section-kicker">RECENT ACTIVITY</p><h3 id="match-preview-heading" className="card-title">Match archive</h3></div>
            <Button type="button" variant="ghost" size="icon" aria-label="Open match graphics" onClick={() => onNavigate('graphics')}><Image aria-hidden="true" /></Button>
          </div>
          {recentMatches.length ? (
            <div className="match-preview-list">
              {recentMatches.map((match) => (
                <div key={match.id} className="match-preview-row">
                  <span className="match-preview-mark">{match.venue === 'Home' ? 'H' : 'A'}</span>
                  <span className="match-preview-copy"><strong>{match.opponent}</strong><small>{match.competition || 'Matchday'} · {formatMatchDate(match.matchDate)}</small></span>
                  <strong className="match-preview-score">{match.teamScore === null ? 'vs' : `${match.teamScore}–${match.opponentScore}`}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-empty card-empty--row">
              <span className="empty-icon empty-icon--small"><Image aria-hidden="true" /></span>
              <div><strong>No match details saved.</strong><p>Build a result graphic and keep the match in your archive.</p></div>
              <Button type="button" variant="outline" size="sm" onClick={() => onNavigate('graphics')}>Open studio</Button>
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-footer-note"><Check aria-hidden="true" /><span>One workspace for the work before, during, and after the whistle.</span></div>
    </section>
  )
}
