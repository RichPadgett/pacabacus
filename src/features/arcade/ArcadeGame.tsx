import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Abacus } from '@/components/Abacus'
import { chiptune } from '@/features/audio/chiptune'
import {
  movesForProblem,
  type ArcadeProblem,
} from '@/features/drills/problemGenerator'
import { useProfile, type CompleteResult } from '@/features/profile/profileStore'
import {
  ADD_ON_MAX,
  ADVENTURE_MAX,
  freePlayCfg,
  learningWorldCfg,
} from './gameConfig'
import {
  DEFAULT_WORLD_LEVELS,
  LEARNING_WORLDS,
  chapterForLevel,
  type LearningWorldId,
} from '@/features/learning/learningWorlds'
import {
  buddyScaleForStage,
  buddyStageForUses,
  growthForProgress,
} from './characterGrowth'
import { characterDetailFor } from './characterDetails'
import type { Dir } from './maze'
import { MazeBoard } from './MazeBoard'
import { PixelSprite } from './PixelSprite'
import { HEROES, SECRET_HERO_IDS, type HeroId } from './sprites'
import { SPEED_MS, useArcadeSettings } from './settingsStore'
import { THEMES } from './themes'
import { ANSWER_PHASES, collectibleTreasureCount, useArcadeGame } from './useArcadeGame'
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

const ANSWER_INPUT_GUARD_MS = 700

function useTileSize(cols: number, rows: number) {
  const calc = () => {
    const isLandscape = window.innerWidth > window.innerHeight
    const boardWidth = window.innerWidth - (isLandscape ? 20 : 12)
    const widthFit = Math.floor(boardWidth / cols)
    const reservedHeight = isLandscape ? 14 : 104
    const heightFit = Math.floor((window.innerHeight - reservedHeight) / rows)
    return Math.max(10, Math.min(96, widthFit, heightFit))
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
    <span className="inline-flex max-w-36 flex-wrap justify-center gap-0.5 sm:max-w-44 sm:gap-1">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="text-xl sm:text-2xl">
          {problem.emoji}
        </span>
      ))}
    </span>
  )
  if (problem.kind === 'count') {
    return (
      <div className="my-1 flex flex-wrap items-center justify-center gap-1 sm:my-2 sm:gap-2">
        {group(problem.a)}
        <span className="text-2xl font-black text-amber-300 sm:text-3xl">= ?</span>
      </div>
    )
  }
  return (
    <div className="my-1 flex flex-wrap items-center justify-center gap-1 sm:my-2 sm:gap-2">
      {group(problem.a)}
      <span className="text-2xl font-black text-amber-300 sm:text-3xl">+</span>
      {group(problem.b)}
      <span className="text-2xl font-black text-amber-300 sm:text-3xl">= ?</span>
    </div>
  )
}

function opSymbol(op: ArcadeProblem['op']) {
  return op === 'add' ? '+' : '−'
}

function VerticalProblem({ problem }: { problem: ArcadeProblem }) {
  const rows = [{ op: '', value: problem.a }]
  rows.push({ op: problem.kind === 'tables' ? '×' : opSymbol(problem.op), value: problem.b })
  if (problem.c != null && problem.op2) rows.push({ op: opSymbol(problem.op2), value: problem.c })

  return (
    <div className="my-1 inline-grid min-w-24 grid-cols-[1.4rem_auto] items-end rounded-xl bg-black/20 px-4 py-2 font-black text-amber-300">
      {rows.map((row, index) => (
        <div key={`${row.op}-${row.value}-${index}`} className="contents">
          <span className="text-right text-xl leading-none sm:text-2xl">{row.op}</span>
          <span className="min-w-12 text-right text-3xl leading-none tabular-nums sm:text-4xl">
            {row.value}
          </span>
        </div>
      ))}
      <div className="col-span-2 mt-1 border-t-4 border-amber-300 pt-1 text-right text-3xl leading-none sm:text-4xl">
        ?
      </div>
    </div>
  )
}

function ProblemPrompt({ problem }: { problem: ArcadeProblem }) {
  if (problem.kind === 'word') {
    return (
      <div className="my-1 rounded-xl bg-black/20 px-4 py-2 text-3xl font-black tracking-[0.18em] text-amber-300 sm:px-5 sm:py-3 sm:text-4xl">
        {problem.prompt}
      </div>
    )
  }
  if (problem.kind === 'tables') return <VerticalProblem problem={problem} />
  if (problem.kind === 'count' || (problem.emoji != null && problem.kind === 'equation')) {
    return <VisualProblem problem={problem} />
  }
  return <VerticalProblem problem={problem} />
}

