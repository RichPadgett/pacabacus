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
  | 'penguin'
  | 'unicorn'
  | 'panda'
  | 'frog'
  | 'bee'
  | 'crab'
  | 'seal'
  | 'dragon'
  | 'meerkat'
  | 'otter'
  | 'beaver'
  | 'dolphin'
  | 'shark'
  | 'koala'
  | 'bunny'
  | 'robo'
  | 'elephant'
  | 'chomper'
  | 'starwhisker'
  | 'mooncalf'
  | 'coraldragon'
  | 'gearfox'
  | 'mewtwo'

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

const PENGUIN_A = [
  '....KKKK....',
  '...KKKKKK...',
  '..KKWWKKKK..',
  '..KWBWKBKK..',
  '.KKKWWKKKK..',
  '.KKWWWWKKK..',
  '.KKWWWWKKK..',
  '..KKOOO...K.',
  '..KKKKKK....',
  '...K..K.....',
  '..OO..OO....',
  '............',
]
const PENGUIN_B = [
  '....KKKK....',
  '...KKKKKK...',
  '..KKWWKKKK..',
  '..KWBWKBKK..',
  '.KKKWWKKKK..',
  '.KKWWWWKKK..',
  '.KKWWWWKKK..',
  'K...OOOKK...',
  '...KKKKKK...',
  '....K..K....',
  '...OO..OO...',
  '............',
]

const UNICORN_A = [
  '.....Y......',
  '....YYY.....',
  '..WWWWWWW...',
  '.WWPWWWWWW..',
  '.WWBWWWWBW..',
  '.WWWWWWWWW..',
  '..WWRRRWW...',
  '..VVVVVWW...',
  '.WWWWWWWW...',
  '...W..W.....',
  '..WW..WW....',
  '............',
]
const UNICORN_B = [
  '.....Y......',
  '....YYY.....',
  '..WWWWWWW...',
  '.WWPWWWWWW..',
  '.WWBWWWWBW..',
  '.WWWWWWWWW..',
  '..WWRRRWW...',
  '..VVVVVWW...',
  '.WWWWWWWW...',
  '..W....W....',
  '..WW..WW....',
  '............',
]

const PANDA_A = [
  '..KK....KK..',
  '.KKKWWWWKKK.',
  '.KKWWWWWWKK.',
  'KKWWKWWKWWKK',
  'KWWWBWWBWWWK',
  'KWWWWWWWWWWK',
  '.KWWKKKKWWK.',
  '..KKWWWWKK..',
  '..KWWWWWWK..',
  '...K....K...',
  '..KK....KK..',
  '............',
]
const PANDA_B = [
  '..KK....KK..',
  '.KKKWWWWKKK.',
  '.KKWWWWWWKK.',
  'KKWWKWWKWWKK',
  'KWWWBWWBWWWK',
  'KWWWWWWWWWWK',
  '.KWWKKKKWWK.',
  '..KKWWWWKK..',
  '..KWWWWWWK..',
  '..K......K..',
  '..KK....KK..',
  '............',
]

const FROG_A = [
  '..GG....GG..',
  '.GGBG..GBGG.',
  '.GGGGGGGGGG.',
  'GGGGGGGGGGGG',
  'GGWGGGGGGWGG',
  'GGGGGRRGGGGG',
  '.GGGGGGGGGG.',
  '..GGGGGGGG..',
  '..GGGGGGGG..',
  '.GG......GG.',
  '.GG......GG.',
  '............',
]
const FROG_B = [
  '..GG....GG..',
  '.GGBG..GBGG.',
  '.GGGGGGGGGG.',
  'GGGGGGGGGGGG',
  'GGWGGGGGGWGG',
  'GGGGGRRGGGGG',
  '.GGGGGGGGGG.',
  '..GGGGGGGG..',
  '..GGGGGGGG..',
  'GG........GG',
  '.GG......GG.',
  '............',
]

const BEE_A = [
  '....WWWW....',
  '..WW....WW..',
  '....YYYY....',
  '...YKKKKY...',
  '..YKYKYKYK..',
  '..YKKKKKKY..',
  '..YKYKYKYK..',
  '...YKKKKY...',
  '....YYYY....',
  '.....KK.....',
  '....K..K....',
  '............',
]
const BEE_B = [
  '..WW....WW..',
  '....WWWW....',
  '....YYYY....',
  '...YKKKKY...',
  '..YKYKYKYK..',
  '..YKKKKKKY..',
  '..YKYKYKYK..',
  '...YKKKKY...',
  '....YYYY....',
  '.....KK.....',
  '...K....K...',
  '............',
]

