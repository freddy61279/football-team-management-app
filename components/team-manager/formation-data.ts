import type { Formation, LineupSlot } from './types'

type SlotSeed = Omit<LineupSlot, 'playerId'>

const formations: Record<Formation, SlotSeed[]> = {
  '4-3-3': [
    { id: 'keeper', label: 'GK', x: 50, y: 88 },
    { id: 'def-1', label: 'LB', x: 18, y: 72 },
    { id: 'def-2', label: 'LCB', x: 40, y: 76 },
    { id: 'def-3', label: 'RCB', x: 60, y: 76 },
    { id: 'def-4', label: 'RB', x: 82, y: 72 },
    { id: 'mid-1', label: 'LCM', x: 30, y: 54 },
    { id: 'mid-2', label: 'CM', x: 50, y: 50 },
    { id: 'mid-3', label: 'RCM', x: 70, y: 54 },
    { id: 'fwd-1', label: 'LW', x: 22, y: 30 },
    { id: 'fwd-2', label: 'ST', x: 50, y: 25 },
    { id: 'fwd-3', label: 'RW', x: 78, y: 30 },
  ],
  '4-2-3-1': [
    { id: 'keeper', label: 'GK', x: 50, y: 88 },
    { id: 'def-1', label: 'LB', x: 18, y: 72 },
    { id: 'def-2', label: 'LCB', x: 40, y: 76 },
    { id: 'def-3', label: 'RCB', x: 60, y: 76 },
    { id: 'def-4', label: 'RB', x: 82, y: 72 },
    { id: 'mid-1', label: 'DM', x: 38, y: 59 },
    { id: 'mid-2', label: 'DM', x: 62, y: 59 },
    { id: 'fwd-1', label: 'LW', x: 22, y: 39 },
    { id: 'fwd-2', label: 'AM', x: 50, y: 36 },
    { id: 'fwd-3', label: 'RW', x: 78, y: 39 },
    { id: 'striker-1', label: 'ST', x: 50, y: 21 },
  ],
  '4-4-2': [
    { id: 'keeper', label: 'GK', x: 50, y: 88 },
    { id: 'def-1', label: 'LB', x: 18, y: 72 },
    { id: 'def-2', label: 'LCB', x: 40, y: 76 },
    { id: 'def-3', label: 'RCB', x: 60, y: 76 },
    { id: 'def-4', label: 'RB', x: 82, y: 72 },
    { id: 'mid-1', label: 'LM', x: 18, y: 52 },
    { id: 'mid-2', label: 'LCM', x: 40, y: 54 },
    { id: 'mid-3', label: 'RCM', x: 60, y: 54 },
    { id: 'mid-4', label: 'RM', x: 82, y: 52 },
    { id: 'fwd-1', label: 'ST', x: 38, y: 28 },
    { id: 'fwd-2', label: 'ST', x: 62, y: 28 },
  ],
  '3-5-2': [
    { id: 'keeper', label: 'GK', x: 50, y: 88 },
    { id: 'def-1', label: 'LCB', x: 30, y: 75 },
    { id: 'def-2', label: 'CB', x: 50, y: 78 },
    { id: 'def-3', label: 'RCB', x: 70, y: 75 },
    { id: 'mid-1', label: 'LWB', x: 12, y: 53 },
    { id: 'mid-2', label: 'LCM', x: 31, y: 56 },
    { id: 'mid-3', label: 'CM', x: 50, y: 51 },
    { id: 'mid-4', label: 'RCM', x: 69, y: 56 },
    { id: 'mid-5', label: 'RWB', x: 88, y: 53 },
    { id: 'fwd-1', label: 'ST', x: 38, y: 28 },
    { id: 'fwd-2', label: 'ST', x: 62, y: 28 },
  ],
}

export function getFormationSlots(
  formation: Formation,
  currentSlots: LineupSlot[] = [],
): LineupSlot[] {
  const playerBySlot = new Map(
    currentSlots.map((slot) => [slot.id, slot.playerId]),
  )

  return formations[formation].map((slot) => ({
    ...slot,
    playerId: playerBySlot.get(slot.id) ?? null,
  }))
}
