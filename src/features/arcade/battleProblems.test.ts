import { describe, expect, it, vi } from 'vitest'
import { generateBattleProblem } from './battleProblems'

describe('RPG battle problems', () => {
  it('always creates a three-term equation', () => {
    const problem = generateBattleProblem('pacabacus', 1)
    expect(problem.c).toBeTypeOf('number')
    expect(problem.op2).toBeTruthy()
    const second = problem.op2 === 'sub' ? -(problem.c ?? 0) : (problem.c ?? 0)
    expect(problem.answer).toBe(problem.a + problem.b + second)
  })

  it('scales number size across later worlds and levels', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const early = generateBattleProblem('pacabacus', 1)
    const late = generateBattleProblem('pacmath', 20)
    expect(late.a + late.b + (late.c ?? 0)).toBeGreaterThan(early.a + early.b + (early.c ?? 0))
    vi.restoreAllMocks()
  })
})
