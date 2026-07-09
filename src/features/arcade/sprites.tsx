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
  | 'monkey'
  | 'dino'
  | 'dog'
  | 'fox'
  | 'snake'
  | 'turtle'
  | 'chick'
  | 'axolotl'
  | 'rooster'
  | 'lamby'
  | 'lion'
  | 'strawbat'
  | 'orca'
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

const MONKEY_A = [
  '..BB....BB..',
  '.BSSBBBBSSB.',
  '.BSBBBBBBSB.',
  'BBBBBBBBBBBB',
  'BBFBBBBBBFBB',
  'BBFBFFFFBFBB',
  'BBBFFFFFFBBB',
  'BBBBFPPFBBBB',
  '.BBBBBBBBBB.',
  '..BBBBBBBB..',
  '...BB..BB...',
  '...BB..BB...',
]
const MONKEY_B = [
  '..BB....BB..',
  '.BSSBBBBSSB.',
  '.BSBBBBBBSB.',
  'BBBBBBBBBBBB',
  'BBFBBBBBBFBB',
  'BBFBFFFFBFBB',
  'BBBFFFFFFBBB',
  'BBBBFPPFBBBB',
  '.BBBBBBBBBB.',
  '..BBBBBBBB..',
  '..BB....BB..',
  '..BB....BB..',
]

const DOG_A = [
  '..DD....DD..',
  '.DDDD..DDDD.',
  '.DDDDDDDDDD.',
  'DDDDDDDDDDDD',
  'DDFDDDDDDIDD',
  'DDFDFFFFDIDD',
  'DDDFFFFFFDDD',
  'DDDDNNNNDDDD',
  '.DDDDDDDDDD.',
  '..DDDDDDDD..',
  '...DD..DD...',
  '...DD..DD...',
]
const DOG_B = [
  '..DD....DD..',
  '.DDDD..DDDD.',
  '.DDDDDDDDDD.',
  'DDDDDDDDDDDD',
  'DDFDDDDDDIDD',
  'DDFDFFFFDIDD',
  'DDDFFFFFFDDD',
  'DDDDNNNNDDDD',
  '.DDDDDDDDDD.',
  '..DDDDDDDD..',
  '..DD....DD..',
  '..DD....DD..',
]

const FOX_A = [
  '.O........O.',
  '.OO......OO.',
  '.OOO....OOO.',
  'OOOOOOOOOOOO',
  'OOWOOOOOOWOO',
  'OOWOBBBOWWOO',
  'OOOOFFFFOOOO',
  '.OOOFNNFOOO.',
  '..OOFFFFOO..',
  '...OOOOOO...',
  '..OO....OO..',
  '..OO....OO..',
]
const FOX_B = [
  '.O........O.',
  '.OO......OO.',
  '.OOO....OOO.',
  'OOOOOOOOOOOO',
  'OOWOOOOOOWOO',
  'OOWOBBBOWWOO',
  'OOOOFFFFOOOO',
  '.OOOFNNFOOO.',
  '..OOFFFFOO..',
  '...OOOOOO...',
  '...OO..OO...',
  '...OO..OO...',
]

const SNAKE_A = [
  '............',
  '...GGGGGG...',
  '..GGGGGGGG..',
  '.GGGBGGGGG..',
  '.GGGGGGGGG..',
  '..GGGGG.....',
  '....GGGGGG..',
  '......GGGGG.',
  '..GGGGGGGGG.',
  '.GGGGGGGG...',
  '............',
  '............',
]
const SNAKE_B = [
  '............',
  '....GGGGGG..',
  '...GGGGGGGG.',
  '..GGGBGGGGG.',
  '..GGGGGGGG..',
  '.....GGGGG..',
  '..GGGGGG....',
  '.GGGGG......',
  '.GGGGGGGGG..',
  '...GGGGGGG..',
  '............',
  '............',
]

const TURTLE_A = [
  '............',
  '....GGGG....',
  '...GFFFFG...',
  '..GFSFSFSG..',
  '.GGFFFFFFGG.',
  'GGGFFFFFFGGG',
  'GGBGFFFFGBGG',
  '.GGFFFFFFGG.',
  '..GGGGGGGG..',
  '.GG......GG.',
  '..GG....GG..',
  '............',
]
const TURTLE_B = [
  '............',
  '....GGGG....',
  '...GFFFFG...',
  '..GFSFSFSG..',
  '.GGFFFFFFGG.',
  'GGGFFFFFFGGG',
  'GGBGFFFFGBGG',
  '.GGFFFFFFGG.',
  '..GGGGGGGG..',
  '..GG....GG..',
  '.GG......GG.',
  '............',
]

