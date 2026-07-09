import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  BUDDY_COSTS,
  BUDDY_ORDER,
  HEROES,
  STARTER_HERO_IDS,
  type HeroId,
} from '@/features/arcade/sprites'
import { BADGES, type Badge } from './rewards'

export type ProgressMode = 'adventure' | 'counting'

export interface CompleteResult {
  newBuddies: HeroId[]
  newCharacters: HeroId[]
  newBadges: Badge[]
  coinsEarned: number
}

export interface PlayerProfile {
  id: string
  username: string
  character: HeroId
  buddy: HeroId | null
  buddies: HeroId[]
  ownedCharacters: HeroId[]
  ownedBuddies: HeroId[]
  treasureCoins: number
  adventureLevel: number
  countingLevel: number
  stars: Record<string, number>
}

interface ProfileStore {
  activeProfileId: string | null
  profiles: PlayerProfile[]
  username: string | null
  character: HeroId
  buddy: HeroId | null
  buddies: HeroId[]
  ownedCharacters: HeroId[]
  ownedBuddies: HeroId[]
  treasureCoins: number
  /** next level to play in each mode (1-based) */
  adventureLevel: number
  countingLevel: number
  /** best stars per level, keyed like 'a12' / 'c3' */
  stars: Record<string, number>
  createProfile: (name: string, character: HeroId) => void
  switchProfile: (id: string) => void
  setUsername: (name: string) => void
  setCharacter: (id: HeroId) => void
  setBuddy: (id: HeroId | null) => void
  toggleBuddy: (id: HeroId) => void
  buyBuddy: (id: HeroId) => boolean
  completeLevel: (mode: ProgressMode, level: number, stars: number) => CompleteResult
  resetProgress: () => void
  deleteProfile: (id: string) => void
  clearAllData: () => void
}

/** total levels completed across both modes — drives all unlocks */
export function totalCompleted(s: { adventureLevel: number; countingLevel: number }) {
  return s.adventureLevel - 1 + (s.countingLevel - 1)
}

const MAX_ACTIVE_BUDDIES = 3

export function unlockedCharacters(adventureLevel: number): HeroId[] {
  return (Object.keys(HEROES) as HeroId[]).filter(
    (id) => !STARTER_HERO_IDS.includes(id) && HEROES[id].unlockLevel <= adventureLevel,
  )
}

export function playableCharacters(ownedCharacters: HeroId[] = []): HeroId[] {
  return Array.from(new Set([...STARTER_HERO_IDS, ...ownedCharacters]))
}

export function unlockedBuddies(adventureLevel: number): HeroId[] {
  return BUDDY_ORDER.filter((id) => HEROES[id].unlockLevel <= adventureLevel)
}

export function buddyCost(id: HeroId): number {
  return BUDDY_COSTS[id] ?? 50
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
    buddy: null,
    buddies: [],
    ownedCharacters: [],
    ownedBuddies: [],
    treasureCoins: 0,
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
    buddy: profile.buddy ?? null,
    buddies: profile.buddies ?? (profile.buddy ? [profile.buddy] : []),
    ownedCharacters: profile.ownedCharacters ?? unlockedCharacters(profile.adventureLevel),
    ownedBuddies: profile.ownedBuddies ?? [],
    treasureCoins: profile.treasureCoins ?? 0,
    adventureLevel: profile.adventureLevel,
    countingLevel: profile.countingLevel,
    stars: profile.stars,
  }
}

