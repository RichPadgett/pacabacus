import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Abacus } from '@/components/Abacus'
import { chiptune } from '@/features/audio/chiptune'
import {
  movesForProblem,
  problemText,
  type ArcadeProblem,
} from '@/features/drills/problemGenerator'
import { useProfile, type CompleteResult } from '@/features/profile/profileStore'
import {
  ADD_ON_MAX,
  ADVENTURE_MAX,
  COUNTING_MAX,
  adventureCfg,
  countingCfg,
  freePlayCfg,
  pacMathCfg,
  pacTablesCfg,
  pacWordsCfg,
} from './gameConfig'
import type { Dir } from './maze'
import { MazeBoard } from './MazeBoard'
import { HEROES, type HeroId } from './sprites'
import { SPEED_MS, useArcadeSettings } from './settingsStore'
import { THEMES } from './themes'
import { collectibleTreasureCount, useArcadeGame } from './useArcadeGame'
import { worldForAdventureLevel } from './worlds'

export type PlayMode = 'adventure' | 'counting' | 'free' | 'pacwords' | 'pactables' | 'pacmath'

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

function useTileSize(cols: number, rows: number) {
  const calc = () => {
    const isLandscape = window.innerWidth > window.innerHeight
    const boardWidth = isLandscape ? window.innerWidth * 0.62 - 28 : window.innerWidth - 40
    const widthFit = Math.floor(boardWidth / cols)
    const reservedHeight = isLandscape ? 126 : 300
    const heightFit = Math.floor((window.innerHeight - reservedHeight) / rows)
    return Math.max(20, Math.min(46, widthFit, heightFit))
  }
  const [tile, setTile] = useState(calc)
  useEffect(() => {
    const onResize = () => setTile(calc())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, rows])
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

export function Twinkles() {
  return (
    <>
      <span className="twinkle text-xl" style={{ top: '8%', left: '12%' }}>✦</span>
      <span className="twinkle text-2xl" style={{ top: '16%', right: '10%', animationDelay: '0.5s' }}>✦</span>
      <span className="twinkle text-lg" style={{ bottom: '14%', left: '7%', animationDelay: '1s' }}>✦</span>
    </>
  )
}

/** big countable emoji groups for the littlest players */
function VisualProblem({ problem }: { problem: ArcadeProblem }) {
  const group = (n: number) => (
    <span className="inline-flex max-w-44 flex-wrap justify-center gap-1">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="text-2xl">
          {problem.emoji}
        </span>
      ))}
    </span>
  )
  if (problem.kind === 'count') {
    return (
      <div className="my-2 flex flex-wrap items-center justify-center gap-2">
        {group(problem.a)}
        <span className="text-3xl font-black text-amber-300">= ?</span>
      </div>
    )
  }
  return (
    <div className="my-2 flex flex-wrap items-center justify-center gap-2">
      {group(problem.a)}
      <span className="text-3xl font-black text-amber-300">+</span>
      {group(problem.b)}
      <span className="text-3xl font-black text-amber-300">= ?</span>
    </div>
  )
}

function ProblemPrompt({ problem }: { problem: ArcadeProblem }) {
  if (problem.kind === 'word') {
    return (
      <div className="my-1 rounded-xl bg-black/20 px-5 py-3 text-4xl font-black tracking-[0.18em] text-amber-300">
        {problem.prompt}
      </div>
    )
  }
  if (problem.kind === 'tables') {
    return (
      <div className="my-1 text-4xl font-black text-amber-300">
        {problem.prompt} = ?
      </div>
    )
  }
  if (problem.kind === 'count' || (problem.emoji != null && problem.kind === 'equation')) {
    return <VisualProblem problem={problem} />
  }
  return (
    <div className="my-1 text-3xl font-black text-amber-300">
      {problemText(problem)} = ?
    </div>
  )
}

