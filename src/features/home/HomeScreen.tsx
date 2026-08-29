import { useEffect, useState } from 'react'
import { Twinkles } from '@/features/arcade/ArcadeGame'
import { useArcadeSettings } from '@/features/arcade/settingsStore'
import { PixelSprite } from '@/features/arcade/PixelSprite'
import { HEROES, SECRET_HERO_IDS, STARTER_HERO_IDS, type HeroId } from '@/features/arcade/sprites'
import { THEMES } from '@/features/arcade/themes'
import { chiptune } from '@/features/audio/chiptune'
import {
  earnedBadges,
  totalWorldCompleted,
  useProfile,
} from '@/features/profile/profileStore'
import { ADVENTURE_MAX } from '@/features/arcade/gameConfig'
import { RESCUE_CHALLENGES, rescueForAgeBand } from '@/features/profile/rescueChallenges'
import {
  ageFromDateOfBirth,
} from '@/features/learning/learningWorlds'
import { LOCALE_OPTIONS, useI18n, useTranslations, type LocaleId } from '@/features/i18n/i18nStore'

const currentYear = new Date().getFullYear()
const AGE_OPTIONS = Array.from({ length: 15 }, (_, index) => index + 3)

function dateForAge(age: number) {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${currentYear - age}-${month}-${day}`
}

interface HomeScreenProps {
  onPreGame: () => void
  onCharacters: () => void
  onRewards: () => void
  onSoundtrack: () => void
}

export function HomeScreen({
  onPreGame,
  onCharacters,
  onRewards,
  onSoundtrack,
}: HomeScreenProps) {
  const profile = useProfile()
  const settings = useArcadeSettings()
  const theme = THEMES[settings.theme] ?? THEMES.stars
  const [nameInput, setNameInput] = useState('')
  const [dateOfBirthInput, setDateOfBirthInput] = useState('')
  const [starterHero, setStarterHero] = useState<HeroId>(STARTER_HERO_IDS[0])
  const [showProfiles, setShowProfiles] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [secretCode, setSecretCode] = useState('')
  const { locale, t, ageBandLabel, worldText } = useTranslations()
  const setLocale = useI18n((state) => state.setLocale)

  const heroDef = HEROES[profile.character] ?? HEROES.kitty
  const buddyNames = profile.buddies.map((id) => HEROES[id]?.name).filter(Boolean)
  const total = totalWorldCompleted(profile)
  const badges = earnedBadges(total)
  const activeWorldText = worldText('pacabacus')
  const unlockedWorldLevel = profile.worldLevels?.pacabacus ?? 1
  const worldLevel = profile.playWorldLevels?.pacabacus ?? unlockedWorldLevel
  const maxWorldLevel = ADVENTURE_MAX
  const rescuedCount = SECRET_HERO_IDS.filter((id) => profile.ownedCharacters.includes(id)).length
  const ageRescue = rescueForAgeBand(profile.ageBand)
  const age = ageFromDateOfBirth(profile.dateOfBirth)
  const playStatus =
    worldLevel > maxWorldLevel
      ? `Replay ${maxWorldLevel}`
      : worldLevel > 1
        ? `Level ${Math.min(worldLevel, maxWorldLevel)}`
        : 'Level 1'

  useEffect(() => {
    if (settings.music) chiptune.playMenuSong()
    else chiptune.stopMusic()
  }, [settings.music])

  useEffect(() => () => chiptune.stopMusic(), [])

  const createProfileFromDraft = () => {
    profile.createProfile(nameInput.trim(), starterHero, dateOfBirthInput || null)
    setNameInput('')
    setDateOfBirthInput('')
    setStarterHero(STARTER_HERO_IDS[0])
  }

  return (
    <div
      className="home-shell relative flex min-h-svh flex-col items-center gap-6 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_50%_20%,var(--c-bg1),var(--c-bg2)_70%)] p-6 py-8 text-slate-50"
      style={theme.vars as React.CSSProperties}
    >
      {theme.id === 'stars' && <Twinkles />}

      <header className="home-header text-center">
        <h1 className="text-5xl font-black tracking-wide text-amber-300 [text-shadow:0_3px_0_#7a5a00]">
          PacAbacus
        </h1>
        <p className="mt-1 text-[var(--c-soft)]">{activeWorldText.subtitle}</p>
        <p className="text-xs font-bold text-[var(--c-soft)]">{t('app.tagline')}</p>
      </header>

      {!profile.username ? (
        <SignupCard
          nameInput={nameInput}
          setNameInput={setNameInput}
          starterHero={starterHero}
          setStarterHero={setStarterHero}
          dateOfBirth={dateOfBirthInput}
          setDateOfBirth={setDateOfBirthInput}
          onCreate={createProfileFromDraft}
          t={t}
        />
      ) : (
        <div className="home-menu-grid flex w-full flex-col items-center gap-6">
          <div className="home-profile flex w-full max-w-md flex-wrap items-center gap-3 rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] px-5 py-3">
            <PixelSprite map={heroDef.frames[0]} palette={heroDef.palette} size={48} />
            <div className="min-w-0 flex-1">
              <div className="text-xl font-black">{t('profile.greeting', { name: profile.username })} 👋</div>
              <div className="text-sm text-[var(--c-soft)]">
                {heroDef.name}
                {buddyNames.length ? ` + ${t('profile.babies', { count: buddyNames.length })}` : ''} · {t('profile.levelsDone', { count: total })} ·{' '}
                {t('profile.badges', { count: badges.length })} · {t('profile.gold', { count: profile.treasureCoins })}
                {' · '}
                {age != null ? t('profile.yearsOld', { count: age }) : ageBandLabel(profile.ageBand)}
                {' · '}
                {t('profile.rescues', { count: rescuedCount, total: SECRET_HERO_IDS.length })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowProfiles((v) => !v)}
              className="rounded-xl border-2 border-[var(--c-border)] bg-black/20 px-3 py-2 text-sm font-bold hover:brightness-125"
            >
              {t('button.switch')}
            </button>
            <button
              type="button"
              onClick={() => setShowTools((v) => !v)}
              className="rounded-xl border-2 border-amber-300 bg-amber-500/15 px-3 py-2 text-sm font-black text-amber-100 hover:bg-amber-500/25"
            >
              {t('button.tools')} {showTools ? '▲' : '▼'}
            </button>
          </div>

          <AdventureFocus
            level={Math.min(worldLevel, maxWorldLevel)}
            maxLevel={maxWorldLevel}
            completed={Math.max(0, Math.min(unlockedWorldLevel, maxWorldLevel + 1) - 1)}
            rescues={rescuedCount}
            rescueTotal={SECRET_HERO_IDS.length}
            badgeCount={badges.length}
            ageLabel={age != null ? t('profile.yearsOld', { count: age }) : ageBandLabel(profile.ageBand)}
          />

          {showProfiles && (
            <div className="home-profiles-panel flex w-full max-w-3xl flex-col gap-4 rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-5">
              <h2 className="text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
                {t('profiles.title')}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {profile.profiles.map((p) => {
                  const pHero = HEROES[p.character] ?? HEROES.kitty
                  const selected = p.id === profile.activeProfileId
                  return (
                    <div
                      key={p.id}
                      className={[
                        'home-player-card flex items-center gap-3 rounded-2xl border-2 p-3 text-left active:scale-95',
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
                            {pHero.name} · {t('profile.levelsDone', { count: totalWorldCompleted(p) })}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`Delete ${p.username}'s profile? This cannot be undone.`)) return
                          profile.deleteProfile(p.id)
                        }}
                        className="home-delete-player rounded-lg border border-rose-300 bg-rose-500/20 px-3 py-2 text-xs font-black text-rose-100 hover:bg-rose-500/35"
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
                dateOfBirth={dateOfBirthInput}
                setDateOfBirth={setDateOfBirthInput}
                onCreate={() => {
                  createProfileFromDraft()
                  setShowProfiles(false)
                }}
                t={t}
              />
            </div>
          )}

          <div className="home-actions flex w-full max-w-md flex-col gap-3">
            <MenuButton onClick={onPreGame} big className="home-adventure-button">
              <span className="home-adventure-label">
                <span>▶ Start Adventure</span>
                <span className="home-adventure-status">{activeWorldText.name} · {playStatus}</span>
              </span>
            </MenuButton>
            <div className="home-secondary-actions grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MenuButton onClick={onCharacters}>🎭 {t('button.team')}</MenuButton>
              <MenuButton onClick={onRewards}>🏆 {t('button.rewards')}</MenuButton>
            </div>
            {showTools && (
              <div className="home-tools-panel flex flex-col gap-2 rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-4">
                <h2 className="text-center text-sm font-black tracking-wide text-amber-200">
                  {t('tools.title')}
                </h2>
                <label className="rounded-xl border border-[var(--c-border)] bg-black/20 p-3 text-xs font-black text-[var(--c-soft)]">
                  {t('tools.language')}
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as LocaleId)}
                    className="mt-1 w-full rounded-lg border border-[var(--c-border)] bg-black/30 px-3 py-2 text-sm font-bold text-white"
                  >
                    {LOCALE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.localLabel} · {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-xl border border-amber-300/60 bg-amber-500/10 p-3">
                  <div className="text-xs font-black text-amber-100">
                    {t('tools.rescuePreview')}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-[var(--c-soft)]">
                    {t('tools.ageBoss', { title: ageRescue.title, level: ageRescue.level })}
                  </div>
                  <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                    <input
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      placeholder={t('tools.secretCode')}
                      className="rounded-lg border border-[var(--c-border)] bg-black/25 px-3 py-2 text-sm font-bold text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!profile.applySecretCode(secretCode)) return
                        setSecretCode('')
                        setShowTools(false)
                      }}
                      className="rounded-lg border border-emerald-300 bg-emerald-500/20 px-3 py-2 text-sm font-black text-emerald-100"
                    >
                      {t('button.jump')}
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--c-border)] bg-black/20 p-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTools(false)
                      onSoundtrack()
                    }}
                    className="w-full rounded-xl border-2 border-cyan-300 bg-cyan-500/15 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-500/25"
                  >
                    🎵 Soundtrack preview
                  </button>
                </div>
                <div className="rounded-xl border border-[var(--c-border)] bg-black/20 p-3">
                  <label className="text-xs font-black text-[var(--c-soft)]">
                    {t('tools.replayUnlocked')}
                    <select
                      value={worldLevel}
                      onChange={(e) => profile.setWorldLevel('pacabacus', Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-[var(--c-border)] bg-black/30 px-3 py-2 text-sm font-bold text-white"
                    >
                      {Array.from(
                        { length: Math.min(unlockedWorldLevel, maxWorldLevel) },
                        (_, i) => i + 1,
                      ).map((level) => {
                        const rescue = RESCUE_CHALLENGES.find(
                          (challenge) => challenge.world === 'pacabacus' && challenge.level === level,
                        )
                        return (
                          <option key={level} value={level}>
                            {t('tools.level', { level })}{rescue ? ` - ${rescue.title}` : ''}
                          </option>
                        )
                      })}
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm(`Start ${profile.username}'s progress over from level 1?`)) return
                    profile.resetProgress()
                  }}
                  className="rounded-xl border-2 border-amber-300 bg-amber-500/15 px-4 py-2 text-sm font-black text-amber-100 hover:bg-amber-500/25"
                >
                  {t('button.startOver')}
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
                  {t('button.deletePlayer')}
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
                  {t('button.clearData')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AdventureFocus({
  level,
  maxLevel,
  completed,
  rescues,
  rescueTotal,
  badgeCount,
  ageLabel,
}: {
  level: number
  maxLevel: number
  completed: number
  rescues: number
  rescueTotal: number
  badgeCount: number
  ageLabel: string
}) {
  const progress = Math.round((completed / maxLevel) * 100)
  return (
    <section className="home-focus-panel w-full max-w-md rounded-2xl border-2 border-[var(--c-border)] bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black tracking-wide text-amber-200">Soroban Adventure</h2>
          <p className="text-xs font-bold text-[var(--c-soft)]">One focused math path built around bead thinking.</p>
        </div>
        <span className="rounded-full border border-emerald-300 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-100">
          Level {level}
        </span>
      </div>
      <div className="mb-3 h-3 overflow-hidden rounded-full border border-[var(--c-border)] bg-black/30">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
      </div>
      <div className="home-focus-stats grid grid-cols-2 gap-2">
        <FocusStat label="Skill path" value={ageLabel} />
        <FocusStat label="Cleared" value={`${completed}/${maxLevel}`} />
        <FocusStat label="Rescues" value={`${rescues}/${rescueTotal}`} />
        <FocusStat label="Badges" value={String(badgeCount)} />
      </div>
    </section>
  )
}

function FocusStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="home-focus-stat rounded-xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-3 text-center">
      <div className="text-[11px] font-black uppercase tracking-wide text-[var(--c-soft)]">{label}</div>
      <div className="mt-1 text-sm font-black text-amber-100">{value}</div>
    </div>
  )
}

