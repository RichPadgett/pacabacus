import { useState } from 'react'
import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import {
  BUDDY_ORDER,
  CHARACTER_ORDER,
  HEROES,
  SECRET_HERO_IDS,
  STARTER_HERO_IDS,
  type HeroId,
} from '@/features/arcade/sprites'
import { PixelSprite } from '@/features/arcade/PixelSprite'
import { THEMES } from '@/features/arcade/themes'
import { ADD_ON_MAX, ADVENTURE_MAX } from '@/features/arcade/gameConfig'
import { LEARNING_WORLDS } from '@/features/learning/learningWorlds'
import { BADGES } from '@/features/profile/rewards'
import {
  earnedBadges,
  totalWorldCompleted,
  useProfile,
} from '@/features/profile/profileStore'
import { RESCUE_CHALLENGES } from '@/features/profile/rescueChallenges'

export function RewardsScreen({ onBack }: { onBack: () => void }) {
  const profile = useProfile()
  const settings = useArcadeSettings()
  const theme = THEMES[settings.theme] ?? THEMES.stars
  const [page, setPage] = useState(0)
  const total = totalWorldCompleted(profile)
  const unlockedBuddies = new Set(profile.ownedBuddies)
  const unlockedCharacters = new Set([...STARTER_HERO_IDS, ...profile.ownedCharacters])
  const earned = new Set(earnedBadges(total).map((b) => b.id))
  const totalStars = Object.values(profile.worldStars).reduce((a, b) => a + b, 0)
  const pages = ['Characters', 'Buddies', 'Badges', 'Trophies']
  const rescueByHero = new Map(RESCUE_CHALLENGES.map((challenge) => [challenge.hero, challenge]))
  const buddyRewardOrder = [
    ...BUDDY_ORDER,
    ...SECRET_HERO_IDS.filter((id) => unlockedBuddies.has(id)),
  ]
  const nextPage = () => setPage((current) => Math.min(pages.length - 1, current + 1))
  const prevPage = () => setPage((current) => Math.max(0, current - 1))

  const worldTrophies = LEARNING_WORLDS.map((world) => {
    const maxLevel = world.id === 'pacabacus' ? ADVENTURE_MAX : ADD_ON_MAX
    const levels = Array.from({ length: maxLevel }, (_, index) => index + 1)
    const stars = levels.reduce(
      (sum, level) => sum + (profile.worldStars[`${world.id}:${level}`] ?? 0),
      0,
    )
    const complete = (profile.worldLevels[world.id] ?? 1) > maxLevel
    return { world, stars, complete, maxStars: maxLevel * 3, maxLevel }
  })

  return (
    <div
      className="paged-shell relative flex min-h-svh flex-col items-center gap-2 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-3 text-slate-50 sm:gap-4 sm:p-6"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}
      <div className="paged-header">
        <h1 className="text-2xl font-black text-amber-300 sm:text-3xl">Your Rewards 🏆</h1>
        <p className="text-xs font-bold text-[var(--c-soft)] sm:text-sm">
          {total} levels · {totalStars} ⭐ · {profile.treasureCoins} gold
        </p>
      </div>

      <main className="paged-main">
        {page === 0 && (
          <section className="paged-card">
            <h2 className="paged-title">CHARACTERS ({unlockedCharacters.size}/{CHARACTER_ORDER.length})</h2>
            <div className="reward-grid">
              {CHARACTER_ORDER.map((id) => (
                <RewardSprite
                  key={id}
                  id={id}
                  label={
                    unlockedCharacters.has(id)
                      ? HEROES[id].name
                      : rescueByHero.has(id)
                        ? `Rescue L${rescueByHero.get(id)?.level}`
                        : `L${HEROES[id].unlockLevel}`
                  }
                  locked={!unlockedCharacters.has(id)}
                />
              ))}
            </div>
          </section>
        )}

        {page === 1 && (
          <section className="paged-card">
            <h2 className="paged-title">BABY BUDDIES ({unlockedBuddies.size}/{buddyRewardOrder.length})</h2>
            <div className="reward-grid">
              {buddyRewardOrder.map((id) => (
                <RewardSprite
                  key={id}
                  id={id}
                  label={unlockedBuddies.has(id) ? HEROES[id].name : 'Shop'}
                  locked={!unlockedBuddies.has(id)}
                />
              ))}
            </div>
          </section>
        )}

        {page === 2 && (
          <section className="paged-card">
            <h2 className="paged-title">BADGES ({earned.size}/{BADGES.length})</h2>
            <div className="badge-grid">
              {BADGES.map((b) => (
                <div
                  key={b.id}
                  className={[
                    'badge-card',
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
        )}

        {page === 3 && (
          <section className="paged-card">
            <h2 className="paged-title">WORLD TROPHIES</h2>
            <div className="trophy-grid">
              {worldTrophies.map(({ world, stars, complete, maxStars, maxLevel }) => (
                <div
                  key={world.id}
                  className={[
                    'rounded-xl border-2 p-3 text-center',
                    complete ? 'border-amber-400 bg-amber-500/15' : 'border-[var(--c-border)] bg-black/25',
                  ].join(' ')}
                >
                  <div className="text-2xl">{complete ? world.icon : '🔒'}</div>
                  <div className="text-sm font-black">{world.name}</div>
                  <div className="text-xs text-[var(--c-soft)]">
                    {complete ? `${stars}/${maxStars} stars` : `Complete all ${maxLevel} levels`}
                  </div>
                </div>
              ))}
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

function RewardSprite({ id, label, locked }: { id: HeroId; label: string; locked: boolean }) {
  return (
    <div className="reward-sprite">
      <PixelSprite
        map={HEROES[id].frames[0]}
        palette={HEROES[id].palette}
        size={42}
        style={locked ? { filter: 'grayscale(1) brightness(0.4)' } : undefined}
      />
      <span className="text-[10px] text-[var(--c-soft)]">{label}</span>
    </div>
  )
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
