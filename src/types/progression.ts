export interface TierProgress {
  unlockedLevelIndex: number
  stars: Record<string, 0 | 1 | 2 | 3>
  bestTimes: Record<string, number>
  totalXp: number
}

export function emptyTierProgress(): TierProgress {
  return {
    unlockedLevelIndex: 0,
    stars: {},
    bestTimes: {},
    totalXp: 0,
  }
}