const CRAB_A = [
  'RR........RR',
  '.RR......RR.',
  '..RRRRRRRR..',
  '.RROORROORR.',
  'RRRRRRRRRRRR',
  'RRRRRRRRRRRR',
  '.RRRRRRRRRR.',
  '..RRRRRRRR..',
  '.RR.RR.RR.R.',
  'RR..RR..RR..',
  '............',
  '............',
]
const CRAB_B = [
  '.RR......RR.',
  'RR........RR',
  '..RRRRRRRR..',
  '.RROORROORR.',
  'RRRRRRRRRRRR',
  'RRRRRRRRRRRR',
  '.RRRRRRRRRR.',
  '..RRRRRRRR..',
  'R.RR.RR.RR..',
  '..RR..RR..RR',
  '............',
  '............',
]

const SEAL_A = [
  '....SSSS....',
  '...SSSSSS...',
  '..SSSSSSSS..',
  '.SSBSSSSBSS.',
  '.SSSSNNSSSS.',
  '..SSSSSSSS..',
  '..SSSSSSS...',
  '.SSSSSS.....',
  'SSSSSSSSS...',
  '..SS..SS....',
  '.SS....SS...',
  '............',
]
const SEAL_B = [
  '....SSSS....',
  '...SSSSSS...',
  '..SSSSSSSS..',
  '.SSBSSSSBSS.',
  '.SSSSNNSSSS.',
  '..SSSSSSSS..',
  '...SSSSSSS..',
  '.....SSSSSS.',
  '...SSSSSSSSS',
  '....SS..SS..',
  '...SS....SS.',
  '............',
]

const DRAGON_A = [
  '...GGGGG....',
  '..GGGGGGG...',
  '..GBGGGGB...',
  '..GGGGGGG...',
  '.GGGGRRRR...',
  'GGGGGGG..GG.',
  'GGGGGGGGGG..',
  '.GGGGGGGG...',
  '..GGGGGG....',
  '..GG..GG....',
  '.GG....GG...',
  '............',
]
const DRAGON_B = [
  '...GGGGG....',
  '..GGGGGGG...',
  '..GBGGGGB...',
  '..GGGGGGG...',
  '.GGGGRRRR...',
  '.GG..GGGGGGG',
  '..GGGGGGGGGG',
  '...GGGGGGG..',
  '....GGGGGG..',
  '....GG..GG..',
  '...GG....GG.',
  '............',
]

const KOALA_A = [
  '.TT......TT.',
  'TTT..SS..TTT',
  'TTSSSSSSSSTT',
  '.SSBSSSSBSS.',
  '.SSSSNNSSSS.',
  '..SSSSSSSS..',
  '..SSPPPPSS..',
  '...SSSSSS...',
  '...SSSSSS...',
  '....S..S....',
  '...SS..SS...',
  '............',
]
const KOALA_B = [
  '.TT......TT.',
  'TTT..SS..TTT',
  'TTSSSSSSSSTT',
  '.SSBSSSSBSS.',
  '.SSSSNNSSSS.',
  '..SSSSSSSS..',
  '..SSPPPPSS..',
  '...SSSSSS...',
  '...SSSSSS...',
  '...S....S...',
  '...SS..SS...',
  '............',
]

const BUNNY_A = [
  '..WW....WW..',
  '..WW....WW..',
  '..WWWWWWWW..',
  '.WWWWWWWWWW.',
  '.WWBWWWWBWW.',
  '.WWWWPPWWWW.',
  '..WWWWWWWW..',
  '..WWWWWWWW..',
  '...WWWWWW...',
  '...W....W...',
  '..WW....WW..',
  '............',
]
const BUNNY_B = [
  '..WW....WW..',
  '..WW....WW..',
  '..WWWWWWWW..',
  '.WWWWWWWWWW.',
  '.WWBWWWWBWW.',
  '.WWWWPPWWWW.',
  '..WWWWWWWW..',
  '..WWWWWWWW..',
  '...WWWWWW...',
  '..W......W..',
  '..WW....WW..',
  '............',
]

