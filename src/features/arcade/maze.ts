export interface Pos {
  r: number
  c: number
}

export type Dir = 'up' | 'down' | 'left' | 'right'

export const DIR_VECTORS: Record<Dir, Pos> = {
  up: { r: -1, c: 0 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
  right: { r: 0, c: 1 },
}

export const MAZE = [
  '#############',
  '#...........#',
  '#.##.###.##.#',
  '#...........#',
  '#.##.###.##.#',
  '#.....#.....#',
  '#.##.###.##.#',
  '#...........#',
  '#############',
]

export const ROWS = MAZE.length
export const COLS = MAZE[0].length

export const PAC_SPAWN: Pos = { r: 7, c: 1 }
export const GHOST_SPAWNS: Pos[] = [
  { r: 1, c: 11 },
  { r: 1, c: 1 },
  { r: 7, c: 11 },
]

export const isWall = (r: number, c: number) =>
  r < 0 || c < 0 || r >= ROWS || c >= COLS || MAZE[r][c] === '#'

export const posKey = (p: Pos) => `${p.r},${p.c}`
export const samePos = (a: Pos, b: Pos) => a.r === b.r && a.c === b.c

export function corridorCells(): Pos[] {
  const out: Pos[] = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) if (!isWall(r, c)) out.push({ r, c })
  return out
}

/** Every corridor tile gets a dot except the spawn tiles. */
export function initialDots(): Set<string> {
  const skip = new Set([PAC_SPAWN, ...GHOST_SPAWNS].map(posKey))
  return new Set(
    corridorCells()
      .map(posKey)
      .filter((k) => !skip.has(k)),
  )
}

const NEIGHBORS: Pos[] = [
  { r: -1, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
]

/** One BFS step along the shortest corridor path from → to. */
export function nextStepToward(from: Pos, to: Pos): Pos {
  if (samePos(from, to)) return from
  const parent = new Map<string, string>()
  const queue: Pos[] = [from]
  parent.set(posKey(from), '')
  let found = false
  while (queue.length && !found) {
    const cur = queue.shift()!
    for (const d of NEIGHBORS) {
      const next = { r: cur.r + d.r, c: cur.c + d.c }
      if (isWall(next.r, next.c) || parent.has(posKey(next))) continue
      parent.set(posKey(next), posKey(cur))
      if (samePos(next, to)) {
        found = true
        break
      }
      queue.push(next)
    }
  }
  if (!found) return from
  // walk back from the target to the tile right after `from`
  let cur = posKey(to)
  const fromKey = posKey(from)
  while (parent.get(cur) !== fromKey) {
    cur = parent.get(cur)!
  }
  const [r, c] = cur.split(',').map(Number)
  return { r, c }
}
