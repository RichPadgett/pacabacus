import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MathLevel, OpsChoice } from '@/features/drills/problemGenerator'
import type { HeroId } from './sprites'
import type { ThemeId } from './themes'

export type GhostDifficulty = 'off' | 'chill' | 'spooky' | 'scary'
export type GameSpeed = 'relaxed' | 'normal' | 'speedy'
export type MaxAnswer = 10 | 20 | 50

export interface ArcadeSettings {
  mathLevel: MathLevel
  ops: OpsChoice
  maxAnswer: MaxAnswer
  ghosts: GhostDifficulty
  speed: GameSpeed
  music: boolean
  theme: ThemeId
  hero: HeroId
}

interface SettingsStore extends ArcadeSettings {
  update: (patch: Partial<ArcadeSettings>) => void
}

/** count = how many ghosts; steps = tiles they chase per turn (right/wrong answer) */
export const GHOST_CONFIG: Record<
  GhostDifficulty,
  { count: number; correctSteps: number; wrongSteps: number }
> = {
  off: { count: 0, correctSteps: 0, wrongSteps: 0 },
  chill: { count: 1, correctSteps: 1, wrongSteps: 1 },
  spooky: { count: 2, correctSteps: 1, wrongSteps: 2 },
  scary: { count: 3, correctSteps: 2, wrongSteps: 3 },
}

export const SPEED_MS: Record<GameSpeed, number> = {
  relaxed: 220,
  normal: 160,
  speedy: 110,
}

export const useArcadeSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      mathLevel: 1,
      ops: 'mixed',
      maxAnswer: 20,
      ghosts: 'chill',
      speed: 'relaxed',
      music: true,
      theme: 'stars',
      hero: 'chomper',
      update: (patch) => set(patch),
    }),
    { name: 'pacabacus-arcade-settings' },
  ),
)