const MEERKAT_A = [
  '...MM..MM...',
  '..MMMMMMMM..',
  '.MMFFFFFFFF.',
  '.MMFBFFBFMM.',
  '.MMFFFFFFFF.',
  '..MMNNNNMM..',
  '..MMMMMMMM..',
  '...MMMMMM...',
  '...MM..MM...',
  '..MMM..MMM..',
  '..MM....MM..',
  '............',
]
const MEERKAT_B = [
  '...MM..MM...',
  '..MMMMMMMM..',
  '.MMFFFFFFFF.',
  '.MMFBFFBFMM.',
  '.MMFFFFFFFF.',
  '..MMNNNNMM..',
  '..MMMMMMMM..',
  '...MMMMMM...',
  '..MM....MM..',
  '..MMM..MMM..',
  '...MM..MM...',
  '............',
]

const OTTER_A = [
  '..OO....OO..',
  '.OOOOOOOOOO.',
  '.OOFOOOOFOO.',
  '.OOFBFFBFOO.',
  '.OOFFFFFFOO.',
  '..OOONNOOO..',
  '..OOOOOOOO..',
  '...OOOOWW...',
  '..OOOOWWWW..',
  '.OOOOOOWWW..',
  '..OO....OO..',
  '............',
]
const OTTER_B = [
  '..OO....OO..',
  '.OOOOOOOOOO.',
  '.OOFOOOOFOO.',
  '.OOFBFFBFOO.',
  '.OOFFFFFFOO.',
  '..OOONNOOO..',
  '..OOOOOOOO..',
  '..OOOOWWWW..',
  '.OOOOOOWWW..',
  '..OOOOWW....',
  '...OO..OO...',
  '............',
]

const BEAVER_A = [
  '..BB....BB..',
  '.BBBBBBBBBB.',
  '.BBFBBBBFBB.',
  '.BBFBFFBFBB.',
  '.BBBFFFFBBB.',
  '..BBTTTTBB..',
  '..BBTTTTBB..',
  '...BBBBBB...',
  '..BBRRRRBB..',
  '..BRRRRRRB..',
  '...BB..BB...',
  '............',
]
const BEAVER_B = [
  '..BB....BB..',
  '.BBBBBBBBBB.',
  '.BBFBBBBFBB.',
  '.BBFBFFBFBB.',
  '.BBBFFFFBBB.',
  '..BBTTTTBB..',
  '..BBTTTTBB..',
  '...BBBBBB...',
  '.BBRRRRRRBB.',
  '..BRRRRRRB..',
  '..BB....BB..',
  '............',
]

const DOLPHIN_A = [
  '............',
  '....DDDD....',
  '..DDDDDDDD..',
  '.DDDDDDDDDD.',
  'DDDDWDDDDDDD',
  'DDDBDDDDDDDF',
  '.DDDDDDDDDF.',
  '..DDDDDDDF..',
  '...DDDDDF...',
  '....D..D....',
  '...D....D...',
  '............',
]
const DOLPHIN_B = [
  '............',
  '...DDDD.....',
  '.DDDDDDDD...',
  'DDDDDDDDDD..',
  'DDDDWDDDDDD.',
  'DDDBDDDDDDF.',
  '.DDDDDDDDDF.',
  '..DDDDDDDF..',
  '...DDDDDF...',
  '...D....D...',
  '....D..D....',
  '............',
]

