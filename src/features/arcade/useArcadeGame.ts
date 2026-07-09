import { useEffect, useMemo, useReducer } from 'react'
import {
  beadHint,
  generateChallenge,
  generateFromCfg,
  movesForProblem,
  type ArcadeProblem,
} from '@/features/drills/problemGenerator'
import type { LevelCfg } from './gameConfig'
import {
  DIR_VECTORS,
  isWall,
  mazeForLevel,
  nextStepToward,
  posKey,
  samePos,
  travelMazeForLevel,
  type Dir,
  type MazeDef,
  type Pos,
} from './maze'

export type Phase =
  | 'answer'
  | 'move'
  | 'ghosts'
  | 'reveal'
  | 'caught'
  | 'doorOpen'
  | 'travel'
  | 'levelClear'
  | 'gameOver'

export interface GameMessage {
  text: string
  tone: 'good' | 'bad'
  id: number
}

const TREASURE_EMOJI = [
  '🍓',
  '🍒',
  '🍊',
  '🍌',
  '🍉',
  '🫐',
  '🍇',
  '🍎',
  '🍐',
  '🍑',
  '🍍',
  '🥝',
]
const ROCK_EMOJI = '🪨'
const JAIL_TURNS = 3
const ROCK_DELAY_MIN_MS = 10_000
const ROCK_DELAY_MAX_MS = 20_000
const CLOAK_SAFE_DISTANCE = 4
const QUICK_SOLVE_MS = 6_000
const QUICK_METER_GAIN = 25
const QUICK_BONUS_MOVES = 2
const POWER_TICKS = 16
const TRAVEL_EXIT_DOOR: Pos = { r: 1, c: 5 }

export interface GameState {
  level: number
  cfg: LevelCfg
  maze: MazeDef
  lives: number
  stars: number
  streak: number
  pac: Pos
  buddy: Pos
  buddyTrail: Pos[]
  facing: Dir
  ghosts: Pos[]
  ghostPrev: Pos[]
  treasures: Map<string, string>
  jailFruits: Set<string>
  jailTurns: number
  phase: Phase
  movesLeft: number
  ghostStepsLeft: number
  afterGhosts: 'retry' | 'next'
  problem: ArcadeProblem
  attempts: number
  answerTicks: number
  hint: string
  answerValue: number
  message: GameMessage | null
  answerStartedAt: number
  quickMeter: number
  starReady: boolean
  powerBuddy: Pos | null
  powerTicksLeft: number
  exitDoor: Pos | null
  travelExitDoor: Pos | null
  /** stars earned when the last level was cleared (1-3, from lives) */
  clearStars: number
}

type Action =
  | { type: 'SET_ANSWER'; value: number }
  | { type: 'SUBMIT' }
  | { type: 'CHALLENGE' }
  | { type: 'MOVE'; dir: Dir }
  | { type: 'END_MOVE' }
  | { type: 'AGE_TREASURES'; count: number }
  | { type: 'START_POWER' }
  | { type: 'BUDDY_POWER_TICK' }
  | { type: 'GHOST_WANDER' }
  | { type: 'GHOST_TICK' }
  | { type: 'TRAVEL_GHOST_TICK' }
  | { type: 'REVEAL_DONE' }
  | { type: 'RESPAWN' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'RESTART_LEVEL' }

const PRAISE = ['Great thinking! 🌟', 'You got it! 🎉', 'Super math brain! 💪', 'Zoom zoom! ✨']
const GENTLE_RETRY = [
  'Almost! Count again — you can do it! 🍓',
  'So close! Try counting one more time! 💛',
  'Good trying! Count them slowly! 🐢',
]
const pickFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
const randomRockDelay = () =>
  ROCK_DELAY_MIN_MS + Math.floor(Math.random() * (ROCK_DELAY_MAX_MS - ROCK_DELAY_MIN_MS + 1))

export function collectibleTreasureCount(treasures: Map<string, string>) {
  return [...treasures.values()].filter((item) => item !== ROCK_EMOJI).length
}

function shuffle<T>(items: T[]) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out
}