export function ArcadeGame({
  mode,
  learningWorld,
  onExit,
}: {
  mode: PlayMode
  learningWorld?: LearningWorldId
  onExit: () => void
}) {
  const settings = useArcadeSettings()
  const profile = useProfile()
  const activeWorld: LearningWorldId =
    learningWorld ??
    (['pacwords', 'pactables', 'pacmath'].includes(mode)
      ? (mode as LearningWorldId)
      : profile.learningWorld)
  const isFreePlay = mode === 'free'
  const worldLevels = { ...DEFAULT_WORLD_LEVELS, ...profile.worldLevels }
  const playWorldLevels = { ...worldLevels, ...profile.playWorldLevels }

  const cfgFor = useMemo(() => {
    if (!isFreePlay) {
      return (level: number) => learningWorldCfg(activeWorld, level, profile.ageBand, settings)
    }
    const snapshot = freePlayCfg(settings)
    return () => snapshot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorld, isFreePlay, profile.ageBand, settings])

  const maxLevel = activeWorld === 'pacabacus' ? ADVENTURE_MAX : ADD_ON_MAX
  const startLevel = isFreePlay ? 1 : Math.min(playWorldLevels[activeWorld], maxLevel)

  const stepMs = SPEED_MS[settings.speed]
  const { state, dispatch } = useArcadeGame(
    cfgFor,
    startLevel,
    stepMs,
    profile.ageBand !== 'little' && settings.rockTimer,
    !isFreePlay,
    maxLevel,
    activeWorld,
    profile.ownedCharacters,
  )
  const visualGrowthLevel = isFreePlay ? worldLevels[activeWorld] : state.level
  const growth = growthForProgress(profile.ageBand, visualGrowthLevel)
  const tile = useTileSize(state.maze.cols, state.maze.rows)
  const world = !isFreePlay ? worldForAdventureLevel(state.level) : null
  const chapter = !isFreePlay ? chapterForLevel(activeWorld, state.level) : null
  const nextWorld = world && state.level < maxLevel ? worldForAdventureLevel(state.level + 1) : null
  const nextChapter = !isFreePlay && state.level < maxLevel ? chapterForLevel(activeWorld, state.level + 1) : null
  const crossingWorld = Boolean(world && nextWorld && world.id !== nextWorld.id)
  const songIndex = world ? world.musicIndex + ((state.level - world.levelStart) % 2) : state.level - 1
  const theme = world ? THEMES[world.theme] : (THEMES[settings.theme] ?? THEMES.stars)
  const hero = HEROES[profile.character] ? profile.character : 'kitty'
  const buddies = profile.buddies.filter((id) => HEROES[id]).slice(0, 3)
  const buddyGrowths = Object.fromEntries(
    buddies.map((id) => {
      const stage = buddyStageForUses(profile.buddyUseCounts[id] ?? 0)
      return [id, { stage, scale: buddyScaleForStage(stage) }]
    }),
  )
  const buddy = buddies[0] ?? (profile.buddy && HEROES[profile.buddy] ? profile.buddy : null)
  const touched = useRef(false)

  const [rewards, setRewards] = useState<CompleteResult | null>(null)
  const [powerBuddyId, setPowerBuddyId] = useState<HeroId | null>(null)
  const [answerInputReady, setAnswerInputReady] = useState(false)
  const [showLearningPanel, setShowLearningPanel] = useState(true)
  const completedLevelRef = useRef(0)

  // record progress + unlocks the moment a level is cleared
  useEffect(() => {
    if (!['levelClear', 'doorOpen'].includes(state.phase) || isFreePlay) return
    if (completedLevelRef.current === state.level) return
    completedLevelRef.current = state.level
    setRewards(profile.completeWorldLevel(activeWorld, state.level, state.clearStars))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.level, isFreePlay, activeWorld])

  // hands-free: right beads auto-submit after a short settle
  useEffect(() => {
    if (!ANSWER_PHASES.includes(state.phase) || !touched.current) return
    if (state.problem.answerText != null) return
    if (state.answerValue !== state.problem.answer) return
    const t = setTimeout(() => dispatch({ type: 'SUBMIT' }), 550)
    return () => clearTimeout(t)
  }, [state.answerValue, state.problem, state.phase, dispatch])

  useEffect(() => {
    touched.current = false
  }, [state.problem])

  useEffect(() => {
    if (!ANSWER_PHASES.includes(state.phase)) {
      setAnswerInputReady(false)
      return
    }
    setAnswerInputReady(false)
    const t = setTimeout(() => setAnswerInputReady(true), ANSWER_INPUT_GUARD_MS)
    return () => clearTimeout(t)
  }, [state.phase, state.problem])

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIRS[e.key] ?? KEY_DIRS[e.key.toLowerCase()]
      if (dir) {
        e.preventDefault()
        dispatch({ type: 'MOVE', dir })
      } else if (e.key === 'Enter') {
        if (!answerInputReady) return
        dispatch({ type: 'SUBMIT' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch, answerInputReady])

  // music + sfx
  useEffect(() => {
    if (settings.music) chiptune.playSong(songIndex)
    else chiptune.stopMusic()
    return () => chiptune.stopMusic()
  }, [settings.music, songIndex])

  const { phase } = state
  useEffect(() => {
    if (phase === 'levelClear') chiptune.sfx('fanfare')
    if (phase === 'gameOver') chiptune.sfx('caught')
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
      : activeWorld === 'pacmath' || activeWorld === 'pactables'
        ? 'keypad'
        : 'abacus'
  const modeLabel = isFreePlay
    ? 'Free Play'
    : LEARNING_WORLDS.find((learning) => learning.id === activeWorld)?.name ?? 'Adventure'

  const setAnswer = useCallback(
    (value: number) => {
      if (!answerInputReady) return
      touched.current = true
      dispatch({ type: 'SET_ANSWER', value })
    },
    [dispatch, answerInputReady],
  )
  const canAnswer = ANSWER_PHASES.includes(phase) && answerInputReady

  useEffect(() => {
    setShowLearningPanel(ANSWER_PHASES.includes(phase))
  }, [phase, problem])

  const goalText =
    phase === 'collisionBattle'
      ? 'Baddie battle! Solve all three numbers to win safely.'
      : phase === 'rescueFight'
      ? `Rescue fight! Solve hard problems to beat ${state.rescue?.badGuysLeft ?? 0} baddie${state.rescue?.badGuysLeft === 1 ? '' : 's'}.`
      : phase === 'rescueWall'
        ? `Break the rescue wall: ${state.rescue?.wallHits ?? 0}/${state.rescue?.wallTarget ?? 0} cracks.`
        : phase === 'answer'
      ? problem.kind === 'word'
        ? `Choose the missing letter to earn ${payout} moves!`
        : problem.kind === 'tables'
          ? `Solve the times table to earn ${payout} moves!`
          : problem.kind === 'count'
        ? `Count the ${problem.emoji}s and make the beads match!`
        : `Solve it to earn ${payout} moves!`
      : phase === 'move'
        ? state.vulnerableMovesLeft > 0
          ? `Power chase! ${state.vulnerableMovesLeft} zap move${state.vulnerableMovesLeft === 1 ? '' : 's'} — catch baddies!`
          : `Steer! ${state.movesLeft} move${state.movesLeft === 1 ? '' : 's'} left — ${state.goalLabel}.`
        : phase === 'doorOpen'
          ? 'The door is open! Steer to the top door, then press up.'
          : phase === 'travel'
            ? crossingWorld
              ? `Cross the world gate: ${nextWorld?.emoji ?? '🚪'} ${nextWorld?.name ?? 'next land'}`
              : `Journey through ${state.maze.name}: ${nextChapter?.emoji ?? '🚪'} ${nextChapter?.name ?? 'next room'}`
        : phase === 'ghosts'
          ? state.jailTurns > 0
            ? 'The baddies are stuck in jail! 🔒'
            : 'The baddies are moving… 👀'
          : phase === 'reveal'
            ? 'Watch the beads show the answer…'
            : ''

  return (
    <div
      className="game-shell relative flex min-h-svh flex-col items-center gap-1.5 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-1.5 text-slate-50 sm:gap-2 sm:p-2"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}

      {/* HUD */}
      <div className="game-hud z-20 grid w-full grid-cols-[1fr_auto_auto] items-center gap-1 rounded-xl border border-white/20 bg-slate-950/55 px-2 py-1 shadow-lg shadow-black/20 backdrop-blur-md sm:flex sm:w-auto sm:flex-wrap sm:justify-center sm:gap-2 sm:rounded-2xl sm:px-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-black text-amber-200 sm:text-sm">
            {modeLabel} · Level {state.level}
          </div>
          <div className="truncate text-[11px] font-bold text-[var(--c-soft)]">
            {chapter ? `${chapter.emoji} ${chapter.name}` : world ? `${world.emoji} ${world.name}` : 'Practice room'}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-black sm:text-sm">
          <span>{'❤️'.repeat(state.lives) || '💔'}</span>
          <span className="rounded-full bg-black/25 px-2 py-0.5 text-amber-200">
            {state.rescue && ['rescueFight', 'rescueWall', 'levelClear'].includes(phase)
              ? `🧱 ${state.rescue.wallHits}/${state.rescue.wallTarget}`
              : `${Math.min(state.goalProgress, state.goalTarget)}/${state.goalTarget}`}
          </span>
          <span className="hidden sm:inline">⭐ {state.stars}</span>
          <span className={`growth-pill growth-pill--${growth.stage}`}>
            {growth.shortLabel}
          </span>
          {state.vulnerableMovesLeft > 0 && (
            <span className="growth-charge-pill">⚡ {state.vulnerableMovesLeft}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className="hidden min-w-20 text-center sm:block">
            <div className="text-[10px] text-[var(--c-soft)]">Quick</div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-amber-300 transition-all"
                style={{ width: `${state.starReady ? 100 : state.quickMeter}%` }}
              />
            </div>
          </div>
          <div className="h-8 w-2 overflow-hidden rounded-full bg-black/30 sm:hidden">
            <div
              className="w-full rounded-full bg-amber-300 transition-all"
              style={{ height: `${state.starReady ? 100 : state.quickMeter}%`, marginTop: `${100 - (state.starReady ? 100 : state.quickMeter)}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => settings.update({ music: !settings.music })}
            className="h-11 w-11 rounded-lg border-2 border-[var(--c-border)] bg-black/20 text-base hover:brightness-125"
            aria-label={settings.music ? 'Mute music' : 'Play music'}
          >
            {settings.music ? '🔊' : '🔇'}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="h-11 rounded-lg border-2 border-[var(--c-border)] bg-black/20 px-3 text-xs font-bold hover:brightness-125"
          >
            🏠
          </button>
        </div>
      </div>

      <div className="game-goal z-20 max-w-[96vw] rounded-full border border-emerald-400/70 bg-slate-950/55 px-3 py-0.5 text-center text-xs font-bold text-emerald-300 backdrop-blur-md sm:px-4 sm:py-1 sm:text-sm">
        {goalText}
      </div>
      {state.rescue && ['rescueFight', 'rescueWall'].includes(phase) && (
        <div className="game-rescue-status z-20 flex max-w-[98vw] items-center gap-2 rounded-2xl border border-amber-300 bg-slate-950/60 px-3 py-1 text-xs font-black text-amber-100 backdrop-blur-md">
          <span>🔒 {HEROES[state.rescue.challenge.hero]?.name}</span>
          <span className="text-lg tracking-tight">
            {'🧱'.repeat(Math.max(0, state.rescue.wallTarget - state.rescue.wallHits))}
            {'💥'.repeat(state.rescue.wallHits)}
          </span>
          <span>👀 {state.rescue.badGuysLeft}</span>
        </div>
      )}

      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <MazeBoard
            maze={state.maze}
            tile={tile}
            treasures={state.treasures}
            jailFruits={state.jailFruits}
            jailTurns={state.jailTurns}
            vulnerableMovesLeft={state.vulnerableMovesLeft}
            pac={state.pac}
            facing={state.facing}
            ghosts={state.ghosts}
            stepMs={stepMs}
            hero={hero}
            buddy={state.buddy}
            buddyTrail={state.buddyTrail}
            buddyId={buddy}
            buddyIds={buddies}
            buddyGrowths={buddyGrowths}
            powerBuddy={state.powerBuddy}
            powerBuddyId={powerBuddyId ?? buddies[0] ?? null}
            exitDoor={state.exitDoor}
            travelExitDoor={state.travelExitDoor}
            rescueHeroId={state.rescue && !state.rescue.saved ? state.rescue.challenge.hero : null}
            rescueWallHits={state.rescue?.wallHits}
            rescueWallTarget={state.rescue?.wallTarget}
            themeId={theme.id}
            growth={growth}
            cloaked={ANSWER_PHASES.includes(phase) && state.ghosts.length > 0}
            onSteer={(dir) => dispatch({ type: 'MOVE', dir })}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowLearningPanel((visible) => !visible)}
          aria-expanded={showLearningPanel}
          aria-controls="learning-panel"
          className="game-learning-tab"
        >
          {showLearningPanel ? '✕' : '🧮 Math & beads'}
        </button>
        <aside
          id="learning-panel"
          aria-hidden={!showLearningPanel}
          inert={!showLearningPanel}
          className={showLearningPanel ? 'game-learning-drawer game-learning-drawer--open' : 'game-learning-drawer'}
        >
          <div className="flex w-full flex-col items-center rounded-2xl border border-white/20 bg-slate-950/55 p-2 shadow-lg shadow-black/20 backdrop-blur-md sm:p-3 landscape:flex-row landscape:justify-center landscape:gap-2 landscape:p-2">
            {state.powerTicksLeft > 0 ? (
              <div className="buddy-power-panel flex w-full flex-col items-center justify-center rounded-xl border border-amber-300 bg-amber-500/15 p-3 text-center landscape:min-h-24">
                <div className="text-xl font-black text-amber-200">⭐ Buddy power!</div>
                <div className="mt-1 text-sm font-bold text-[var(--c-soft)]">
                  Watch your buddy chase down one baddie.
                </div>
                <div className="mt-2 h-2 w-full max-w-52 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full rounded-full bg-amber-300 transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, (state.powerTicksLeft / 16) * 100))}%` }}
                  />
                </div>
              </div>
            ) : canSteer ? (
              <div className="flex w-full items-center justify-between gap-3 p-2 text-center">
                <p className="text-sm font-bold text-slate-100">Tap around your player or swipe anywhere on the maze.</p>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'END_MOVE' })}
                  className="shrink-0 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-black"
                >
                  End turn
                </button>
              </div>
            ) : (
              <>
                <div
                  className={[
                    'flex w-full flex-col items-center rounded-xl border p-1.5 sm:p-2 landscape:w-[min(11rem,17vw)] landscape:shrink-0 landscape:p-1.5',
                    isChallenge
                      ? 'border-amber-400 bg-amber-950/50'
                      : 'border-white/10 bg-black/10',
                  ].join(' ')}
                >
                  <h3 className="text-[11px] font-bold tracking-wide text-[var(--c-soft)] sm:text-xs">
                    {phase === 'collisionBattle'
                      ? '⚔️ BADDIE BATTLE! ⚔️'
                      : isChallenge
                      ? phase === 'rescueFight'
                        ? '⚡ RESCUE FIGHT! ⚡'
                        : phase === 'rescueWall'
                          ? '🧱 BREAK THE WALL! 🧱'
                          : '⚡ CHALLENGE — ONE TRY! ⚡'
                      : problem.kind === 'count'
                        ? 'HOW MANY?'
                        : problem.kind === 'word'
                          ? 'MISSING LETTER'
                          : 'SOLVE ME!'}
                  </h3>
                  <ProblemPrompt problem={problem} />
                  <div className="mb-0.5 rounded-full border border-emerald-500 bg-emerald-500/15 px-2.5 py-0 text-[10px] font-bold text-emerald-300 sm:text-xs">
                    {ANSWER_PHASES.includes(phase) && !answerInputReady
                      ? 'ready...'
                      : phase === 'collisionBattle'
                        ? 'correct = defeat it · wrong = lose a heart'
                      : phase === 'rescueFight'
                        ? 'correct = zap a baddie'
                        : phase === 'rescueWall'
                          ? 'correct = crack the wall'
                          : `worth +${payout} moves`}
                  </div>
                  <p className="min-h-4 max-w-64 text-center text-[10px] text-[var(--c-soft)] sm:min-h-6 sm:text-xs">
                    {state.hint}
                  </p>
                  <div className="mt-0.5 grid w-full max-w-64 grid-cols-[0.9fr_1.35fr] items-center gap-1.5 landscape:max-w-44">
                    <button
                      type="button"
                      onClick={() => {
                        if (canAnswer) dispatch({ type: 'SET_ANSWER', value: 0 })
                      }}
                      disabled={!canAnswer}
                      className="rounded-lg border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-2 py-1.5 text-xs font-bold brightness-110 disabled:opacity-40"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (canAnswer) dispatch({ type: 'SUBMIT' })
                      }}
                      disabled={!canAnswer}
                      className="rounded-lg border-2 border-emerald-600 bg-emerald-400 px-3 py-1.5 text-sm font-black text-emerald-950 disabled:opacity-40"
                    >
                      Go ▶
                    </button>
                  </div>
                  {phase === 'answer' && state.cfg.allowChallenge && !isChallenge && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'CHALLENGE' })}
                      disabled={!canAnswer}
                      className="mt-1 rounded-lg border border-amber-500 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30 disabled:opacity-40 sm:text-xs"
                    >
                      ⚡ 10-move challenge
                    </button>
                  )}
                  {state.starReady && state.powerTicksLeft === 0 && buddies.length > 0 && (
                    <div className="mt-2 flex max-w-64 flex-wrap justify-center gap-2 rounded-xl border border-amber-300 bg-amber-500/15 p-2">
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

                <div className="flex w-full flex-col items-center p-0.5 landscape:w-auto landscape:shrink-0">
                  {answerMode === 'word' ? (
                    <WordChoices
                      choices={problem.choices ?? []}
                      selected={state.answerText}
                      disabled={!canAnswer}
                      onPick={(value) => {
                        if (!canAnswer) return
                        dispatch({ type: 'SET_TEXT_ANSWER', value })
                        dispatch({ type: 'SUBMIT' })
                      }}
                    />
                  ) : answerMode === 'keypad' ? (
                    <NumberPad
                      value={state.answerValue}
                      disabled={!canAnswer}
                      onChange={setAnswer}
                      onSubmit={() => {
                        if (canAnswer) dispatch({ type: 'SUBMIT' })
                      }}
                    />
                  ) : (
                    <>
                      <h3 className="mb-1 text-[11px] font-bold tracking-wide text-[var(--c-soft)] sm:mb-2 sm:text-xs">
                        YOUR ABACUS
                      </h3>
                      <Abacus
                        rodCount={state.cfg.rodCount}
                        value={state.answerValue}
                        onChange={setAnswer}
                        readOnly={!canAnswer}
                        showLabels={state.cfg.rodCount > 1}
                        compact
                      />
                      <div className="mt-1 text-sm sm:mt-2 sm:text-lg">
                        Beads: <b className="text-xl text-amber-300 sm:text-2xl">{state.answerValue}</b>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </aside>
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
          <p className="text-lg">Goal complete: {state.goalLabel}!</p>
          {state.rescue?.saved && (
            <RescueCard heroId={state.rescue.challenge.hero} />
          )}
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
              {SECRET_HERO_IDS.includes(id) ? '🔓 Prisoner rescued' : '🎁 New character unlocked'}: {HEROES[id].name}!
            </p>
          ))}
          {rewards?.newCharacters.includes('mewtwo') && (
            <p className="text-lg font-black text-fuchsia-200">
              You saved the super secret character. Whole journey complete! ✨
            </p>
          )}
          {rewards?.newBadges.map((b) => (
            <p key={b.id} className="font-bold text-amber-300">
              {b.emoji} New badge: {b.name}!
            </p>
          ))}
          {state.level >= maxLevel ? (
            <>
              <p className="text-lg font-bold text-emerald-300">
                You finished the whole {modeLabel} journey! 🏆
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
        <Overlay title="Ouch — you lost all three hearts! ❤️">
          <p className="text-lg">
            A baddie hurt your player. Restart this level and try again.
          </p>
          <div className="flex justify-center gap-3">
            <OverlayButton onClick={() => dispatch({ type: 'RESTART_LEVEL' })}>
              Restart level ▶
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

function RescueCard({ heroId }: { heroId: HeroId }) {
  const hero = HEROES[heroId]
  const detail = characterDetailFor(heroId)
  if (!hero) return null
  return (
    <div className="my-2 flex max-w-sm flex-col items-center rounded-2xl border-2 border-amber-300 bg-amber-500/15 p-4 text-center shadow-lg shadow-black/20">
      <div className="mb-2 rounded-full bg-black/25 p-3">
        <PixelSprite map={hero.frames[0]} palette={hero.palette} size={76} />
      </div>
      <div className="text-xl font-black text-amber-200">You saved {hero.name}!</div>
      <div className="mt-1 text-sm font-black text-emerald-200">{detail.title}</div>
      <p className="mt-2 text-sm leading-snug text-slate-100">
        {detail.rescueLine ?? detail.personality}
      </p>
      <p className="mt-2 text-xs font-bold text-[var(--c-soft)]">
        Power: {detail.power}
      </p>
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