export function ArcadeGame({ mode, onExit }: { mode: PlayMode; onExit: () => void }) {
  const settings = useArcadeSettings()
  const profile = useProfile()

  const cfgFor = useMemo(() => {
    if (mode === 'adventure') return (level: number) => adventureCfg(level, settings)
    if (mode === 'counting') return countingCfg
    if (mode === 'pacwords') return pacWordsCfg
    if (mode === 'pactables') return pacTablesCfg
    if (mode === 'pacmath') return pacMathCfg
    const snapshot = freePlayCfg(settings)
    return () => snapshot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, settings])

  const startLevel =
    mode === 'adventure'
      ? Math.min(profile.adventureLevel, ADVENTURE_MAX)
      : mode === 'counting'
        ? Math.min(profile.countingLevel, COUNTING_MAX)
        : 1

  const stepMs = SPEED_MS[settings.speed]
  const { state, dispatch } = useArcadeGame(
    cfgFor,
    startLevel,
    stepMs,
    mode !== 'counting' && settings.rockTimer,
    mode === 'adventure',
    ADVENTURE_MAX,
  )
  const tile = useTileSize(state.maze.cols, state.maze.rows)
  const world = mode === 'adventure' ? worldForAdventureLevel(state.level) : null
  const nextWorld = world && state.level < ADVENTURE_MAX ? worldForAdventureLevel(state.level + 1) : null
  const songIndex = world ? world.musicIndex + ((state.level - world.levelStart) % 2) : state.level - 1
  const theme = world ? THEMES[world.theme] : (THEMES[settings.theme] ?? THEMES.stars)
  const hero = HEROES[profile.character] ? profile.character : 'kitty'
  const buddies = profile.buddies.filter((id) => HEROES[id]).slice(0, 3)
  const buddy = buddies[0] ?? (profile.buddy && HEROES[profile.buddy] ? profile.buddy : null)
  const touched = useRef(false)

  const maxLevel = mode === 'adventure' ? ADVENTURE_MAX : mode === 'counting' ? COUNTING_MAX : ADD_ON_MAX
  const [rewards, setRewards] = useState<CompleteResult | null>(null)
  const [powerBuddyId, setPowerBuddyId] = useState<HeroId | null>(null)
  const completedLevelRef = useRef(0)

  // record progress + unlocks the moment a level is cleared
  useEffect(() => {
    if (!['levelClear', 'doorOpen'].includes(state.phase) || !['adventure', 'counting'].includes(mode)) return
    if (completedLevelRef.current === state.level) return
    completedLevelRef.current = state.level
    setRewards(profile.completeLevel(mode as 'adventure' | 'counting', state.level, state.clearStars))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.level, mode])

  // hands-free: right beads auto-submit after a short settle
  useEffect(() => {
    if (state.phase !== 'answer' || !touched.current) return
    if (state.problem.answerText != null) return
    if (state.answerValue !== state.problem.answer) return
    const t = setTimeout(() => dispatch({ type: 'SUBMIT' }), 550)
    return () => clearTimeout(t)
  }, [state.answerValue, state.problem, state.phase, dispatch])

  useEffect(() => {
    touched.current = false
  }, [state.problem])

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

  // music + sfx
  useEffect(() => {
    if (settings.music) chiptune.playSong(songIndex)
    else chiptune.stopMusic()
    return () => chiptune.stopMusic()
  }, [settings.music, songIndex])

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

  const treasuresLeft = collectibleTreasureCount(state.treasures)
  const prevTreasures = useRef(treasuresLeft)
  useEffect(() => {
    if (treasuresLeft < prevTreasures.current) chiptune.sfx('eat')
    prevTreasures.current = treasuresLeft
  }, [treasuresLeft])

  const { problem } = state
  const isChallenge = problem.technique === 'challenge'
  const payout = movesForProblem(problem)
  const canSteer = phase === 'move' || phase === 'doorOpen' || phase === 'travel'
  const answerMode =
    problem.kind === 'word'
      ? 'word'
      : mode === 'pacmath' || mode === 'pactables'
        ? 'keypad'
        : 'abacus'
  const modeLabel =
    mode === 'counting'
      ? 'Little Counters'
      : mode === 'adventure'
        ? 'Adventure'
        : mode === 'pacwords'
          ? 'PacWords'
          : mode === 'pactables'
            ? 'PacTables'
            : mode === 'pacmath'
              ? 'PacMath'
              : 'Free Play'

  const setAnswer = useCallback(
    (value: number) => {
      touched.current = true
      dispatch({ type: 'SET_ANSWER', value })
    },
    [dispatch],
  )

  const goalText =
    phase === 'answer'
      ? problem.kind === 'word'
        ? `Choose the missing letter to earn ${payout} moves!`
        : problem.kind === 'tables'
          ? `Solve the times table to earn ${payout} moves!`
          : problem.kind === 'count'
        ? `Count the ${problem.emoji}s and make the beads match!`
        : `Solve it to earn ${payout} moves!`
      : phase === 'move'
        ? `Steer! ${state.movesLeft} move${state.movesLeft === 1 ? '' : 's'} left — grab the fruit!`
        : phase === 'doorOpen'
          ? 'The door is open! Steer to the top door, then press up.'
          : phase === 'travel'
            ? `Follow the path to the next door: ${nextWorld?.emoji ?? '🚪'} ${nextWorld?.name ?? 'next level'}`
        : phase === 'ghosts'
          ? state.jailTurns > 0
            ? 'The baddies are stuck in jail! 🔒'
            : 'The baddies are moving… 👀'
          : phase === 'reveal'
            ? 'Watch the beads show the answer…'
            : phase === 'caught'
              ? 'Ouch! Back to the start…'
              : ''

  return (
    <div
      className="relative flex h-svh flex-col items-center gap-2 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-2 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}

      {/* HUD */}
      <div className="flex flex-wrap items-stretch justify-center gap-2">
        <Stat
          label={modeLabel}
          value={`Level ${state.level}`}
        />
        {world && (
          <Stat
            label="World"
            value={`${world.emoji} ${world.name}`}
          />
        )}
        <Stat
          label="Stars"
          value={`⭐ ${state.stars}${state.streak >= 2 ? ` 🔥${state.streak}` : ''}`}
        />
        <Stat label="Lives" value={'❤️'.repeat(state.lives) || '💔'} />
        <Stat label="Fruit" value={String(treasuresLeft)} />
        <div className="min-w-24 rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-3 py-1 text-center">
          <div className="text-[11px] text-[var(--c-soft)]">Quick</div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full bg-amber-300 transition-all"
              style={{ width: `${state.starReady ? 100 : state.quickMeter}%` }}
            />
          </div>
        </div>
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
          🏠 Home
        </button>
      </div>

      <div className="max-w-[96vw] rounded-full border-2 border-emerald-400 bg-[var(--c-panel)] px-4 py-1 text-center text-sm font-bold text-emerald-300">
        {goalText}
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-2 landscape:flex-row landscape:items-center landscape:justify-center">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <MazeBoard
            maze={state.maze}
            tile={tile}
            treasures={state.treasures}
            jailFruits={state.jailFruits}
            jailTurns={state.jailTurns}
            pac={state.pac}
            facing={state.facing}
            ghosts={state.ghosts}
            stepMs={stepMs}
            hero={hero}
            buddy={state.buddy}
            buddyTrail={state.buddyTrail}
            buddyId={buddy}
            buddyIds={buddies}
            powerBuddy={state.powerBuddy}
            powerBuddyId={powerBuddyId ?? buddies[0] ?? null}
            exitDoor={state.exitDoor}
            travelExitDoor={state.travelExitDoor}
            themeId={theme.id}
            cloaked={phase === 'answer' && state.ghosts.length > 0}
            onSwipe={(dir) => dispatch({ type: 'MOVE', dir })}
          />
        </div>

        <div className="flex w-full max-w-[30rem] shrink-0 flex-col items-center gap-2 landscape:w-[22rem]">
          {canSteer ? (
            <div className="flex w-full flex-col items-center rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-3">
              <SteeringControls
                embedded
                canMove
                onMove={(dir) => dispatch({ type: 'MOVE', dir })}
                onStay={() => dispatch({ type: 'END_MOVE' })}
              />
            </div>
          ) : (
            <>
              <div
                className={[
                  'flex w-full flex-col items-center rounded-2xl border-2 p-2',
                  isChallenge
                    ? 'border-amber-400 bg-amber-950/50'
                    : 'border-[var(--c-border)] bg-[var(--c-panel)]',
                ].join(' ')}
              >
                <h3 className="text-xs font-bold tracking-wide text-[var(--c-soft)]">
                  {isChallenge
                    ? '⚡ CHALLENGE — ONE TRY! ⚡'
                    : problem.kind === 'count'
                      ? 'HOW MANY?'
                      : problem.kind === 'word'
                        ? 'MISSING LETTER'
                        : 'SOLVE ME!'}
                </h3>
                <ProblemPrompt problem={problem} />
                <div className="mb-1 rounded-full border border-emerald-500 bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-300">
                  worth +{payout} moves
                </div>
                <p className="min-h-8 max-w-64 text-center text-xs text-[var(--c-soft)]">
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
                {state.cfg.allowChallenge && !isChallenge && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'CHALLENGE' })}
                    disabled={phase !== 'answer'}
                    className="mt-3 rounded-xl border-2 border-amber-500 bg-amber-500/20 px-4 py-1.5 text-sm font-bold text-amber-300 hover:bg-amber-500/30 disabled:opacity-40"
                  >
                    ⚡ Hard one for 10 moves!
                  </button>
                )}
                {state.starReady && state.powerTicksLeft === 0 && buddies.length > 0 && (
                  <div className="mt-3 flex max-w-64 flex-wrap justify-center gap-2 rounded-xl border border-amber-300 bg-amber-500/15 p-2">
                    <div className="w-full text-center text-xs font-black text-amber-200">
                      ⭐ Buddy power ready!
                    </div>
                    {buddies.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setPowerBuddyId(id)
                          dispatch({ type: 'START_POWER' })
                        }}
                        className="rounded-lg border border-amber-200 bg-amber-300 px-2 py-1 text-xs font-black text-amber-950"
                      >
                        {HEROES[id].name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col items-center rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-2">
                {answerMode === 'word' ? (
                  <WordChoices
                    choices={problem.choices ?? []}
                    selected={state.answerText}
                    disabled={phase !== 'answer'}
                    onPick={(value) => {
                      dispatch({ type: 'SET_TEXT_ANSWER', value })
                      dispatch({ type: 'SUBMIT' })
                    }}
                  />
                ) : answerMode === 'keypad' ? (
                  <NumberPad
                    value={state.answerValue}
                    disabled={phase !== 'answer'}
                    onChange={setAnswer}
                    onSubmit={() => dispatch({ type: 'SUBMIT' })}
                  />
                ) : (
                  <>
                    <h3 className="mb-2 text-xs font-bold tracking-wide text-[var(--c-soft)]">
                      YOUR ABACUS — TAP OR FLICK THE BEADS
                    </h3>
                    <Abacus
                      rodCount={state.cfg.rodCount}
                      value={state.answerValue}
                      onChange={setAnswer}
                      readOnly={phase !== 'answer'}
                      showLabels={state.cfg.rodCount > 1}
                    />
                    <div className="mt-2 text-lg">
                      Your beads say: <b className="text-2xl text-amber-300">{state.answerValue}</b>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
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
          <p className="text-2xl">{'⭐'.repeat(state.clearStars)}</p>
          <p className="text-lg">You cleared the whole board!</p>
          {world && nextWorld && state.level < maxLevel && (
            <p className="font-bold text-emerald-300">
              {world.doorText} Next stop: {nextWorld.emoji} {nextWorld.name}
            </p>
          )}
          {rewards && (
            <p className="font-bold text-amber-300">
              +{rewards.coinsEarned} gold coins
            </p>
          )}
          {rewards?.newCharacters.map((id) => (
            <p key={id} className="font-bold text-amber-300">
              🎁 New character unlocked: {HEROES[id].name}!
            </p>
          ))}
          {rewards?.newBadges.map((b) => (
            <p key={b.id} className="font-bold text-amber-300">
              {b.emoji} New badge: {b.name}!
            </p>
          ))}
          {state.level >= maxLevel ? (
            <>
              <p className="text-lg font-bold text-emerald-300">
                You finished the whole {mode === 'counting' ? 'Little Counters journey' : 'adventure'}! 🏆
              </p>
              <OverlayButton onClick={onExit}>Back home 🏠</OverlayButton>
            </>
          ) : (
            <OverlayButton onClick={() => { setRewards(null); dispatch({ type: 'NEXT_LEVEL' }) }}>
              Next level ▶
            </OverlayButton>
          )}
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
              🏠 Home
            </button>
          </div>
        </Overlay>
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

function NumberPad({
  value,
  disabled,
  onChange,
  onSubmit,
}: {
  value: number
  disabled: boolean
  onChange: (value: number) => void
  onSubmit: () => void
}) {
  const append = (digit: number) => onChange(Math.min(999, value * 10 + digit))
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <h3 className="text-xs font-bold tracking-wide text-[var(--c-soft)]">TYPE THE ANSWER</h3>
      <div className="min-w-28 rounded-xl border-2 border-[var(--c-border)] bg-black/25 px-5 py-2 text-center text-3xl font-black text-amber-300">
        {value}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            onClick={() => append(digit)}
            className="h-12 w-16 rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] text-2xl font-black brightness-110 active:brightness-150 disabled:opacity-40"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(0)}
          className="h-12 w-16 rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] text-sm font-black brightness-110 active:brightness-150 disabled:opacity-40"
        >
          Clear
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => append(0)}
          className="h-12 w-16 rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] text-2xl font-black brightness-110 active:brightness-150 disabled:opacity-40"
        >
          0
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onSubmit}
          className="h-12 w-16 rounded-xl border-2 border-emerald-600 bg-emerald-400 text-sm font-black text-emerald-950 active:brightness-110 disabled:opacity-40"
        >
          Go
        </button>
      </div>
    </div>
  )
}

