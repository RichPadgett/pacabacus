import type { ArcadeProblem } from '@/features/drills/problemGenerator'
import type { LearningWorldId } from '@/features/learning/learningWorlds'

const WORLD_RANK: Record<LearningWorldId, number> = {
  pacabacus: 0,
  pacwords: 1,
  pactables: 2,
  pacmath: 3,
}

export function generateBattleProblem(world: LearningWorldId, level: number, gentle = false): ArcadeProblem {
  if (gentle) {
    const ceiling = Math.min(8, 4 + Math.floor(level / 4))
    const a = 1 + Math.floor(Math.random() * Math.max(1, ceiling - 1))
    const b = 1 + Math.floor(Math.random() * Math.max(1, ceiling - a))
    return {
      a,
      b,
      op: 'add',
      answer: a + b,
      technique: 'direct',
      kind: 'equation',
      emoji: '🍓',
    }
  }

  const rank = WORLD_RANK[world]
  const ceiling = Math.min(50, 12 + rank * 6 + Math.floor(level / 5) * 3)
  const a = 4 + Math.floor(Math.random() * Math.max(1, ceiling - 6))
  const b = 1 + Math.floor(Math.random() * Math.max(2, Math.floor(ceiling / 3)))
  const c = 1 + Math.floor(Math.random() * Math.max(2, Math.floor(ceiling / 3)))
  return {
    a,
    b,
    c,
    op: 'add',
    op2: rank >= 2 && c < a + b && level % 2 === 0 ? 'sub' : 'add',
    answer: rank >= 2 && c < a + b && level % 2 === 0 ? a + b - c : a + b + c,
    technique: 'challenge',
    kind: 'equation',
  }
}
