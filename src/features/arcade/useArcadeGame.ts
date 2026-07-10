import { useEffect, useMemo, useReducer } from 'react'
import {
  beadHint,
  generateChallenge,
  generateFromCfg,
  movesForProblem,
  type ArcadeProblem,
} from '@/features/drills/problemGenerator'
import type { LearningWorldId } from '@/features/learning/learningWorlds'
import { rescueForClear, type RescueChallenge } from '@/features/profile/rescueChallenges'
import type { GhostSkill } from './characterGrowth'
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
  | 'rescueFight'
  | 'rescueWall'
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

export interface RescueRun {
  challenge: RescueChallenge
  badGuysLeft: number
  wallHits: number
  wallTarget: number
  saved: boolean
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
const POWER_STRAWBERRY_MOVES = 20
const ROCK_DELAY_MIN_MS = 10_000
const ROCK_DELAY_MAX_MS = 20_000
const CLOAK_SAFE_DISTANCE = 4
const QUICK_SOLVE_MS = 6_000
const QUICK_METER_GAIN = 25
const QUICK_BONUS_MOVES = 2
const POWER_TICKS = 16
const PATH_TREASURES = ['🍓', '🍒', '🍊', '🍌', '🍇', '💰']

export const ANSWER_PHASES: Phase[] = ['answer', 'rescueFight', 'rescueWall']

function guardChargesForSkill(skill: GhostSkill) {
  if (skill === 'attack') return 2
  if (skill === 'defend') return 3
  return 0
}

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
  vulnerableMovesLeft: number
  phase: Phase
  movesLeft: number
  ghostStepsLeft: number
  afterGhosts: 'retry' | 'next'
  problem: ArcadeProblem
  attempts: number
  answerTicks: number
  hint: string
  answerValue: number
  answerText: string
  message: GameMessage | null
  rescue: RescueRun | null
  answerStartedAt: number
  goalProgress: number
  goalTarget: number
  goalLabel: string
  quickMeter: number
  starReady: boolean
  guardCharges: number
  powerBuddy: Pos | null
  powerTicksLeft: number
  exitDoor: Pos | null
  travelExitDoor: Pos | null
  /** stars earned when the last level was cleared (1-3, from lives) */
  clearStars: number
}

type Action =
  | { type: 'SET_ANSWER'; value: number }
  | { type: 'SET_TEXT_ANSWER'; value: string }
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