function spawnTreasures(maze: MazeDef, cfg: LevelCfg) {
  const skip = new Set([maze.pacSpawn, ...maze.ghostSpawns].map(posKey))
  const treasures = new Map<string, string>()
  const cells: string[] = []
  for (let r = 0; r < maze.rows; r++)
    for (let c = 0; c < maze.cols; c++) {
      const k = posKey({ r, c })
      if (!isWall(maze, r, c) && !skip.has(k)) cells.push(k)
    }
  const picks = shuffle(cells).slice(0, Math.min(cfg.treasureCount, cells.length))
  for (const k of picks) {
    treasures.set(k, TREASURE_EMOJI[Math.floor(Math.random() * TREASURE_EMOJI.length)])
  }
  const jailFruits = new Set<string>()
  if (cfg.enemy.count > 0) {
    for (const k of shuffle(picks).slice(0, Math.min(2, picks.length))) {
      treasures.set(k, '🍓')
      jailFruits.add(k)
    }
  }
  return { treasures, jailFruits }
}

function hasCollectibleTreasure(treasures: Map<string, string>, pos: Pos) {
  const item = treasures.get(posKey(pos))
  return item != null && item !== ROCK_EMOJI
}

function openSteps(maze: MazeDef, from: Pos): Pos[] {
  return Object.values(DIR_VECTORS)
    .map((v) => ({ r: from.r + v.r, c: from.c + v.c }))
    .filter((p) => !isWall(maze, p.r, p.c))
}

function randomStep(maze: MazeDef, from: Pos): Pos {
  const open = openSteps(maze, from)
  return open.length ? open[Math.floor(Math.random() * open.length)] : from
}

function dist(a: Pos, b: Pos) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c)
}

function leaveFruitStep(
  maze: MazeDef,
  from: Pos,
  treasures: Map<string, string>,
  pac?: Pos,
  avoid?: Pos,
): Pos | null {
  if (!hasCollectibleTreasure(treasures, from)) return null
  const clear = openSteps(maze, from).filter(
    (p) =>
      !hasCollectibleTreasure(treasures, p) &&
      (!pac || dist(p, pac) >= CLOAK_SAFE_DISTANCE),
  )
  const forward = avoid ? clear.filter((p) => !samePos(p, avoid)) : clear
  const choices = forward.length ? forward : clear
  return choices.length ? choices[Math.floor(Math.random() * choices.length)] : null
}

function randomSafeStep(maze: MazeDef, from: Pos, pac: Pos, avoid?: Pos): Pos {
  const open = openSteps(maze, from)
  const currentDist = dist(from, pac)
  const away = open.filter(
    (p) =>
      dist(p, pac) > currentDist &&
      dist(p, pac) >= CLOAK_SAFE_DISTANCE &&
      (!avoid || !samePos(p, avoid)),
  )
  const sideways = open.filter(
    (p) =>
      dist(p, pac) >= currentDist &&
      dist(p, pac) >= CLOAK_SAFE_DISTANCE &&
      (!avoid || !samePos(p, avoid)),
  )
  const safe = open.filter((p) => dist(p, pac) >= CLOAK_SAFE_DISTANCE)
  const notPlayer = open.filter((p) => !samePos(p, pac))
  const fallback = away.length ? away : sideways.length ? sideways : safe.length ? safe : notPlayer
  return fallback.length ? fallback[Math.floor(Math.random() * fallback.length)] : from
}

function wanderWhileSolving(
  maze: MazeDef,
  from: Pos,
  previous: Pos | undefined,
  treasures: Map<string, string>,
  pac: Pos,
): Pos {
  let current = from
  let avoid = previous
  const steps = 1
  for (let i = 0; i < steps; i++) {
    const next =
      leaveFruitStep(maze, current, treasures, pac, avoid) ??
      randomSafeStep(maze, current, pac, avoid)
    avoid = current
    current = next
  }
  return current
}

function nearestTreasureStep(maze: MazeDef, from: Pos, treasures: Map<string, string>): Pos {
  const targets = [...treasures.keys()].filter((k) => treasures.get(k) !== ROCK_EMOJI)
  if (!targets.length) return from
  const [targetKey] = targets.sort((a, b) => {
    const [ar, ac] = a.split(',').map(Number)
    const [br, bc] = b.split(',').map(Number)
    return dist(from, { r: ar, c: ac }) - dist(from, { r: br, c: bc })
  })
  const [r, c] = targetKey.split(',').map(Number)
  return nextStepToward(maze, from, { r, c })
}

