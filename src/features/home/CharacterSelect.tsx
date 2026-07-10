import { useState } from 'react'
import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { BUDDY_ORDER, HEROES, PixelSprite, SECRET_HERO_IDS } from '@/features/arcade/sprites'
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
  const [page, setPage] = useState(0)
  const ownedBuddies = new Set(profile.ownedBuddies)
  const activeBuddies = new Set(profile.buddies)
  const playable = playableCharacters(profile.ownedCharacters)
  const buddyRoster = [
    ...BUDDY_ORDER,
    ...SECRET_HERO_IDS.filter((id) => ownedBuddies.has(id)),
  ]
  const buddyPages = chunk(buddyRoster, 6)
  const pages = ['Player', ...buddyPages.map((_, index) => `Buddies ${index + 1}`)]
  const nextPage = () => setPage((current) => Math.min(pages.length - 1, current + 1))
  const prevPage = () => setPage((current) => Math.max(0, current - 1))

  return (
    <div
      className="paged-shell relative flex min-h-svh flex-col items-center gap-2 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-3 text-slate-50 sm:gap-4 sm:p-6"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
      <div className="paged-header">
        <h1 className="text-2xl font-black text-amber-300 sm:text-3xl">Choose your team! 🎭</h1>
        <div className="rounded-full border-2 border-amber-400 bg-amber-500/15 px-4 py-1 text-sm font-black text-amber-200 sm:text-lg">
          <GoldCoin /> {profile.treasureCoins}
        </div>
      </div>

      <main className="paged-main">
        {page === 0 ? (
          <section className="paged-card">
            <h2 className="paged-title">PLAYER</h2>
            <div className="paged-grid paged-grid--characters">
              {playable.map((id) => {
                const hero = HEROES[id]
                const isCurrent = profile.character === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => profile.setCharacter(id)}
                    className={[
                      'paged-pick-card',
                      isCurrent
                        ? 'border-emerald-400 bg-emerald-500/20'
                        : 'border-[var(--c-border)] bg-black/20 hover:brightness-125',
                    ].join(' ')}
                  >
                    <PixelSprite map={hero.frames[0]} palette={hero.palette} size={58} />
                    <span className="font-bold">{hero.name}</span>
                    <span className="text-[10px] text-[var(--c-soft)] sm:text-xs">
                      {isCurrent ? '✓ Playing!' : 'Tap to pick'}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ) : (
          <section className="paged-card">
            <h2 className="paged-title">BABY BUDDIES ({profile.buddies.length}/3)</h2>
            <div className="mb-2 flex justify-center">
              <button
                type="button"
                onClick={() => profile.setBuddy(null)}
                className={[
                  'rounded-xl border-2 px-4 py-1.5 text-sm font-bold',
                  profile.buddy == null
                    ? 'border-emerald-400 bg-emerald-500/20'
                    : 'border-[var(--c-border)] bg-black/20 hover:brightness-125',
                ].join(' ')}
              >
                No buddies
              </button>
            </div>
            <div className="paged-grid paged-grid--buddies">
              {buddyPages[page - 1].map((id) => {
                const hero = HEROES[id]
                const cost = buddyCost(id)
                const isOwned = ownedBuddies.has(id)
                const canBuy = profile.treasureCoins >= cost
                const isCurrent = activeBuddies.has(id)
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={!isOwned && !canBuy}
                    onClick={() => {
                      if (isOwned) profile.toggleBuddy(id)
                      else profile.buyBuddy(id)
                    }}
                    className={[
                      'paged-pick-card',
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
                      size={54}
                      style={isOwned ? undefined : { filter: 'grayscale(1) brightness(0.45)' }}
                    />
                    <span className="font-bold">{hero.name}</span>
                    <span className="text-[10px] text-[var(--c-soft)] sm:text-xs">
                      {isCurrent
                        ? '✓ Following!'
                        : isOwned
                          ? profile.buddies.length >= 3
                            ? 'Tap to swap'
                            : 'Tap to follow'
                          : canBuy
                            ? (
                                <>
                                  Buy {cost} <GoldCoin small />
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
        )}
      </main>

      <Pager
        page={page}
        pages={pages}
        onBack={onBack}
        onPrev={prevPage}
        onNext={nextPage}
        onPage={setPage}
      />
    </div>
  )
}

function chunk<T>(items: T[], size: number) {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size))
  return pages
}

function Pager({
  page,
  pages,
  onBack,
  onPrev,
  onNext,
  onPage,
}: {
  page: number
  pages: string[]
  onBack: () => void
  onPrev: () => void
  onNext: () => void
  onPage: (page: number) => void
}) {
  return (
    <footer className="paged-footer">
      <button type="button" onClick={onBack} className="paged-nav-button">
        🏠
      </button>
      <button type="button" onClick={onPrev} disabled={page === 0} className="paged-nav-button">
        ◀
      </button>
      <div className="paged-dots" aria-label={`${pages[page]} page`}>
        {pages.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => onPage(index)}
            aria-label={label}
            className={index === page ? 'paged-dot paged-dot--active' : 'paged-dot'}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={page === pages.length - 1}
        className="paged-nav-button"
      >
        ▶
      </button>
    </footer>
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
