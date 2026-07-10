import { useEffect, useMemo, useReducer, useRef } from 'react'
import { Abacus } from '@/components/Abacus'
import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings, type ArcadeSettings } from '@/features/arcade/settingsStore'
import { THEMES } from '@/features/arcade/themes'
import { chiptune } from '@/features/audio/chiptune'
import { generateDelta, type DeltaStep } from '@/features/drills/problemGenerator'

const ROWS = 12
const MAX_STACK = 6
const POPS_PER_LEVEL = 10
const FALL_MS_BASE = { relaxed: 11000, normal: 8500, speedy: 6000 }
const AUTO_SETTLE_MS = 550

type Phase = 'falling' | 'reveal' | 'gameOver'

interface RainState {
  total: number
  delta: DeltaStep
  row: number
  stack: number
  score: number
  streak: number
  level: number
  phase: Phase
  answerValue: number
  message: { text: string; tone: 'good' | 'bad'; id: number } | null
}

type Action =
  | { type: 'TICK' }
  | { type: 'SET_ANSWER'; value: number }
  | { type: 'SUBMIT' }
  | { type: 'REVEAL_DONE' }
  | { type: 'RESTART' }

const PRAISE = ['Popped it! 🌟', 'Nice one! 🎉', 'Zap! ✨', 'Super streak! 💪']

function makeReducer(settings: ArcadeSettings) {
  const genOpts = (current: number) => ({
    mathLevel: settings.mathLevel,
    ops: settings.ops,
    maxAnswer: settings.maxAnswer,
    current,
  })

  const say = (s: RainState, text: string, tone: 'good' | 'bad') => ({
    text,
    tone,
    id: (s.message?.id ?? 0) + 1,
  })

  return function reducer(state: RainState, action: Action): RainState {
    switch (action.type) {
      case 'SET_ANSWER': {
        if (state.phase !== 'falling') return state
        return { ...state, answerValue: action.value }
      }

      case 'TICK': {
        if (state.phase !== 'falling') return state
        const landingRow = ROWS - 1 - state.stack
        if (state.row + 1 < landingRow) {
          return { ...state, row: state.row + 1 }
        }
        // it landed — that's a miss
        const stack = state.stack + 1
        if (stack >= MAX_STACK) {
          return {
            ...state,
            stack,
            phase: 'gameOver',
            message: say(state, 'The blocks stacked up! 🧱', 'bad'),
          }
        }
        return {
          ...state,
          stack,
          phase: 'reveal',
          answerValue: state.delta.next,
          message: say(
            state,
            `It landed! ${state.total} ${state.delta.op === 'add' ? '+' : '−'} ${state.delta.amount} = ${state.delta.next}`,
            'bad',
          ),
        }
      }

      case 'REVEAL_DONE': {
        if (state.phase !== 'reveal') return state
        const total = state.delta.next
        return {
          ...state,
          total,
          delta: generateDelta(genOpts(total)),
          row: 0,
          answerValue: 0,
          streak: 0,
          phase: 'falling',
        }
      }

      case 'SUBMIT': {
        if (state.phase !== 'falling') return state
        if (state.answerValue !== state.delta.next) {
          return {
            ...state,
            streak: 0,
            message: say(state, 'Not yet — check your beads! 💡', 'bad'),
          }
        }
        const score = state.score + 1
        const streak = state.streak + 1
        const melted = streak > 0 && streak % 5 === 0 && state.stack > 0
        const total = state.delta.next
        return {
          ...state,
          score,
          streak,
          stack: melted ? state.stack - 1 : state.stack,
          level: 1 + Math.floor(score / POPS_PER_LEVEL),
          total,
          delta: generateDelta(genOpts(total)),
          row: 0,
          answerValue: 0,
          message: say(
            state,
            melted
              ? '🔥 5 in a row — a block melted away!'
              : PRAISE[Math.floor(Math.random() * PRAISE.length)],
            'good',
          ),
        }
      }

      case 'RESTART': {
        return makeInitial(settings)
      }

      default:
        return state
    }
  }
}

