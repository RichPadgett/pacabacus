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
  treasures: Map<string, string>
  jailFruits: Set<string>
  jailTurns: number
  pac: Pos
  buddy: Pos
  facing: Dir
  ghosts: Pos[]
  stepMs: number
  hero: HeroId
  buddyId: HeroId | null
  onSwipe?: (dir: Dir) => void
}

export function MazeBoard({
  maze,
  tile,
  treasures,
  jailFruits,
  jailTurns,
  pac,
  buddy,
  facing,
  ghosts,
  stepMs,
  hero,
  buddyId,
  onSwipe,
}: MazeBoardProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const cells = []
  for (let r = 0; r < maze.rows; r++) {
    for (let c = 0; c < maze.cols; c++) {
      const wall = isWall(maze, r, c)
      const k = posKey({ r, c })
      const treasure = treasures.get(k)
      const isJailFruit = jailFruits.has(k)
      cells.push(
        <div
          key={k}
          className={
            wall
              ? 'rounded-md bg-[var(--c-wall)] shadow-[inset_0_0_0_2px_var(--c-wall-edge)]'
              : 'relative'
          }
        >
          {!wall && treasure === 'gold-coin' && (
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{ filter: 'drop-shadow(0 0 5px #ffd23f)' }}
            >
              <span
                className="flex items-center justify-center rounded-full border-2 border-yellow-200 bg-gradient-to-br from-yellow-100 via-yellow-300 to-amber-500 font-black text-amber-900 shadow-[inset_0_-2px_0_rgba(146,64,14,0.45)]"
                style={{
                  width: tile * 0.52,
                  height: tile * 0.52,
                  fontSize: tile * 0.25,
                }}
              >
                $
              </span>
            </span>
          )}
          {!wall && treasure && treasure !== 'gold-coin' && (
            <span
              className={[
                'absolute inset-0 flex items-center justify-center leading-none',
                isJailFruit ? 'animate-pulse' : '',
              ].join(' ')}
              style={{
                fontSize: tile * (isJailFruit ? 0.62 : 0.45),
                filter: isJailFruit ? 'drop-shadow(0 0 6px #ffd23f)' : undefined,
              }}
            >
              {treasure}
            </span>
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
        const jailed = jailTurns > 0
        return (
          <div
            key={i}
            className="absolute top-1 left-1 z-4 flex items-center justify-center"
            style={{ ...spriteStyle(g), opacity: jailed ? 0.45 : 1 }}
          >
            <PixelSprite map={enemy.map} palette={enemy.palette} size={tile * 0.86} />
            {jailed && (
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{ fontSize: tile * 0.5 }}
              >
                🔒
              </span>
            )}
          </div>
        )
      })}

      {buddyId && !samePosForBoard(buddy, pac) && (
        <div
          className="absolute top-1 left-1 z-4 flex items-center justify-center"
          style={{ ...spriteStyle(buddy), opacity: 0.92 }}
        >
          <PixelSprite
            map={HEROES[buddyId].frames[(buddy.r + buddy.c) % 2]}
            palette={HEROES[buddyId].palette}
            size={tile * 0.58}
          />
        </div>
      )}

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

function samePosForBoard(a: Pos, b: Pos) {
  return a.r === b.r && a.c === b.c
}
