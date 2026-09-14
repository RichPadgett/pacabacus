import type { ArcadeProblem } from '@/features/drills/problemGenerator'
import type { LearningWorldId } from '@/features/learning/learningWorlds'

export function generateBattleProblem(_world: LearningWorldId, level: number, gentle = false): ArcadeProblem {
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

  const ceiling = Math.min(50, 12 + Math.floor(level / 5) * 3)
  const a = 4 + Math.floor(Math.random() * Math.max(1, ceiling - 6))
  const b = 1 + Math.floor(Math.random() * Math.max(2, Math.floor(ceiling / 3)))
  const c = 1 + Math.floor(Math.random() * Math.max(2, Math.floor(ceiling / 3)))
  const useSubtraction = c < a + b && level >= 10 && level % 2 === 0
  return {
    a,
    b,
    c,
    op: 'add',
    op2: useSubtraction ? 'sub' : 'add',
    answer: useSubtraction ? a + b - c : a + b + c,
    technique: 'challenge',
    kind: 'equation',
  }
}
