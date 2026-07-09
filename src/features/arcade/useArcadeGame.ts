import { useEffect, useMemo, useReducer } from 'react'
import {
  generateProblem,
  beadHint,
  type ArcadeProblem,
} from '@/features/drills/problemGenerator'
import {
  DIR_VECTORS,
  GHOST_SPAWNS,
  PAC_SPAWN,
  initialDots,
  isWall,
  nextStepToward,
  posKey,
  samePos,
  type Dir,
  type Pos,
} from './maze'
import { GHOST_CONFIG, SPEED_MS, type ArcadeSettings } from './settingsStore'

export const MOVES_PER_CORRECT = 4

export type Phase =
  | 'answer'
  | 'move'
  | 'ghosts'
  | 'reveal'
  | 'caught'
  | 'levelClear'
  | 'gameOver'

export interface GameMessage {
  text: string
  tone: 'good' | 'bad'
  id: number
}

export interface GameState {
  level: number
  lives: number
  stars: number
  streak: number
  pac: Pos
  facing: Dir
  ghosts: Pos[]
  dots: Set<string>
  phase: Phase
  movesLeft: number
  ghostStepsLeft: number
  afterGhosts: 'retry' | 'next'
  problem: ArcadeProblem
  attempts: number
  hint: string
  answerValue: number
  message: GameMessage | null
}

type Action =
  | { type: 'SET_ANSWER'; value: number }
  | { type: 'SUBMIT' }
  | { type: 'MOVE'; dir: Dir }
  | { type: 'END_MOVE' }
  | { type: 'GHOST_TICK' }
  | { type: 'REVEAL_DONE' }
  | { type: 'RESPAWN' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'RESTART_LEVEL' }

const PRAISE = ['Great thinking! 🌟', 'You got it! 🎉', 'Super math brain! 💪', 'Zoom zoom! ✨']
const pickPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)]

