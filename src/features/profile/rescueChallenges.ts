import type { HeroId } from '@/features/arcade/sprites'
import type { AgeBand, LearningWorldId } from '@/features/learning/learningWorlds'

export interface RescueChallenge {
  id: string
  world: LearningWorldId
  level: number
  hero: HeroId
  title: string
  clue: string
  final?: boolean
}

export const RESCUE_CHALLENGES: RescueChallenge[] = [
  {
    id: 'starwhisker',
    world: 'pacabacus',
    level: 5,
    hero: 'starwhisker',
    title: 'Save Starwhisker',
    clue: 'A secret kitten is trapped behind the first world gate.',
  },
  {
    id: 'mooncalf',
    world: 'pacabacus',
    level: 10,
    hero: 'mooncalf',
    title: 'Save Mooncalf',
    clue: 'A moonlit baby buddy waits beyond the second gate.',
  },
  {
    id: 'coraldragon',
    world: 'pacabacus',
    level: 20,
    hero: 'coraldragon',
    title: 'Save Coral Dragon',
    clue: 'A tiny dragon is locked inside the ocean gate.',
  },
  {
    id: 'gearfox',
    world: 'pacabacus',
    level: 35,
    hero: 'gearfox',
    title: 'Save Gear Fox',
    clue: 'A clever fox is hidden in the deep forest machine room.',
  },
  {
    id: 'mewtwo',
    world: 'pacabacus',
    level: 50,
    hero: 'mewtwo',
    title: 'Save the Super Secret One',
    clue: 'The final prisoner waits after the whole PacAbacus journey.',
    final: true,
  },
]

export const AGE_BOSS_LEVELS: Record<AgeBand, number> = {
  little: 5,
  early: 10,
  growing: 20,
  big: 35,
  master: 50,
}

export function rescueForClear(world: LearningWorldId, level: number) {
  return RESCUE_CHALLENGES.find((challenge) => challenge.world === world && challenge.level === level)
}

export function rescueForAgeBand(ageBand: AgeBand) {
  const level = AGE_BOSS_LEVELS[ageBand]
  return RESCUE_CHALLENGES.find((challenge) => challenge.level === level) ?? RESCUE_CHALLENGES[0]
}

export function secretCodeLevel(code: string): number | null {
  const normalized = code.trim().toLowerCase().replace(/\s+/g, '')
  if (!normalized) return null
  if (normalized === 'rescue' || normalized === 'starwhisker') return 5
  if (normalized === 'mooncalf') return 10
  if (normalized === 'coraldragon') return 20
  if (normalized === 'gearfox') return 35
  if (normalized === 'mewtwo' || normalized === 'finalboss') return 50
  const match = normalized.match(/^level(\d{1,2})$/)
  if (!match) return null
  return Math.max(1, Math.min(50, Number(match[1])))
}
