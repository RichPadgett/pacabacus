import { describe, expect, it } from 'vitest'
import type { AgeBand } from '@/features/learning/learningWorlds'
import { generateFromCfg } from '@/features/drills/problemGenerator'
import { COUNTING_MAX, countingCfg, learningWorldCfg } from './gameConfig'

describe('age-tuned game config', () => {
  it('keeps ages 4-5 on one-rod visual counting and tiny sums', () => {
    for (let level = 1; level <= COUNTING_MAX; level += 1) {
      const cfg = countingCfg(level)
      expect(cfg.rodCount).toBe(1)
      expect(cfg.gentle).toBe(true)
      expect(cfg.allowChallenge).toBe(false)
      expect(cfg.problem.kind).toBe('early')

      for (let sample = 0; sample < 80; sample += 1) {
        const problem = generateFromCfg(cfg.problem)
        expect(problem.answer).toBeGreaterThanOrEqual(0)
        expect(problem.answer).toBeLessThanOrEqual(9)
        expect(problem.op).toBe('add')
        expect(problem.technique).toBe('direct')
        expect(['count', 'equation']).toContain(problem.kind)
      }
    }
  })

  it('starts fresh soroban players with pure bead-count matching', () => {
    for (let level = 1; level <= 10; level += 1) {
      const cfg = countingCfg(level)

      expect(cfg.problem.kind).toBe('early')
      if (cfg.problem.kind !== 'early') return
      expect(cfg.problem.countChance).toBe(1)
      expect(cfg.problem.sumCap).toBe(0)

      for (let sample = 0; sample < 40; sample += 1) {
        const problem = generateFromCfg(cfg.problem)
        expect(problem.kind).toBe('count')
        expect(problem.b).toBe(0)
      }
    }
  })

  it('uses the protected counting path for the little age band at any adventure level', () => {
    const cfg = learningWorldCfg('pacabacus', 50, 'little')

    expect(cfg.rodCount).toBe(1)
    expect(cfg.gentle).toBe(true)
    expect(cfg.problem.kind).toBe('early')
  })

  it('keeps age 6-7 aligned to within-20 addition before harder work', () => {
    for (const level of [1, 6, 12, 20]) {
      const cfg = learningWorldCfg('pacabacus', level, 'early')

      expect(cfg.problem.kind).toBe('tech')
      if (cfg.problem.kind !== 'tech') return
      expect(cfg.problem.ops).toBe('add')
      expect(cfg.problem.maxAnswer).toBeLessThanOrEqual(20)
      expect(cfg.problem.mathLevel).toBeLessThanOrEqual(3)
    }
  })

  it('ramps older children without skipping the early soroban foundation', () => {
    const expectations: Array<{
      ageBand: AgeBand
      firstLevelMaxAnswer: number
      firstLevelMathLevel: number
      midLevelMaxAnswer: number
    }> = [
      { ageBand: 'growing', firstLevelMaxAnswer: 10, firstLevelMathLevel: 1, midLevelMaxAnswer: 20 },
      { ageBand: 'big', firstLevelMaxAnswer: 10, firstLevelMathLevel: 2, midLevelMaxAnswer: 20 },
      { ageBand: 'master', firstLevelMaxAnswer: 20, firstLevelMathLevel: 3, midLevelMaxAnswer: 50 },
    ]

    for (const expected of expectations) {
      const first = learningWorldCfg('pacabacus', 1, expected.ageBand)
      const mid = learningWorldCfg('pacabacus', 15, expected.ageBand)

      expect(first.problem.kind).toBe('tech')
      expect(mid.problem.kind).toBe('tech')
      if (first.problem.kind !== 'tech' || mid.problem.kind !== 'tech') return
      expect(first.problem.ops).toBe('add')
      expect(first.problem.maxAnswer).toBeLessThanOrEqual(expected.firstLevelMaxAnswer)
      expect(first.problem.mathLevel).toBeLessThanOrEqual(expected.firstLevelMathLevel)
      expect(mid.problem.maxAnswer).toBeLessThanOrEqual(expected.midLevelMaxAnswer)
    }
  })
})
