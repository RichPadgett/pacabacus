import { samePos, type Pos } from './maze'

export function collisionOutcome(lives: number) {
  const livesRemaining = Math.max(0, lives - 1)
  return { livesRemaining, levelFailed: livesRemaining === 0 }
}

export function removeOneBaddieAt(ghosts: Pos[], target: Pos) {
  const hitIndex = ghosts.findIndex((ghost) => samePos(ghost, target))
  return hitIndex < 0 ? ghosts : ghosts.filter((_, index) => index !== hitIndex)
}
