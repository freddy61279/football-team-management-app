export type ViewKey = 'overview' | 'players' | 'lineup' | 'graphics'

export type PlayerPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'
export type PlayerAvailability = 'Available' | 'Injured' | 'Unavailable'
export type PreferredFoot = 'Right' | 'Left' | 'Both'
export type Formation = '4-3-3' | '4-2-3-1' | '4-4-2' | '3-5-2'

export interface Team {
  name: string
  shortName: string
  primaryColor: string
  secondaryColor: string
}

export interface Player {
  id: string
  name: string
  number: number
  position: PlayerPosition
  availability: PlayerAvailability
  preferredFoot: PreferredFoot
  dateOfBirth: string
  appearances: number
  goals: number
  assists: number
  notes: string
}

export type PlayerDraft = Omit<Player, 'id'>

export interface LineupSlot {
  id: string
  label: string
  x: number
  y: number
  playerId: string | null
}

export interface Lineup {
  formation: Formation
  slots: LineupSlot[]
}

export interface MatchRecord {
  id: string
  opponent: string
  competition: string
  matchDate: string
  venue: 'Home' | 'Away'
  status: 'Upcoming' | 'Final'
  teamScore: number | null
  opponentScore: number | null
}

export const PLAYER_POSITIONS: PlayerPosition[] = [
  'Goalkeeper',
  'Defender',
  'Midfielder',
  'Forward',
]

export const PLAYER_AVAILABILITY: PlayerAvailability[] = [
  'Available',
  'Injured',
  'Unavailable',
]

export const DEFAULT_TEAM_COLORS = {
  primaryColor: '#B8E95B',
  secondaryColor: '#18352B',
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