function exitDoorForMaze(maze: MazeDef): Pos {
  const topCorridors: Pos[] = []
  for (let c = 1; c < maze.cols - 1; c++) {
    if (!isWall(maze, 1, c)) topCorridors.push({ r: 1, c })
  }
  return topCorridors.sort(
    (a, b) =>
      Math.abs(a.c - Math.floor(maze.cols / 2)) -
      Math.abs(b.c - Math.floor(maze.cols / 2)),
  )[0] ?? maze.pacSpawn
}

function farthestSpawn(maze: MazeDef, pac: Pos): Pos {
  return [...maze.ghostSpawns].sort(
    (a, b) =>
      Math.abs(b.r - pac.r) + Math.abs(b.c - pac.c) - (Math.abs(a.r - pac.r) + Math.abs(a.c - pac.c)),
  )[0]
}

function makeReducer(
  cfgFor: (level: number) => LevelCfg,
  travelEnabled: boolean,
  travelMaxLevel: number,
) {
  const say = (state: GameState, text: string, tone: 'good' | 'bad'): GameMessage => ({
    text,
    tone,
    id: (state.message?.id ?? 0) + 1,
  })

  const freshProblem = (cfg: LevelCfg): Partial<GameState> => ({
    problem: generateFromCfg(cfg.problem),
    attempts: 0,
    answerTicks: 0,
    hint: '',
    answerValue: 0,
    answerStartedAt: Date.now(),
    phase: 'answer',
  })

  const enterGhostPhase = (
    state: GameState,
    steps: number,
    after: 'retry' | 'next',
  ): GameState => {
    // jailed baddies sit this turn out
    if (state.jailTurns > 0) {
      const served = { ...state, jailTurns: state.jailTurns - 1 }
      return after === 'next'
        ? { ...served, ...freshProblem(state.cfg) }
        : { ...served, phase: 'answer' }
    }
    // random spawning: a new baddie may wander in
    let ghosts = state.ghosts
    let message = state.message
    if (
      ghosts.length < state.cfg.enemy.count &&
      Math.random() < state.cfg.enemy.spawnChance
    ) {
      ghosts = [...ghosts, farthestSpawn(state.maze, state.pac)]
      message = say(state, 'A new baddie wandered in! 👀', 'bad')
    }
    if (ghosts.length === 0 || steps <= 0) {
      const base = { ...state, ghosts, message }
      return after === 'next'
        ? { ...base, ...freshProblem(state.cfg) }
        : { ...base, phase: 'answer' }
    }
    return { ...state, ghosts, message, phase: 'ghosts', ghostStepsLeft: steps, afterGhosts: after }
  }

  const caughtState = (state: GameState): GameState => {
    const lives = state.lives - 1
    if (lives <= 0) {
      return {
        ...state,
        lives: 0,
        phase: 'gameOver',
        message: say(state, 'The baddies got you! 👻', 'bad'),
      }
    }
    return {
      ...state,
      lives,
      phase: 'caught',
      message: say(state, 'A baddie got you! Back to start — keep going! ❤️', 'bad'),
    }
  }

  const enterTravel = (state: GameState): GameState => {
    const maze = travelMazeForLevel(state.level)
    const ghostCount = Math.max(1, Math.min(2, state.cfg.enemy.count))
    return {
      ...state,
      maze,
      pac: maze.pacSpawn,
      buddy: maze.pacSpawn,
      buddyTrail: [maze.pacSpawn, maze.pacSpawn, maze.pacSpawn],
      facing: 'up',
      ghosts: maze.ghostSpawns.slice(0, ghostCount),
      ghostPrev: maze.ghostSpawns.slice(0, ghostCount),
      treasures: new Map(),
      jailFruits: new Set(),
      jailTurns: 0,
      movesLeft: 0,
      powerBuddy: null,
      powerTicksLeft: 0,
      exitDoor: null,
      travelExitDoor: TRAVEL_EXIT_DOOR,
      phase: 'travel',
      message: say(state, 'Find the next door! Watch the path baddies. 🚪', 'good'),
    }
  }

  const revealState = (state: GameState): GameState => ({
    ...state,
    streak: 0,
    hint: `The answer is ${state.problem.answer} — look at the beads!`,
    answerValue: state.problem.answer,
    phase: 'reveal',
    message: say(state, `It was ${state.problem.answer}. You'll get the next one! 💪`, 'bad'),
  })

  const levelStart = (state: GameState, level: number): GameState => {
    const cfg = cfgFor(level)
    const maze = mazeForLevel(level)
    const { treasures, jailFruits } = spawnTreasures(maze, cfg)
    return {
      ...state,
      level,
      cfg,
      maze,
      pac: maze.pacSpawn,
      buddy: maze.pacSpawn,
      buddyTrail: [maze.pacSpawn, maze.pacSpawn, maze.pacSpawn],
      facing: 'right',
      ghosts: maze.ghostSpawns.slice(0, cfg.enemy.count),
      ghostPrev: maze.ghostSpawns.slice(0, cfg.enemy.count),
      treasures,
      jailFruits,
      jailTurns: 0,
      powerBuddy: null,
      powerTicksLeft: 0,
      exitDoor: null,
      travelExitDoor: null,
      ...freshProblem(cfg),
      message: cfg.intro ? say(state, cfg.intro, 'good') : state.message,
    }
  }

  return function reducer(state: GameState, action: Action): GameState {
    switch (action.type) {
      case 'SET_ANSWER': {
        if (state.phase !== 'answer') return state
        return { ...state, answerValue: action.value }
      }

      case 'CHALLENGE': {
        if (
          state.phase !== 'answer' ||
          !state.cfg.allowChallenge ||
          state.problem.technique === 'challenge' ||
          state.cfg.problem.kind !== 'tech'
        )
          return state
        return {
          ...state,
          problem: generateChallenge({
            mathLevel: state.cfg.problem.mathLevel,
            ops: state.cfg.problem.ops,
            maxAnswer: state.cfg.problem.maxAnswer,
          }),
          attempts: 0,
          hint: '',
          answerValue: 0,
          message: say(state, '⚡ CHALLENGE! One try for 10 moves!', 'good'),
        }
      }

      case 'SUBMIT': {
        if (state.phase !== 'answer') return state
        const p = state.problem
        if (state.answerValue === p.answer) {
          const isChallenge = p.technique === 'challenge'
          const quickSolve = !isChallenge && Date.now() - state.answerStartedAt <= QUICK_SOLVE_MS
          const quickMeter = quickSolve
            ? Math.min(100, state.quickMeter + QUICK_METER_GAIN)
            : state.quickMeter
          const starReady = state.starReady || quickMeter >= 100
          const moves = movesForProblem(p) + (quickSolve ? QUICK_BONUS_MOVES : 0)
          return {
            ...state,
            stars: state.stars + (isChallenge ? 3 : 1),
            streak: state.streak + 1,
            movesLeft: moves,
            quickMeter,
            starReady,
            phase: 'move',
            hint: '',
            message: say(
              state,
              isChallenge
                ? '⚡ CHALLENGE SMASHED! 10 moves! ⚡'
                : quickSolve
                  ? `Quick solve! +${QUICK_BONUS_MOVES} moves! ⭐`
                  : pickFrom(PRAISE),
              'good',
            ),
          }
        }
        const attempts = state.attempts + 1
        if (state.cfg.gentle) {
          // unlimited kind retries; show the answer on the beads after 3 tries
          if (attempts >= 3) return revealState({ ...state, attempts })
          return {
            ...state,
            attempts,
            hint: beadHint(p),
            message: say(state, pickFrom(GENTLE_RETRY), 'bad'),
          }
        }
        if (p.technique === 'challenge') {
          return revealState({ ...state, attempts })
        }
        if (attempts === 1) {
          return enterGhostPhase(
            {
              ...state,
              attempts,
              streak: 0,
              hint: beadHint(p),
              message: say(state, 'Almost! Try again — check the hint. 💡', 'bad'),
            },
            state.cfg.enemy.wrongSteps,
            'retry',
          )
        }
        return revealState({ ...state, attempts })
      }

      case 'MOVE': {
        if (!['move', 'doorOpen', 'travel'].includes(state.phase)) return state
        if (
          state.phase === 'doorOpen' &&
          state.exitDoor &&
          samePos(state.pac, state.exitDoor) &&
          action.dir === 'up'
        ) {
          return enterTravel(state)
        }
        const v = DIR_VECTORS[action.dir]
        const target = { r: state.pac.r + v.r, c: state.pac.c + v.c }
        if (isWall(state.maze, target.r, target.c)) {
          return { ...state, facing: action.dir }
        }
        if (state.phase === 'travel') {
          const moved: GameState = {
            ...state,
            pac: target,
            buddy: state.pac,
            buddyTrail: [state.pac, ...state.buddyTrail].slice(0, 3),
            facing: action.dir,
          }
          if (state.travelExitDoor && samePos(target, state.travelExitDoor)) {
            return levelStart(moved, state.level + 1)
          }
          if (state.ghosts.some((g) => samePos(g, target))) {
            return {
              ...moved,
              pac: state.maze.pacSpawn,
              buddy: state.maze.pacSpawn,
              buddyTrail: [state.maze.pacSpawn, state.maze.pacSpawn, state.maze.pacSpawn],
              message: say(state, 'A path baddie bumped you back to the door! Try again. 👀', 'bad'),
            }
          }
          return moved
        }
        if (state.phase === 'doorOpen') {
          return {
            ...state,
            pac: target,
            buddy: state.pac,
            buddyTrail: [state.pac, ...state.buddyTrail].slice(0, 3),
            facing: action.dir,
            message:
              state.exitDoor && samePos(target, state.exitDoor)
                ? say(state, 'Press up at the door to enter the path! 🚪', 'good')
                : state.message,
          }
        }
        const key = posKey(target)
        const treasure = state.treasures.get(key)
        const treasures = new Map(state.treasures)
        if (treasure && treasure !== ROCK_EMOJI) treasures.delete(key)
        let moved: GameState = {
          ...state,
          pac: target,
          buddy: state.pac,
          buddyTrail: [state.pac, ...state.buddyTrail].slice(0, 3),
          facing: action.dir,
          treasures,
          movesLeft: state.movesLeft - 1,
        }
        if (state.jailFruits.has(key) && state.ghosts.length) {
          const jail = state.maze.ghostSpawns[0]
          const jailFruits = new Set(state.jailFruits)
          jailFruits.delete(key)
          moved = {
            ...moved,
            jailFruits,
            jailTurns: JAIL_TURNS,
            ghosts: state.ghosts.map(() => jail),
            ghostPrev: state.ghosts,
            message: say(state, 'Golden strawberry! Baddies go to jail! 🔒', 'good'),
          }
        }
        if (state.jailTurns === 0 && state.ghosts.some((g) => samePos(g, target))) {
          return caughtState(moved)
        }
        if (collectibleTreasureCount(treasures) === 0) {
          if (travelEnabled && state.level < travelMaxLevel) {
            return {
              ...moved,
              phase: 'doorOpen',
              exitDoor: exitDoorForMaze(state.maze),
              clearStars: Math.max(1, moved.lives),
              message: say(state, 'The exit door opened! Head to the top door. 🚪', 'good'),
            }
          }
          return { ...moved, phase: 'levelClear', clearStars: Math.max(1, moved.lives) }
        }
        if (moved.movesLeft <= 0) {
          return enterGhostPhase(moved, state.cfg.enemy.correctSteps, 'next')
        }
        return moved
      }

      case 'END_MOVE': {
        if (state.phase !== 'move') return state
        return enterGhostPhase(state, state.cfg.enemy.correctSteps, 'next')
      }

      case 'AGE_TREASURES': {
        if (state.phase !== 'answer') return state
        const candidates = [...state.treasures.keys()].filter(
          (k) => state.treasures.get(k) !== ROCK_EMOJI && !state.jailFruits.has(k),
        )
        if (!candidates.length) return { ...state, answerTicks: state.answerTicks + 1 }
        const treasures = new Map(state.treasures)
        for (const k of shuffle(candidates).slice(0, action.count)) {
          treasures.set(k, ROCK_EMOJI)
        }
        return {
          ...state,
          treasures,
          answerTicks: state.answerTicks + 1,
          message:
            state.answerTicks === 0
              ? say(state, 'Some treasures turned into rocks — keep counting! 🪨', 'bad')
              : state.message,
        }
      }

      case 'START_POWER': {
        if (!state.starReady || state.powerTicksLeft > 0) return state
        return {
          ...state,
          starReady: false,
          quickMeter: 0,
          powerBuddy: state.pac,
          powerTicksLeft: POWER_TICKS,
          message: say(state, 'Star buddy power! Grab that fruit! ⭐', 'good'),
        }
      }

      case 'BUDDY_POWER_TICK': {
        if (!state.powerBuddy || state.powerTicksLeft <= 0) return state
        const next = nearestTreasureStep(state.maze, state.powerBuddy, state.treasures)
        const key = posKey(next)
        const treasure = state.treasures.get(key)
        const treasures = new Map(state.treasures)
        if (treasure && treasure !== ROCK_EMOJI) treasures.delete(key)
        const done = state.powerTicksLeft <= 1 || collectibleTreasureCount(treasures) === 0
        const cleared = done && collectibleTreasureCount(treasures) === 0
        return {
          ...state,
          treasures,
          powerBuddy: done ? null : next,
          powerTicksLeft: done ? 0 : state.powerTicksLeft - 1,
          phase: cleared
            ? travelEnabled && state.level < travelMaxLevel
              ? 'doorOpen'
              : 'levelClear'
            : state.phase,
          exitDoor:
            cleared && travelEnabled && state.level < travelMaxLevel
              ? exitDoorForMaze(state.maze)
              : state.exitDoor,
          clearStars: cleared ? Math.max(1, state.lives) : state.clearStars,
          message:
            cleared && travelEnabled && state.level < travelMaxLevel
              ? say(state, 'The exit door opened! Head to the top door. 🚪', 'good')
              : state.message,
        }
      }

      case 'GHOST_WANDER': {
        if (state.phase !== 'answer' || state.jailTurns > 0) return state
        return {
          ...state,
          ghosts: state.ghosts.map((g, i) =>
            wanderWhileSolving(state.maze, g, state.ghostPrev[i], state.treasures, state.pac),
          ),
          ghostPrev: state.ghosts,
        }
      }

      case 'GHOST_TICK': {
        if (state.phase !== 'ghosts') return state
        const ghosts = state.ghosts.map((g) => {
          const leaveFruit = leaveFruitStep(state.maze, g, state.treasures)
          if (leaveFruit) return leaveFruit
          return Math.random() < state.cfg.enemy.chaseChance
            ? nextStepToward(state.maze, g, state.pac)
            : randomStep(state.maze, g)
        })
        const stepped = {
          ...state,
          ghosts,
          ghostPrev: state.ghosts,
          ghostStepsLeft: state.ghostStepsLeft - 1,
        }
        if (ghosts.some((g) => samePos(g, state.pac))) {
          return caughtState(stepped)
        }
        if (stepped.ghostStepsLeft <= 0) {
          return stepped.afterGhosts === 'next'
            ? { ...stepped, ...freshProblem(state.cfg) }
            : { ...stepped, phase: 'answer' }
        }
        return stepped
      }

      case 'TRAVEL_GHOST_TICK': {
        if (state.phase !== 'travel') return state
        const ghosts = state.ghosts.map((g) => randomStep(state.maze, g))
        const bumped = ghosts.some((g) => samePos(g, state.pac))
        return {
          ...state,
          ghosts,
          ghostPrev: state.ghosts,
          ...(bumped
            ? {
                pac: state.maze.pacSpawn,
                buddy: state.maze.pacSpawn,
                buddyTrail: [state.maze.pacSpawn, state.maze.pacSpawn, state.maze.pacSpawn],
                message: say(state, 'A path baddie bumped you back to the door! Try again. 👀', 'bad'),
              }
            : {}),
        }
      }

      case 'REVEAL_DONE': {
        if (state.phase !== 'reveal') return state
        return enterGhostPhase(
          state,
          state.cfg.gentle ? 0 : state.cfg.enemy.wrongSteps,
          'next',
        )
      }

      case 'RESPAWN': {
        if (state.phase !== 'caught') return state
        return {
          ...state,
          pac: state.maze.pacSpawn,
          buddy: state.maze.pacSpawn,
          buddyTrail: [state.maze.pacSpawn, state.maze.pacSpawn, state.maze.pacSpawn],
          facing: 'right',
          ghosts: state.maze.ghostSpawns.slice(0, state.cfg.enemy.count),
          ghostPrev: state.maze.ghostSpawns.slice(0, state.cfg.enemy.count),
          jailTurns: 0,
          ...freshProblem(state.cfg),
        }
      }

      case 'NEXT_LEVEL': {
        if (state.phase !== 'levelClear') return state
        return levelStart(state, state.level + 1)
      }

      case 'RESTART_LEVEL': {
        if (state.phase !== 'gameOver') return state
        return levelStart({ ...state, lives: 3, streak: 0 }, state.level)
      }

      default:
        return state
    }
  }
}

