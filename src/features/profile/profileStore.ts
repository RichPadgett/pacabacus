import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  BUDDY_COSTS,
  BUDDY_ORDER,
  HEROES,
  SECRET_HERO_IDS,
  STARTER_HERO_IDS,
  type HeroId,
} from '@/features/arcade/sprites'
import {
  DEFAULT_WORLD_LEVELS,
  ageBandFromDateOfBirth,
  characterUnlocksForWorld,
  trainerStartLevel,
  type AgeBand,
  type LearningWorldId,
} from '@/features/learning/learningWorlds'
import { RESCUE_CHALLENGES, rescueForClear, secretCodeLevel } from './rescueChallenges'
import { BADGES, type Badge } from './rewards'

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
  buddyUseCounts: Partial<Record<HeroId, number>>
  ownedCharacters: HeroId[]
  ownedBuddies: HeroId[]
  treasureCoins: number
  dateOfBirth: string | null
  ageBand: AgeBand
  learningWorld: LearningWorldId
  worldLevels: Record<LearningWorldId, number>
  playWorldLevels: Record<LearningWorldId, number>
  worldStars: Record<string, number>
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
  buddyUseCounts: Partial<Record<HeroId, number>>
  ownedCharacters: HeroId[]
  ownedBuddies: HeroId[]
  treasureCoins: number
  dateOfBirth: string | null
  ageBand: AgeBand
  learningWorld: LearningWorldId
  worldLevels: Record<LearningWorldId, number>
  playWorldLevels: Record<LearningWorldId, number>
  worldStars: Record<string, number>
  /** next level to play in each mode (1-based) */
  adventureLevel: number
  countingLevel: number
  /** best stars per level, keyed like 'a12' / 'c3' */
  stars: Record<string, number>
  createProfile: (name: string, character: HeroId, dateOfBirth?: string | null) => void
  switchProfile: (id: string) => void
  setUsername: (name: string) => void
  setDateOfBirth: (dateOfBirth: string | null) => void
  setAgeBand: (ageBand: AgeBand) => void
  setLearningWorld: (world: LearningWorldId) => void
  setWorldLevel: (world: LearningWorldId, level: number) => void
  applySecretCode: (code: string) => boolean
  setCharacter: (id: HeroId) => void
  setBuddy: (id: HeroId | null) => void
  toggleBuddy: (id: HeroId) => void
  buyBuddy: (id: HeroId) => boolean
  completeWorldLevel: (world: LearningWorldId, level: number, stars: number) => CompleteResult
  runTrainer: (world?: LearningWorldId) => void
  resetProgress: () => void
  deleteProfile: (id: string) => void
  clearAllData: () => void
}

/** total levels completed across both modes — drives all unlocks */
export function totalCompleted(s: { adventureLevel: number; countingLevel: number }) {
  return s.adventureLevel - 1 + (s.countingLevel - 1)
}

