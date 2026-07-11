import { describe, expect, it } from 'vitest'
import { generateDelta, generateProblem, techniquesForMathLevel } from './problemGenerator'

describe('problem generation boundaries', () => {
  it('keeps generated answers inside the configured range', () => {
    for (let index = 0; index < 250; index += 1) {
      const problem = generateProblem({
        mathLevel: 5,
        ops: 'mixed',
        maxAnswer: 50,
      })
      expect(problem.answer).toBeGreaterThanOrEqual(0)
      expect(problem.answer).toBeLessThanOrEqual(50)
    }
  })

  it('keeps rain deltas valid from both ends of the range', () => {
    for (const current of [0, 1, 49, 50]) {
      for (let index = 0; index < 50; index += 1) {
        const step = generateDelta({ mathLevel: 5, ops: 'mixed', maxAnswer: 50, current })
        expect(step.next).toBeGreaterThanOrEqual(0)
        expect(step.next).toBeLessThanOrEqual(50)
      }
    }
  })

  it('moves from direct practice to the advanced technique set', () => {
    expect(techniquesForMathLevel(1)).toEqual(['direct'])
    expect(techniquesForMathLevel(5)).toEqual(['twodigit', 'ten', 'five', 'plain'])
  })
})