function emptyFields() {
  return {
    activeProfileId: null,
    username: null,
    character: STARTER_HERO_IDS[0],
    buddy: null,
    buddies: [],
    ownedCharacters: [],
    ownedBuddies: [],
    treasureCoins: 0,
    adventureLevel: 1,
    countingLevel: 1,
    stars: {},
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
      character: STARTER_HERO_IDS[0],
      buddy: null,
      buddies: [],
      ownedCharacters: [],
      ownedBuddies: [],
      treasureCoins: 0,
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
      setBuddy: (buddy) =>
        set((s) => ({
          buddy,
          buddies: buddy ? [buddy] : [],
          profiles: syncActive(s.profiles, s.activeProfileId, { buddy, buddies: buddy ? [buddy] : [] }),
        })),
      toggleBuddy: (buddy) =>
        set((s) => {
          if (!s.ownedBuddies.includes(buddy)) return s
          const buddies = s.buddies.includes(buddy)
            ? s.buddies.filter((id) => id !== buddy)
            : [...s.buddies, buddy].slice(-MAX_ACTIVE_BUDDIES)
          return {
            buddy: buddies[0] ?? null,
            buddies,
            profiles: syncActive(s.profiles, s.activeProfileId, {
              buddy: buddies[0] ?? null,
              buddies,
            }),
          }
        }),
      buyBuddy: (buddy) => {
        const s = get()
        if (s.ownedBuddies.includes(buddy)) {
          get().toggleBuddy(buddy)
          return true
        }
        const cost = buddyCost(buddy)
        if (s.treasureCoins < cost) return false
        const ownedBuddies = [...s.ownedBuddies, buddy]
        const treasureCoins = s.treasureCoins - cost
        const buddies = [...s.buddies, buddy].slice(-MAX_ACTIVE_BUDDIES)
        set({
          buddy: buddies[0] ?? null,
          buddies,
          ownedBuddies,
          treasureCoins,
          profiles: syncActive(s.profiles, s.activeProfileId, {
            buddy: buddies[0] ?? null,
            buddies,
            ownedBuddies,
            treasureCoins,
          }),
        })
        return true
      },
      completeLevel: (mode, level, starCount) => {
        const s = get()
        const before = totalCompleted(s)
        const charactersBefore = new Set(s.ownedCharacters)
        const key = `${mode === 'adventure' ? 'a' : 'c'}${level}`
        const levelField = mode === 'adventure' ? 'adventureLevel' : 'countingLevel'
        const nextLevel = Math.max(s[levelField], level + 1)
        const firstClear = s.stars[key] == null
        const coinsEarned = firstClear ? 10 + starCount * 5 : 2
        const treasureCoins = s.treasureCoins + coinsEarned
        const stars = { ...s.stars, [key]: Math.max(s.stars[key] ?? 0, starCount) }
        const nextAdventureLevel = mode === 'adventure' ? nextLevel : s.adventureLevel
        const ownedCharacters = Array.from(new Set([...s.ownedCharacters, ...unlockedCharacters(nextAdventureLevel)]))
        const newCharacters = ownedCharacters.filter((id) => !charactersBefore.has(id))
        const updates = { [levelField]: nextLevel, stars, treasureCoins, ownedCharacters }
        const after = totalCompleted({ ...s, [levelField]: nextLevel })
        set((current) => ({
          [levelField]: nextLevel,
          stars,
          treasureCoins,
          ownedCharacters,
          profiles: syncActive(current.profiles, current.activeProfileId, updates),
        }))
        return {
          newBuddies: [],
          newCharacters,
          newBadges: earnedBadges(after).filter(
            (b) => !earnedBadges(before).some((eb) => eb.id === b.id),
          ),
          coinsEarned,
        }
      },
      resetProgress: () =>
        set((s) => ({
          adventureLevel: 1,
          countingLevel: 1,
          stars: {},
          character: STARTER_HERO_IDS[0],
          buddy: null,
          buddies: [],
          ownedCharacters: [],
          ownedBuddies: [],
          treasureCoins: 0,
          profiles: syncActive(s.profiles, s.activeProfileId, {
            adventureLevel: 1,
            countingLevel: 1,
            stars: {},
            character: STARTER_HERO_IDS[0],
            buddy: null,
            buddies: [],
            ownedCharacters: [],
            ownedBuddies: [],
            treasureCoins: 0,
          }),
        })),
      deleteProfile: (id) =>
        set((s) => {
          const profiles = s.profiles.filter((p) => p.id !== id)
          const active =
            id === s.activeProfileId
              ? profiles[0]
              : profiles.find((p) => p.id === s.activeProfileId)
          return {
            profiles,
            ...(active ? activeFields(active) : emptyFields()),
          }
        }),
      clearAllData: () =>
        set({
          profiles: [],
          ...emptyFields(),
        }),
    }),
    {
      name: 'pacabacus-profile',
      version: 3,
      migrate: (persisted) => {
        const s = persisted as Partial<ProfileStore>
        if (s.profiles?.length) {
          const profiles = s.profiles.map((p) => {
            const buddies = p.buddies ?? (p.buddy ? [p.buddy] : [])
            const ownedCharacters = Array.from(
              new Set([...(p.ownedCharacters ?? []), ...unlockedCharacters(p.adventureLevel ?? 1)]),
            )
            return {
              ...p,
              buddy: buddies[0] ?? p.buddy ?? null,
              buddies: buddies.slice(0, MAX_ACTIVE_BUDDIES),
              ownedCharacters,
              ownedBuddies: p.ownedBuddies ?? [],
              treasureCoins:
                p.treasureCoins ?? totalCompleted(p) * 12 + Object.keys(p.stars ?? {}).length * 3,
            }
          })
          const active = profiles.find((p) => p.id === s.activeProfileId) ?? profiles[0]
          return {
            ...s,
            profiles,
            ...(active ? activeFields(active) : {}),
          }
        }
        if (!s.username) return persisted
        const profile: PlayerProfile = {
          id: 'profile-1',
          username: s.username,
          character: s.character ?? STARTER_HERO_IDS[0],
          buddy: null,
          buddies: [],
          ownedCharacters: unlockedCharacters(s.adventureLevel ?? 1),
          ownedBuddies: [],
          treasureCoins:
            totalCompleted({
              adventureLevel: s.adventureLevel ?? 1,
              countingLevel: s.countingLevel ?? 1,
            }) *
              12 +
            Object.keys(s.stars ?? {}).length * 3,
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
