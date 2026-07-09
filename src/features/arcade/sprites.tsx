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

// ============================== CHARACTERS ==============================

export type HeroId =
  | 'kitty'
  | 'lamby'
  | 'lion'
  | 'strawbat'
  | 'orca'
  | 'dino'
  | 'robo'
  | 'elephant'
  | 'chomper'

export interface HeroDef {
  id: HeroId
  name: string
  /** adventure level required to unlock (0 = available from the start) */
  unlockLevel: number
  /** two animation frames, swapped as the hero moves */
  frames: [string[], string[]]
  palette: Record<string, string>
  /** chomper-style heroes rotate to face travel direction; others just flip */
  rotates: boolean
}

const KITTY_A = [
  '.P...LL...P.',
  '.PP.LLLL.PP.',
  '.PPPLLLLPPP.',
  'PPPPPPPPPPPP',
  'PPBPPPPPPBPP',
  'PPPPPPPPPPPP',
  'PPPPPRRPPPPP',
  '.PPWWWWWWPP.',
  '.PPPWWWWPPP.',
  '..PPPPPPPP..',
  '...PP..PP...',
  '...PP..PP...',
]
const KITTY_B = [
  '.P...LL...P.',
  '.PP.LLLL.PP.',
  '.PPPLLLLPPP.',
  'PPPPPPPPPPPP',
  'PPBPPPPPPBPP',
  'PPPPPPPPPPPP',
  'PPPPPRRPPPPP',
  '.PPWWWWWWPP.',
  '.PPPWWWWPPP.',
  '..PPPPPPPP..',
  '..PP....PP..',
  '..PP....PP..',
]

const LAMBY_A = [
  '..WW....WW..',
  '.WWWW..WWWW.',
  '.WWWWWWWWWW.',
  'WWWWWWWWWWWW',
  'WWFFFFFFFFWW',
  'WWFBFFFFBFWW',
  'WWFFFFFFFFWW',
  'WWFFFPPFFFWW',
  '.WWWWWWWWWW.',
  '..WWWWWWWW..',
  '...WW..WW...',
  '...WW..WW...',
]
const LAMBY_B = [
  '..WW....WW..',
  '.WWWW..WWWW.',
  '.WWWWWWWWWW.',
  'WWWWWWWWWWWW',
  'WWFFFFFFFFWW',
  'WWFBFFFFBFWW',
  'WWFFFFFFFFWW',
  'WWFFFPPFFFWW',
  '.WWWWWWWWWW.',
  '..WWWWWWWW..',
  '..WW....WW..',
  '..WW....WW..',
]

const LION_A = [
  '.MM.MMMM.MM.',
  'MMMMMMMMMMMM',
  'MMFFFFFFFFMM',
  'MMFBFFFFBFMM',
  'MMFFFFFFFFMM',
  'MMFFFNNFFFMM',
  'MMFFNNNNFFMM',
  'MMFFFFFFFFMM',
  'MMMMMMMMMMMM',
  '.MM.MMMM.MM.',
  '...FF..FF...',
  '...FF..FF...',
]
const LION_B = [
  '.MM.MMMM.MM.',
  'MMMMMMMMMMMM',
  'MMFFFFFFFFMM',
  'MMFBFFFFBFMM',
  'MMFFFFFFFFMM',
  'MMFFFNNFFFMM',
  'MMFFNNNNFFMM',
  'MMFFFFFFFFMM',
  'MMMMMMMMMMMM',
  '.MM.MMMM.MM.',
  '..FF....FF..',
  '..FF....FF..',
]

const STRAWBAT_A = [
  '.....LL.....',
  'V...RRRR...V',
  'VV..RRRR..VV',
  'VVV.RRRR.VVV',
  'VVVVRRRRVVVV',
  '.VVWRRRRWVV.',
  '.VVBRRRRBVV.',
  '..VVRRRRVV..',
  '..VVRRRRVV..',
  '...VRRRRV...',
  '....R..R....',
  '............',
]
const STRAWBAT_B = [
  '.....LL.....',
  '....RRRR....',
  'V...RRRR...V',
  'VV..RRRR..VV',
  'VVVVRRRRVVVV',
  '.VVWRRRRWVV.',
  '.VVBRRRRBVV.',
  '.VVVRRRRVVV.',
  '..VVRRRRVV..',
  '...VRRRRV...',
  '....R..R....',
  '............',
]