function goalStateFor(cfg: LevelCfg, treasures: Map<string, string>) {
  const total = collectibleTreasureCount(treasures)
  if (cfg.goal?.kind === 'collectFruit') {
    const target = Math.min(cfg.goal.target, total)
    return {
      goalProgress: 0,
      goalTarget: target,
      goalLabel: cfg.goal.label.replace(String(cfg.goal.target), String(target)),
    }
  }
  return {
    goalProgress: 0,
    goalTarget: total,
    goalLabel: cfg.goal?.label ?? 'Rescue every fruit',
  }
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

function travelTreasuresForMaze(maze: MazeDef, exitDoor: Pos, level: number): Map<string, string> {
  const treasures = new Map<string, string>()
  const blocked = new Set([maze.pacSpawn, exitDoor, ...maze.ghostSpawns].map(posKey))
  const candidates: Pos[] = []
  for (let r = 1; r < maze.rows - 1; r++) {
    for (let c = 1; c < maze.cols - 1; c++) {
      const p = { r, c }
      if (!isWall(maze, r, c) && !blocked.has(posKey(p))) candidates.push(p)
    }
  }
  const step = Math.max(2, 4 - (level % 3))
  candidates.forEach((p, index) => {
    if (index % step !== level % step) return
    treasures.set(posKey(p), PATH_TREASURES[(index + level) % PATH_TREASURES.length])
  })
  return treasures
}

function farthestSpawn(maze: MazeDef, pac: Pos): Pos {
  return [...maze.ghostSpawns].sort(
    (a, b) =>
      Math.abs(b.r - pac.r) + Math.abs(b.c - pac.c) - (Math.abs(a.r - pac.r) + Math.abs(a.c - pac.c)),
  )[0]
}

function travelGhostCount(level: number, cfgCount: number, spawnCount: number) {
  const base = level % 5 === 0 ? 3 : 2
  const lateBoost = level >= 30 ? 2 : level >= 15 ? 1 : 0
  return Math.max(base, Math.min(spawnCount, cfgCount + 1 + lateBoost))
}

function rescueProblem(cfg: LevelCfg): ArcadeProblem {
  const problem = cfg.problem
  if (problem.kind === 'tech') {
    return generateChallenge({
      mathLevel: problem.mathLevel,
      ops: problem.ops,
      maxAnswer: problem.maxAnswer,
    })
  }
  if (problem.kind === 'tables') {
    return generateFromCfg({ ...problem, maxFactor: Math.min(15, problem.maxFactor + 2) })
  }
  if (problem.kind === 'standard') {
    return generateFromCfg({ ...problem, maxAnswer: Math.min(100, problem.maxAnswer + 25) })
  }
  if (problem.kind === 'words') {
    return generateFromCfg({ ...problem, level: problem.level + 3 })
  }
  return generateChallenge({ mathLevel: 3, ops: 'add', maxAnswer: 20 })
}

function rescueWallTarget(level: number) {
  return level >= 50 ? 5 : level >= 35 ? 4 : 3
}

function makeReducer(
  cfgFor: (level: number) => LevelCfg,
  travelEnabled: boolean,
  travelMaxLevel: number,
  ghostSkill: GhostSkill,
  learningWorld: LearningWorldId,
  ownedCharacters: string[],
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
    answerText: '',
    answerStartedAt: Date.now(),
    phase: 'answer',
  })

  const freshRescueProblem = (state: GameState): Partial<GameState> => ({
    problem: rescueProblem(state.cfg),
    attempts: 0,
    answerTicks: 0,
    hint: '',
    answerValue: 0,
    answerText: '',
    answerStartedAt: Date.now(),
  })

  const rescueForState = (state: GameState) => {
    const rescue = rescueForClear(learningWorld, state.level)
    if (!rescue || ownedCharacters.includes(rescue.hero)) return null
    return rescue
  }

  const startRescue = (state: GameState, rescue: RescueChallenge): GameState => {
    const badGuysLeft = Math.max(2, state.ghosts.length, Math.min(4, state.cfg.enemy.count + 1))
    const ghosts = state.maze.ghostSpawns.slice(0, badGuysLeft)
    return {
      ...state,
      rescue: {
        challenge: rescue,
        badGuysLeft,
        wallHits: 0,
        wallTarget: rescueWallTarget(state.level),
        saved: false,
      },
      ghosts,
      ghostPrev: ghosts,
      movesLeft: 0,
      phase: 'rescueFight',
      ...freshRescueProblem(state),
      message: say(state, `${rescue.title}! Defeat the baddies, then break the rescue wall.`, 'good'),
    }
  }

  const clearRescueState = (state: GameState): GameState => ({
    ...state,
    phase: 'levelClear',
    clearStars: Math.max(1, state.lives),
    rescue: state.rescue ? { ...state.rescue, saved: true } : null,
    message: say(state, 'Rescue complete! The wall crumbled away. 🔓', 'good'),
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

  const defendedState = (state: GameState): GameState | null => {
    if (
      ghostSkill === 'none' ||
      state.vulnerableMovesLeft > 0 ||
      state.jailTurns > 0 ||
      state.guardCharges <= 0
    )
      return null
    const colliding = state.ghosts.filter((g) => samePos(g, state.pac))
    if (!colliding.length) return null
    if (ghostSkill === 'attack') {
      return {
        ...state,
        ghosts: state.ghosts.filter((g) => !samePos(g, state.pac)),
        ghostPrev: state.ghosts,
        jailTurns: 0,
        vulnerableMovesLeft: 0,
        guardCharges: state.guardCharges - 1,
        message: say(
          state,
          state.guardCharges > 1
            ? `Legend power! The baddie poofed away! ${state.guardCharges - 1} left. ✨`
            : 'Legend power used up! The baddie poofed away! ✨',
          'good',
        ),
      }
    }
    const jail = state.maze.ghostSpawns[0] ?? state.maze.pacSpawn
    return {
      ...state,
      ghosts: state.ghosts.map((g) => (samePos(g, state.pac) ? jail : g)),
      ghostPrev: state.ghosts,
      jailTurns: 1,
      guardCharges: state.guardCharges - 1,
      message: say(
        state,
        state.guardCharges > 1
          ? `Guardian block! ${state.guardCharges - 1} blocks left. 🛡️`
          : 'Guardian block used up! Stay sharp. 🛡️',
        'good',
      ),
    }
  }

  const caughtState = (state: GameState): GameState => {
    const defended = defendedState(state)
    if (defended) return defended
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
    const ghostCount = travelGhostCount(state.level, state.cfg.enemy.count, maze.ghostSpawns.length)
    const travelExitDoor = exitDoorForMaze(maze)
    const treasures = travelTreasuresForMaze(maze, travelExitDoor, state.level)
    const isWorldGate = state.level % 5 === 0
    return {
      ...state,
      maze,
      pac: maze.pacSpawn,
      buddy: maze.pacSpawn,
      buddyTrail: [maze.pacSpawn, maze.pacSpawn, maze.pacSpawn],
      facing: 'up',
      ghosts: maze.ghostSpawns.slice(0, ghostCount),
      ghostPrev: maze.ghostSpawns.slice(0, ghostCount),
      treasures,
      jailFruits: new Set(),
      jailTurns: 0,
      vulnerableMovesLeft: 0,
      movesLeft: 0,
      powerBuddy: null,
      powerTicksLeft: 0,
      exitDoor: null,
      travelExitDoor,
      goalProgress: 0,
      goalTarget: 1,
      goalLabel: isWorldGate ? 'Cross the world gate' : 'Reach the next room',
      phase: 'travel',
      message: say(
        state,
        isWorldGate
          ? 'World gate opened! Cross the maze path to the next land. 🚪'
          : maze.troubleSpots?.length
            ? 'Journey path opened! Warning tiles can call more baddies. ⚠'
            : 'Journey path opened! Grab snacks and find the next room. 🚪',
        'good',
      ),
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
    const goal = goalStateFor(cfg, treasures)
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
      vulnerableMovesLeft: 0,
      guardCharges: guardChargesForSkill(ghostSkill),
      powerBuddy: null,
      powerTicksLeft: 0,
      exitDoor: null,
      travelExitDoor: null,
      rescue: null,
      ...goal,
      ...freshProblem(cfg),
      message: cfg.intro ? say(state, cfg.intro, 'good') : state.message,
    }
  }

  const goalComplete = (
    state: GameState,
    treasures: Map<string, string>,
    goalProgress: number,
  ) => {
    if (state.cfg.goal?.kind === 'collectFruit') return goalProgress >= state.goalTarget
    return collectibleTreasureCount(treasures) === 0
  }

  const clearLevelState = (state: GameState, message?: string): GameState => {
    const rescue = rescueForState(state)
    if (rescue) return startRescue(state, rescue)
    if (travelEnabled && state.level < travelMaxLevel) {
      return {
        ...state,
        phase: 'doorOpen',
        exitDoor: exitDoorForMaze(state.maze),
        clearStars: Math.max(1, state.lives),
        message: say(state, message ?? 'The exit door opened! Head to the top door. 🚪', 'good'),
      }
    }
    return { ...state, phase: 'levelClear', clearStars: Math.max(1, state.lives) }
  }

  return function reducer(state: GameState, action: Action): GameState {
    switch (action.type) {
      case 'SET_ANSWER': {
        if (!ANSWER_PHASES.includes(state.phase)) return state
        return { ...state, answerValue: action.value }
      }

      case 'SET_TEXT_ANSWER': {
        if (!ANSWER_PHASES.includes(state.phase)) return state
        return { ...state, answerText: action.value }
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
        if (!ANSWER_PHASES.includes(state.phase)) return state
        const p = state.problem
        const correct =
          p.answerText != null
            ? state.answerText.trim().toLowerCase() === p.answerText.toLowerCase()
            : state.answerValue === p.answer
        if (state.phase === 'rescueFight') {
          if (!state.rescue) return state
          if (correct) {
            const badGuysLeft = Math.max(0, state.rescue.badGuysLeft - 1)
            const rescue = { ...state.rescue, badGuysLeft }
            const ghosts = state.ghosts.slice(0, badGuysLeft)
            if (badGuysLeft <= 0) {
              return {
                ...state,
                rescue,
                ghosts: [],
                ghostPrev: [],
                phase: 'rescueWall',
                stars: state.stars + 2,
                ...freshRescueProblem(state),
                message: say(state, 'Baddies beaten! Solve to crumble the rescue wall. 🧱', 'good'),
              }
            }
            return {
              ...state,
              rescue,
              ghosts,
              ghostPrev: ghosts,
              stars: state.stars + 2,
              ...freshRescueProblem(state),
              message: say(state, `Baddie beaten! ${badGuysLeft} left before the wall. ⚡`, 'good'),
            }
          }
          const lives = state.lives - 1
          if (lives <= 0) {
            return {
              ...state,
              lives: 0,
              phase: 'gameOver',
              message: say(state, 'The rescue baddies got you! 👻', 'bad'),
            }
          }
          return {
            ...state,
            lives,
            ...freshRescueProblem(state),
            attempts: state.attempts + 1,
            hint: beadHint(p),
            message: say(state, 'The baddie pushed back! You lost a heart. ❤️', 'bad'),
          }
        }
        if (state.phase === 'rescueWall') {
          if (!state.rescue) return state
          if (correct) {
            const wallHits = state.rescue.wallHits + 1
            const rescue = { ...state.rescue, wallHits }
            if (wallHits >= state.rescue.wallTarget) {
              return clearRescueState({ ...state, rescue, stars: state.stars + 3, ghosts: [], ghostPrev: [] })
            }
            return {
              ...state,
              rescue,
              stars: state.stars + 1,
              ...freshRescueProblem(state),
              message: say(
                state,
                `Crack! The wall is crumbling (${wallHits}/${state.rescue.wallTarget}). 🧱`,
                'good',
              ),
            }
          }
          const rescue = { ...state.rescue, badGuysLeft: 1 }
          const ghost = farthestSpawn(state.maze, state.pac)
          return {
            ...state,
            rescue,
            ghosts: [ghost],
            ghostPrev: [ghost],
            phase: 'rescueFight',
            ...freshRescueProblem(state),
            message: say(state, 'Oops! A new rescue baddie appeared. Beat it first! 👀', 'bad'),
          }
        }
        if (correct) {
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
          const key = posKey(target)
          const treasure = state.treasures.get(key)
          const treasures = new Map(state.treasures)
          if (treasure) treasures.delete(key)
          const hitTrouble = state.maze.troubleSpots?.some((spot) => samePos(spot, target)) ?? false
          const canSpawnTrouble =
            hitTrouble &&
            state.ghosts.length < state.maze.ghostSpawns.length &&
            Math.random() < (state.level >= 35 ? 0.8 : state.level >= 20 ? 0.55 : 0.35)
          const ghosts = canSpawnTrouble
            ? [...state.ghosts, farthestSpawn(state.maze, target)]
            : state.ghosts
          const moved: GameState = {
            ...state,
            pac: target,
            buddy: state.pac,
            buddyTrail: [state.pac, ...state.buddyTrail].slice(0, 3),
            facing: action.dir,
            ghosts,
            ghostPrev: canSpawnTrouble ? [...state.ghostPrev, state.pac] : state.ghostPrev,
            treasures,
            message: canSpawnTrouble
              ? say(state, 'Trouble zone! Another baddie joined the path. ⚠', 'bad')
              : treasure
                ? say(state, treasure === '💰' ? 'Path coin found! 💰' : 'Trail snack! Keep going. 🍓', 'good')
                : hitTrouble
                  ? say(state, 'Trouble zone... keep moving. ⚠', 'bad')
                  : state.message,
          }
          if (state.travelExitDoor && samePos(target, state.travelExitDoor)) {
            return levelStart(moved, state.level + 1)
          }
          if (state.ghosts.some((g) => samePos(g, target))) {
            const defended = defendedState(moved)
            return defended ?? {
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
        const collectedFruit = treasure != null && treasure !== ROCK_EMOJI
        if (collectedFruit) treasures.delete(key)
        const goalProgress = collectedFruit ? state.goalProgress + 1 : state.goalProgress
        const vulnerableMovesLeft = Math.max(0, state.vulnerableMovesLeft - 1)
        let moved: GameState = {
          ...state,
          pac: target,
          buddy: state.pac,
          buddyTrail: [state.pac, ...state.buddyTrail].slice(0, 3),
          facing: action.dir,
          treasures,
          goalProgress,
          movesLeft: state.movesLeft - 1,
          vulnerableMovesLeft,
        }
        if (state.jailFruits.has(key) && state.ghosts.length) {
          const jailFruits = new Set(state.jailFruits)
          jailFruits.delete(key)
          moved = {
            ...moved,
            jailFruits,
            movesLeft: moved.movesLeft + POWER_STRAWBERRY_MOVES,
            vulnerableMovesLeft: POWER_STRAWBERRY_MOVES,
            message: say(state, `Power strawberry! +${POWER_STRAWBERRY_MOVES} moves — zap baddies! ⚡`, 'good'),
          }
        }
        if (moved.vulnerableMovesLeft > 0 && moved.ghosts.some((g) => samePos(g, target))) {
          return {
            ...moved,
            ghosts: moved.ghosts.filter((g) => !samePos(g, target)),
            ghostPrev: moved.ghosts,
            stars: moved.stars + 2,
            message: say(state, 'ZAP! Baddie poofed away! ⚡', 'good'),
          }
        }
        if (state.jailTurns === 0 && moved.ghosts.some((g) => samePos(g, target))) {
          return caughtState(moved)
        }
        if (goalComplete(moved, treasures, goalProgress)) {
          return clearLevelState(
            moved,
            state.cfg.goal?.kind === 'collectFruit'
              ? 'Goal reached! The exit door opened! 🚪'
              : undefined,
          )
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
        const collectedFruit = treasure != null && treasure !== ROCK_EMOJI
        if (collectedFruit) treasures.delete(key)
        const goalProgress = collectedFruit ? state.goalProgress + 1 : state.goalProgress
        const cleared = goalComplete(state, treasures, goalProgress)
        const done = cleared || state.powerTicksLeft <= 1 || collectibleTreasureCount(treasures) === 0
        return {
          ...state,
          treasures,
          goalProgress,
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
              ? say(state, 'Goal reached! The exit door opened! 🚪', 'good')
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
          if (state.vulnerableMovesLeft > 0) return randomSafeStep(state.maze, g, state.pac)
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
          if (state.vulnerableMovesLeft > 0) {
            return {
              ...stepped,
              ghosts: ghosts.filter((g) => !samePos(g, state.pac)),
              ghostPrev: ghosts,
              stars: stepped.stars + 2,
              message: say(state, 'ZAP! Baddie poofed away! ⚡', 'good'),
            }
          }
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
        const ghosts = state.ghosts.map((g) =>
          Math.random() < (state.level >= 35 ? 0.35 : 0.18)
            ? nextStepToward(state.maze, g, state.pac)
            : randomStep(state.maze, g),
        )
        const stepped = {
          ...state,
          ghosts,
          ghostPrev: state.ghosts,
        }
        if (!ghosts.some((g) => samePos(g, state.pac))) return stepped
        const defended = defendedState(stepped)
        return defended ?? {
          ...stepped,
          pac: state.maze.pacSpawn,
          buddy: state.maze.pacSpawn,
          buddyTrail: [state.maze.pacSpawn, state.maze.pacSpawn, state.maze.pacSpawn],
          message: say(state, 'A path baddie bumped you back to the door! Try again. 👀', 'bad'),
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
          vulnerableMovesLeft: 0,
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

function makeInitialState(
  cfgFor: (level: number) => LevelCfg,
  startLevel: number,
  ghostSkill: GhostSkill,
): GameState {
  const cfg = cfgFor(startLevel)
  const maze = mazeForLevel(startLevel)
  const { treasures, jailFruits } = spawnTreasures(maze, cfg)
  const goal = goalStateFor(cfg, treasures)
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
    vulnerableMovesLeft: 0,
    phase: 'answer',
    movesLeft: 0,
    ghostStepsLeft: 0,
    afterGhosts: 'next',
    problem: generateFromCfg(cfg.problem),
    attempts: 0,
    answerTicks: 0,
    hint: '',
    answerValue: 0,
    answerText: '',
    message: cfg.intro ? { text: cfg.intro, tone: 'good', id: 1 } : null,
    rescue: null,
    answerStartedAt: Date.now(),
    ...goal,
    quickMeter: 0,
    starReady: false,
    guardCharges: guardChargesForSkill(ghostSkill),
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
  ghostSkill: GhostSkill = 'none',
  learningWorld: LearningWorldId = 'pacabacus',
  ownedCharacters: string[] = [],
) {
  const reducer = useMemo(
    () => makeReducer(cfgFor, travelEnabled, travelMaxLevel, ghostSkill, learningWorld, ownedCharacters),
    [cfgFor, travelEnabled, travelMaxLevel, ghostSkill, learningWorld, ownedCharacters],
  )
  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => makeInitialState(cfgFor, startLevel, ghostSkill),
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
