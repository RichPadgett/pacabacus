import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { BUDDY_ORDER, HEROES, PixelSprite } from '@/features/arcade/sprites'
import { THEMES } from '@/features/arcade/themes'
import {
  buddyCost,
  playableCharacters,
  useProfile,
} from '@/features/profile/profileStore'

export function CharacterSelect({ onBack }: { onBack: () => void }) {
  const profile = useProfile()
  const settings = useArcadeSettings()
  const theme = THEMES[settings.theme] ?? THEMES.stars
  const ownedBuddies = new Set(profile.ownedBuddies)
  const playable = playableCharacters()

  return (
    <div
      className="relative flex min-h-svh flex-col items-center gap-5 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-6 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
      <h1 className="text-3xl font-black text-amber-300">Choose your team! 🎭</h1>
      <p className="text-sm text-[var(--c-soft)]">
        Pick your player, buy buddies, then choose one to follow you.
      </p>
      <div className="rounded-full border-2 border-amber-400 bg-amber-500/15 px-5 py-2 text-lg font-black text-amber-200">
        <GoldCoin /> {profile.treasureCoins} treasure coins
      </div>

      <section className="w-full max-w-2xl rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
        <h2 className="mb-3 text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
          PLAYER
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {playable.map((id) => {
            const hero = HEROES[id]
            const isCurrent = profile.character === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => profile.setCharacter(id)}
                className={[
                  'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition',
                  isCurrent
                    ? 'border-emerald-400 bg-emerald-500/20'
                    : 'border-[var(--c-border)] bg-black/20 hover:brightness-125',
                ].join(' ')}
              >
                <PixelSprite map={hero.frames[0]} palette={hero.palette} size={64} />
                <span className="font-bold">{hero.name}</span>
                <span className="text-xs text-[var(--c-soft)]">
                  {isCurrent ? '✓ Playing!' : 'Tap to pick'}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="w-full max-w-2xl rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
        <h2 className="mb-3 text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
          BUDDY
        </h2>
        <div className="mb-3 flex justify-center">
          <button
            type="button"
            onClick={() => profile.setBuddy(null)}
            className={[
              'rounded-2xl border-2 px-5 py-3 font-bold',
              profile.buddy == null
                ? 'border-emerald-400 bg-emerald-500/20'
                : 'border-[var(--c-border)] bg-black/20 hover:brightness-125',
            ].join(' ')}
          >
            No buddy
          </button>
        </div>
        <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
          {BUDDY_ORDER.map((id) => {
            const hero = HEROES[id]
            const cost = buddyCost(id)
            const isOwned = ownedBuddies.has(id)
            const canBuy = profile.treasureCoins >= cost
            const isCurrent = profile.buddy === id
            return (
              <button
                key={id}
                type="button"
                disabled={!isOwned && !canBuy}
                onClick={() => {
                  if (isOwned) profile.setBuddy(id)
                  else profile.buyBuddy(id)
                }}
                className={[
                  'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition',
                  isCurrent
                    ? 'border-emerald-400 bg-emerald-500/20'
                    : isOwned
                      ? 'border-[var(--c-border)] bg-[var(--c-panel)] hover:brightness-125'
                      : canBuy
                        ? 'border-amber-400 bg-amber-500/15 hover:brightness-125'
                        : 'border-[var(--c-border)] bg-black/30 opacity-70',
                ].join(' ')}
              >
                <PixelSprite
                  map={hero.frames[0]}
                  palette={hero.palette}
                  size={64}
                  style={isOwned ? undefined : { filter: 'grayscale(1) brightness(0.45)' }}
                />
                <span className="font-bold">{hero.name}</span>
                <span className="text-xs text-[var(--c-soft)]">
                  {isCurrent
                    ? '✓ Following!'
                    : isOwned
                      ? 'Tap for buddy'
                      : canBuy
                        ? (
                            <>
                              Buy for {cost} <GoldCoin small />
                            </>
                          )
                        : (
                            <>
                              {cost} <GoldCoin small />
                            </>
                          )}
                </span>
              </button>
            )
          })}
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

function GoldCoin({ small }: { small?: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-full border border-yellow-100 bg-gradient-to-br from-yellow-100 via-yellow-300 to-amber-500 font-black text-amber-900 shadow-[inset_0_-1px_0_rgba(146,64,14,0.55)] align-middle',
        small ? 'h-4 w-4 text-[10px]' : 'h-6 w-6 text-sm',
      ].join(' ')}
    >
      $
    </span>
  )
}
