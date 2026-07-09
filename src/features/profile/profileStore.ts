import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CHARACTER_ORDER, HEROES, type HeroId } from '@/features/arcade/sprites'
import { BADGES, type Badge } from './rewards'

export type ProgressMode = 'adventure' | 'counting'

export interface CompleteResult {
  newCharacters: HeroId[]
  newBadges: Badge[]
}

interface ProfileStore {
  username: string | null
  character: HeroId
  /** next level to play in each mode (1-based) */
  adventureLevel: number
  countingLevel: number
  /** best stars per level, keyed like 'a12' / 'c3' */
  stars: Record<string, number>
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

export const useProfile = create<ProfileStore>()(
  persist(
    (set, get) => ({
      username: null,
      character: 'kitty',
      adventureLevel: 1,
      countingLevel: 1,
      stars: {},
      setUsername: (username) => set({ username }),
      setCharacter: (character) => set({ character }),
      completeLevel: (mode, level, starCount) => {
        const s = get()
        const before = totalCompleted(s)
        const key = `${mode === 'adventure' ? 'a' : 'c'}${level}`
        const levelField = mode === 'adventure' ? 'adventureLevel' : 'countingLevel'
        const nextLevel = Math.max(s[levelField], level + 1)
        const after = totalCompleted({ ...s, [levelField]: nextLevel })
        set({
          [levelField]: nextLevel,
          stars: { ...s.stars, [key]: Math.max(s.stars[key] ?? 0, starCount) },
        })
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
        set({ adventureLevel: 1, countingLevel: 1, stars: {}, character: 'kitty' }),
    }),
    { name: 'pacabacus-profile' },
  ),
)
