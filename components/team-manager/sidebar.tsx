'use client'

import {
  Image,
  LayoutDashboard,
  ListChecks,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Team, ViewKey } from './types'

const items = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'players', label: 'Players', icon: Users },
  { key: 'lineup', label: 'Lineup', icon: ListChecks },
  { key: 'graphics', label: 'Match graphics', icon: Image },
] as const

type Props = {
  activeSection: ViewKey
  onSelect: (section: ViewKey) => void
  team: Team | null
  playerCount: number
}

function ClubMark({ team }: { team: Team | null }) {
  return (
    <span
      className="club-mark"
      style={{ '--club-accent': team?.primaryColor ?? '#EF233C' } as React.CSSProperties}
      aria-hidden="true"
    >
      {team?.emblemUrl ? <img src={team.emblemUrl} alt="" /> : team?.shortName?.slice(0, 3) || 'TL'}
    </span>
  )
}

export function Sidebar({ activeSection, onSelect, team, playerCount }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-symbol" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="brand-copy">
          <strong>touchline</strong>
          <small>TEAM OPERATIONS</small>
        </span>
      </div>

      <div className="sidebar-club">
        <ClubMark team={team} />
        <span className="sidebar-club-copy">
          <small>YOUR CLUB</small>
          <strong>{team?.name || 'Set up your club'}</strong>
        </span>
        <span className="sidebar-club-count" aria-label={`${playerCount} players`}>
          {playerCount}
        </span>
      </div>

      <p className="sidebar-label">WORKSPACE</p>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {items.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            type="button"
            variant="ghost"
            size="lg"
            className="nav-link"
            aria-current={activeSection === key ? 'page' : undefined}
            onClick={() => onSelect(key)}
          >
            <Icon data-icon="inline-start" aria-hidden="true" />
            <span>{label}</span>
            {key === 'players' && playerCount > 0 ? (
              <span className="nav-count">{playerCount}</span>
            ) : null}
          </Button>
        ))}
      </nav>

      <div className="sidebar-spacer" />
      <div className="sidebar-note">
        <span className="sidebar-note-icon" aria-hidden="true">
          <span />
        </span>
        <div>
          <strong>Built for matchday</strong>
          <p>Squad, tactics, and story in one place.</p>
        </div>
      </div>
      <div className="sidebar-footer">
        <span className="preview-indicator" aria-hidden="true" />
        <span>Workspace preview</span>
      </div>
    </aside>
  )
}

export function MobileNavigation({ activeSection, onSelect }: Pick<Props, 'activeSection' | 'onSelect'>) {
  return (
    <nav className="mobile-nav" aria-label="Main navigation">
      {items.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          type="button"
          variant="ghost"
          className="mobile-nav-link"
          aria-current={activeSection === key ? 'page' : undefined}
          onClick={() => onSelect(key)}
        >
          <Icon aria-hidden="true" />
          <span>{label === 'Match graphics' ? 'Graphics' : label}</span>
        </Button>
      ))}
    </nav>
  )
}
