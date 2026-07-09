import type { DrillConfig } from './drill'

export interface ArcadeLevelConfig extends DrillConfig {
  pathLength: number
  dotCells: number[]
  ghostStartGap: number
  lives: number
  advanceOnCorrect: number
  advanceOnWrong: number
}

export type ArcadeOutcome = 'cleared' | 'caught'

export interface ArcadeTickResult {
  playerPos: number
  ghostPos: number
  livesRemaining: number
  dotsCollected: number[]
  caught: boolean
  cleared: boolean
}
