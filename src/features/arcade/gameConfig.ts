import type { ProblemCfg } from '@/features/drills/problemGenerator'
import type { AgeBand, LearningWorldId } from '@/features/learning/learningWorlds'
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

export type LevelGoal =
  | { kind: 'collectAll'; label: string }
  | { kind: 'collectFruit'; target: number; label: string }

export interface LevelCfg {
  problem: ProblemCfg
  rodCount: number
  enemy: EnemyCfg
  /** number of fruit placed on the maze */
  treasureCount: number
  /** gentle mode: unlimited kind retries, enemies never punish mistakes */
  gentle: boolean
  /** shown once when the level starts */
  intro?: string
  allowChallenge: boolean
  goal?: LevelGoal
}

function goalForLevel(_level: number, treasureCount: number, ageBand: AgeBand): LevelGoal {
  const ratio =
    ageBand === 'little'
      ? 0.45
      : ageBand === 'early'
        ? 0.5
        : ageBand === 'growing'
          ? 0.58
          : 0.65
  const target = Math.max(ageBand === 'little' ? 6 : 8, Math.ceil(treasureCount * ratio))
  return { kind: 'collectFruit', target, label: `Collect ${target} fruit` }
}

function withGoal(cfg: LevelCfg, level: number, ageBand: AgeBand): LevelCfg {
  return { ...cfg, goal: goalForLevel(level, cfg.treasureCount, ageBand) }
}

function ageTuneEnemy(enemy: EnemyCfg, ageBand: AgeBand): EnemyCfg {
  if (ageBand === 'little') {
    return {
      ...enemy,
      count: Math.min(enemy.count, 1),
      correctSteps: Math.max(0, enemy.correctSteps - 1),
      wrongSteps: 0,
      chaseChance: Math.min(0.25, enemy.chaseChance),
      spawnChance: 0,
    }
  }
  if (ageBand === 'early') {
    return {
      ...enemy,
      chaseChance: Math.min(0.72, enemy.chaseChance + 0.12),
      spawnChance: Math.min(0.2, enemy.spawnChance + 0.04),
    }
  }
  if (ageBand === 'growing') {
    return {
      ...enemy,
      count: Math.min(3, enemy.count + (enemy.count > 0 ? 1 : 0)),
      correctSteps: enemy.correctSteps + 1,
      wrongSteps: enemy.wrongSteps + 1,
      chaseChance: Math.min(0.9, enemy.chaseChance + 0.22),
      spawnChance: Math.min(0.38, enemy.spawnChance + 0.12),
    }
  }
  if (ageBand === 'big') {
    return {
      ...enemy,
      count: Math.min(4, enemy.count + (enemy.count > 1 ? 2 : enemy.count > 0 ? 1 : 0)),
      correctSteps: enemy.correctSteps + 2,
      wrongSteps: enemy.wrongSteps + 1,
      chaseChance: Math.min(0.96, enemy.chaseChance + 0.32),
      spawnChance: Math.min(0.5, enemy.spawnChance + 0.2),
    }
  }
  if (ageBand === 'master') {
    return {
      ...enemy,
      count: Math.min(5, enemy.count + (enemy.count > 1 ? 2 : enemy.count > 0 ? 1 : 0)),
      correctSteps: enemy.correctSteps + 3,
      wrongSteps: enemy.wrongSteps + 2,
      chaseChance: Math.min(0.98, enemy.chaseChance + 0.38),
      spawnChance: Math.min(0.6, enemy.spawnChance + 0.26),
    }
  }
  return enemy
}

function ageTuneCfg(cfg: LevelCfg, ageBand: AgeBand): LevelCfg {
  return { ...cfg, enemy: ageTuneEnemy(cfg.enemy, ageBand) }
}

function ageAdjustedLevel(level: number, ageBand: AgeBand) {
  if (ageBand === 'little') return Math.max(1, level - 2)
  if (ageBand === 'growing') return level + 3
  if (ageBand === 'big') return level + 8
  if (ageBand === 'master') return level + 14
  return level
}

/** Main 50-level adventure: eases in, then grows through real soroban skills. */
export function adventureCfg(level: number, settings?: ArcadeSettings): LevelCfg {
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
              : level <= 52
                ? { kind: 'tech', mathLevel: 5, ops: 'mixed', maxAnswer: 50 }
                : { kind: 'tech', mathLevel: 5, ops: 'mixed', maxAnswer: 100 }

  const baseEnemy: EnemyCfg = {
    count: level <= 2 ? 1 : level <= 8 ? 1 : level <= 16 ? 2 : 3,
    correctSteps: level <= 14 ? 1 : level <= 30 ? 1 : 2,
    wrongSteps: Math.min(3, 1 + Math.floor(level / 15)),
    chaseChance: Math.min(0.88, 0.38 + level * 0.014),
    spawnChance: level <= 10 ? 0 : Math.min(0.35, (level - 10) * 0.012),
  }
  const tuned = settings ? GHOST_CONFIG[settings.ghosts] : null
  const enemy: EnemyCfg = tuned
    ? {
        ...baseEnemy,
        count: Math.min(baseEnemy.count, tuned.count),
        correctSteps: tuned.correctSteps,
        wrongSteps: tuned.wrongSteps,
      }
    : baseEnemy

  return {
    problem,
    rodCount: 2,
    enemy,
    treasureCount: Math.min(44, 28 + Math.floor(level / 2)),
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
    level <= 10
      ? { kind: 'early', countChance: 1, countMin: 1, countMax: Math.min(9, 2 + level), sumCap: 0 }
      : level <= 15
        ? { kind: 'early', countChance: 0.85, countMin: 1, countMax: 8, sumCap: 5 }
        : { kind: 'early', countChance: 0.7, countMin: 1, countMax: 9, sumCap: 8 }

  const enemy: EnemyCfg = {
    count: level <= 6 ? 0 : 1,
    correctSteps: 1,
    wrongSteps: 0, // mistakes never help the baddie
    chaseChance: level <= 12 ? 0.2 : 0.35,
    spawnChance: 0,
  }

  return {
    problem,
    // One rod keeps the youngest players focused on matching quantities, not place value.
    rodCount: 1,
    enemy,
    treasureCount: Math.min(28, 16 + Math.ceil(level / 2)),
    gentle: true,
    allowChallenge: false,
    intro:
      level === 1
        ? 'Count the fruit — slide one blue bead up for each one! 🍓'
        : level === 6
          ? 'The gold bead at the top counts as 5. Keep matching fruit to beads! ✨'
        : level === 11
          ? 'Now try tiny adding: move the first fruit group, then add the next group on the beads. ➕'
        : level === 16
          ? 'A little baddie is wandering around — keep counting! 👀'
        : undefined,
  }
}

export const ADVENTURE_MAX = 50
export const COUNTING_MAX = 20

export function learningWorldCfg(
  _world: LearningWorldId,
  level: number,
  ageBand: AgeBand,
  settings?: ArcadeSettings,
): LevelCfg {
  if (ageBand === 'little') {
    return withGoal(countingCfg(Math.min(level, COUNTING_MAX)), level, ageBand)
  }
  return withGoal(
    ageTuneCfg(
      adventureCfg(ageAdjustedLevel(level, ageBand), settings),
      ageBand,
    ),
    level,
    ageBand,
  )
}