const SHARK_A = [
  '............',
  '....SSSS....',
  '..SSSSSSSS..',
  '.SSSSSSSSSS.',
  'SSSSWSSSSSSS',
  'SSSBSSSSSSSF',
  'SSSSSSSSSSFF',
  '.SSSTTTTSSF.',
  '..SSSSSSSF..',
  '...SSSSSF...',
  '....S..S....',
  '............',
]
const SHARK_B = [
  '............',
  '...SSSS.....',
  '.SSSSSSSS...',
  'SSSSSSSSSS..',
  'SSSSWSSSSSS.',
  'SSSBSSSSSSF.',
  'SSSSSSSSSFF.',
  '.SSSTTTTSSF.',
  '..SSSSSSSF..',
  '...SSSSSF...',
  '...S....S...',
  '............',
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
    unlockLevel: 6,
    frames: [MONKEY_A, MONKEY_B],
    palette: { B: '#8b5a2b', S: '#c4864a', F: '#f4c28b', P: '#ff9ec6' },
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
  dog: {
    id: 'dog',
    name: 'Puppy',
    unlockLevel: 0,
    frames: [DOG_A, DOG_B],
    palette: { D: '#b8753b', F: '#f2c18b', I: '#4b2a16', N: '#2a1508' },
    rotates: false,
  },
  fox: {
    id: 'fox',
    name: 'Fox',
    unlockLevel: 0,
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
    unlockLevel: 0,
    frames: [ORCA_A, ORCA_B],
    palette: { K: '#2c3a52', W: '#f5fbff', B: '#0c1420' },
    rotates: false,
  },
  penguin: {
    id: 'penguin',
    name: 'Penguin',
    unlockLevel: 4,
    frames: [PENGUIN_A, PENGUIN_B],
    palette: { K: '#1f2937', W: '#f8fafc', B: '#0f172a', O: '#f97316' },
    rotates: false,
  },
  unicorn: {
    id: 'unicorn',
    name: 'Unicorn',
    unlockLevel: 7,
    frames: [UNICORN_A, UNICORN_B],
    palette: { W: '#fff7ed', P: '#ff9ec6', B: '#3a205a', R: '#a78bfa', V: '#c084fc', Y: '#fde047' },
    rotates: false,
  },
  panda: {
    id: 'panda',
    name: 'Panda',
    unlockLevel: 9,
    frames: [PANDA_A, PANDA_B],
    palette: { K: '#1f2937', W: '#f8fafc', B: '#0f172a' },
    rotates: false,
  },
  frog: {
    id: 'frog',
    name: 'Frog',
    unlockLevel: 12,
    frames: [FROG_A, FROG_B],
    palette: { G: '#4ade80', B: '#0f3b1d', W: '#f7fee7', R: '#fb7185' },
    rotates: false,
  },
  bee: {
    id: 'bee',
    name: 'Bee',
    unlockLevel: 17,
    frames: [BEE_A, BEE_B],
    palette: { Y: '#facc15', K: '#1f2937', W: '#e0f2fe' },
    rotates: false,
  },
  crab: {
    id: 'crab',
    name: 'Crab',
    unlockLevel: 21,
    frames: [CRAB_A, CRAB_B],
    palette: { R: '#ef4444', O: '#fed7aa' },
    rotates: false,
  },
  seal: {
    id: 'seal',
    name: 'Seal',
    unlockLevel: 24,
    frames: [SEAL_A, SEAL_B],
    palette: { S: '#94a3b8', B: '#1e293b', N: '#334155' },
    rotates: false,
  },
  dragon: {
    id: 'dragon',
    name: 'Dragon',
    unlockLevel: 32,
    frames: [DRAGON_A, DRAGON_B],
    palette: { G: '#22c55e', B: '#123a16', R: '#fb7185' },
    rotates: false,
  },
  meerkat: {
    id: 'meerkat',
    name: 'Meerkat',
    unlockLevel: 34,
    frames: [MEERKAT_A, MEERKAT_B],
    palette: { M: '#c7904a', F: '#f4c28b', B: '#3a2410', N: '#7a4a22' },
    rotates: false,
  },
  otter: {
    id: 'otter',
    name: 'Otter',
    unlockLevel: 35,
    frames: [OTTER_A, OTTER_B],
    palette: { O: '#8b5a2b', F: '#f4c28b', B: '#2a1508', N: '#1f1208', W: '#dff6ff' },
    rotates: false,
  },
  beaver: {
    id: 'beaver',
    name: 'Beaver',
    unlockLevel: 37,
    frames: [BEAVER_A, BEAVER_B],
    palette: { B: '#7a4a22', F: '#d9a066', T: '#fff1c7', R: '#a16207' },
    rotates: false,
  },
  dolphin: {
    id: 'dolphin',
    name: 'Dolphin',
    unlockLevel: 39,
    frames: [DOLPHIN_A, DOLPHIN_B],
    palette: { D: '#60a5fa', W: '#e0f2fe', B: '#0f172a', F: '#3b82f6' },
    rotates: false,
  },
  shark: {
    id: 'shark',
    name: 'Shark',
    unlockLevel: 42,
    frames: [SHARK_A, SHARK_B],
    palette: { S: '#64748b', W: '#e2e8f0', B: '#0f172a', F: '#475569', T: '#ffffff' },
    rotates: false,
  },
  koala: {
    id: 'koala',
    name: 'Koala',
    unlockLevel: 38,
    frames: [KOALA_A, KOALA_B],
    palette: { S: '#9ca3af', T: '#6b7280', B: '#111827', N: '#374151', P: '#f9a8d4' },
    rotates: false,
  },
  bunny: {
    id: 'bunny',
    name: 'Bunny',
    unlockLevel: 48,
    frames: [BUNNY_A, BUNNY_B],
    palette: { W: '#fff7ed', B: '#3a2410', P: '#f9a8d4' },
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
  starwhisker: {
    id: 'starwhisker',
    name: 'Starwhisker',
    unlockLevel: 999,
    frames: [KITTY_A, KITTY_B],
    palette: { P: '#f9a8d4', L: '#fde047', B: '#2e1065', R: '#fef3c7', W: '#ffffff' },
    rotates: false,
  },
  mooncalf: {
    id: 'mooncalf',
    name: 'Mooncalf',
    unlockLevel: 999,
    frames: [LAMBY_A, LAMBY_B],
    palette: { W: '#dbeafe', F: '#bfdbfe', B: '#1e1b4b', P: '#c4b5fd' },
    rotates: false,
  },
  coraldragon: {
    id: 'coraldragon',
    name: 'Coral Dragon',
    unlockLevel: 999,
    frames: [DRAGON_A, DRAGON_B],
    palette: { G: '#fb7185', B: '#3b0764', R: '#fef08a' },
    rotates: false,
  },
  gearfox: {
    id: 'gearfox',
    name: 'Gear Fox',
    unlockLevel: 999,
    frames: [FOX_A, FOX_B],
    palette: { O: '#f59e0b', F: '#e2e8f0', B: '#0f172a', W: '#f8fafc', T: '#38bdf8' },
    rotates: false,
  },
  mewtwo: {
    id: 'mewtwo',
    name: 'Mewtwo of PacAbacus',
    unlockLevel: 999,
    frames: [CHOMPER_OPEN, CHOMPER_CLOSED],
    palette: { Y: '#c084fc', B: '#1e1b4b' },
    rotates: true,
  },
}

export const CHARACTER_ORDER: HeroId[] = [
  'dog',
  'kitty',
  'orca',
  'fox',
  'penguin',
  'monkey',
  'unicorn',
  'snake',
  'panda',
  'dino',
  'turtle',
  'frog',
  'chick',
  'axolotl',
  'bee',
  'rooster',
  'crab',
  'lamby',
  'seal',
  'lion',
  'strawbat',
  'dragon',
  'meerkat',
  'otter',
  'robo',
  'beaver',
  'koala',
  'dolphin',
  'elephant',
  'shark',
  'chomper',
  'bunny',
  'starwhisker',
  'mooncalf',
  'coraldragon',
  'gearfox',
  'mewtwo',
]

export const STARTER_HERO_IDS: HeroId[] = ['dog', 'kitty', 'orca', 'fox']
export const SECRET_HERO_IDS: HeroId[] = ['starwhisker', 'mooncalf', 'coraldragon', 'gearfox', 'mewtwo']
export const BUDDY_ORDER: HeroId[] = CHARACTER_ORDER.filter(
  (id) => !STARTER_HERO_IDS.includes(id) && !SECRET_HERO_IDS.includes(id),
)
export const BUDDY_COSTS: Partial<Record<HeroId, number>> = {
  chick: 30,
  penguin: 35,
  snake: 45,
  turtle: 55,
  axolotl: 60,
  unicorn: 65,
  rooster: 70,
  panda: 75,
  lamby: 80,
  frog: 85,
  lion: 90,
  bee: 95,
  strawbat: 100,
  crab: 105,
  seal: 115,
  robo: 120,
  dragon: 130,
  meerkat: 135,
  otter: 138,
  elephant: 140,
  beaver: 145,
  dolphin: 148,
  koala: 150,
  shark: 155,
  chomper: 160,
  bunny: 170,
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
