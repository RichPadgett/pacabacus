import { useEffect, useMemo, useRef, useState } from 'react'
import { Abacus } from '@/components/Abacus'
import { chiptune } from '@/features/audio/chiptune'
import { movesForProblem, problemText } from '@/features/drills/problemGenerator'
import type { Dir } from './maze'
import { MazeBoard } from './MazeBoard'
import { useArcadeSettings } from './settingsStore'
import { useArcadeGame } from './useArcadeGame'

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

function useTileSize(cols: number) {
  const calc = () => Math.max(26, Math.min(46, Math.floor((window.innerWidth - 40) / cols)))
  const [tile, setTile] = useState(calc)
  useEffect(() => {
    const onResize = () => setTile(calc())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols])
  return tile
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        color: ['#ffd23f', '#4ade80', '#60c8ff', '#f472b6', '#a78bfa'][i % 5],
        duration: 1.2 + Math.random() * 1.3,
        delay: Math.random() * 0.6,
      })),
    [],
  )
  return (
    <>
      {pieces.map((p, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}vw`,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  )
}

export function ArcadeGame({ onExit }: { onExit: () => void }) {
  const settings = useArcadeSettings()
  const { state, dispatch, stepMs } = useArcadeGame(settings)
  const tile = useTileSize(state.maze.cols)

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIRS[e.key] ?? KEY_DIRS[e.key.toLowerCase()]
      if (dir) {
        e.preventDefault()
        dispatch({ type: 'MOVE', dir })
      } else if (e.key === 'Enter') {
        dispatch({ type: 'SUBMIT' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])

  // music
  useEffect(() => {
    if (settings.music) chiptune.startMusic()
    else chiptune.stopMusic()
    return () => chiptune.stopMusic()
  }, [settings.music])

  // sound effects driven by game events
  const { phase } = state
  useEffect(() => {
    if (phase === 'levelClear') chiptune.sfx('fanfare')
    if (phase === 'caught' || phase === 'gameOver') chiptune.sfx('caught')
  }, [phase])

  const msgId = state.message?.id
  useEffect(() => {
    if (!state.message || msgId === undefined) return
    if (state.message.tone === 'good') {
      chiptune.sfx(state.message.text.includes('SMASHED') ? 'challenge' : 'correct')
    } else if (phase === 'answer' || phase === 'reveal' || phase === 'ghosts') {
      chiptune.sfx('wrong')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgId])

  const dotsLeft = state.dots.size
  const prevDots = useRef(dotsLeft)
  useEffect(() => {
    if (dotsLeft < prevDots.current) chiptune.sfx('eat')
    prevDots.current = dotsLeft
  }, [dotsLeft])

  const { problem } = state
  const isChallenge = problem.technique === 'challenge'
  const payout = movesForProblem(problem)

  const goalText =
    phase === 'answer'
      ? `Solve it to earn ${payout} moves!`
      : phase === 'move'
        ? `Steer! ${state.movesLeft} move${state.movesLeft === 1 ? '' : 's'} left`
        : phase === 'ghosts'
          ? 'Ghosts on the move… 👻'
          : phase === 'reveal'
            ? 'Watch the beads show the answer…'
            : phase === 'caught'
              ? 'Ouch! Back to the start…'
              : ''

  return (
    <div className="flex min-h-svh flex-col items-center gap-3 bg-[radial-gradient(circle_at_50%_20%,#2b2070,#1a1440_70%)] p-3 text-indigo-50">
      {/* HUD */}
      <div className="flex flex-wrap items-stretch justify-center gap-2">
        <Stat label="Level" value={`${state.level} · ${state.maze.name}`} />
        <Stat
          label="Stars"
          value={`⭐ ${state.stars}${state.streak >= 2 ? ` 🔥${state.streak}` : ''}`}
        />
        <Stat label="Lives" value={'❤️'.repeat(state.lives) || '💔'} />
        <Stat label="Dots" value={String(dotsLeft)} />
        <button
          type="button"
          onClick={() => settings.update({ music: !settings.music })}
          className="rounded-xl border-2 border-indigo-500 bg-indigo-900 px-3 text-lg hover:border-indigo-300"
          title="Music on/off"
        >
          {settings.music ? '🔊' : '🔇'}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="rounded-xl border-2 border-indigo-500 bg-indigo-900 px-4 text-sm font-bold hover:border-indigo-300"
        >
          ⚙️ Setup
        </button>
      </div>

      <div className="rounded-full border-2 border-emerald-400 bg-indigo-950 px-5 py-1 text-base font-bold text-emerald-300">
        {goalText}
      </div>

      <MazeBoard
        maze={state.maze}
        tile={tile}
        dots={state.dots}
        pac={state.pac}
        facing={state.facing}
        ghosts={state.ghosts}
        stepMs={stepMs}
      />

      {/* problem + abacus + dpad */}
      <div className="flex flex-wrap items-start justify-center gap-4">
        <div
          className={[
            'flex min-w-56 flex-col items-center rounded-2xl border-2 p-4',
            isChallenge
              ? 'border-amber-400 bg-amber-950/50'
              : 'border-indigo-600 bg-indigo-950/70',
          ].join(' ')}
        >
          <h3 className="text-xs font-bold tracking-wide text-indigo-300">
            {isChallenge ? '⚡ CHALLENGE — ONE TRY! ⚡' : 'SOLVE ME!'}
          </h3>
          <div className="my-2 text-4xl font-black text-amber-300">
            {problemText(problem)} = ?
          </div>
          <div className="mb-1 rounded-full border border-emerald-500 bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-300">
            worth +{payout} moves
          </div>
          <p className="min-h-10 max-w-60 text-center text-sm text-indigo-300">
            {state.hint}
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ANSWER', value: 0 })}
              disabled={phase !== 'answer'}
              className="rounded-xl border-2 border-indigo-500 bg-indigo-900 px-4 py-2 font-bold disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SUBMIT' })}
              disabled={phase !== 'answer'}
              className="rounded-xl border-4 border-emerald-600 bg-emerald-400 px-8 py-2 text-xl font-black text-emerald-950 disabled:opacity-40"
            >
              Go! ▶
            </button>
          </div>
          {!isChallenge && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'CHALLENGE' })}
              disabled={phase !== 'answer'}
              className="mt-3 rounded-xl border-2 border-amber-500 bg-amber-500/20 px-4 py-1.5 text-sm font-bold text-amber-300 hover:bg-amber-500/30 disabled:opacity-40"
            >
              ⚡ Hard one for 10 moves!
            </button>
          )}
        </div>

        <div className="flex flex-col items-center rounded-2xl border-2 border-indigo-600 bg-indigo-950/70 p-4">
          <h3 className="mb-2 text-xs font-bold tracking-wide text-indigo-300">
            YOUR ABACUS — TAP THE BEADS
          </h3>
          <Abacus
            rodCount={2}
            value={state.answerValue}
            onChange={(value) => dispatch({ type: 'SET_ANSWER', value })}
            readOnly={phase !== 'answer'}
            showLabels
          />
          <div className="mt-2 text-lg">
            Your answer: <b className="text-2xl text-amber-300">{state.answerValue}</b>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-indigo-600 bg-indigo-950/70 p-4">
          <h3 className="text-xs font-bold tracking-wide text-indigo-300">STEER</h3>
          <div className="grid grid-cols-3 grid-rows-2 gap-1.5">
            <div />
            <DirBtn dir="up" onMove={(dir) => dispatch({ type: 'MOVE', dir })} disabled={phase !== 'move'} />
            <div />
            <DirBtn dir="left" onMove={(dir) => dispatch({ type: 'MOVE', dir })} disabled={phase !== 'move'} />
            <DirBtn dir="down" onMove={(dir) => dispatch({ type: 'MOVE', dir })} disabled={phase !== 'move'} />
            <DirBtn dir="right" onMove={(dir) => dispatch({ type: 'MOVE', dir })} disabled={phase !== 'move'} />
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'END_MOVE' })}
            disabled={phase !== 'move'}
            className="mt-1 rounded-xl border-2 border-indigo-500 bg-indigo-900 px-4 py-1.5 text-sm font-bold disabled:opacity-40"
          >
            Stay here
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

      {/* overlays */}
      {phase === 'levelClear' && (
        <Overlay title="🎉 Level cleared! 🎉">
          <Confetti />
          <p className="text-lg">
            You ate every dot with <b>{state.stars}</b> ⭐!
          </p>
          <OverlayButton onClick={() => dispatch({ type: 'NEXT_LEVEL' })}>
            Next level ▶
          </OverlayButton>
        </Overlay>
      )}
      {phase === 'gameOver' && (
        <Overlay title="The ghosts win this time! 👻">
          <p className="text-lg">
            You solved <b>{state.stars}</b> problems — great practice!
          </p>
          <div className="flex justify-center gap-3">
            <OverlayButton onClick={() => dispatch({ type: 'RESTART_LEVEL' })}>
              Try again 💪
            </OverlayButton>
            <button
              type="button"
              onClick={onExit}
              className="rounded-xl border-2 border-indigo-400 bg-indigo-800 px-6 py-2 text-lg font-bold"
            >
              Change setup
            </button>
          </div>
        </Overlay>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-xl border-2 border-indigo-500 bg-indigo-950 px-4 py-1 text-center">
      <div className="text-[11px] text-indigo-300">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  )
}

const DIR_ARROWS: Record<Dir, string> = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' }

function DirBtn({
  dir,
  onMove,
  disabled,
}: {
  dir: Dir
  onMove: (dir: Dir) => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onMove(dir)}
      className="h-14 w-14 rounded-xl border-2 border-indigo-500 bg-indigo-900 text-2xl active:bg-indigo-600 disabled:opacity-30"
    >
      {DIR_ARROWS[dir]}
    </button>
  )
}

function Overlay({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-indigo-950/80 p-4">
      <div className="w-full max-w-md rounded-3xl border-4 border-indigo-500 bg-indigo-900 p-7 text-center">
        <h2 className="mb-3 text-2xl font-black text-amber-300">{title}</h2>
        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </div>
  )
}

function OverlayButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto rounded-xl border-4 border-emerald-600 bg-emerald-400 px-8 py-2 text-lg font-black text-emerald-950 active:scale-95"
    >
      {children}
    </button>
  )
}
