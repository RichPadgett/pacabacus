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

function goalForLevel(level: number, treasureCount: number, ageBand: AgeBand): LevelGoal {
  const gentleTarget = Math.max(8, Math.ceil(treasureCount * 0.55))
  const sprintTarget = Math.max(10, Math.ceil(treasureCount * 0.5))
  const trailTarget = Math.max(12, Math.ceil(treasureCount * 0.7))

  if (ageBand === 'little' && level % 3 !== 0) {
    return { kind: 'collectFruit', target: gentleTarget, label: `Collect ${gentleTarget} fruit` }
  }
  if (level % 5 === 2) {
    return { kind: 'collectFruit', target: sprintTarget, label: `Snack sprint: collect ${sprintTarget}` }
  }
  if (level % 5 === 4) {
    return { kind: 'collectFruit', target: trailTarget, label: `Treasure trail: collect ${trailTarget}` }
  }
  return { kind: 'collectAll', label: 'Rescue every fruit' }
}

function withGoal(cfg: LevelCfg, level: number, ageBand: AgeBand): LevelCfg {
  return { ...cfg, goal: goalForLevel(level, cfg.treasureCount, ageBand) }
}

function ageTuneEnemy(enemy: EnemyCfg, ageBand: AgeBand): EnemyCfg {
  if (ageBand === 'growing') {
    return {
      ...enemy,
      count: Math.min(3, enemy.count + (enemy.count > 0 ? 1 : 0)),
      correctSteps: enemy.correctSteps + 1,
      wrongSteps: enemy.wrongSteps + 1,
      chaseChance: Math.min(0.9, enemy.chaseChance + 0.16),
      spawnChance: Math.min(0.35, enemy.spawnChance + 0.08),
    }
  }
  if (ageBand === 'big') {
    return {
      ...enemy,
      count: Math.min(4, enemy.count + (enemy.count > 0 ? 1 : 0)),
      correctSteps: enemy.correctSteps + 1,
      wrongSteps: enemy.wrongSteps + 1,
      chaseChance: Math.min(0.95, enemy.chaseChance + 0.24),
      spawnChance: Math.min(0.45, enemy.spawnChance + 0.14),
    }
  }
  return enemy
}

function ageTuneCfg(cfg: LevelCfg, ageBand: AgeBand): LevelCfg {
  return { ...cfg, enemy: ageTuneEnemy(cfg.enemy, ageBand) }
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
              : { kind: 'tech', mathLevel: 5, ops: 'mixed', maxAnswer: 50 }

  const baseEnemy: EnemyCfg = {
    count: level <= 2 ? 1 : level <= 8 ? 1 : level <= 16 ? 2 : 3,
    correctSteps: level <= 14 ? 1 : level <= 30 ? 1 : 2,
    wrongSteps: Math.min(3, 1 + Math.floor(level / 15)),
    chaseChance: Math.min(0.85, 0.3 + level * 0.012),
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
    treasureCount: Math.min(36, 22 + Math.floor(level / 2)),
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
    treasureCount: Math.min(22, 12 + Math.ceil(level / 2)),
    gentle: true,
    allowChallenge: false,
    intro:
      level === 1
        ? 'Count the fruit — slide one blue bead up for each one! 🍓'
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
export const ADD_ON_MAX = 20

function addOnEnemy(level: number): EnemyCfg {
  return {
    count: level <= 3 ? 0 : level <= 10 ? 1 : 2,
    correctSteps: 1,
    wrongSteps: level <= 8 ? 0 : 1,
    chaseChance: Math.min(0.55, 0.18 + level * 0.015),
    spawnChance: 0,
  }
}

export function pacWordsCfg(level: number): LevelCfg {
  return pacWordsCfgForAge(level, 'early')
}

export function pacWordsCfgForAge(level: number, ageBand: AgeBand): LevelCfg {
  const adjustedLevel =
    ageBand === 'little' ? Math.max(1, level - 2) : ageBand === 'big' ? level + 2 : level
  return {
    problem: { kind: 'words', level: adjustedLevel },
    rodCount: 1,
    enemy: addOnEnemy(ageBand === 'little' ? Math.max(1, level - 4) : level),
    treasureCount: Math.min(30, 16 + Math.ceil(adjustedLevel / 2)),
    gentle: true,
    allowChallenge: false,
    intro: level === 1 ? 'Find the missing letter, then collect the fruit! 🔤' : undefined,
  }
}

export function pacTablesCfg(level: number): LevelCfg {
  return pacTablesCfgForAge(level, 'early')
}

export function pacTablesCfgForAge(level: number, ageBand: AgeBand): LevelCfg {
  const maxFactor =
    ageBand === 'little'
      ? Math.min(5, 1 + Math.ceil(level / 3))
      : ageBand === 'early'
        ? Math.min(10, 2 + Math.ceil(level / 3))
        : Math.min(12, 2 + Math.ceil(level / 2))
  return {
    problem: { kind: 'tables', maxFactor },
    rodCount: 2,
    enemy: addOnEnemy(ageBand === 'little' ? Math.max(1, level - 5) : level),
    treasureCount: Math.min(32, 18 + Math.ceil(level / 2)),
    gentle: ageBand === 'little',
    allowChallenge: false,
    intro: level === 1 ? 'Practice times tables to earn moves! ✖️' : undefined,
  }
}

export function pacMathCfg(level: number): LevelCfg {
  return pacMathCfgForAge(level, 'early')
}

export function pacMathCfgForAge(level: number, ageBand: AgeBand): LevelCfg {
  const maxAnswer =
    ageBand === 'little'
      ? level <= 10 ? 10 : 20
      : level <= 6
        ? 10
        : level <= 14
          ? 20
          : 50
  return {
    problem: {
      kind: 'standard',
      maxAnswer,
      ops: ageBand === 'little' || level <= 8 ? 'add' : 'mixed',
    },
    rodCount: 2,
    enemy: addOnEnemy(ageBand === 'little' ? Math.max(1, level - 4) : level),
    treasureCount: Math.min(34, 18 + Math.ceil(level / 2)),
    gentle: ageBand === 'little',
    allowChallenge: false,
    intro: level === 1 ? 'Regular math mode: type the answer to earn moves! ➕' : undefined,
  }
}

export function learningWorldCfg(
  world: LearningWorldId,
  level: number,
  ageBand: AgeBand,
  settings?: ArcadeSettings,
): LevelCfg {
  if (world === 'pacwords') return withGoal(ageTuneCfg(pacWordsCfgForAge(level, ageBand), ageBand), level, ageBand)
  if (world === 'pactables') return withGoal(ageTuneCfg(pacTablesCfgForAge(level, ageBand), ageBand), level, ageBand)
  if (world === 'pacmath') return withGoal(ageTuneCfg(pacMathCfgForAge(level, ageBand), ageBand), level, ageBand)
  if (ageBand === 'little') {
    return withGoal(countingCfg(Math.min(level, COUNTING_MAX)), level, ageBand)
  }
  return withGoal(
    ageTuneCfg(
      adventureCfg(
        ageBand === 'early' ? level : ageBand === 'growing' ? level + 2 : level + 5,
        settings,
      ),
      ageBand,
    ),
    level,
    ageBand,
  )
}

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
    treasureCount: 30,
    gentle: false,
    allowChallenge: true,
    goal: { kind: 'collectAll', label: 'Collect freely' },
  }
}