const CHICK_A = [
  '............',
  '....YYY.....',
  '...YYYYY....',
  '..YYYYYYY...',
  '..YYBYYBYY..',
  '..YYYYYYY...',
  '...YYOYY....',
  '..YYYYYYY...',
  '.YYYYYYYYY..',
  '..YYYYYYY...',
  '...OO..OO...',
  '...OO..OO...',
]
const CHICK_B = [
  '............',
  '....YYY.....',
  '...YYYYY....',
  '..YYYYYYY...',
  '..YYBYYBYY..',
  '..YYYYYYY...',
  '...YYOYY....',
  '..YYYYYYY...',
  '.YYYYYYYYY..',
  '..YYYYYYY...',
  '..OO....OO..',
  '..OO....OO..',
]

const AXOLOTL_A = [
  '.P..R....R..',
  '.PP.RR..RR..',
  '..PPPPPPPP..',
  '.PPPPPPPPPP.',
  'PPBPPPPPPBPP',
  'PPPPPPPPPPPP',
  'PPPPRRPPPPPP',
  '.PPWWWWWWPP.',
  '..PPPPPPPP..',
  '..P.PPPP.P..',
  '..PP....PP..',
  '..PP....PP..',
]
const AXOLOTL_B = [
  '..R....R..P.',
  '..RR..RR.PP.',
  '..PPPPPPPP..',
  '.PPPPPPPPPP.',
  'PPBPPPPPPBPP',
  'PPPPPPPPPPPP',
  'PPPPRRPPPPPP',
  '.PPWWWWWWPP.',
  '..PPPPPPPP..',
  '..P.PPPP.P..',
  '...PP..PP...',
  '...PP..PP...',
]

