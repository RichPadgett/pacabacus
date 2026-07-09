export interface Badge {
  id: string
  level: number
  name: string
  emoji: string
}

/** milestone badges earned by completing adventure levels */
export const BADGES: Badge[] = [
  { id: 'first-steps', level: 1, name: 'First Steps', emoji: '🌱' },
  { id: 'high-five', level: 5, name: 'High Five', emoji: '🖐️' },
  { id: 'perfect-ten', level: 10, name: 'Perfect Ten', emoji: '🔟' },
  { id: 'adding-ace', level: 15, name: 'Adding Ace', emoji: '➕' },
  { id: 'treasure-hunter', level: 20, name: 'Treasure Hunter', emoji: '💎' },
  { id: 'halfway-hero', level: 25, name: 'Halfway Hero', emoji: '🌟' },
  { id: 'baddie-dodger', level: 30, name: 'Baddie Dodger', emoji: '🛡️' },
  { id: 'bead-master', level: 40, name: 'Bead Master', emoji: '🧮' },
  { id: 'champion', level: 50, name: 'PacAbacus Champion', emoji: '🏆' },
]

export const MAX_LEVEL = 50
