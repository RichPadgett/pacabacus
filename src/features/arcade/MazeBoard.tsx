import { useRef, type CSSProperties } from 'react'
import type { CharacterGrowthProfile } from './characterGrowth'
import { isWall, posKey, type Dir, type MazeDef, type Pos } from './maze'
import { ENEMIES, HEROES, PixelSprite, type HeroId } from './sprites'
import type { ThemeId } from './themes'

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
  vulnerableMovesLeft: number
  pac: Pos
  buddy: Pos
  buddyTrail: Pos[]
  facing: Dir
  ghosts: Pos[]
  stepMs: number
  hero: HeroId
  buddyId: HeroId | null
  buddyIds?: HeroId[]
  powerBuddy?: Pos | null
  powerBuddyId?: HeroId | null
  exitDoor?: Pos | null
  travelExitDoor?: Pos | null
  themeId?: ThemeId
  growth: CharacterGrowthProfile
  cloaked?: boolean
  onSwipe?: (dir: Dir) => void
}

export function MazeBoard({
  maze,
  tile,
  treasures,
  jailFruits,
  jailTurns,
  vulnerableMovesLeft,
  pac,
  buddy,
  buddyTrail,
  facing,
  ghosts,
  stepMs,
  hero,
  buddyId,
  buddyIds,
  powerBuddy,
  powerBuddyId,
  exitDoor,
  travelExitDoor,
  themeId = 'stars',
  growth,
  cloaked,
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
      const trouble = maze.troubleSpots?.some((spot) => samePosForBoard(spot, { r, c }))
      const decoration = maze.decorations?.[k]
      const hasDoor =
        (!wall && exitDoor && samePosForBoard(exitDoor, { r, c })) ||
        (!wall && travelExitDoor && samePosForBoard(travelExitDoor, { r, c }))
      cells.push(
        <div
          key={k}
          className={
            wall
              ? 'rounded-md shadow-[inset_0_0_0_2px_var(--c-wall-edge)]'
              : 'relative'
          }
          style={wall ? wallTexture(themeId, r, c) : floorTexture(themeId, r, c)}
        >
          {hasDoor && (
            <div
              className="door-burst absolute inset-0 z-[1] flex items-center justify-center"
              style={{
                '--door-glow':
                  themeId === 'ocean'
                    ? '#7dd3fc'
                    : themeId === 'forest'
                      ? '#86efac'
                      : '#fde047',
              } as CSSProperties}
              aria-label="Open doorway"
            >
              <span className="door-burst__light" style={{ width: tile * 0.82, height: tile * 0.82 }} />
              <span className="door-burst__left" style={{ width: tile * 0.28, height: tile * 0.72 }} />
              <span className="door-burst__right" style={{ width: tile * 0.28, height: tile * 0.72 }} />
              <span className="door-burst__spark" style={{ fontSize: tile * 0.42 }}>✦</span>
            </div>
          )}
          {!wall && trouble && !hasDoor && (
            <span
              className="travel-trouble absolute inset-0 z-[1] flex items-center justify-center"
              style={{ fontSize: tile * 0.42 }}
              aria-label="Trouble zone"
            >
              ⚠
            </span>
          )}
          {!wall && decoration && !treasure && !hasDoor && (
            <span
              className="absolute inset-0 flex items-center justify-center leading-none opacity-75"
              style={{ fontSize: tile * 0.38 }}
            >
              {decoration}
            </span>
          )}
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
        const vulnerable = vulnerableMovesLeft > 0
        return (
          <div
            key={i}
            className="absolute top-1 left-1 z-4 flex items-center justify-center"
            style={{
              ...spriteStyle(g),
              opacity: jailed ? 0.45 : vulnerable ? 0.78 : 1,
              filter: vulnerable ? 'drop-shadow(0 0 8px #60a5fa) hue-rotate(155deg)' : undefined,
            }}
          >
            <PixelSprite map={enemy.map} palette={enemy.palette} size={tile * 0.86} />
            {vulnerable && (
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{ fontSize: tile * 0.48 }}
              >
                ⚡
              </span>
            )}
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

      {(buddyIds?.length ? buddyIds : buddyId ? [buddyId] : []).map((id, i) => {
        const p = buddyTrail[i] ?? buddy
        if (samePosForBoard(p, pac)) return null
        return (
          <div
            key={`${id}-${i}`}
            className={`character-stage character-stage--${growth.buddyStage} absolute top-1 left-1 z-4 flex items-center justify-center`}
            style={{ ...spriteStyle(p), opacity: 0.92 - i * 0.08 }}
          >
            <PixelSprite
              map={HEROES[id].frames[(p.r + p.c) % 2]}
              palette={HEROES[id].palette}
              size={tile * Math.max(0.34, growth.buddyScale - i * 0.04)}
            />
          </div>
        )
      })}

      {cloaked && (
        <div
          className="absolute top-1 left-1 z-4 flex items-center justify-center"
          style={spriteStyle(pac)}
        >
          <span
            className="animate-pulse leading-none opacity-85"
            style={{
              fontSize: tile * 1.1,
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.75))',
            }}
          >
            ☁️
          </span>
        </div>
      )}

      {powerBuddy && powerBuddyId && (
        <div
          className="absolute top-1 left-1 z-[6] flex items-center justify-center"
          style={{
            ...spriteStyle(powerBuddy),
            filter: 'drop-shadow(0 0 8px #fde047)',
          }}
        >
          <span className="absolute text-2xl leading-none">⭐</span>
          <PixelSprite
            map={HEROES[powerBuddyId].frames[(powerBuddy.r + powerBuddy.c) % 2]}
            palette={HEROES[powerBuddyId].palette}
            size={tile * growth.powerBuddyScale}
          />
        </div>
      )}

      <div
        className={`character-stage character-stage--${growth.stage} absolute top-1 left-1 z-5 flex items-center justify-center`}
        style={spriteStyle(pac)}
      >
        <PixelSprite
          map={heroFrame}
          palette={heroDef.palette}
          size={tile * growth.heroScale}
          style={{ transform: heroTransform }}
        />
      </div>
    </div>
  )
}

