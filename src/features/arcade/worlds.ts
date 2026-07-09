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
    levelEnd: 5,
    theme: 'stars',
    musicIndex: 0,
    doorText: 'The star door opens!',
  },
  {
    id: 'berry-brook',
    name: 'Berry Brook',
    emoji: '🍓',
    levelStart: 6,
    levelEnd: 10,
    theme: 'forest',
    musicIndex: 1,
    doorText: 'The berry gate opens!',
  },
  {
    id: 'bubblegum-bay',
    name: 'Bubblegum Bay',
    emoji: '🫧',
    levelStart: 11,
    levelEnd: 15,
    theme: 'bubblegum',
    musicIndex: 2,
    doorText: 'A bubbly door pops open!',
  },
  {
    id: 'cloud-circus',
    name: 'Cloud Circus',
    emoji: '☁️',
    levelStart: 16,
    levelEnd: 20,
    theme: 'stars',
    musicIndex: 3,
    doorText: 'The cloud curtain lifts!',
  },
  {
    id: 'kelp-cove',
    name: 'Kelp Cove',
    emoji: '🌊',
    levelStart: 21,
    levelEnd: 25,
    theme: 'ocean',
    musicIndex: 4,
    doorText: 'The bubble door unlocks!',
  },
  {
    id: 'coral-castle',
    name: 'Coral Castle',
    emoji: '🐚',
    levelStart: 26,
    levelEnd: 30,
    theme: 'ocean',
    musicIndex: 5,
    doorText: 'The shell door opens!',
  },
  {
    id: 'mossy-woods',
    name: 'Mossy Woods',
    emoji: '🌲',
    levelStart: 31,
    levelEnd: 35,
    theme: 'forest',
    musicIndex: 6,
    doorText: 'The leafy door opens!',
  },
  {
    id: 'firefly-grove',
    name: 'Firefly Grove',
    emoji: '✨',
    levelStart: 36,
    levelEnd: 40,
    theme: 'forest',
    musicIndex: 7,
    doorText: 'The glowing door opens!',
  },
  {
    id: 'sunset-hills',
    name: 'Sunset Hills',
    emoji: '🌅',
    levelStart: 41,
    levelEnd: 45,
    theme: 'sunset',
    musicIndex: 8,
    doorText: 'The sunset bridge lowers!',
  },
  {
    id: 'sunset-castle',
    name: 'Sunset Castle',
    emoji: '🏰',
    levelStart: 46,
    levelEnd: 50,
    theme: 'sunset',
    musicIndex: 9,
    doorText: 'The castle door shines open!',
  },
]

export function worldForAdventureLevel(level: number): AdventureWorld {
  return ADVENTURE_WORLDS.find((world) => level >= world.levelStart && level <= world.levelEnd) ?? ADVENTURE_WORLDS[0]
}
