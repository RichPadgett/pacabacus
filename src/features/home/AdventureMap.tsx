import { ADVENTURE_MAX } from '@/features/arcade/gameConfig'
import { THEMES } from '@/features/arcade/themes'
import { ADVENTURE_WORLDS, worldForAdventureLevel } from '@/features/arcade/worlds'
import { useProfile } from '@/features/profile/profileStore'
import { Twinkles } from '@/features/arcade/ArcadeGame'

export function AdventureMap({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  const profile = useProfile()
  const currentLevel = Math.min(profile.adventureLevel, ADVENTURE_MAX)
  const currentWorld = worldForAdventureLevel(currentLevel)
  const theme = THEMES[currentWorld.theme] ?? THEMES.stars

  return (
    <div
      className="relative flex min-h-svh flex-col items-center gap-5 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-5 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
      <header className="text-center">
        <h1 className="text-4xl font-black text-amber-300">Adventure Map</h1>
        <p className="mt-1 text-sm font-bold text-[var(--c-soft)]">
          Level {currentLevel} · {currentWorld.emoji} {currentWorld.name}
        </p>
      </header>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-5">
        {ADVENTURE_WORLDS.map((world) => {
          const isCurrent = world.id === currentWorld.id
          const isOpen = profile.adventureLevel >= world.levelStart
          const isDone = profile.adventureLevel > world.levelEnd
          return (
            <div
              key={world.id}
              className={[
                'flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center',
                isCurrent
                  ? 'border-emerald-400 bg-emerald-500/20'
                  : isOpen
                    ? 'border-[var(--c-border)] bg-[var(--c-panel)]'
                    : 'border-[var(--c-border)] bg-black/30 opacity-60',
              ].join(' ')}
            >
              <span className="text-4xl">{isOpen ? world.emoji : '🔒'}</span>
              <span className="text-lg font-black">{world.name}</span>
              <span className="text-xs font-bold text-[var(--c-soft)]">
                Levels {world.levelStart}-{world.levelEnd}
              </span>
              <span className="min-h-5 text-xs font-black text-amber-200">
                {isCurrent ? 'Here now' : isDone ? 'Cleared' : isOpen ? 'Open' : 'Locked'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="rounded-2xl border-4 border-emerald-600 bg-emerald-400 px-10 py-3 text-xl font-black text-emerald-950 active:scale-95"
        >
          Start Level {currentLevel} ▶
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-8 py-3 font-bold hover:brightness-125"
        >
          🏠 Back home
        </button>
      </div>
    </div>
  )
}
