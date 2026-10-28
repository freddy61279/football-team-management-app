'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, LogOut, Settings2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardView } from './dashboard-view'
import { GraphicsView } from './graphics-view'
import { LineupView } from './lineup-view'
import { PlayerDialog } from './player-dialog'
import { PlayersView } from './players-view'
import { MobileNavigation, Sidebar } from './sidebar'
import { TeamSetupDialog } from './team-setup-dialog'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Lineup, MatchRecord, Player, PlayerDraft, Team, ViewKey } from './types'
import type { GraphicType } from './lineup-view'

const titles: Record<ViewKey, string> = {
  overview: 'Team overview',
  players: 'Player roster',
  lineup: 'Lineup selection',
  graphics: 'Scoreline studio',
}

export function TeamManagerApp() {
  const [activeSection, setActiveSection] = useState<ViewKey>('overview')
  const [team, setTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [lineup, setLineup] = useState<Lineup>({ formation: '4-3-3', slots: [] })
  const [graphicType, setGraphicType] = useState<GraphicType>('scoreline')
  const [matches, setMatches] = useState<MatchRecord[]>([])
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [playerDialog, setPlayerDialog] = useState<{ open: boolean; player: Player | null }>({ open: false, player: null })
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    if (!supabase) return

    void supabase.auth.getUser().then((result: {
      data: { user: { user_metadata?: Record<string, unknown> | null } | null }
    }) => {
      const metadata = result.data.user?.user_metadata
      const clubName = typeof metadata?.club_name === 'string' ? metadata.club_name.trim() : ''
      if (!clubName) return

      setTeam({
        name: clubName,
        shortName: typeof metadata?.short_name === 'string' && metadata.short_name.trim()
          ? metadata.short_name.trim().slice(0, 4).toUpperCase()
          : clubName.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase(),
        city: typeof metadata?.city === 'string' ? metadata.city.trim() : '',
        country: typeof metadata?.country === 'string' ? metadata.country.trim() : '',
        competition: typeof metadata?.competition === 'string' ? metadata.competition.trim() : '',
        primaryColor: typeof metadata?.primary_color === 'string' ? metadata.primary_color : '#B8E95B',
        secondaryColor: typeof metadata?.secondary_color === 'string' ? metadata.secondary_color : '#18352B',
        emblemUrl: typeof metadata?.emblem_url === 'string' ? metadata.emblem_url : undefined,
      })
    })
  }, [])

  function openNewPlayer() {
    setPlayerDialog({ open: true, player: null })
  }

  function navigateTo(section: ViewKey) {
    setActiveSection(section)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  function openPlayer(player: Player) {
    setPlayerDialog({ open: true, player })
  }

  function savePlayer(player: Player) {
    const isExisting = players.some((item) => item.id === player.id)
    setPlayers((current) => isExisting
      ? current.map((item) => item.id === player.id ? player : item)
      : [player, ...current])
    setPlayerDialog({ open: false, player: null })
    setNotice(`${player.name} profile ${isExisting ? 'updated' : 'added'} in this preview.`)
  }

  function importPlayers(drafts: PlayerDraft[]) {
    const importedPlayers = drafts.map((draft) => ({ ...draft, id: globalThis.crypto.randomUUID() }))
    setPlayers((current) => [...importedPlayers, ...current])
    setNotice(`${importedPlayers.length} player${importedPlayers.length === 1 ? '' : 's'} imported to this preview squad.`)
  }

  function updatePlayerHeadshot(playerId: string, headshot: string) {
    const player = players.find((item) => item.id === playerId)
    setPlayers((current) => current.map((item) => item.id === playerId ? { ...item, headshot } : item))
    setNotice(`${player?.name ?? 'Player'} headshot updated in this preview.`)
  }

  function deletePlayer(playerId: string) {
    const removed = players.find((player) => player.id === playerId)
    setPlayers((current) => current.filter((player) => player.id !== playerId))
    setLineup((current) => ({
      ...current,
      slots: current.slots.map((slot) => slot.playerId === playerId ? { ...slot, playerId: null } : slot),
    }))
    setPlayerDialog({ open: false, player: null })
    setNotice(removed ? `${removed.name} removed from this preview roster.` : 'Player removed from this preview roster.')
  }

  async function saveTeam(nextTeam: Team) {
    setTeam(nextTeam)
    setTeamDialogOpen(false)
    setNotice(`${nextTeam.name} club profile updated.`)

    const supabase = createSupabaseBrowserClient()
    if (!supabase) return

    const { error } = await supabase.auth.updateUser({
      data: {
        club_name: nextTeam.name,
        short_name: nextTeam.shortName,
        city: nextTeam.city ?? '',
        country: nextTeam.country ?? '',
        competition: nextTeam.competition ?? '',
        primary_color: nextTeam.primaryColor,
        secondary_color: nextTeam.secondaryColor,
        emblem_url: nextTeam.emblemUrl ?? null,
      },
    })

    if (error) {
      setNotice('Club profile updated for this session, but could not be synced to your account.')
    }
  }

  function saveLineup(nextLineup: Lineup) {
    setLineup(nextLineup)
    setNotice('Starting lineup saved in this preview.')
  }

  function saveMatch(match: MatchRecord) {
    setMatches((current) => [match, ...current.filter((item) => item.id !== match.id)])
    setNotice(`${match.opponent} added to the match list.`)
  }

  return (
    <div className="touchline-app">
      <Sidebar
        activeSection={activeSection}
        onSelect={navigateTo}
        team={team}
        playerCount={players.length}
      />

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-heading">
            <span className="topbar-mobile-mark" aria-hidden="true">T</span>
            <div>
              <p className="topbar-eyebrow">TOUCHLINE <span>/</span> CLUB OPERATIONS</p>
              <h1>{titles[activeSection]}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="preview-pill"><span /> UI preview</span>
            <Button type="button" variant="outline" size="lg" onClick={() => setTeamDialogOpen(true)}>
              <Settings2 data-icon="inline-start" aria-hidden="true" />
              {team ? 'Club settings' : 'Set up club'}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="topbar-alert" aria-label="Notifications are not connected yet" title="Notifications are not connected yet" disabled>
              <Bell aria-hidden="true" />
            </Button>
            <Button
              render={<Link href="/sign-in" />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="topbar-signout-button"
              aria-label="Sign out"
            >
              <LogOut data-icon="inline-start" aria-hidden="true" />
              <span className="topbar-signout-label">Sign out</span>
            </Button>
          </div>
        </header>

        {notice ? (
          <div className="save-notice" role="status">
            <span className="notice-check" aria-hidden="true">✓</span>
            <span>{notice}</span>
            <Button type="button" variant="ghost" size="icon" aria-label="Dismiss notification" onClick={() => setNotice('')}>
              <X aria-hidden="true" />
            </Button>
          </div>
        ) : null}

        <main className="page-content">
          {activeSection === 'overview' ? (
            <DashboardView
              team={team}
              players={players}
              lineup={lineup}
              matches={matches}
              onCreateTeam={() => setTeamDialogOpen(true)}
              onAddPlayer={openNewPlayer}
              onOpenPlayer={openPlayer}
              onNavigate={navigateTo}
            />
          ) : null}
          {activeSection === 'players' ? (
            <PlayersView
              players={players}
              onAddPlayer={openNewPlayer}
              onOpenPlayer={openPlayer}
              onImportPlayers={importPlayers}
              onUploadHeadshot={updatePlayerHeadshot}
            />
          ) : null}
          {activeSection === 'lineup' ? (
            <LineupView players={players} lineup={lineup} graphicType={graphicType} onGraphicTypeChange={setGraphicType} onSave={saveLineup} onAddPlayer={openNewPlayer} />
          ) : null}
          {activeSection === 'graphics' ? (
            <GraphicsView team={team} players={players} lineup={lineup} graphicType={graphicType} matches={matches} onSaveMatch={saveMatch} />
          ) : null}
        </main>

        <MobileNavigation activeSection={activeSection} onSelect={navigateTo} />
      </div>

      <TeamSetupDialog open={teamDialogOpen} team={team} onOpenChange={setTeamDialogOpen} onSave={saveTeam} />
      <PlayerDialog
        open={playerDialog.open}
        player={playerDialog.player}
        onOpenChange={(open) => setPlayerDialog((current) => ({ ...current, open }))}
        onSave={savePlayer}
        onDelete={deletePlayer}
      />
    </div>
  )
}