function makeReducer(settings: ArcadeSettings) {
  const ghostCfg = GHOST_CONFIG[settings.ghosts]
  const genOpts = {
    mathLevel: settings.mathLevel,
    ops: settings.ops,
    maxAnswer: settings.maxAnswer,
  }

  const say = (state: GameState, text: string, tone: 'good' | 'bad'): GameMessage => ({
    text,
    tone,
    id: (state.message?.id ?? 0) + 1,
  })

  const freshProblem = (): Partial<GameState> => ({
    problem: generateProblem(genOpts),
    attempts: 0,
    hint: '',
    answerValue: 0,
    phase: 'answer',
  })

  /** Ghosts take `steps` chase turns; if none, resolve straight to what's next. */
  const enterGhostPhase = (
    state: GameState,
    steps: number,
    after: 'retry' | 'next',
  ): GameState => {
    if (ghostCfg.count === 0 || steps <= 0) {
      return after === 'next'
        ? { ...state, ...freshProblem() }
        : { ...state, phase: 'answer' }
    }
    return { ...state, phase: 'ghosts', ghostStepsLeft: steps, afterGhosts: after }
  }

  const caughtState = (state: GameState): GameState => {
    const lives = state.lives - 1
    if (lives <= 0) {
      return {
        ...state,
        lives: 0,
        phase: 'gameOver',
        message: say(state, 'The ghosts got you! 👻', 'bad'),
      }
    }
    return {
      ...state,
      lives,
      phase: 'caught',
      message: say(state, 'The ghost got you! Back to start — keep going! ❤️', 'bad'),
    }
  }

  return function reducer(state: GameState, action: Action): GameState {
    switch (action.type) {
      case 'SET_ANSWER': {
        if (state.phase !== 'answer') return state
        return { ...state, answerValue: action.value }
      }

      case 'SUBMIT': {
        if (state.phase !== 'answer') return state
        const p = state.problem
        if (state.answerValue === p.answer) {
          return {
            ...state,
            stars: state.stars + 1,
            streak: state.streak + 1,
            movesLeft: MOVES_PER_CORRECT,
            phase: 'move',
            hint: '',
            message: say(state, pickPraise(), 'good'),
          }
        }
        const attempts = state.attempts + 1
        if (attempts === 1) {
          return enterGhostPhase(
            {
              ...state,
              attempts,
              streak: 0,
              hint: beadHint(p),
              message: say(state, 'Almost! Try again — check the hint. 💡', 'bad'),
            },
            ghostCfg.wrongSteps,
            'retry',
          )
        }
        return {
          ...state,
          attempts,
          streak: 0,
          hint: `The answer is ${p.answer} — look at the beads!`,
          answerValue: p.answer,
          phase: 'reveal',
          message: say(state, `It was ${p.answer}. You'll get the next one! 💪`, 'bad'),
        }
      }

      case 'MOVE': {
        if (state.phase !== 'move') return state
        const v = DIR_VECTORS[action.dir]
        const target = { r: state.pac.r + v.r, c: state.pac.c + v.c }
        if (isWall(target.r, target.c)) {
          return { ...state, facing: action.dir }
        }
        const dots = new Set(state.dots)
        dots.delete(posKey(target))
        const moved: GameState = {
          ...state,
          pac: target,
          facing: action.dir,
          dots,
          movesLeft: state.movesLeft - 1,
        }
        if (state.ghosts.some((g) => samePos(g, target))) {
          return caughtState(moved)
        }
        if (dots.size === 0) {
          return { ...moved, phase: 'levelClear' }
        }
        if (moved.movesLeft <= 0) {
          return enterGhostPhase(moved, ghostCfg.correctSteps, 'next')
        }
        return moved
      }

      case 'END_MOVE': {
        if (state.phase !== 'move') return state
        return enterGhostPhase(state, ghostCfg.correctSteps, 'next')
      }

      case 'GHOST_TICK': {
        if (state.phase !== 'ghosts') return state
        const ghosts = state.ghosts.map((g) => nextStepToward(g, state.pac))
        const stepped = { ...state, ghosts, ghostStepsLeft: state.ghostStepsLeft - 1 }
        if (ghosts.some((g) => samePos(g, state.pac))) {
          return caughtState(stepped)
        }
        if (stepped.ghostStepsLeft <= 0) {
          return stepped.afterGhosts === 'next'
            ? { ...stepped, ...freshProblem() }
            : { ...stepped, phase: 'answer' }
        }
        return stepped
      }

      case 'REVEAL_DONE': {
        if (state.phase !== 'reveal') return state
        return enterGhostPhase(state, ghostCfg.wrongSteps, 'next')
      }

      case 'RESPAWN': {
        if (state.phase !== 'caught') return state
        return {
          ...state,
          pac: PAC_SPAWN,
          facing: 'right',
          ghosts: GHOST_SPAWNS.slice(0, ghostCfg.count),
          ...freshProblem(),
        }
      }

      case 'NEXT_LEVEL': {
        if (state.phase !== 'levelClear') return state
        return {
          ...state,
          level: state.level + 1,
          pac: PAC_SPAWN,
          facing: 'right',
          ghosts: GHOST_SPAWNS.slice(0, ghostCfg.count),
          dots: initialDots(),
          ...freshProblem(),
        }
      }

      case 'RESTART_LEVEL': {
        if (state.phase !== 'gameOver') return state
        return {
          ...state,
          lives: 3,
          streak: 0,
          pac: PAC_SPAWN,
          facing: 'right',
          ghosts: GHOST_SPAWNS.slice(0, ghostCfg.count),
          ...freshProblem(),
        }
      }

      default:
        return state
    }
  }
}

function makeInitialState(settings: ArcadeSettings): GameState {
  return {
    level: 1,
    lives: 3,
    stars: 0,
    streak: 0,
    pac: PAC_SPAWN,
    facing: 'right',
    ghosts: GHOST_SPAWNS.slice(0, GHOST_CONFIG[settings.ghosts].count),
    dots: initialDots(),
    phase: 'answer',
    movesLeft: 0,
    ghostStepsLeft: 0,
    afterGhosts: 'next',
    problem: generateProblem({
      mathLevel: settings.mathLevel,
      ops: settings.ops,
      maxAnswer: settings.maxAnswer,
    }),
    attempts: 0,
    hint: '',
    answerValue: 0,
    message: null,
  }
}

export function useArcadeGame(settings: ArcadeSettings) {
  const reducer = useMemo(() => makeReducer(settings), [settings])
  const [state, dispatch] = useReducer(reducer, settings, makeInitialState)
  const stepMs = SPEED_MS[settings.speed]

  // time-based phase transitions
  useEffect(() => {
    if (state.phase === 'ghosts') {
      const t = setInterval(() => dispatch({ type: 'GHOST_TICK' }), stepMs + 40)
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
  }, [state.phase, stepMs])

  return { state, dispatch, stepMs }
}
