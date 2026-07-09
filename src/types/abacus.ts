/** One rod: heaven bead (worth 5, up/down) + 4 earth beads (worth 1 each, bottom-up count) */
export interface RodState {
  heavenDown: boolean
  earthUp: number // 0-4 beads pushed up toward the beam
}

export function rodValue(rod: RodState): number {
  return (rod.heavenDown ? 5 : 0) + rod.earthUp
}

export function rodFromValue(value: number): RodState {
  const clamped = Math.max(0, Math.min(9, Math.trunc(value)))
  return {
    heavenDown: clamped >= 5,
    earthUp: clamped % 5,
  }
}

export type AbacusState = RodState[]

export function abacusValue(rods: AbacusState): number {
  return rods.reduce((total, rod) => total * 10 + rodValue(rod), 0)
}

export function abacusFromValue(value: number, rodCount: number): AbacusState {
  const digits = Math.max(0, Math.trunc(value))
    .toString()
    .padStart(rodCount, '0')
    .slice(-rodCount)
    .split('')
    .map(Number)
  return digits.map(rodFromValue)
}

export function emptyAbacus(rodCount: number): AbacusState {
  return Array.from({ length: rodCount }, () => rodFromValue(0))
}