function makeInitialState(cfgFor: (level: number) => LevelCfg, startLevel: number): GameState {
  const cfg = cfgFor(startLevel)
  const maze = mazeForLevel(startLevel)
  const { treasures, jailFruits } = spawnTreasures(maze, cfg)
  return {
    level: startLevel,
    cfg,
    maze,
    lives: 3,
    stars: 0,
    streak: 0,
    pac: maze.pacSpawn,
    buddy: maze.pacSpawn,
    buddyTrail: [maze.pacSpawn, maze.pacSpawn, maze.pacSpawn],
    facing: 'right',
    ghosts: maze.ghostSpawns.slice(0, cfg.enemy.count),
    ghostPrev: maze.ghostSpawns.slice(0, cfg.enemy.count),
    treasures,
    jailFruits,
    jailTurns: 0,
    phase: 'answer',
    movesLeft: 0,
    ghostStepsLeft: 0,
    afterGhosts: 'next',
    problem: generateFromCfg(cfg.problem),
    attempts: 0,
    answerTicks: 0,
    hint: '',
    answerValue: 0,
    message: cfg.intro ? { text: cfg.intro, tone: 'good', id: 1 } : null,
    answerStartedAt: Date.now(),
    quickMeter: 0,
    starReady: false,
    powerBuddy: null,
    powerTicksLeft: 0,
    exitDoor: null,
    travelExitDoor: null,
    clearStars: 0,
  }
}

