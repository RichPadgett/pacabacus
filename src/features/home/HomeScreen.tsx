import { useState } from 'react'
import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { HEROES, PixelSprite } from '@/features/arcade/sprites'
import { THEMES } from '@/features/arcade/themes'
import {
  earnedBadges,
  totalCompleted,
  useProfile,
} from '@/features/profile/profileStore'
import { ADVENTURE_MAX, COUNTING_MAX } from '@/features/arcade/gameConfig'

interface HomeScreenProps {
  onAdventure: () => void
  onCounting: () => void
  onCharacters: () => void
  onRewards: () => void
  onFreePlay: () => void
}

export function HomeScreen({
  onAdventure,
  onCounting,
  onCharacters,
  onRewards,
  onFreePlay,
}: HomeScreenProps) {
  const profile = useProfile()
  const settings = useArcadeSettings()
  const theme = THEMES[settings.theme] ?? THEMES.stars
  const [nameInput, setNameInput] = useState('')

  const heroDef = HEROES[profile.character] ?? HEROES.kitty
  const total = totalCompleted(profile)
  const badges = earnedBadges(total)

  return (
    <div
      className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-6 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}

      <header className="text-center">
        <h1 className="text-5xl font-black tracking-wide text-amber-300 [text-shadow:0_3px_0_#7a5a00]">
          PacAbacus
        </h1>
        <p className="mt-1 text-[var(--c-soft)]">Bead by bead, level by level!</p>
      </header>

      {!profile.username ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-6">
          <h2 className="text-xl font-bold">What's your name?</h2>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={20}
            placeholder="Type your name…"
            className="w-full rounded-xl border-2 border-[var(--c-border)] bg-black/30 px-4 py-3 text-center text-xl font-bold text-slate-50 outline-none focus:border-emerald-400"
          />
          <button
            type="button"
            disabled={!nameInput.trim()}
            onClick={() => profile.setUsername(nameInput.trim())}
            className="rounded-2xl border-4 border-emerald-600 bg-emerald-400 px-10 py-3 text-xl font-black text-emerald-950 disabled:opacity-40"
          >
            Let's go! ▶
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-5 py-3">
            <PixelSprite map={heroDef.frames[0]} palette={heroDef.palette} size={48} />
            <div>
              <div className="text-xl font-black">Hi, {profile.username}! 👋</div>
              <div className="text-sm text-[var(--c-soft)]">
                {heroDef.name} · {total} levels done · {badges.length} badges
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col gap-3">
            <MenuButton onClick={onAdventure} big>
              🗺️ Adventure —{' '}
              {profile.adventureLevel > ADVENTURE_MAX
                ? 'All done! Replay level 50'
                : profile.adventureLevel > 1
                  ? `Continue Level ${Math.min(profile.adventureLevel, ADVENTURE_MAX)}`
                  : 'Start Level 1'}{' '}
              ▶
            </MenuButton>
            <MenuButton onClick={onCounting} big>
              🐣 Little Counters —{' '}
              {profile.countingLevel > COUNTING_MAX
                ? 'All done! Replay level 20'
                : `Level ${Math.min(profile.countingLevel, COUNTING_MAX)}`}{' '}
              ▶
            </MenuButton>
            <div className="flex gap-3">
              <MenuButton onClick={onCharacters}>🎭 Characters</MenuButton>
              <MenuButton onClick={onRewards}>🏆 Rewards</MenuButton>
              <MenuButton onClick={onFreePlay}>🎮 Free Play</MenuButton>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MenuButton({
  onClick,
  children,
  big,
}: {
  onClick: () => void
  children: React.ReactNode
  big?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex-1 rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] font-bold transition hover:brightness-125 active:scale-95',
        big ? 'px-6 py-4 text-lg' : 'px-4 py-3 text-base',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
