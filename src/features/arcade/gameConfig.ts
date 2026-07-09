import type { ProblemCfg } from '@/features/drills/problemGenerator'
import { GHOST_CONFIG, type ArcadeSettings } from './settingsStore'

export interface EnemyCfg {
  count: number
  correctSteps: number
  wrongSteps: number
  /** chance an enemy chases (vs wanders randomly) each step */
  chaseChance: number
  /** chance a new enemy appears at the start of an enemy turn */
  spawnChance: number
}

export interface LevelCfg {
  problem: ProblemCfg
  rodCount: number
  enemy: EnemyCfg
  /** number of treasures needed to finish the maze */
  treasureCount: number
  /** gentle mode: unlimited kind retries, enemies never punish mistakes */
  gentle: boolean
  /** shown once when the level starts */
  intro?: string
  allowChallenge: boolean
}

/** Main 50-level adventure: eases in, then grows through real soroban skills. */
export function adventureCfg(level: number): LevelCfg {
  const problem: ProblemCfg =
    level <= 6
      ? { kind: 'tech', mathLevel: 1, ops: 'add', maxAnswer: 10 }
      : level <= 12
        ? { kind: 'tech', mathLevel: 2, ops: 'add', maxAnswer: level <= 9 ? 10 : 20 }
        : level <= 20
          ? { kind: 'tech', mathLevel: 3, ops: 'add', maxAnswer: 20 }
          : level <= 28
            ? { kind: 'tech', mathLevel: 3, ops: 'mixed', maxAnswer: 20 }
            : level <= 38
              ? { kind: 'tech', mathLevel: 4, ops: 'mixed', maxAnswer: 50 }
              : { kind: 'tech', mathLevel: 5, ops: 'mixed', maxAnswer: 50 }

  const enemy: EnemyCfg = {
    count: level <= 2 ? 1 : level <= 8 ? 1 : level <= 16 ? 2 : 3,
    correctSteps: level <= 14 ? 1 : level <= 30 ? 1 : 2,
    wrongSteps: Math.min(3, 1 + Math.floor(level / 15)),
    chaseChance: Math.min(0.85, 0.3 + level * 0.012),
    spawnChance: level <= 10 ? 0 : Math.min(0.35, (level - 10) * 0.012),
  }

  return {
    problem,
    rodCount: 2,
    enemy,
    treasureCount: Math.min(24, 10 + Math.floor(level / 3)),
    gentle: false,
    allowChallenge: true,
    intro:
      level === 21
        ? 'Watch out — taking away starts now! ➖'
        : level === 29
          ? 'Big two-digit numbers ahead — you can do it! 💪'
          : undefined,
  }
}

/** Little Counters: 20 gentle levels for brand-new counters (age ~5). */
export function countingCfg(level: number): LevelCfg {
  const problem: ProblemCfg =
    level <= 3
      ? { kind: 'early', countChance: 1, countMin: 1, countMax: 2 + level, sumCap: 0 }
      : level <= 8
        ? { kind: 'early', countChance: 0.55, countMin: 1, countMax: 5, sumCap: 5 }
        : level <= 12
          ? { kind: 'early', countChance: 0.4, countMin: 1, countMax: 7, sumCap: 7 }
          : level <= 16
            ? { kind: 'early', countChance: 0.3, countMin: 1, countMax: 10, sumCap: 10 }
            : { kind: 'early', countChance: 0.2, countMin: 1, countMax: 10, sumCap: 10 }

  const enemy: EnemyCfg = {
    count: level <= 6 ? 0 : 1,
    correctSteps: 1,
    wrongSteps: 0, // mistakes never help the baddie
    chaseChance: level <= 12 ? 0.2 : 0.35,
    spawnChance: 0,
  }

  return {
    problem,
    // one rod keeps it simple until sums can reach 10
    rodCount: level <= 12 ? 1 : 2,
    enemy,
    treasureCount: Math.min(12, 4 + Math.ceil(level / 2)),
    gentle: true,
    allowChallenge: false,
    intro:
      level === 1
        ? 'Count the treats — slide one blue bead up for each one! 🍓'
        : level === 4
            ? 'Now try adding! Count both groups together. ➕'
            : level === 9
              ? 'Big numbers! The gold bead at the top counts as 5. ✨'
              : level === 13
                ? 'A little baddie is wandering around — keep counting! 👀'
              : undefined,
  }
}

export const ADVENTURE_MAX = 50
export const COUNTING_MAX = 20

/** Free-play maze uses whatever the setup screen says. */
export function freePlayCfg(s: ArcadeSettings): LevelCfg {
  const g = GHOST_CONFIG[s.ghosts]
  return {
    problem: { kind: 'tech', mathLevel: s.mathLevel, ops: s.ops, maxAnswer: s.maxAnswer },
    rodCount: 2,
    enemy: {
      count: g.count,
      correctSteps: g.correctSteps,
      wrongSteps: g.wrongSteps,
      chaseChance: 0.75,
      spawnChance: 0,
    },
    treasureCount: 18,
    gentle: false,
    allowChallenge: true,
  }
}