export function useArcadeGame(
  cfgFor: (level: number) => LevelCfg,
  startLevel: number,
  stepMs: number,
  rockAgingEnabled: boolean,
  travelEnabled = false,
  travelMaxLevel = Infinity,
) {
  const reducer = useMemo(
    () => makeReducer(cfgFor, travelEnabled, travelMaxLevel),
    [cfgFor, travelEnabled, travelMaxLevel],
  )
  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => makeInitialState(cfgFor, startLevel),
  )

  useEffect(() => {
    if (state.powerTicksLeft > 0) {
      const t = setInterval(() => dispatch({ type: 'BUDDY_POWER_TICK' }), 300)
      return () => clearInterval(t)
    }
    if (state.phase === 'answer' && rockAgingEnabled) {
      const t = setTimeout(
        () => dispatch({ type: 'AGE_TREASURES', count: 1 }),
        randomRockDelay(),
      )
      return () => clearTimeout(t)
    }
    if (state.phase === 'ghosts') {
      const t = setInterval(() => dispatch({ type: 'GHOST_TICK' }), stepMs + 40)
      return () => clearInterval(t)
    }
    if (state.phase === 'travel') {
      const t = setInterval(() => dispatch({ type: 'TRAVEL_GHOST_TICK' }), Math.max(700, stepMs * 3))
      return () => clearInterval(t)
    }
    if (state.phase === 'caught') {
      const t = setTimeout(() => dispatch({ type: 'RESPAWN' }), 1100)
      return () => clearTimeout(t)
    }
    if (state.phase === 'reveal') {
      const t = setTimeout(() => dispatch({ type: 'REVEAL_DONE' }), 1900)
      return () => clearTimeout(t)
    }
  }, [state.phase, state.answerTicks, state.powerTicksLeft, stepMs, rockAgingEnabled])

  useEffect(() => {
    if (state.phase !== 'answer' || state.ghosts.length === 0 || state.jailTurns > 0) return
    const t = setInterval(
      () => dispatch({ type: 'GHOST_WANDER' }),
      Math.max(900, stepMs * 5),
    )
    return () => clearInterval(t)
  }, [state.phase, state.ghosts.length, state.jailTurns, stepMs])

  return { state, dispatch }
}