function WordChoices({
  choices,
  selected,
  disabled,
  onPick,
}: {
  choices: string[]
  selected: string
  disabled: boolean
  onPick: (value: string) => void
}) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <h3 className="text-xs font-bold tracking-wide text-[var(--c-soft)]">PICK A LETTER</h3>
      <div className="grid grid-cols-2 gap-3">
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            onClick={() => onPick(choice)}
            className={[
              'h-16 w-24 rounded-2xl border-2 text-3xl font-black uppercase active:scale-95 disabled:opacity-40',
              selected === choice
                ? 'border-emerald-300 bg-emerald-300 text-emerald-950'
                : 'border-[var(--c-border)] bg-[var(--c-panel)] text-amber-200 brightness-110',
            ].join(' ')}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}

const DIR_ARROWS: Record<Dir, string> = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' }

function SteeringControls({
  className,
  compact,
  embedded,
  canMove,
  onMove,
  onStay,
}: {
  className?: string
  compact?: boolean
  embedded?: boolean
  canMove: boolean
  onMove: (dir: Dir) => void
  onStay: () => void
}) {
  return (
    <div
      className={[
        'flex flex-col items-center gap-2',
        embedded ? 'p-0' : 'border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-3',
        compact || embedded ? '' : 'rounded-2xl p-4',
        className ?? '',
      ].join(' ')}
    >
      <h3 className="text-xs font-bold tracking-wide text-[var(--c-soft)]">STEER</h3>
      {!compact && !embedded && (
        <p className="max-w-40 text-center text-xs text-[var(--c-soft)]">
          Swipe the maze on a tablet, or:
        </p>
      )}
      <div className="grid grid-cols-3 grid-rows-2 gap-1.5">
        <div />
        <DirBtn dir="up" onMove={onMove} disabled={!canMove} compact={compact} />
        <div />
        <DirBtn dir="left" onMove={onMove} disabled={!canMove} compact={compact} />
        <DirBtn dir="down" onMove={onMove} disabled={!canMove} compact={compact} />
        <DirBtn dir="right" onMove={onMove} disabled={!canMove} compact={compact} />
      </div>
      <button
        type="button"
        onClick={onStay}
        disabled={!canMove}
        className="mt-1 rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-4 py-1.5 text-sm font-bold brightness-110 disabled:opacity-40"
      >
        Stay here
      </button>
    </div>
  )
}

function DirBtn({
  dir,
  onMove,
  disabled,
  compact,
}: {
  dir: Dir
  onMove: (dir: Dir) => void
  disabled: boolean
  compact?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onMove(dir)}
      className={[
        compact ? 'h-14 w-16' : 'h-16 w-16',
        'rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] text-2xl brightness-110 active:brightness-150 disabled:opacity-30',
      ].join(' ')}
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