const ROOSTER_A = [
  '....RRR.....',
  '...RYYY.....',
  '..YYYYYY....',
  '.YYBYYYYY...',
  '.YYYYOYYY...',
  '..YYYYYYY...',
  '...YYYYYY...',
  '..YWWYYYY...',
  '.YYWWYYYYY..',
  '..YYYYYYY...',
  '...OO..OO...',
  '...OO..OO...',
]
const ROOSTER_B = [
  '....RRR.....',
  '...RYYY.....',
  '..YYYYYY....',
  '.YYBYYYYY...',
  '.YYYYOYYY...',
  '..YYYYYYY...',
  '...YYYYYY...',
  '..YWWYYYY...',
  '.YYWWYYYYY..',
  '..YYYYYYY...',
  '..OO....OO..',
  '..OO....OO..',
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
  monkey: {
    id: 'monkey',
    name: 'Monkey',
    unlockLevel: 0,
    frames: [MONKEY_A, MONKEY_B],
    palette: { B: '#8b5a2b', S: '#c4864a', F: '#f4c28b', P: '#ff9ec6' },
    rotates: false,
  },
  dino: {
    id: 'dino',
    name: 'Dino',
    unlockLevel: 0,
    frames: [DINO_A, DINO_B],
    palette: { G: '#5fd068', B: '#123a16', R: '#ff8b5f' },
    rotates: false,
  },
  dog: {
    id: 'dog',
    name: 'Dog',
    unlockLevel: 2,
    frames: [DOG_A, DOG_B],
    palette: { D: '#b8753b', F: '#f2c18b', I: '#4b2a16', N: '#2a1508' },
    rotates: false,
  },
  fox: {
    id: 'fox',
    name: 'Fox',
    unlockLevel: 5,
    frames: [FOX_A, FOX_B],
    palette: { O: '#f97316', W: '#fff4df', B: '#2a1206', F: '#ffd3a3', N: '#3a1808' },
    rotates: false,
  },
  snake: {
    id: 'snake',
    name: 'Snake',
    unlockLevel: 8,
    frames: [SNAKE_A, SNAKE_B],
    palette: { G: '#6ee06a', B: '#153a16' },
    rotates: false,
  },
  turtle: {
    id: 'turtle',
    name: 'Turtle',
    unlockLevel: 11,
    frames: [TURTLE_A, TURTLE_B],
    palette: { G: '#59c96a', F: '#b7e26b', S: '#7a9f35', B: '#173b1e' },
    rotates: false,
  },
  chick: {
    id: 'chick',
    name: 'Chick',
    unlockLevel: 13,
    frames: [CHICK_A, CHICK_B],
    palette: { Y: '#ffd84d', B: '#3a2800', O: '#f97316' },
    rotates: false,
  },
  axolotl: {
    id: 'axolotl',
    name: 'Axolotl',
    unlockLevel: 15,
    frames: [AXOLOTL_A, AXOLOTL_B],
    palette: { P: '#ff9ec6', R: '#ff5f9f', B: '#4a1030', W: '#fff3fb' },
    rotates: false,
  },
  rooster: {
    id: 'rooster',
    name: 'Rooster',
    unlockLevel: 19,
    frames: [ROOSTER_A, ROOSTER_B],
    palette: { Y: '#f6c85f', R: '#ef4444', B: '#3a2800', O: '#f97316', W: '#fff7e6' },
    rotates: false,
  },
  lamby: {
    id: 'lamby',
    name: 'Lamby',
    unlockLevel: 22,
    frames: [LAMBY_A, LAMBY_B],
    palette: { W: '#fdf6ec', F: '#e8b98f', B: '#3a2410', P: '#ff9ec6' },
    rotates: false,
  },
  lion: {
    id: 'lion',
    name: 'Lion',
    unlockLevel: 25,
    frames: [LION_A, LION_B],
    palette: { M: '#d97a1f', F: '#ffcf6b', B: '#4a2800', N: '#a05a10' },
    rotates: false,
  },
  strawbat: {
    id: 'strawbat',
    name: 'Strawberry Bat',
    unlockLevel: 28,
    frames: [STRAWBAT_A, STRAWBAT_B],
    palette: { V: '#ff9ec6', R: '#ff4b6e', L: '#5fd068', W: '#ffffff', B: '#4a1030' },
    rotates: false,
  },
  orca: {
    id: 'orca',
    name: 'Orca',
    unlockLevel: 32,
    frames: [ORCA_A, ORCA_B],
    palette: { K: '#2c3a52', W: '#f5fbff', B: '#0c1420' },
    rotates: false,
  },
  robo: {
    id: 'robo',
    name: 'Robo',
    unlockLevel: 36,
    frames: [ROBO_A, ROBO_B],
    palette: { D: '#2e6fd8', S: '#9ad8ff', B: '#15254a', R: '#ff5f5f' },
    rotates: false,
  },
  elephant: {
    id: 'elephant',
    name: 'Elephant',
    unlockLevel: 40,
    frames: [ELEPHANT_A, ELEPHANT_B],
    palette: { E: '#a8b4c8', P: '#ff9ec6', B: '#2a3040', T: '#8894a8' },
    rotates: false,
  },
  chomper: {
    id: 'chomper',
    name: 'Chomper',
    unlockLevel: 44,
    frames: [CHOMPER_OPEN, CHOMPER_CLOSED],
    palette: { Y: '#ffd23f', B: '#3a2800' },
    rotates: true,
  },
}

export const CHARACTER_ORDER: HeroId[] = [
  'kitty',
  'monkey',
  'dino',
  'dog',
  'fox',
  'snake',
  'turtle',
  'chick',
  'axolotl',
  'rooster',
  'lamby',
  'lion',
  'strawbat',
  'orca',
  'robo',
  'elephant',
  'chomper',
]

export const STARTER_HERO_IDS: HeroId[] = ['kitty', 'monkey', 'dino']
export const BUDDY_ORDER: HeroId[] = CHARACTER_ORDER.filter(
  (id) => !STARTER_HERO_IDS.includes(id),
)
export const BUDDY_COSTS: Partial<Record<HeroId, number>> = {
  dog: 25,
  chick: 30,
  fox: 35,
  snake: 45,
  turtle: 55,
  axolotl: 60,
  rooster: 70,
  lamby: 80,
  lion: 90,
  strawbat: 100,
  orca: 110,
  robo: 120,
  elephant: 140,
  chomper: 160,
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
