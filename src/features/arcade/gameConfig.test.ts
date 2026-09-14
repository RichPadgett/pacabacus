import { describe, expect, it } from 'vitest'
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
})
