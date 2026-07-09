import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { CHARACTER_ORDER, HEROES, PixelSprite } from '@/features/arcade/sprites'
import { THEMES } from '@/features/arcade/themes'
import {
  totalCompleted,
  unlockedCharacters,
  useProfile,
} from '@/features/profile/profileStore'

export function CharacterSelect({ onBack }: { onBack: () => void }) {
  const profile = useProfile()
  const settings = useArcadeSettings()
  const theme = THEMES[settings.theme] ?? THEMES.stars
  const total = totalCompleted(profile)
  const unlocked = new Set(unlockedCharacters(total))

  return (
    <div
      className="relative flex min-h-svh flex-col items-center gap-5 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-6 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
      <h1 className="text-3xl font-black text-amber-300">Choose your friend! 🎭</h1>
      <p className="text-sm text-[var(--c-soft)]">
        Finish more levels to unlock new friends!
      </p>

      <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
        {CHARACTER_ORDER.map((id) => {
          const hero = HEROES[id]
          const isUnlocked = unlocked.has(id)
          const isCurrent = profile.character === id
          return (
            <button
              key={id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => profile.setCharacter(id)}
              className={[
                'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition',
                isCurrent
                  ? 'border-emerald-400 bg-emerald-500/20'
                  : isUnlocked
                    ? 'border-[var(--c-border)] bg-[var(--c-panel)] hover:brightness-125'
                    : 'border-[var(--c-border)] bg-black/30 opacity-70',
              ].join(' ')}
            >
              <PixelSprite
                map={hero.frames[0]}
                palette={hero.palette}
                size={64}
                style={isUnlocked ? undefined : { filter: 'grayscale(1) brightness(0.4)' }}
              />
              <span className="font-bold">{isUnlocked ? hero.name : '???'}</span>
              <span className="text-xs text-[var(--c-soft)]">
                {isCurrent
                  ? '✓ Playing!'
                  : isUnlocked
                    ? 'Tap to pick'
                    : `🔒 Finish ${hero.unlockLevel} levels`}
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-8 py-3 font-bold hover:brightness-125"
      >
        🏠 Back home
      </button>
    </div>
  )
}
