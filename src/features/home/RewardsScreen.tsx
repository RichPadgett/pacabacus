import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { BUDDY_ORDER, CHARACTER_ORDER, HEROES, PixelSprite, STARTER_HERO_IDS } from '@/features/arcade/sprites'
import { THEMES } from '@/features/arcade/themes'
import { ADVENTURE_WORLDS } from '@/features/arcade/worlds'
import { BADGES } from '@/features/profile/rewards'
import {
  earnedBadges,
  totalCompleted,
  useProfile,
} from '@/features/profile/profileStore'

export function RewardsScreen({ onBack }: { onBack: () => void }) {
  const profile = useProfile()
  const settings = useArcadeSettings()
  const theme = THEMES[settings.theme] ?? THEMES.stars
  const total = totalCompleted(profile)
  const unlockedBuddies = new Set(profile.ownedBuddies)
  const unlockedCharacters = new Set([...STARTER_HERO_IDS, ...profile.ownedCharacters])
  const earned = new Set(earnedBadges(total).map((b) => b.id))
  const totalStars = Object.values(profile.stars).reduce((a, b) => a + b, 0)

  const worldTrophies = ADVENTURE_WORLDS.map((world) => {
    const levels = Array.from(
      { length: world.levelEnd - world.levelStart + 1 },
      (_, i) => world.levelStart + i,
    )
    const stars = levels.reduce((sum, level) => sum + (profile.stars[`a${level}`] ?? 0), 0)
    const complete = levels.every((level) => profile.stars[`a${level}`] != null)
    return { world, stars, complete, maxStars: levels.length * 3 }
  })

  return (
    <div
      className="relative flex min-h-svh flex-col items-center gap-5 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-6 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
      <h1 className="text-3xl font-black text-amber-300">Your Rewards 🏆</h1>
      <p className="text-sm text-[var(--c-soft)]">
        {total} levels finished · {totalStars} ⭐ collected · {profile.treasureCoins} gold saved
      </p>

      <section className="w-full max-w-2xl rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
        <h2 className="mb-3 text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
          CHARACTERS ({unlockedCharacters.size}/{CHARACTER_ORDER.length})
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {CHARACTER_ORDER.map((id) => (
            <div key={id} className="flex flex-col items-center gap-1">
              <PixelSprite
                map={HEROES[id].frames[0]}
                palette={HEROES[id].palette}
                size={44}
                style={
                  unlockedCharacters.has(id) ? undefined : { filter: 'grayscale(1) brightness(0.4)' }
                }
              />
              <span className="text-[10px] text-[var(--c-soft)]">
                {unlockedCharacters.has(id) ? HEROES[id].name : `L${HEROES[id].unlockLevel}`}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-2xl rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
        <h2 className="mb-3 text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
          BABY BUDDIES ({unlockedBuddies.size}/{BUDDY_ORDER.length})
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {BUDDY_ORDER.map((id) => (
            <div key={id} className="flex flex-col items-center gap-1">
              <PixelSprite
                map={HEROES[id].frames[0]}
                palette={HEROES[id].palette}
                size={44}
                style={
                  unlockedBuddies.has(id) ? undefined : { filter: 'grayscale(1) brightness(0.4)' }
                }
              />
              <span className="text-[10px] text-[var(--c-soft)]">
                {unlockedBuddies.has(id) ? HEROES[id].name : 'Shop'}
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

      <section className="w-full max-w-2xl rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
        <h2 className="mb-3 text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
          WORLD TROPHIES
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {worldTrophies.map(({ world, stars, complete, maxStars }) => (
            <div
              key={world.id}
              className={[
                'rounded-xl border-2 p-3 text-center',
                complete ? 'border-amber-400 bg-amber-500/15' : 'border-[var(--c-border)] bg-black/25',
              ].join(' ')}
            >
              <div className="text-2xl">{complete ? world.emoji : '🔒'}</div>
              <div className="text-sm font-black">{world.name}</div>
              <div className="text-xs text-[var(--c-soft)]">
                {complete ? `${stars}/${maxStars} stars` : `Levels ${world.levelStart}-${world.levelEnd}`}
              </div>
            </div>
          ))}
        </div>
      </section>

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
