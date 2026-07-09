import { COLS, ROWS, isWall, posKey, type Dir, type Pos } from './maze'

const GHOST_COLORS = [
  'linear-gradient(#ff8ba0, #ff5f7a)',
  'linear-gradient(#8be9ff, #45b1f5)',
  'linear-gradient(#d8b4fe, #a855f7)',
]

const FACE_TRANSFORM: Record<Dir, string> = {
  right: 'none',
  left: 'scaleX(-1)',
  down: 'rotate(90deg)',
  up: 'rotate(-90deg)',
}

interface MazeBoardProps {
  tile: number
  dots: Set<string>
  pac: Pos
  facing: Dir
  ghosts: Pos[]
  stepMs: number
}

export function MazeBoard({ tile, dots, pac, facing, ghosts, stepMs }: MazeBoardProps) {
  const cells = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const wall = isWall(r, c)
      cells.push(
        <div
          key={`${r},${c}`}
          className={
            wall
              ? 'rounded-md bg-indigo-700 shadow-[inset_0_0_0_2px_#6a58e8]'
              : 'relative'
          }
        >
          {!wall && dots.has(posKey({ r, c })) && (
            <div className="absolute inset-[38%] rounded-full bg-amber-100 shadow-[0_0_6px_rgba(255,233,176,0.8)]" />
          )}
        </div>,
      )
    }
  }

  const spriteStyle = (p: Pos) => ({
    width: tile,
    height: tile,
    transform: `translate(${p.c * tile}px, ${p.r * tile}px)`,
    transition: `transform ${stepMs}ms linear`,
  })

  return (
    <div className="relative">
      <div
        className="grid overflow-hidden rounded-xl border-4 border-[#6a58e8]"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${tile}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${tile}px)`,
          background: 'var(--maze-floor)',
        }}
      >
        {cells}
      </div>

      {ghosts.map((g, i) => (
        <div key={i} className="absolute top-1 left-1 z-4" style={spriteStyle(g)}>
          <div
            className="ghost-body shadow-[0_0_12px_rgba(255,95,122,0.6)]"
            style={{ background: GHOST_COLORS[i % GHOST_COLORS.length] }}
          />
        </div>
      ))}

      <div className="absolute top-1 left-1 z-5" style={spriteStyle(pac)}>
        <div className="pac-face" style={{ transform: FACE_TRANSFORM[facing] }}>
          <div className="pac-mouth" />
        </div>
      </div>
    </div>
  )
}
