import type { HeroId } from '@/features/arcade/sprites'

export type LearningWorldId = 'pacabacus' | 'pacwords' | 'pactables' | 'pacmath'
export type PlayStyle = 'adventure' | 'free' | 'rain'
export type AgeBand = 'little' | 'early' | 'growing' | 'big'

export interface LearningWorldDef {
  id: LearningWorldId
  name: string
  icon: string
  detail: string
  shortDetail: string
}

export interface LearningChapter {
  name: string
  emoji: string
  detail: string
}

export const LEARNING_WORLDS: LearningWorldDef[] = [
  {
    id: 'pacabacus',
    name: 'PacAbacus',
    icon: '🧮',
    detail: 'Soroban, counting, and bead thinking',
    shortDetail: 'Abacus adventure',
  },
  {
    id: 'pacwords',
    name: 'PacWords',
    icon: '🔤',
    detail: 'Letters, spelling, and sight words',
    shortDetail: 'Words and letters',
  },
  {
    id: 'pactables',
    name: 'PacTables',
    icon: '✖️',
    detail: 'Times tables and skip counting',
    shortDetail: 'Multiplication facts',
  },
  {
    id: 'pacmath',
    name: 'PacMath',
    icon: '➕',
    detail: 'Standard math without abacus controls',
    shortDetail: 'Regular math',
  },
]

export const DEFAULT_WORLD_LEVELS: Record<LearningWorldId, number> = {
  pacabacus: 1,
  pacwords: 1,
  pactables: 1,
  pacmath: 1,
}

export const WORLD_CHAPTERS: Record<LearningWorldId, LearningChapter[]> = {
  pacabacus: [
    { name: 'Berry Bead Park', emoji: '🍓', detail: 'Counting, small sums, and bead confidence' },
    { name: 'Friendship Forest', emoji: '🌲', detail: '5-friends and 10-friends with gentle pressure' },
    { name: 'Moon Bridge', emoji: '🌙', detail: 'Mixed moves and bigger bead patterns' },
    { name: 'Crystal Castle', emoji: '🏰', detail: 'Longer rooms with stronger soroban thinking' },
  ],
  pacwords: [
    { name: 'Letter Garden', emoji: '🌼', detail: 'Missing letters and simple word shapes' },
    { name: 'Rhyme River', emoji: '🌊', detail: 'Short vowels and familiar sounds' },
    { name: 'Story Woods', emoji: '📖', detail: 'Sight words and quick recognition' },
    { name: 'Library Tower', emoji: '🗼', detail: 'Longer words and trickier choices' },
  ],
  pactables: [
    { name: 'Skip-Hop Meadow', emoji: '🌿', detail: 'Early skip counting patterns' },
    { name: 'Factor Factory', emoji: '⚙️', detail: 'Core multiplication facts' },
    { name: 'Comet Kitchen', emoji: '☄️', detail: 'Mixed tables with faster choices' },
    { name: 'Times Temple', emoji: '🏛️', detail: 'All facts with stronger recall' },
  ],
  pacmath: [
    { name: 'Number Nook', emoji: '🔢', detail: 'Friendly addition and counting' },
    { name: 'Plus Plaza', emoji: '➕', detail: 'Addition and subtraction rooms' },
    { name: 'Puzzle Port', emoji: '🧩', detail: 'Mixed problems and bigger numbers' },
    { name: 'Logic Lighthouse', emoji: '💡', detail: 'Fast regular math practice' },
  ],
}

export function chapterForLevel(world: LearningWorldId, level: number) {
  const chapters = WORLD_CHAPTERS[world]
  const index = Math.min(chapters.length - 1, Math.max(0, Math.floor((level - 1) / 5)))
  return chapters[index]
}

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  little: 'Ages 4-5',
  early: 'Ages 6-7',
  growing: 'Ages 8-9',
  big: 'Ages 10+',
}

export function ageFromDateOfBirth(dateOfBirth?: string | null, now = new Date()) {
  if (!dateOfBirth) return null
  const dob = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(dob.getTime())) return null
  let age = now.getFullYear() - dob.getFullYear()
  const monthDelta = now.getMonth() - dob.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) age -= 1
  return Math.max(0, age)
}

export function ageBandFromDateOfBirth(dateOfBirth?: string | null): AgeBand {
  const age = ageFromDateOfBirth(dateOfBirth)
  if (age == null) return 'early'
  if (age <= 5) return 'little'
  if (age <= 7) return 'early'
  if (age <= 9) return 'growing'
  return 'big'
}

export function trainerStartLevel(ageBand: AgeBand, world: LearningWorldId) {
  if (world === 'pactables') {
    if (ageBand === 'little' || ageBand === 'early') return 1
    if (ageBand === 'growing') return 4
    return 7
  }
  if (world === 'pacwords') {
    if (ageBand === 'little') return 1
    if (ageBand === 'early') return 3
    if (ageBand === 'growing') return 6
    return 8
  }
  if (world === 'pacmath') {
    if (ageBand === 'little') return 1
    if (ageBand === 'early') return 3
    if (ageBand === 'growing') return 7
    return 10
  }
  if (ageBand === 'little') return 1
  if (ageBand === 'early') return 4
  if (ageBand === 'growing') return 9
  return 14
}

export const WORLD_CHARACTER_UNLOCKS: Record<LearningWorldId, HeroId[]> = {
  pacabacus: ['monkey', 'dino', 'snake', 'turtle', 'meerkat', 'elephant', 'chomper'],
  pacwords: ['penguin', 'unicorn', 'panda', 'otter', 'bunny', 'chick'],
  pactables: ['bee', 'dragon', 'robo', 'lion', 'shark', 'crab'],
  pacmath: ['frog', 'seal', 'koala', 'dolphin', 'beaver', 'axolotl', 'rooster', 'lamby', 'strawbat'],
}

export function characterUnlocksForWorld(world: LearningWorldId, level: number) {
  const roster = WORLD_CHARACTER_UNLOCKS[world]
  return roster.filter((_, index) => level >= (index + 1) * 3)
}