function makeInitial(settings: ArcadeSettings): RainState {
  const total = 5
  return {
    total,
    delta: generateDelta({
      mathLevel: settings.mathLevel,
      ops: settings.ops,
      maxAnswer: settings.maxAnswer,
      current: total,
    }),
    row: 0,
    stack: 0,
    score: 0,
    streak: 0,
    level: 1,
    phase: 'falling',
    answerValue: 0,
    message: null,
  }
}

export function RainGame({ onExit }: { onExit: () => void }) {
  const settings = useArcadeSettings()
  const reducer = useMemo(() => makeReducer(settings), [settings])
  const [state, dispatch] = useReducer(reducer, settings, makeInitial)
  const theme = THEMES[settings.theme] ?? THEMES.stars
  const touched = useRef(false)

  const fallMs = Math.max(
    2800,
    FALL_MS_BASE[settings.speed] * 0.93 ** (state.level - 1),
  )
  const rowMs = fallMs / ROWS

  // falling clock
  useEffect(() => {
    if (state.phase === 'falling') {
      const t = setInterval(() => dispatch({ type: 'TICK' }), rowMs)
      return () => clearInterval(t)
    }
    if (state.phase === 'reveal') {
      const t = setTimeout(() => dispatch({ type: 'REVEAL_DONE' }), 2000)
      return () => clearTimeout(t)
    }
  }, [state.phase, rowMs])

  // hands-free pop: right beads = automatic, no Go needed
  useEffect(() => {
    if (state.phase !== 'falling' || !touched.current) return
    if (state.answerValue !== state.delta.next) return
    const t = setTimeout(() => dispatch({ type: 'SUBMIT' }), AUTO_SETTLE_MS)
    return () => clearTimeout(t)
  }, [state.answerValue, state.delta, state.phase])

  // new piece → beads reset, wait for fresh input
  useEffect(() => {
    touched.current = false
  }, [state.delta])

  // music + sfx
  useEffect(() => {
    if (settings.music) chiptune.playSong(state.level - 1)
    else chiptune.stopMusic()
    return () => chiptune.stopMusic()
  }, [settings.music, state.level])

  const msgId = state.message?.id
  useEffect(() => {
    if (!state.message || msgId === undefined) return
    chiptune.sfx(state.message.tone === 'good' ? 'correct' : 'wrong')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgId])

  useEffect(() => {
    if (state.phase === 'gameOver') {
      chiptune.sfx('caught')
      const best = Number(localStorage.getItem('pacabacus-rain-best') ?? 0)
      if (state.score > best)
        localStorage.setItem('pacabacus-rain-best', String(state.score))
    }
  }, [state.phase, state.score])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') dispatch({ type: 'SUBMIT' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const best = Number(localStorage.getItem('pacabacus-rain-best') ?? 0)
  const sym = state.delta.op === 'add' ? '+' : '−'
  const landingRow = ROWS - 1 - state.stack

  return (
    <div
      className="relative flex min-h-svh flex-col items-center gap-3 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-3 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}

      {/* HUD */}
      <div className="flex flex-wrap items-stretch justify-center gap-2">
        <Stat label="Level" value={String(state.level)} />
        <Stat
          label="Popped"
          value={`${state.score}${state.streak >= 2 ? ` 🔥${state.streak}` : ''}`}
        />
        <Stat label="Best" value={String(Math.max(best, state.score))} />
        <button
          type="button"
          onClick={() => settings.update({ music: !settings.music })}
          className="rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-3 text-lg hover:brightness-125"
        >
          {settings.music ? '🔊' : '🔇'}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-4 text-sm font-bold hover:brightness-125"
        >
          ⚙️ Setup
        </button>
      </div>

      <div className="rounded-full border-2 border-emerald-400 bg-[var(--c-panel)] px-5 py-1 text-base font-bold text-emerald-300">
        Pop the falling block: solve it on your beads before it lands!
      </div>

      <div className="flex flex-wrap items-start justify-center gap-5">
        {/* the well */}
        <div
          className="relative overflow-hidden rounded-xl border-4 border-[var(--c-wall-edge)]"
          style={{ width: 150, height: ROWS * 34, background: 'var(--maze-floor)' }}
        >
          {/* falling piece */}
          {state.phase !== 'gameOver' && (
            <div
              className="absolute right-2 left-2 flex items-center justify-center rounded-lg border-2 border-amber-500 bg-amber-400 text-2xl font-black text-amber-950"
              style={{
                height: 30,
                top: state.row * 34 + 2,
                transition: `top ${rowMs}ms linear`,
              }}
            >
              {sym} {state.delta.amount}
            </div>
          )}
          {/* missed stack */}
          {Array.from({ length: state.stack }).map((_, i) => (
            <div
              key={i}
              className="absolute right-1 left-1 flex items-center justify-center rounded-md border-2 border-slate-500 bg-slate-600 text-sm font-bold text-slate-300"
              style={{ height: 30, top: (ROWS - 1 - i) * 34 + 2 }}
            >
              ✗
            </div>
          ))}
          {/* danger line */}
          <div
            className="absolute right-0 left-0 border-t-2 border-dashed border-rose-400/60"
            style={{ top: (ROWS - MAX_STACK) * 34 }}
          />
          {/* landing row shimmer */}
          <div
            className="absolute right-0 left-0 bg-emerald-300/10"
            style={{ height: 34, top: landingRow * 34 }}
          />
        </div>

        {/* the problem, front and center */}
        <div className="flex min-w-52 flex-col items-center rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
          <h3 className="text-xs font-bold tracking-wide text-[var(--c-soft)]">SOLVE ME!</h3>
          <div className="my-2 text-5xl font-black text-amber-300">
            {state.total} {sym} {state.delta.amount}
          </div>
          <div className="text-3xl font-black text-emerald-300">= ?</div>
          <p className="mt-3 max-w-52 text-center text-xs text-[var(--c-soft)]">
            Your number is <b className="text-amber-300">{state.total}</b>. The falling
            block says <b className="text-amber-300">{sym} {state.delta.amount}</b> — make
            your beads show the new total to pop it!
          </p>
        </div>

        {/* abacus controls */}
        <div className="flex flex-col items-center rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
          <h3 className="mb-1 text-xs font-bold tracking-wide text-[var(--c-soft)]">
            YOUR ABACUS — TAP OR FLICK THE BEADS
          </h3>
          <p className="mb-2 text-xs text-[var(--c-soft)]">
            Right beads pop the block all by themselves!
          </p>
          <Abacus
            rodCount={2}
            value={state.answerValue}
            onChange={(value) => {
              touched.current = true
              dispatch({ type: 'SET_ANSWER', value })
            }}
            readOnly={state.phase !== 'falling'}
            showLabels
          />
          <div className="mt-2 text-lg">
            Your beads say: <b className="text-2xl text-amber-300">{state.answerValue}</b>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_ANSWER', value: 0 })}
            disabled={state.phase !== 'falling'}
            className="mt-2 rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-4 py-1.5 text-sm font-bold brightness-110 disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      {/* toast */}
      {state.message && (
        <div
          key={state.message.id}
          className={[
            'toast-pop fixed top-3 left-1/2 z-50 max-w-[90vw] rounded-full px-5 py-2 text-center font-bold',
            state.message.tone === 'good'
              ? 'bg-emerald-400 text-emerald-950'
              : 'bg-rose-300 text-rose-950',
          ].join(' ')}
        >
          {state.message.text}
        </div>
      )}

      {state.phase === 'gameOver' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-3xl border-4 border-[var(--c-border)] bg-[var(--c-panel)] p-7 text-center">
            <h2 className="mb-3 text-2xl font-black text-amber-300">
              The blocks won this time! 🧱
            </h2>
            <p className="mb-4 text-lg">
              You popped <b>{state.score}</b> blocks
              {state.score >= best && state.score > 0 ? ' — a new best! 🏆' : ''}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => dispatch({ type: 'RESTART' })}
                className="rounded-xl border-4 border-emerald-600 bg-emerald-400 px-8 py-2 text-lg font-black text-emerald-950 active:scale-95"
              >
                Try again 💪
              </button>
              <button
                type="button"
                onClick={onExit}
                className="rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-6 py-2 text-lg font-bold"
              >
                Change setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-4 py-1 text-center">
      <div className="text-[11px] text-[var(--c-soft)]">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  )
}