function SignupCard({
  compact,
  nameInput,
  setNameInput,
  starterHero,
  setStarterHero,
  dateOfBirth,
  setDateOfBirth,
  onCreate,
  t,
}: {
  compact?: boolean
  nameInput: string
  setNameInput: (name: string) => void
  starterHero: HeroId
  setStarterHero: (id: HeroId) => void
  dateOfBirth: string
  setDateOfBirth: (dateOfBirth: string) => void
  onCreate: () => void
  t: ReturnType<typeof useTranslations>['t']
}) {
  return (
    <div
      className={[
        'flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] p-6',
        compact ? 'max-w-none border-dashed bg-black/15 p-4' : '',
      ].join(' ')}
    >
      <h2 className="text-xl font-bold">{compact ? t('signup.addPlayer') : t('signup.nameQuestion')}</h2>
      <input
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        maxLength={20}
        placeholder={t('signup.namePlaceholder')}
        className="w-full rounded-xl border-2 border-[var(--c-border)] bg-black/30 px-4 py-3 text-center text-xl font-bold text-slate-50 outline-none focus:border-emerald-400"
      />
      <AgePicker value={dateOfBirth} onChange={setDateOfBirth} />
      <div className="w-full">
        <h3 className="mb-3 text-center text-sm font-bold tracking-wide text-[var(--c-soft)]">
          {t('signup.firstFriend')}
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
                  {selected ? t('signup.playing') : t('signup.tap')}
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
        {t('signup.letsGo')} ▶
      </button>
    </div>
  )
}

function AgePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (dateOfBirth: string) => void
}) {
  const selectedAge = value ? ageFromDateOfBirth(value) : null

  return (
    <label className="w-full text-center text-xs font-black tracking-wide text-[var(--c-soft)]">
      Player age
      <select
        value={selectedAge ?? ''}
        onChange={(e) => onChange(e.target.value ? dateForAge(Number(e.target.value)) : '')}
        className="mt-1 w-full rounded-xl border-2 border-[var(--c-border)] bg-black/30 px-4 py-3 text-center text-lg font-black text-slate-50 outline-none focus:border-emerald-400"
      >
        <option value="">Pick age</option>
        {AGE_OPTIONS.map((age) => (
          <option key={age} value={age}>
            Age {age}
          </option>
        ))}
      </select>
    </label>
  )
}

function MenuButton({
  onClick,
  children,
  big,
  className = '',
}: {
  onClick: () => void
  children: React.ReactNode
  big?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex-1 rounded-2xl border-2 border-[var(--c-border)] bg-[var(--c-panel)] font-bold transition hover:brightness-125 active:scale-95',
        big ? 'px-6 py-4 text-lg' : 'px-4 py-3 text-base',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
