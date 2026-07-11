import { describe, expect, it } from 'vitest'
import { directionFromGesture } from './mazeGestures'

describe('maze gestures', () => {
  const player = { x: 100, y: 100 }

  it.each([
    [{ x: 100, y: 40 }, 'up'],
    [{ x: 100, y: 160 }, 'down'],
    [{ x: 40, y: 100 }, 'left'],
    [{ x: 160, y: 100 }, 'right'],
  ] as const)('maps a tap around the player to %s', (point, direction) => {
    expect(directionFromGesture(point, point, player)).toBe(direction)
  })

  it('uses swipe direction regardless of the player location', () => {
    expect(directionFromGesture({ x: 20, y: 20 }, { x: 80, y: 25 }, player)).toBe('right')
    expect(directionFromGesture({ x: 80, y: 80 }, { x: 75, y: 20 }, player)).toBe('up')
  })

  it('ignores a tap directly on the player', () => {
    expect(directionFromGesture(player, player, player)).toBeNull()
  })
})
