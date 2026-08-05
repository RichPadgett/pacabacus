import type { CSSProperties } from 'react'
import { Twinkles } from '@/features/arcade/ArcadeGame'
import { PixelSprite } from '@/features/arcade/PixelSprite'
import { HEROES } from '@/features/arcade/sprites'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { THEMES } from '@/features/arcade/themes'
import { ADD_ON_MAX, ADVENTURE_MAX } from '@/features/arcade/gameConfig'
import { LEARNING_WORLDS, ageFromDateOfBirth } from '@/features/learning/learningWorlds'
import { useProfile } from '@/features/profile/profileStore'
import { useTranslations } from '@/features/i18n/i18nStore'

interface PreGameScreenProps {
  onStart: () => void
  onLineup: () => void
  onBack: () => void
}

export function PreGameScreen({ onStart, onLineup, onBack }: PreGameScreenProps) {
  const profile = useProfile()
  const settings = useArcadeSettings()
  const { ageBandLabel, t, worldText } = useTranslations()
  const theme = THEMES[settings.theme] ?? THEMES.stars
  const world = LEARNING_WORLDS.find((item) => item.id === profile.learningWorld) ?? LEARNING_WORLDS[0]
  const worldCopy = worldText(world.id)
  const maxLevel = profile.learningWorld === 'pacabacus' ? ADVENTURE_MAX : ADD_ON_MAX
  const unlockedLevel = profile.worldLevels?.[profile.learningWorld] ?? 1
  const playLevel = Math.min(profile.playWorldLevels?.[profile.learningWorld] ?? unlockedLevel, maxLevel)
  const heroId = HEROES[profile.character] ? profile.character : 'kitty'
  const hero = HEROES[heroId]
  const buddies = profile.buddies.filter((id) => HEROES[id]).slice(0, 3)
  const age = ageFromDateOfBirth(profile.dateOfBirth)

  return (
    <div
      className="home-shell relative flex min-h-svh flex-col items-center justify-center gap-5 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-6 text-slate-50"
      style={theme.vars as CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
      <section className="w-full max-w-md rounded-3xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-5 shadow-2xl shadow-black/25">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border-2 border-[var(--c-border)] bg-black/20 px-3 py-2 text-sm font-black hover:brightness-125"
          >
            ◀ Home
          </button>
          <span className="rounded-full border border-amber-300 bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-100">
            {age != null ? t('profile.yearsOld', { count: age }) : ageBandLabel(profile.ageBand)}
          </span>
        </div>

        <div className="mt-5 text-center">
          <div className="text-4xl">{world.icon}</div>
          <h1 className="mt-1 text-3xl font-black text-amber-300">{worldCopy.name}</h1>
          <p className="text-sm font-bold text-[var(--c-soft)]">
            Level {playLevel} · {worldCopy.subtitle}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border-2 border-[var(--c-border)] bg-black/20 p-4">
          <div className="flex items-center gap-4">
            <PixelSprite map={hero.frames[0]} palette={hero.palette} size={64} />
            <div className="min-w-0 flex-1">
              <div className="text-lg font-black">{hero.name}</div>
              <div className="text-xs font-bold text-[var(--c-soft)]">Current player</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {buddies.length ? (
              buddies.map((id) => {
                const buddy = HEROES[id]
                return (
                  <div key={id} className="rounded-xl border border-[var(--c-border)] bg-black/20 p-2 text-center">
                    <PixelSprite map={buddy.frames[0]} palette={buddy.palette} size={36} />
                    <div className="mt-1 truncate text-[11px] font-black">{buddy.name}</div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-3 rounded-xl border border-dashed border-[var(--c-border)] bg-black/15 p-3 text-center text-xs font-bold text-[var(--c-soft)]">
                No buddies selected yet
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={onStart}
            className="rounded-2xl border-4 border-emerald-600 bg-emerald-400 px-6 py-4 text-2xl font-black text-emerald-950 shadow-lg shadow-emerald-950/25 transition hover:brightness-110 active:scale-95"
          >
            Start Game ▶
          </button>
          <button
            type="button"
            onClick={onLineup}
            className="rounded-2xl border-2 border-sky-300 bg-sky-500/15 px-5 py-3 text-lg font-black text-sky-100 transition hover:bg-sky-500/25 active:scale-95"
          >
            Change Lineup 🎭
          </button>
        </div>
      </section>
    </div>
  )
}
