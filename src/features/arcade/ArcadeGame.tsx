import { useEffect, useMemo, useRef, useState } from 'react'
import { Abacus } from '@/components/Abacus'
import { chiptune } from '@/features/audio/chiptune'
import { movesForProblem, problemText } from '@/features/drills/problemGenerator'
import type { Dir } from './maze'
import { MazeBoard } from './MazeBoard'
import { useArcadeSettings } from './settingsStore'
import { THEMES } from './themes'
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
  const theme = THEMES[settings.theme] ?? THEMES.stars

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

  // music — a different song each level, cycling through the songbook
  useEffect(() => {
    if (settings.music) chiptune.playSong(state.level - 1)
    else chiptune.stopMusic()
    return () => chiptune.stopMusic()
  }, [settings.music, state.level])

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
        ? `Steer! ${state.movesLeft} move${state.movesLeft === 1 ? '' : 's'} left — swipe the maze or use arrows`
        : phase === 'ghosts'
          ? 'The baddies are moving… 👀'
          : phase === 'reveal'
            ? 'Watch the beads show the answer…'
            : phase === 'caught'
              ? 'Ouch! Back to the start…'
              : ''

  return (
    <div
      className="relative flex min-h-svh flex-col items-center gap-3 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-3 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
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
          className="rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-3 text-lg hover:brightness-125"
          title="Music on/off"
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
        hero={settings.hero}
        onSwipe={(dir) => dispatch({ type: 'MOVE', dir })}
      />

      {/* problem + abacus + dpad */}
      <div className="flex flex-wrap items-start justify-center gap-4">
        <div
          className={[
            'flex min-w-56 flex-col items-center rounded-2xl border-2 p-4',
            isChallenge
              ? 'border-amber-400 bg-amber-950/50'
              : 'border-[var(--c-border)] bg-[var(--c-panel)]',
          ].join(' ')}
        >
          <h3 className="text-xs font-bold tracking-wide text-[var(--c-soft)]">
            {isChallenge ? '⚡ CHALLENGE — ONE TRY! ⚡' : 'SOLVE ME!'}
          </h3>
          <div className="my-2 text-4xl font-black text-amber-300">
            {problemText(problem)} = ?
          </div>
          <div className="mb-1 rounded-full border border-emerald-500 bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-300">
            worth +{payout} moves
          </div>
          <p className="min-h-10 max-w-60 text-center text-sm text-[var(--c-soft)]">
            {state.hint}
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ANSWER', value: 0 })}
              disabled={phase !== 'answer'}
              className="rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-4 py-2 font-bold brightness-110 disabled:opacity-40"
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

        <div className="flex flex-col items-center rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
          <h3 className="mb-2 text-xs font-bold tracking-wide text-[var(--c-soft)]">
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

        <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
          <h3 className="text-xs font-bold tracking-wide text-[var(--c-soft)]">STEER</h3>
          <p className="max-w-40 text-center text-xs text-[var(--c-soft)]">
            Swipe the maze on a tablet, or:
          </p>
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
            className="mt-1 rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-4 py-1.5 text-sm font-bold brightness-110 disabled:opacity-40"
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
        <Overlay title="The baddies win this time! 👻">
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
              className="rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-6 py-2 text-lg font-bold"
            >
              Change setup
            </button>
          </div>
        </Overlay>
      )}
    </div>
  )
}

export function Twinkles() {
  return (
    <>
      <span className="twinkle text-xl" style={{ top: '8%', left: '12%' }}>✦</span>
      <span className="twinkle text-2xl" style={{ top: '16%', right: '10%', animationDelay: '0.5s' }}>✦</span>
      <span className="twinkle text-lg" style={{ bottom: '14%', left: '7%', animationDelay: '1s' }}>✦</span>
    </>
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
      className="h-16 w-16 rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] text-2xl brightness-110 active:brightness-150 disabled:opacity-30"
    >
      {DIR_ARROWS[dir]}
    </button>
  )
}

function Overlay({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border-4 border-[var(--c-border)] bg-[var(--c-panel)] p-7 text-center">
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
