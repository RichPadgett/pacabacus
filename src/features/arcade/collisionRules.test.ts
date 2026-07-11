import { describe, expect, it } from 'vitest'
import { collisionOutcome, removeOneBaddieAt } from './collisionRules'

describe('baddie collisions', () => {
  it('removes one heart per collision and fails on the third hit', () => {
    expect(collisionOutcome(3)).toEqual({ livesRemaining: 2, levelFailed: false })
    expect(collisionOutcome(2)).toEqual({ livesRemaining: 1, levelFailed: false })
    expect(collisionOutcome(1)).toEqual({ livesRemaining: 0, levelFailed: true })
  })

  it('lets Buddy Power remove exactly one colliding baddie', () => {
    const ghosts = [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 3, c: 3 }]
    expect(removeOneBaddieAt(ghosts, { r: 1, c: 1 })).toEqual([
      { r: 1, c: 1 },
      { r: 3, c: 3 },
    ])
  })
})
