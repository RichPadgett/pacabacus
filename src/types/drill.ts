import type { AgeTier } from './profile'

export type Operation = 'add' | 'sub'

export interface DrillConfig {
  id: string
  tier: AgeTier
  title: string
  /** inclusive [min, max] digit count for generated operands */
  digitRange: [number, number]
  operations: Operation[]
  complementFocus: boolean
  timeLimitSec: number
  problemCount: number
}

export interface Problem {
  a: number
  b: number
  operation: Operation
  answer: number
}

export interface PracticeResult {
  correct: number
  total: number
  timeMs: number
  bestStreak: number
  stars: 0 | 1 | 2 | 3
  xpEarned: number
}
