/**
 * 8-bit pixel sprites drawn as SVG grids — no image assets.
 * '.' = transparent, letters index into each sprite's palette.
 */

export function PixelSprite({
  map,
  palette,
  size,
  style,
  className,
}: {
  map: string[]
  palette: Record<string, string>
  size: number
  style?: React.CSSProperties
  className?: string
}) {
  const rows = map.length
  const cols = map[0].length
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      style={style}
      className={className}
    >
      {map.flatMap((row, r) =>
        [...row].map((ch, c) =>
          ch !== '.' && palette[ch] ? (
            <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={palette[ch]} />
          ) : null,
        ),
      )}
    </svg>
  )
}

// ============================== HEROES ==============================

export type HeroId = 'chomper' | 'robo' | 'kitty' | 'dino'

export interface HeroDef {
  id: HeroId
  name: string
  /** two animation frames, swapped as the hero moves */
  frames: [string[], string[]]
  palette: Record<string, string>
  /** chomper-style heroes rotate to face travel direction; others just flip */
  rotates: boolean
}

const CHOMPER_OPEN = [
  '....YYYY....',
  '..YYYYYYYY..',
  '.YYYYYYYYYY.',
  '.YYYYBYYYYY.',
  'YYYYYYYYY...',
  'YYYYYYY.....',
  'YYYYY.......',
  'YYYYYYY.....',
  'YYYYYYYYY...',
  '.YYYYYYYYYY.',
  '..YYYYYYYY..',
  '....YYYY....',
]
const CHOMPER_CLOSED = [
  '....YYYY....',
  '..YYYYYYYY..',
  '.YYYYYYYYYY.',
  '.YYYYBYYYYY.',
  'YYYYYYYYYYYY',
  'YYYYYYYYYYYY',
  'YYYYYYBBBBBB',
  'YYYYYYYYYYYY',
  'YYYYYYYYYYYY',
  '.YYYYYYYYYY.',
  '..YYYYYYYY..',
  '....YYYY....',
]

const ROBO_A = [
  '.....RR.....',
  '.....DD.....',
  '..DDDDDDDD..',
  '.DSSSSSSSSD.',
  '.DSBSSSSBSD.',
  '.DSSSSSSSSD.',
  '.DSSBBBBSSD.',
  '.DDDDDDDDDD.',
  '..DSSSSSSD..',
  '..DDDDDDDD..',
  '..DD....DD..',
  '.DDD....DDD.',
]
const ROBO_B = [
  '.....RR.....',
  '.....DD.....',
  '..DDDDDDDD..',
  '.DSSSSSSSSD.',
  '.DSBSSSSBSD.',
  '.DSSSSSSSSD.',
  '.DSSBBBBSSD.',
  '.DDDDDDDDDD.',
  '..DSSSSSSD..',
  '..DDDDDDDD..',
  '...DD..DD...',
  '...DD..DD...',
]

const KITTY_A = [
  '.OO......OO.',
  '.OPO....OPO.',
  '.OOOOOOOOOO.',
  'OOOOOOOOOOOO',
  'OOBOOOOOOBOO',
  'OOOOOOOOOOOO',
  'OOOOOPPOOOOO',
  '.OOWWWWWWOO.',
  '.OOOWWWWOOO.',
  '..OOOOOOOO..',
  '...OO..OO...',
  '...OO..OO...',
]
const KITTY_B = [
  '.OO......OO.',
  '.OPO....OPO.',
  '.OOOOOOOOOO.',
  'OOOOOOOOOOOO',
  'OOBOOOOOOBOO',
  'OOOOOOOOOOOO',
  'OOOOOPPOOOOO',
  '.OOWWWWWWOO.',
  '.OOOWWWWOOO.',
  '..OOOOOOOO..',
  '..OO....OO..',
  '..OO....OO..',
]

const DINO_A = [
  '....GGGGGG..',
  '...GGGGGGGG.',
  '...GBGGGGGG.',
  '...GGGGGGGG.',
  '...GGGGRRRR.',
  'G..GGGGG....',
  'GG.GGGGGGG..',
  'GGGGGGGGG...',
  '.GGGGGGGG...',
  '..GGGGGG....',
  '..GG..GG....',
  '..GG..GG....',
]
const DINO_B = [
  '....GGGGGG..',
  '...GGGGGGGG.',
  '...GBGGGGGG.',
  '...GGGGGGGG.',
  '...GGGGRRRR.',
  'G..GGGGG....',
  'GG.GGGGGGG..',
  'GGGGGGGGG...',
  '.GGGGGGGG...',
  '..GGGGGG....',
  '.GG....GG...',
  '.GG....GG...',
]

export const HEROES: Record<HeroId, HeroDef> = {
  chomper: {
    id: 'chomper',
    name: 'Chomper',
    frames: [CHOMPER_OPEN, CHOMPER_CLOSED],
    palette: { Y: '#ffd23f', B: '#3a2800' },
    rotates: true,
  },
  robo: {
    id: 'robo',
    name: 'Robo',
    frames: [ROBO_A, ROBO_B],
    palette: { D: '#2e6fd8', S: '#9ad8ff', B: '#15254a', R: '#ff5f5f' },
    rotates: false,
  },
  kitty: {
    id: 'kitty',
    name: 'Kitty',
    frames: [KITTY_A, KITTY_B],
    palette: { O: '#ff9d3b', P: '#ff6ba0', B: '#3a2000', W: '#fff3df' },
    rotates: false,
  },
  dino: {
    id: 'dino',
    name: 'Dino',
    frames: [DINO_A, DINO_B],
    palette: { G: '#5fd068', B: '#123a16', R: '#ff8b5f' },
    rotates: false,
  },
}

// ============================== BADDIES ==============================

const GHOSTY = [
  '...GGGGGG...',
  '..GGGGGGGG..',
  '.GGGGGGGGGG.',
  '.GWWGGGGWWG.',
  '.GWPGGGGWPG.',
  '.GGGGGGGGGG.',
  '.GGGGGGGGGG.',
  '.GGGGGGGGGG.',
  '.GGGGGGGGGG.',
  '.GGGGGGGGGG.',
  '.GG.GGGG.GG.',
  '.G...GG...G.',
]

const SLIMEY = [
  '............',
  '............',
  '....SSSS....',
  '..SSSSSSSS..',
  '.SSSSSSSSSS.',
  '.SWBSSSSWBS.',
  'SSSSSSSSSSSS',
  'SSSSSBBSSSSS',
  'SSSSSSSSSSSS',
  'SSSSSSSSSSSS',
  '.SSSSSSSSSS.',
  '..SS.SS.SS..',
]

const BATTY = [
  '............',
  'V..........V',
  'VV...VV...VV',
  'VVV.VVVV.VVV',
  'VVVVVVVVVVVV',
  '.VVWVVVVWVV.',
  '.VVBVVVVBVV.',
  '..VVVVVVVV..',
  '..VVWVVWVV..',
  '...VVVVVV...',
  '....V..V....',
  '............',
]

export interface EnemyDef {
  name: string
  map: string[]
  palette: Record<string, string>
}

export const ENEMIES: EnemyDef[] = [
  {
    name: 'Ghosty',
    map: GHOSTY,
    palette: { G: '#ff5f7a', W: '#ffffff', P: '#2c2c6e' },
  },
  {
    name: 'Slimey',
    map: SLIMEY,
    palette: { S: '#6fdc5a', W: '#ffffff', B: '#1c4a12' },
  },
  {
    name: 'Batty',
    map: BATTY,
    palette: { V: '#a06bff', W: '#ffffff', B: '#2a1052' },
  },
]
