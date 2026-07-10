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
  troubleSpots?: Pos[]
  decorations?: Record<string, string>
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

// ---- seeded procedural mazes so 50 levels don't repeat ----

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generate a 13×9 maze with a recursive backtracker over the "room" grid
 * (odd coordinates), then knock out extra walls to add loops. Connectivity
 * is guaranteed by construction.
 */
function generateGrid(seed: number): string[] {
  const rnd = mulberry32(seed * 7919 + 13)
  const rows = 9
  const cols = 13
  const cells: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => '#'),
  )
  const roomRows = 4 // rooms at r = 1,3,5,7
  const roomCols = 6 // rooms at c = 1,3,5,7,9,11
  const visited = new Set<string>()
  const stack: [number, number][] = [[0, 0]]
  visited.add('0,0')
  cells[1][1] = '.'

  while (stack.length) {
    const [rr, rc] = stack[stack.length - 1]
    const neighbors = (
      [
        [rr - 1, rc],
        [rr + 1, rc],
        [rr, rc - 1],
        [rr, rc + 1],
      ] as [number, number][]
    ).filter(
      ([nr, nc]) =>
        nr >= 0 && nr < roomRows && nc >= 0 && nc < roomCols && !visited.has(`${nr},${nc}`),
    )
    if (!neighbors.length) {
      stack.pop()
      continue
    }
    const [nr, nc] = neighbors[Math.floor(rnd() * neighbors.length)]
    visited.add(`${nr},${nc}`)
    cells[nr * 2 + 1][nc * 2 + 1] = '.'
    // carve the wall between the two rooms
    cells[rr + nr + 1][rc + nc + 1] = '.'
    stack.push([nr, nc])
  }

  // knock out extra walls so there are loops (no dead-end-only mazes)
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (cells[r][c] !== '#') continue
      const horizontal = cells[r][c - 1] === '.' && cells[r][c + 1] === '.'
      const vertical = cells[r - 1][c] === '.' && cells[r + 1][c] === '.'
      if ((horizontal || vertical) && rnd() < 0.35) cells[r][c] = '.'
    }
  }

  return cells.map((row) => row.join(''))
}

export function mazeForLevel(level: number): MazeDef {
  if (level <= MAZES.length) return MAZES[level - 1]
  return buildMaze(`Maze ${level}`, generateGrid(level))
}

export function travelMazeForLevel(level: number): MazeDef {
  const journeys: {
    name: string
    grid: string[]
    pacSpawn: Pos
    ghostSpawns: Pos[]
    troubleSpots: Pos[]
    decorations: Record<string, string>
  }[] = [
    {
      name: 'Doorstep Trail',
      grid: [
        '#############',
        '#.....#.....#',
        '#.###.#.###.#',
        '#...........#',
        '#.###...###.#',
        '#...........#',
        '#.###.#.###.#',
        '#.....#.....#',
        '#############',
      ],
      pacSpawn: { r: 7, c: 5 },
      ghostSpawns: [
        { r: 3, c: 10 },
        { r: 5, c: 2 },
        { r: 1, c: 1 },
        { r: 7, c: 10 },
      ],
      troubleSpots: [
        { r: 3, c: 5 },
        { r: 5, c: 7 },
      ],
      decorations: {
        '1,5': '✦',
        '3,1': '🌿',
        '3,11': '🌿',
        '7,1': '🪧',
        '7,11': '✦',
      },
    },
    {
      name: 'Winding Bridge',
      grid: [
        '#############',
        '#...........#',
        '#.####.####.#',
        '#.#.......#.#',
        '#.#.###.#.#.#',
        '#...#...#...#',
        '#.###.#####.#',
        '#...........#',
        '#############',
      ],
      pacSpawn: { r: 7, c: 6 },
      ghostSpawns: [
        { r: 1, c: 10 },
        { r: 5, c: 1 },
        { r: 3, c: 6 },
        { r: 7, c: 2 },
      ],
      troubleSpots: [
        { r: 1, c: 6 },
        { r: 5, c: 6 },
        { r: 7, c: 9 },
      ],
      decorations: {
        '1,1': '🪧',
        '1,11': '✦',
        '3,3': '🌉',
        '5,9': '🌉',
        '7,6': '✦',
      },
    },
    {
      name: 'Little Room Road',
      grid: [
        '#############',
        '#.....#.....#',
        '#.###...###.#',
        '#...#.#.#...#',
        '###.#.#.#.###',
        '#...#...#...#',
        '#.###.#.###.#',
        '#.....#.....#',
        '#############',
      ],
      pacSpawn: { r: 7, c: 6 },
      ghostSpawns: [
        { r: 1, c: 1 },
        { r: 3, c: 11 },
        { r: 5, c: 1 },
        { r: 7, c: 11 },
      ],
      troubleSpots: [
        { r: 1, c: 6 },
        { r: 3, c: 3 },
        { r: 5, c: 9 },
      ],
      decorations: {
        '1,5': '🚪',
        '1,7': '🚪',
        '3,1': '✦',
        '5,11': '✦',
        '7,6': '🪧',
      },
    },
    {
      name: 'World Gate Maze',
      grid: [
        '#############',
        '#.....#.....#',
        '#.###.#.###.#',
        '#...#...#...#',
        '#.#.#####.#.#',
        '#.#.......#.#',
        '#.#####.###.#',
        '#...........#',
        '#############',
      ],
      pacSpawn: { r: 7, c: 6 },
      ghostSpawns: [
        { r: 1, c: 10 },
        { r: 3, c: 1 },
        { r: 5, c: 10 },
        { r: 7, c: 2 },
        { r: 7, c: 10 },
      ],
      troubleSpots: [
        { r: 1, c: 5 },
        { r: 3, c: 7 },
        { r: 5, c: 5 },
        { r: 7, c: 8 },
      ],
      decorations: {
        '1,1': '🏰',
        '1,11': '🏰',
        '3,5': '✦',
        '5,7': '✦',
        '7,6': '🪧',
      },
    },
  ]
  const journey = level % 5 === 0 ? journeys[3] : journeys[level % 3]
  const grid = journey.grid
  return {
    name: `${journey.name} to Level ${level + 1}`,
    grid,
    rows: grid.length,
    cols: grid[0].length,
    pacSpawn: journey.pacSpawn,
    ghostSpawns: journey.ghostSpawns,
    troubleSpots: level >= 15 ? journey.troubleSpots : [],
    decorations: journey.decorations,
  }
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
