import type { Dir } from './maze'

const SWIPE_MIN_PX = 24

export function directionFromGesture(
  start: { x: number; y: number },
  end: { x: number; y: number },
  player: { x: number; y: number },
): Dir | null {
  const swipeX = end.x - start.x
  const swipeY = end.y - start.y
  if (Math.max(Math.abs(swipeX), Math.abs(swipeY)) >= SWIPE_MIN_PX) {
    return Math.abs(swipeX) > Math.abs(swipeY)
      ? swipeX > 0 ? 'right' : 'left'
      : swipeY > 0 ? 'down' : 'up'
  }
  const tapX = end.x - player.x
  const tapY = end.y - player.y
  if (Math.max(Math.abs(tapX), Math.abs(tapY)) < 6) return null
  return Math.abs(tapX) > Math.abs(tapY)
    ? tapX > 0 ? 'right' : 'left'
    : tapY > 0 ? 'down' : 'up'
}
