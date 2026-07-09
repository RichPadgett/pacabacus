import { useRef } from 'react'
import { isWall, posKey, type Dir, type MazeDef, type Pos } from './maze'
import { ENEMIES, HEROES, PixelSprite, type HeroId } from './sprites'

const FACE_TRANSFORM: Record<Dir, string> = {
  right: 'none',
  left: 'scaleX(-1)',
  down: 'rotate(90deg)',
  up: 'rotate(-90deg)',
}

const SWIPE_MIN_PX = 24

interface MazeBoardProps {
  maze: MazeDef
  tile: number
  dots: Set<string>
  pac: Pos
  facing: Dir
  ghosts: Pos[]
  stepMs: number
  hero: HeroId
  onSwipe?: (dir: Dir) => void
}

export function MazeBoard({
  maze,
  tile,
  dots,
  pac,
  facing,
  ghosts,
  stepMs,
  hero,
  onSwipe,
}: MazeBoardProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const cells = []
  for (let r = 0; r < maze.rows; r++) {
    for (let c = 0; c < maze.cols; c++) {
      const wall = isWall(maze, r, c)
      cells.push(
        <div
          key={`${r},${c}`}
          className={
            wall
              ? 'rounded-md bg-[var(--c-wall)] shadow-[inset_0_0_0_2px_var(--c-wall-edge)]'
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

  const heroDef = HEROES[hero]
  // frame flips with every tile the hero moves — cheap walk animation
  const heroFrame = heroDef.frames[(pac.r + pac.c) % 2]
  const heroTransform = heroDef.rotates
    ? FACE_TRANSFORM[facing]
    : facing === 'left'
      ? 'scaleX(-1)'
      : 'none'

  return (
    <div
      className="relative touch-none"
      onTouchStart={(e) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }}
      onTouchEnd={(e) => {
        if (!touchStart.current || !onSwipe) return
        const dx = e.changedTouches[0].clientX - touchStart.current.x
        const dy = e.changedTouches[0].clientY - touchStart.current.y
        touchStart.current = null
        if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return
        if (Math.abs(dx) > Math.abs(dy)) onSwipe(dx > 0 ? 'right' : 'left')
        else onSwipe(dy > 0 ? 'down' : 'up')
      }}
    >
      <div
        className="grid overflow-hidden rounded-xl border-4 border-[var(--c-wall-edge)]"
        style={{
          gridTemplateColumns: `repeat(${maze.cols}, ${tile}px)`,
          gridTemplateRows: `repeat(${maze.rows}, ${tile}px)`,
          background: 'var(--maze-floor)',
        }}
      >
        {cells}
      </div>

      {ghosts.map((g, i) => {
        const enemy = ENEMIES[i % ENEMIES.length]
        return (
          <div
            key={i}
            className="absolute top-1 left-1 z-4 flex items-center justify-center"
            style={spriteStyle(g)}
          >
            <PixelSprite map={enemy.map} palette={enemy.palette} size={tile * 0.86} />
          </div>
        )
      })}

      <div
        className="absolute top-1 left-1 z-5 flex items-center justify-center"
        style={spriteStyle(pac)}
      >
        <PixelSprite
          map={heroFrame}
          palette={heroDef.palette}
          size={tile * 0.9}
          style={{ transform: heroTransform }}
        />
      </div>
    </div>
  )
}
