import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CHARACTER_ORDER, HEROES, type HeroId } from '@/features/arcade/sprites'
import { BADGES, type Badge } from './rewards'

export type ProgressMode = 'adventure' | 'counting'

export interface CompleteResult {
  newCharacters: HeroId[]
  newBadges: Badge[]
}

export interface PlayerProfile {
  id: string
  username: string
  character: HeroId
  adventureLevel: number
  countingLevel: number
  stars: Record<string, number>
}

interface ProfileStore {
  activeProfileId: string | null
  profiles: PlayerProfile[]
  username: string | null
  character: HeroId
  /** next level to play in each mode (1-based) */
  adventureLevel: number
  countingLevel: number
  /** best stars per level, keyed like 'a12' / 'c3' */
  stars: Record<string, number>
  createProfile: (name: string, character: HeroId) => void
  switchProfile: (id: string) => void
  setUsername: (name: string) => void
  setCharacter: (id: HeroId) => void
  completeLevel: (mode: ProgressMode, level: number, stars: number) => CompleteResult
  resetProgress: () => void
}

/** total levels completed across both modes — drives all unlocks */
export function totalCompleted(s: { adventureLevel: number; countingLevel: number }) {
  return s.adventureLevel - 1 + (s.countingLevel - 1)
}

export function unlockedCharacters(total: number): HeroId[] {
  return CHARACTER_ORDER.filter((id) => HEROES[id].unlockLevel <= total)
}

export function earnedBadges(total: number): Badge[] {
  return BADGES.filter((b) => b.level <= total)
}

function makeProfile(username: string, character: HeroId): PlayerProfile {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `profile-${Date.now()}-${Math.random().toString(36).slice(2)}`
  return {
    id,
    username,
    character,
    adventureLevel: 1,
    countingLevel: 1,
    stars: {},
  }
}

function activeFields(profile: PlayerProfile) {
  return {
    activeProfileId: profile.id,
    username: profile.username,
    character: profile.character,
    adventureLevel: profile.adventureLevel,
    countingLevel: profile.countingLevel,
    stars: profile.stars,
  }
}

function syncActive(
  profiles: PlayerProfile[],
  activeProfileId: string | null,
  updates: Partial<Omit<PlayerProfile, 'id'>>,
) {
  if (!activeProfileId) return profiles
  return profiles.map((p) => (p.id === activeProfileId ? { ...p, ...updates } : p))
}

export const useProfile = create<ProfileStore>()(
  persist(
    (set, get) => ({
      activeProfileId: null,
      profiles: [],
      username: null,
      character: 'kitty',
      adventureLevel: 1,
      countingLevel: 1,
      stars: {},
      createProfile: (username, character) => {
        const profile = makeProfile(username, character)
        set((s) => ({
          profiles: [...s.profiles, profile],
          ...activeFields(profile),
        }))
      },
      switchProfile: (id) => {
        const profile = get().profiles.find((p) => p.id === id)
        if (profile) set(activeFields(profile))
      },
      setUsername: (username) =>
        set((s) => ({
          username,
          profiles: syncActive(s.profiles, s.activeProfileId, { username }),
        })),
      setCharacter: (character) =>
        set((s) => ({
          character,
          profiles: syncActive(s.profiles, s.activeProfileId, { character }),
        })),
      completeLevel: (mode, level, starCount) => {
        const s = get()
        const before = totalCompleted(s)
        const key = `${mode === 'adventure' ? 'a' : 'c'}${level}`
        const levelField = mode === 'adventure' ? 'adventureLevel' : 'countingLevel'
        const nextLevel = Math.max(s[levelField], level + 1)
        const stars = { ...s.stars, [key]: Math.max(s.stars[key] ?? 0, starCount) }
        const updates = { [levelField]: nextLevel, stars }
        const after = totalCompleted({ ...s, [levelField]: nextLevel })
        set((current) => ({
          [levelField]: nextLevel,
          stars,
          profiles: syncActive(current.profiles, current.activeProfileId, updates),
        }))
        return {
          newCharacters: unlockedCharacters(after).filter(
            (id) => !unlockedCharacters(before).includes(id),
          ),
          newBadges: earnedBadges(after).filter(
            (b) => !earnedBadges(before).some((eb) => eb.id === b.id),
          ),
        }
      },
      resetProgress: () =>
        set((s) => ({
          adventureLevel: 1,
          countingLevel: 1,
          stars: {},
          character: 'kitty',
          profiles: syncActive(s.profiles, s.activeProfileId, {
            adventureLevel: 1,
            countingLevel: 1,
            stars: {},
            character: 'kitty',
          }),
        })),
    }),
    {
      name: 'pacabacus-profile',
      version: 1,
      migrate: (persisted) => {
        const s = persisted as Partial<ProfileStore>
        if (s.profiles?.length) return persisted
        if (!s.username) return persisted
        const profile: PlayerProfile = {
          id: 'profile-1',
          username: s.username,
          character: s.character ?? 'kitty',
          adventureLevel: s.adventureLevel ?? 1,
          countingLevel: s.countingLevel ?? 1,
          stars: s.stars ?? {},
        }
        return {
          ...s,
          profiles: [profile],
          activeProfileId: profile.id,
        }
      },
    },
  ),
)