export function totalWorldCompleted(s: { worldLevels?: Partial<Record<LearningWorldId, number>> }) {
  const levels = { ...DEFAULT_WORLD_LEVELS, ...s.worldLevels }
  return Object.values(levels).reduce((sum, level) => sum + Math.max(0, level - 1), 0)
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

export function secretCharacters(ownedCharacters: HeroId[] = []): HeroId[] {
  return SECRET_HERO_IDS.filter((id) => ownedCharacters.includes(id))
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

function normalizeWorldLevels(worldLevels?: Partial<Record<LearningWorldId, number>>) {
  return { ...DEFAULT_WORLD_LEVELS, ...worldLevels }
}

function makeProfile(username: string, character: HeroId, dateOfBirth: string | null = null): PlayerProfile {
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
    buddyUseCounts: {},
    ownedCharacters: [],
    ownedBuddies: [],
    treasureCoins: 0,
    dateOfBirth,
    ageBand: ageBandFromDateOfBirth(dateOfBirth),
    learningWorld: 'pacabacus',
    worldLevels: { ...DEFAULT_WORLD_LEVELS },
    playWorldLevels: { ...DEFAULT_WORLD_LEVELS },
    worldStars: {},
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
    buddyUseCounts: profile.buddyUseCounts ?? {},
    ownedCharacters: profile.ownedCharacters ?? unlockedCharacters(profile.adventureLevel),
    ownedBuddies: profile.ownedBuddies ?? [],
    treasureCoins: profile.treasureCoins ?? 0,
    dateOfBirth: profile.dateOfBirth ?? null,
    ageBand: profile.ageBand ?? ageBandFromDateOfBirth(profile.dateOfBirth),
    learningWorld: profile.learningWorld ?? 'pacabacus',
    worldLevels: normalizeWorldLevels(profile.worldLevels),
    playWorldLevels: normalizeWorldLevels(profile.playWorldLevels ?? profile.worldLevels),
    worldStars: profile.worldStars ?? {},
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
    buddyUseCounts: {},
    ownedCharacters: [],
    ownedBuddies: [],
    treasureCoins: 0,
    dateOfBirth: null,
    ageBand: 'early' as AgeBand,
    learningWorld: 'pacabacus' as LearningWorldId,
    worldLevels: { ...DEFAULT_WORLD_LEVELS },
    playWorldLevels: { ...DEFAULT_WORLD_LEVELS },
    worldStars: {},
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

function bumpBuddyUses(
  counts: Partial<Record<HeroId, number>> = {},
  buddies: HeroId[] = [],
) {
  return buddies.reduce(
    (next, id) => ({ ...next, [id]: (next[id] ?? 0) + 1 }),
    { ...counts },
  )
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
      buddyUseCounts: {},
      ownedCharacters: [],
      ownedBuddies: [],
      treasureCoins: 0,
      dateOfBirth: null,
      ageBand: 'early',
      learningWorld: 'pacabacus',
      worldLevels: { ...DEFAULT_WORLD_LEVELS },
      playWorldLevels: { ...DEFAULT_WORLD_LEVELS },
      worldStars: {},
      adventureLevel: 1,
      countingLevel: 1,
      stars: {},
      createProfile: (username, character, dateOfBirth = null) => {
        const profile = makeProfile(username, character, dateOfBirth)
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
      setDateOfBirth: (dateOfBirth) =>
        set((s) => {
          const ageBand = ageBandFromDateOfBirth(dateOfBirth)
          return {
            dateOfBirth,
            ageBand,
            profiles: syncActive(s.profiles, s.activeProfileId, { dateOfBirth, ageBand }),
          }
        }),
      setAgeBand: (ageBand) =>
        set((s) => ({
          ageBand,
          profiles: syncActive(s.profiles, s.activeProfileId, { ageBand }),
        })),
      setLearningWorld: (learningWorld) =>
        set((s) => ({
          learningWorld,
          profiles: syncActive(s.profiles, s.activeProfileId, { learningWorld }),
        })),
      setWorldLevel: (learningWorld, level) =>
        set((s) => {
          const playWorldLevels = normalizeWorldLevels(s.playWorldLevels)
          const nextPlayWorldLevels = {
            ...playWorldLevels,
            [learningWorld]: Math.max(1, level),
          }
          return {
            learningWorld,
            playWorldLevels: nextPlayWorldLevels,
            profiles: syncActive(s.profiles, s.activeProfileId, {
              learningWorld,
              playWorldLevels: nextPlayWorldLevels,
            }),
          }
        }),
      applySecretCode: (code) => {
        const level = secretCodeLevel(code)
        if (!level) return false
        get().setWorldLevel('pacabacus', level)
        return true
      },
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
        const buddyUseCounts = { ...s.buddyUseCounts, [buddy]: s.buddyUseCounts[buddy] ?? 0 }
        const treasureCoins = s.treasureCoins - cost
        const buddies = [...s.buddies, buddy].slice(-MAX_ACTIVE_BUDDIES)
        set({
          buddy: buddies[0] ?? null,
          buddies,
          buddyUseCounts,
          ownedBuddies,
          treasureCoins,
          profiles: syncActive(s.profiles, s.activeProfileId, {
            buddy: buddies[0] ?? null,
            buddies,
            buddyUseCounts,
            ownedBuddies,
            treasureCoins,
          }),
        })
        return true
      },
      completeWorldLevel: (world, level, starCount) => {
        const s = get()
        const before = totalWorldCompleted(s)
        const charactersBefore = new Set(s.ownedCharacters)
        const worldLevels = normalizeWorldLevels(s.worldLevels)
        const nextLevel = Math.max(worldLevels[world], level + 1)
        const nextWorldLevels = { ...worldLevels, [world]: nextLevel }
        const nextPlayWorldLevels = { ...normalizeWorldLevels(s.playWorldLevels), [world]: Math.min(nextLevel, level + 1) }
        const key = `${world}:${level}`
        const firstClear = s.worldStars[key] == null
        const coinsEarned = firstClear ? 10 + starCount * 5 : 2
        const treasureCoins = s.treasureCoins + coinsEarned
        const worldStars = { ...s.worldStars, [key]: Math.max(s.worldStars[key] ?? 0, starCount) }
        const worldCharacters = characterUnlocksForWorld(world, nextLevel)
        const rescue = rescueForClear(world, level)
        const rescued = rescue ? [rescue.hero] : []
        const ownedCharacters = Array.from(new Set([...s.ownedCharacters, ...worldCharacters, ...rescued]))
        const ownedBuddies = Array.from(new Set([...s.ownedBuddies, ...rescued]))
        const buddyUseCounts = bumpBuddyUses(
          rescued.reduce(
            (counts, id) => ({ ...counts, [id]: counts[id] ?? 0 }),
            s.buddyUseCounts,
          ),
          s.buddies,
        )
        const newCharacters = ownedCharacters.filter((id) => !charactersBefore.has(id))
        const after = totalWorldCompleted({ worldLevels: nextWorldLevels })
        set((current) => ({
          worldLevels: nextWorldLevels,
          playWorldLevels: nextPlayWorldLevels,
          worldStars,
          treasureCoins,
          ownedCharacters,
          ownedBuddies,
          buddyUseCounts,
          profiles: syncActive(current.profiles, current.activeProfileId, {
            worldLevels: nextWorldLevels,
            playWorldLevels: nextPlayWorldLevels,
            worldStars,
            treasureCoins,
            ownedCharacters,
            ownedBuddies,
            buddyUseCounts,
          }),
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
      runTrainer: (world) =>
        set((s) => {
          const learningWorld = world ?? s.learningWorld
          const worldLevels = normalizeWorldLevels(s.worldLevels)
          const nextWorldLevels = {
            ...worldLevels,
            [learningWorld]: Math.max(worldLevels[learningWorld], trainerStartLevel(s.ageBand, learningWorld)),
          }
          return {
            learningWorld,
            worldLevels: nextWorldLevels,
            profiles: syncActive(s.profiles, s.activeProfileId, {
              learningWorld,
              worldLevels: nextWorldLevels,
            }),
          }
        }),
      resetProgress: () =>
        set((s) => ({
          adventureLevel: 1,
          countingLevel: 1,
          stars: {},
          worldLevels: { ...DEFAULT_WORLD_LEVELS },
          playWorldLevels: { ...DEFAULT_WORLD_LEVELS },
          worldStars: {},
          character: STARTER_HERO_IDS[0],
          buddy: null,
          buddies: [],
          buddyUseCounts: {},
          ownedCharacters: [],
          ownedBuddies: [],
          treasureCoins: 0,
          profiles: syncActive(s.profiles, s.activeProfileId, {
            adventureLevel: 1,
            countingLevel: 1,
            stars: {},
            worldLevels: { ...DEFAULT_WORLD_LEVELS },
            playWorldLevels: { ...DEFAULT_WORLD_LEVELS },
            worldStars: {},
            character: STARTER_HERO_IDS[0],
            buddy: null,
            buddies: [],
            buddyUseCounts: {},
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
      version: 5,
      migrate: (persisted) => {
        const s = persisted as Partial<ProfileStore>
        if (s.profiles?.length) {
          const profiles = s.profiles.map((p) => {
            const buddies = p.buddies ?? (p.buddy ? [p.buddy] : [])
            const worldLevels = normalizeWorldLevels({
              ...p.worldLevels,
              pacabacus: Math.max(p.worldLevels?.pacabacus ?? 1, p.adventureLevel ?? 1, p.countingLevel ?? 1),
            })
            const ownedCharacters = Array.from(
              new Set([
                ...(p.ownedCharacters ?? []),
                ...unlockedCharacters(p.adventureLevel ?? 1),
                ...characterUnlocksForWorld('pacabacus', worldLevels.pacabacus),
                ...RESCUE_CHALLENGES.filter((challenge) =>
                  (p.worldStars ?? {})[`${challenge.world}:${challenge.level}`] != null,
                ).map((challenge) => challenge.hero),
              ]),
            )
            const ownedBuddies = Array.from(
              new Set([
                ...(p.ownedBuddies ?? []),
                ...ownedCharacters.filter((id) => SECRET_HERO_IDS.includes(id)),
              ]),
            )
            const buddyUseCounts = {
              ...Object.fromEntries(ownedBuddies.map((id) => [id, Math.max(1, (worldLevels.pacabacus ?? 1) - 1)])),
              ...p.buddyUseCounts,
            }
            return {
              ...p,
              buddy: buddies[0] ?? p.buddy ?? null,
              buddies: buddies.slice(0, MAX_ACTIVE_BUDDIES),
              buddyUseCounts,
              ownedCharacters,
              ownedBuddies,
              dateOfBirth: p.dateOfBirth ?? null,
              ageBand: p.ageBand ?? ageBandFromDateOfBirth(p.dateOfBirth),
              learningWorld: p.learningWorld ?? 'pacabacus',
              worldLevels,
              playWorldLevels: normalizeWorldLevels(p.playWorldLevels ?? p.worldLevels),
              worldStars: p.worldStars ?? {},
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
          buddyUseCounts: {},
          ownedCharacters: unlockedCharacters(s.adventureLevel ?? 1),
          ownedBuddies: [],
          dateOfBirth: null,
          ageBand: 'early',
          learningWorld: 'pacabacus',
          worldLevels: normalizeWorldLevels({
            pacabacus: Math.max(s.adventureLevel ?? 1, s.countingLevel ?? 1),
          }),
          playWorldLevels: normalizeWorldLevels({
            pacabacus: Math.max(s.adventureLevel ?? 1, s.countingLevel ?? 1),
          }),
          worldStars: {},
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
