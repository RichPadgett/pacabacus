import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { CHARACTER_ORDER, HEROES, PixelSprite } from '@/features/arcade/sprites'
import { THEMES } from '@/features/arcade/themes'
import { BADGES } from '@/features/profile/rewards'
import {
  earnedBadges,
  totalCompleted,
  unlockedCharacters,
  useProfile,
} from '@/features/profile/profileStore'

export function RewardsScreen({ onBack }: { onBack: () => void }) {
  const profile = useProfile()
  const settings = useArcadeSettings()
  const theme = THEMES[settings.theme] ?? THEMES.stars
  const total = totalCompleted(profile)
  const unlocked = new Set(unlockedCharacters(total))
  const earned = new Set(earnedBadges(total).map((b) => b.id))
  const totalStars = Object.values(profile.stars).reduce((a, b) => a + b, 0)

  const trophies = Object.entries(profile.stars).sort((a, b) => {
    const modeA = a[0][0]
    const modeB = b[0][0]
    if (modeA !== modeB) return modeA < modeB ? -1 : 1
    return Number(a[0].slice(1)) - Number(b[0].slice(1))
  })

  return (
    <div
      className="relative flex min-h-svh flex-col items-center gap-5 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-6 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
      <h1 className="text-3xl font-black text-amber-300">Your Rewards 🏆</h1>
      <p className="text-sm text-[var(--c-soft)]">
        {total} levels finished · {totalStars} ⭐ collected
      </p>

      <section className="w-full max-w-2xl rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
        <h2 className="mb-3 text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
          FRIENDS ({unlocked.size}/{CHARACTER_ORDER.length})
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {CHARACTER_ORDER.map((id) => (
            <div key={id} className="flex flex-col items-center gap-1">
              <PixelSprite
                map={HEROES[id].frames[0]}
                palette={HEROES[id].palette}
                size={44}
                style={
                  unlocked.has(id) ? undefined : { filter: 'grayscale(1) brightness(0.4)' }
                }
              />
              <span className="text-[10px] text-[var(--c-soft)]">
                {unlocked.has(id) ? HEROES[id].name : '🔒'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-2xl rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
        <h2 className="mb-3 text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
          BADGES ({earned.size}/{BADGES.length})
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className={[
                'flex w-24 flex-col items-center gap-1 rounded-xl border-2 p-2 text-center',
                earned.has(b.id)
                  ? 'border-amber-400 bg-amber-500/15'
                  : 'border-[var(--c-border)] bg-black/30 opacity-60',
              ].join(' ')}
            >
              <span className="text-2xl">{earned.has(b.id) ? b.emoji : '🔒'}</span>
              <span className="text-[10px] font-bold">{b.name}</span>
              <span className="text-[9px] text-[var(--c-soft)]">
                {earned.has(b.id) ? 'Earned!' : `${b.level} levels`}
              </span>
            </div>
          ))}
        </div>
      </section>

      {trophies.length > 0 && (
        <section className="w-full max-w-2xl rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
          <h2 className="mb-3 text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
            LEVEL TROPHIES
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {trophies.map(([key, stars]) => (
              <span
                key={key}
                className="rounded-full border border-[var(--c-border)] bg-black/20 px-3 py-1 text-xs font-bold"
              >
                {key.startsWith('a') ? '🗺️' : '🐣'} L{key.slice(1)} {'⭐'.repeat(stars)}
              </span>
            ))}
          </div>
        </section>
      )}

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
