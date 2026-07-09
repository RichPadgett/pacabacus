import type { ThemeId } from './themes'

export interface AdventureWorld {
  id: string
  name: string
  emoji: string
  levelStart: number
  levelEnd: number
  theme: ThemeId
  musicIndex: number
  doorText: string
}

export const ADVENTURE_WORLDS: AdventureWorld[] = [
  {
    id: 'star-park',
    name: 'Star Park',
    emoji: '⭐',
    levelStart: 1,
    levelEnd: 10,
    theme: 'stars',
    musicIndex: 0,
    doorText: 'The star door opens!',
  },
  {
    id: 'candy-carnival',
    name: 'Candy Carnival',
    emoji: '🍬',
    levelStart: 11,
    levelEnd: 20,
    theme: 'bubblegum',
    musicIndex: 1,
    doorText: 'A candy gate swings open!',
  },
  {
    id: 'kelp-cove',
    name: 'Kelp Cove',
    emoji: '🌊',
    levelStart: 21,
    levelEnd: 30,
    theme: 'ocean',
    musicIndex: 2,
    doorText: 'The bubble door unlocks!',
  },
  {
    id: 'mossy-woods',
    name: 'Mossy Woods',
    emoji: '🌲',
    levelStart: 31,
    levelEnd: 40,
    theme: 'forest',
    musicIndex: 3,
    doorText: 'The leafy door opens!',
  },
  {
    id: 'sunset-castle',
    name: 'Sunset Castle',
    emoji: '🌅',
    levelStart: 41,
    levelEnd: 50,
    theme: 'sunset',
    musicIndex: 4,
    doorText: 'The castle door shines open!',
  },
]

export function worldForAdventureLevel(level: number): AdventureWorld {
  return ADVENTURE_WORLDS.find((world) => level >= world.levelStart && level <= world.levelEnd) ?? ADVENTURE_WORLDS[0]
}