const ORCA_A = [
  '............',
  '.....KK.....',
  '....KKKK....',
  '..KKKKKKKKK.',
  '.KKWWKKKKKKK',
  'KKKBKKKKKKKK',
  'KKKKKKKKKKKK',
  'KWWWWWWWKKKK',
  '.KWWWWWKKKK.',
  '..KKKKKKKK..',
  '....KK.KK...',
  '...KK...KK..',
]
const ORCA_B = [
  '............',
  '.....KK.....',
  '....KKKK....',
  '..KKKKKKKKK.',
  '.KKWWKKKKKKK',
  'KKKBKKKKKKKK',
  'KKKKKKKKKKKK',
  'KWWWWWWWKKKK',
  '.KWWWWWKKKK.',
  '..KKKKKKKK..',
  '...KK.KK....',
  '..KK...KK...',
]

const ELEPHANT_A = [
  '..EE....EE..',
  '.EPEE..EEPE.',
  '.EEEEEEEEEE.',
  'EEEEEEEEEEEE',
  'EEBEEEEEEBEE',
  'EEEEEEEEEEEE',
  '.EEEETTEEEE.',
  '..EEETTEEE..',
  '...EETTEE...',
  '....ETT.....',
  '...EE..EE...',
  '...EE..EE...',
]
const ELEPHANT_B = [
  '..EE....EE..',
  '.EPEE..EEPE.',
  '.EEEEEEEEEE.',
  'EEEEEEEEEEEE',
  'EEBEEEEEEBEE',
  'EEEEEEEEEEEE',
  '.EEEETTEEEE.',
  '..EEETTEEE..',
  '...EETTEE...',
  '.....TTE....',
  '..EE....EE..',
  '..EE....EE..',
]

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
  kitty: {
    id: 'kitty',
    name: 'Strawberry Kitty',
    unlockLevel: 0,
    frames: [KITTY_A, KITTY_B],
    palette: { P: '#ff9ec6', L: '#5fd068', B: '#4a1030', R: '#ff4b6e', W: '#fff3df' },
    rotates: false,
  },
  lamby: {
    id: 'lamby',
    name: 'Lamby',
    unlockLevel: 0,
    frames: [LAMBY_A, LAMBY_B],
    palette: { W: '#fdf6ec', F: '#e8b98f', B: '#3a2410', P: '#ff9ec6' },
    rotates: false,
  },
  lion: {
    id: 'lion',
    name: 'Lion',
    unlockLevel: 0,
    frames: [LION_A, LION_B],
    palette: { M: '#d97a1f', F: '#ffcf6b', B: '#4a2800', N: '#a05a10' },
    rotates: false,
  },
  strawbat: {
    id: 'strawbat',
    name: 'Strawberry Bat',
    unlockLevel: 4,
    frames: [STRAWBAT_A, STRAWBAT_B],
    palette: { V: '#ff9ec6', R: '#ff4b6e', L: '#5fd068', W: '#ffffff', B: '#4a1030' },
    rotates: false,
  },
  orca: {
    id: 'orca',
    name: 'Orca',
    unlockLevel: 7,
    frames: [ORCA_A, ORCA_B],
    palette: { K: '#2c3a52', W: '#f5fbff', B: '#0c1420' },
    rotates: false,
  },
  dino: {
    id: 'dino',
    name: 'Dino',
    unlockLevel: 10,
    frames: [DINO_A, DINO_B],
    palette: { G: '#5fd068', B: '#123a16', R: '#ff8b5f' },
    rotates: false,
  },
  robo: {
    id: 'robo',
    name: 'Robo',
    unlockLevel: 14,
    frames: [ROBO_A, ROBO_B],
    palette: { D: '#2e6fd8', S: '#9ad8ff', B: '#15254a', R: '#ff5f5f' },
    rotates: false,
  },
  elephant: {
    id: 'elephant',
    name: 'Elephant',
    unlockLevel: 18,
    frames: [ELEPHANT_A, ELEPHANT_B],
    palette: { E: '#a8b4c8', P: '#ff9ec6', B: '#2a3040', T: '#8894a8' },
    rotates: false,
  },
  chomper: {
    id: 'chomper',
    name: 'Chomper',
    unlockLevel: 22,
    frames: [CHOMPER_OPEN, CHOMPER_CLOSED],
    palette: { Y: '#ffd23f', B: '#3a2800' },
    rotates: true,
  },
}

export const CHARACTER_ORDER: HeroId[] = [
  'kitty',
  'lamby',
  'lion',
  'strawbat',
  'orca',
  'dino',
  'robo',
  'elephant',
  'chomper',
]

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
