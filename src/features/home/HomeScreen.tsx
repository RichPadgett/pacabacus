import { useState } from 'react'
import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { HEROES, PixelSprite, STARTER_HERO_IDS, type HeroId } from '@/features/arcade/sprites'
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
  const [starterHero, setStarterHero] = useState<HeroId>('kitty')
  const [showProfiles, setShowProfiles] = useState(false)
  const [showTools, setShowTools] = useState(false)

  const heroDef = HEROES[profile.character] ?? HEROES.kitty
  const buddyDef = profile.buddy ? HEROES[profile.buddy] : null
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
        <SignupCard
          nameInput={nameInput}
          setNameInput={setNameInput}
          starterHero={starterHero}
          setStarterHero={setStarterHero}
          onCreate={() => profile.createProfile(nameInput.trim(), starterHero)}
        />
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-5 py-3">
            <PixelSprite map={heroDef.frames[0]} palette={heroDef.palette} size={48} />
            <div>
              <div className="text-xl font-black">Hi, {profile.username}! 👋</div>
              <div className="text-sm text-[var(--c-soft)]">
                {heroDef.name}
                {buddyDef ? ` + ${buddyDef.name} buddy` : ''} · {total} levels done ·{' '}
                {badges.length} badges · {profile.treasureCoins} gold
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowProfiles((v) => !v)}
              className="rounded-xl border-2 border-[var(--c-border)] bg-black/20 px-3 py-2 text-sm font-bold hover:brightness-125"
            >
              Switch
            </button>
          </div>

          {showProfiles && (
            <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
              <h2 className="text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
                WHO'S PLAYING?
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {profile.profiles.map((p) => {
                  const pHero = HEROES[p.character] ?? HEROES.kitty
                  const selected = p.id === profile.activeProfileId
                  return (
                    <div
                      key={p.id}
                      className={[
                        'flex items-center gap-3 rounded-2xl border-2 p-3 text-left active:scale-95',
                        selected
                          ? 'border-emerald-400 bg-emerald-500/20'
                          : 'border-[var(--c-border)] bg-black/20 hover:brightness-125',
                      ].join(' ')}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          profile.switchProfile(p.id)
                          setShowProfiles(false)
                        }}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <PixelSprite map={pHero.frames[0]} palette={pHero.palette} size={42} />
                        <span>
                          <span className="block font-black">{p.username}</span>
                          <span className="block text-xs text-[var(--c-soft)]">
                            {pHero.name} · {totalCompleted(p)} levels
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`Delete ${p.username}'s profile? This cannot be undone.`)) return
                          profile.deleteProfile(p.id)
                        }}
                        className="rounded-lg border border-rose-300 bg-rose-500/20 px-2 py-1 text-xs font-black text-rose-100 hover:bg-rose-500/35"
                      >
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>
              <SignupCard
                compact
                nameInput={nameInput}
                setNameInput={setNameInput}
                starterHero={starterHero}
                setStarterHero={setStarterHero}
                onCreate={() => {
                  profile.createProfile(nameInput.trim(), starterHero)
                  setNameInput('')
                  setShowProfiles(false)
                }}
              />
            </div>
          )}

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
            <button
              type="button"
              onClick={() => settings.update({ rockTimer: !settings.rockTimer })}
              className="rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-4 py-3 text-sm font-bold transition hover:brightness-125 active:scale-95"
            >
              🪨 Rock timer: {settings.rockTimer ? 'On' : 'Off'}
            </button>
            <MenuButton onClick={onCounting} big>
              🐣 Little Counters —{' '}
              {profile.countingLevel > COUNTING_MAX
                ? 'All done! Replay level 20'
                : `Level ${Math.min(profile.countingLevel, COUNTING_MAX)}`}{' '}
              ▶
            </MenuButton>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MenuButton onClick={onCharacters}>🎭 Team</MenuButton>
              <MenuButton onClick={onRewards}>🏆 Rewards</MenuButton>
              <MenuButton onClick={onFreePlay}>🎮 Free Play</MenuButton>
            </div>
            <button
              type="button"
              onClick={() => setShowTools((v) => !v)}
              className="rounded-2xl border-2 border-[var(--c-border)] bg-black/20 px-4 py-2 text-xs font-bold text-[var(--c-soft)] transition hover:brightness-125 active:scale-95"
            >
              Grown-up tools {showTools ? '▲' : '▼'}
            </button>
            {showTools && (
              <div className="flex flex-col gap-2 rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm(`Start ${profile.username}'s progress over from level 1?`)) return
                    profile.resetProgress()
                  }}
                  className="rounded-xl border-2 border-amber-300 bg-amber-500/15 px-4 py-2 text-sm font-black text-amber-100 hover:bg-amber-500/25"
                >
                  Start this player over
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm(`Delete ${profile.username}'s profile? This cannot be undone.`)) return
                    if (profile.activeProfileId) profile.deleteProfile(profile.activeProfileId)
                    setShowTools(false)
                  }}
                  className="rounded-xl border-2 border-rose-300 bg-rose-500/15 px-4 py-2 text-sm font-black text-rose-100 hover:bg-rose-500/25"
                >
                  Delete this player
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm('Clear all PacAbacus players and progress on this device?')) return
                    profile.clearAllData()
                    settings.resetSettings()
                    setShowTools(false)
                    setShowProfiles(false)
                  }}
                  className="rounded-xl border-2 border-rose-400 bg-rose-600/25 px-4 py-2 text-sm font-black text-rose-50 hover:bg-rose-600/40"
                >
                  Clear all app data
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function SignupCard({
  compact,
  nameInput,
  setNameInput,
  starterHero,
  setStarterHero,
  onCreate,
}: {
  compact?: boolean
  nameInput: string
  setNameInput: (name: string) => void
  starterHero: HeroId
  setStarterHero: (id: HeroId) => void
  onCreate: () => void
}) {
  return (
    <div
      className={[
        'flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-6',
        compact ? 'max-w-none border-dashed bg-black/15 p-4' : '',
      ].join(' ')}
    >
      <h2 className="text-xl font-bold">{compact ? 'Add a player' : "What's your name?"}</h2>
      <input
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        maxLength={20}
        placeholder="Type your name..."
        className="w-full rounded-xl border-2 border-[var(--c-border)] bg-black/30 px-4 py-3 text-center text-xl font-bold text-slate-50 outline-none focus:border-emerald-400"
      />
      <div className="w-full">
        <h3 className="mb-3 text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
          PICK YOUR FIRST FRIEND
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {STARTER_HERO_IDS.map((id) => {
            const hero = HEROES[id]
            const selected = starterHero === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStarterHero(id)}
                className={[
                  'flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-2 transition active:scale-95',
                  compact ? 'min-h-24' : '',
                  selected
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                    : 'border-[var(--c-border)] bg-black/20 hover:brightness-125',
                ].join(' ')}
              >
                <PixelSprite map={hero.frames[0]} palette={hero.palette} size={compact ? 44 : 58} />
                <span className="text-center text-sm font-black">{hero.name}</span>
                <span className="min-h-4 text-xs text-[var(--c-soft)]">
                  {selected ? 'Playing!' : 'Tap'}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <button
        type="button"
        disabled={!nameInput.trim()}
        onClick={onCreate}
        className="rounded-2xl border-4 border-emerald-600 bg-emerald-400 px-10 py-3 text-xl font-black text-emerald-950 disabled:opacity-40"
      >
        Let's go! ▶
      </button>
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
