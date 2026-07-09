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

export interface MazeDef {
  name: string
  grid: string[]
  rows: number
  cols: number
  pacSpawn: Pos
  ghostSpawns: Pos[]
}

/** Maze layouts cycle as levels advance. All are 13×9 and fully connected. */
const LAYOUTS: { name: string; grid: string[] }[] = [
  {
    name: 'Crossbars',
    grid: [
      '#############',
      '#...........#',
      '#.##.###.##.#',
      '#...........#',
      '#.##.###.##.#',
      '#.....#.....#',
      '#.##.###.##.#',
      '#...........#',
      '#############',
    ],
  },
  {
    name: 'Double Ring',
    grid: [
      '#############',
      '#.....#.....#',
      '#.###.#.###.#',
      '#.#.......#.#',
      '#.#.#####.#.#',
      '#.#.......#.#',
      '#.###.#.###.#',
      '#.....#.....#',
      '#############',
    ],
  },
  {
    name: 'Pillar Hall',
    grid: [
      '#############',
      '#...........#',
      '#.#.#.#.#.#.#',
      '#...........#',
      '#.#.#.#.#.#.#',
      '#...........#',
      '#.#.#.#.#.#.#',
      '#...........#',
      '#############',
    ],
  },
  {
    name: 'Spiral',
    grid: [
      '#############',
      '#...........#',
      '#.#########.#',
      '#.#.......#.#',
      '#.#.#####.#.#',
      '#.#.#.....#.#',
      '#.#.........#',
      '#...........#',
      '#############',
    ],
  },
]

function wallAt(grid: string[], r: number, c: number): boolean {
  return (
    r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] === '#'
  )
}

function corridors(grid: string[]): Pos[] {
  const out: Pos[] = []
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++) if (!wallAt(grid, r, c)) out.push({ r, c })
  return out
}

/** corridor tile closest to a target corner */
function nearestTo(grid: string[], target: Pos): Pos {
  let best: Pos = corridors(grid)[0]
  let bestDist = Infinity
  for (const p of corridors(grid)) {
    const d = Math.abs(p.r - target.r) + Math.abs(p.c - target.c)
    if (d < bestDist) {
      bestDist = d
      best = p
    }
  }
  return best
}

function buildMaze(name: string, grid: string[]): MazeDef {
  const rows = grid.length
  const cols = grid[0].length
  return {
    name,
    grid,
    rows,
    cols,
    // pac starts bottom-left; ghosts spread to the other corners
    pacSpawn: nearestTo(grid, { r: rows - 1, c: 0 }),
    ghostSpawns: [
      nearestTo(grid, { r: 0, c: cols - 1 }),
      nearestTo(grid, { r: 0, c: 0 }),
      nearestTo(grid, { r: rows - 1, c: cols - 1 }),
    ],
  }
}

export const MAZES: MazeDef[] = LAYOUTS.map((l) => buildMaze(l.name, l.grid))

export function mazeForLevel(level: number): MazeDef {
  return MAZES[(level - 1) % MAZES.length]
}

export const isWall = (maze: MazeDef, r: number, c: number) => wallAt(maze.grid, r, c)

export const posKey = (p: Pos) => `${p.r},${p.c}`
export const samePos = (a: Pos, b: Pos) => a.r === b.r && a.c === b.c

/** Every corridor tile gets a dot except the spawn tiles. */
export function initialDots(maze: MazeDef): Set<string> {
  const skip = new Set([maze.pacSpawn, ...maze.ghostSpawns].map(posKey))
  return new Set(
    corridors(maze.grid)
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
export function nextStepToward(maze: MazeDef, from: Pos, to: Pos): Pos {
  if (samePos(from, to)) return from
  const parent = new Map<string, string>()
  const queue: Pos[] = [from]
  parent.set(posKey(from), '')
  let found = false
  while (queue.length && !found) {
    const cur = queue.shift()!
    for (const d of NEIGHBORS) {
      const next = { r: cur.r + d.r, c: cur.c + d.c }
      if (isWall(maze, next.r, next.c) || parent.has(posKey(next))) continue
      parent.set(posKey(next), posKey(cur))
      if (samePos(next, to)) {
        found = true
        break
      }
      queue.push(next)
    }
  }
  if (!found) return from
  let cur = posKey(to)
  const fromKey = posKey(from)
  while (parent.get(cur) !== fromKey) {
    cur = parent.get(cur)!
  }
  const [r, c] = cur.split(',').map(Number)
  return { r, c }
}