function samePosForBoard(a: Pos, b: Pos) {
  return a.r === b.r && a.c === b.c
}

function floorTexture(theme: ThemeId, r: number, c: number): CSSProperties {
  const seed = (r * 17 + c * 31) % 5
  const common = {
    backgroundColor: 'var(--maze-floor)',
    backgroundBlendMode: 'soft-light',
  } as CSSProperties
  if (theme === 'ocean') {
    return {
      ...common,
      backgroundImage:
        'radial-gradient(circle at 25% 25%, rgba(125,211,252,0.22) 0 12%, transparent 13%), linear-gradient(135deg, rgba(255,255,255,0.08), transparent 45%)',
      backgroundSize: `${24 + seed * 3}px ${18 + seed * 2}px, 100% 100%`,
    }
  }
  if (theme === 'forest') {
    return {
      ...common,
      backgroundImage:
        'linear-gradient(45deg, rgba(74,222,128,0.13) 25%, transparent 25% 50%, rgba(74,222,128,0.1) 50% 75%, transparent 75%)',
      backgroundSize: `${18 + seed * 2}px ${18 + seed * 2}px`,
    }
  }
  if (theme === 'bubblegum') {
    return {
      ...common,
      backgroundImage:
        'radial-gradient(circle at 35% 35%, rgba(255,194,224,0.25) 0 16%, transparent 17%), radial-gradient(circle at 75% 70%, rgba(253,230,138,0.18) 0 10%, transparent 11%)',
      backgroundSize: `${28 + seed * 2}px ${28 + seed * 2}px`,
    }
  }
  if (theme === 'sunset') {
    return {
      ...common,
      backgroundImage:
        'linear-gradient(135deg, rgba(251,146,60,0.18) 0 20%, transparent 21% 55%, rgba(253,224,71,0.1) 56% 70%, transparent 71%)',
      backgroundSize: `${22 + seed * 2}px ${22 + seed * 2}px`,
    }
  }
  return {
    ...common,
    backgroundImage:
      'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16) 0 8%, transparent 9%)',
    backgroundSize: `${24 + seed * 2}px ${24 + seed * 2}px`,
  }
}

function wallTexture(theme: ThemeId, r: number, c: number): CSSProperties {
  const offset = `${(r + c) % 2 ? 0 : 50}%`
  return {
    backgroundColor: 'var(--c-wall)',
    backgroundImage:
      theme === 'forest'
        ? 'linear-gradient(90deg, rgba(20,83,45,0.35) 0 45%, rgba(255,255,255,0.08) 46% 52%, transparent 53%)'
        : theme === 'ocean'
          ? 'radial-gradient(circle at 30% 30%, rgba(186,230,253,0.18) 0 18%, transparent 19%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.12) 0 20%, transparent 21% 55%, rgba(0,0,0,0.12) 56%)',
    backgroundPosition: offset,
    backgroundSize: '18px 18px',
  }
}
