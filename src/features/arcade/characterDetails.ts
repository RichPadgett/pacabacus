import type { HeroId } from './sprites'

export interface CharacterDetail {
  title: string
  personality: string
  power: string
  rescueLine?: string
}

const details: Partial<Record<HeroId, CharacterDetail>> = {
  kitty: {
    title: 'Berry-brave starter',
    personality: 'Curious, gentle, and always ready to count one more fruit.',
    power: 'Spots friendly number patterns.',
  },
  dog: {
    title: 'Loyal trail buddy',
    personality: 'Happy, steady, and great at cheering after a hard problem.',
    power: 'Keeps the team moving when the maze gets busy.',
  },
  orca: {
    title: 'Ocean pathfinder',
    personality: 'Calm under pressure and brave around big waves.',
    power: 'Helps with long journeys between worlds.',
  },
  fox: {
    title: 'Clever puzzle scout',
    personality: 'Quick, playful, and good at noticing hidden routes.',
    power: 'Finds shortcuts through tricky rooms.',
  },
  monkey: {
    title: 'Tree-top counter',
    personality: 'Bouncy, silly, and happiest when numbers come in bunches.',
    power: 'Helps spot groups of five.',
  },
  dino: {
    title: 'Gentle stomper',
    personality: 'Big feet, soft heart, and a steady counting rhythm.',
    power: 'Stomps through long fruit trails.',
  },
  snake: {
    title: 'Pattern slider',
    personality: 'Quiet and twisty, with a talent for seeing number paths.',
    power: 'Slithers through tricky bead moves.',
  },
  turtle: {
    title: 'Slow-and-sure guardian',
    personality: 'Patient, careful, and never worried by a hard room.',
    power: 'Rewards slow, accurate thinking.',
  },
  chick: {
    title: 'Tiny pep captain',
    personality: 'Small, bright, and full of brave little chirps.',
    power: 'Makes early counting feel friendly.',
  },
  axolotl: {
    title: 'Bubble buddy',
    personality: 'Sweet, splashy, and curious about every new answer.',
    power: 'Keeps calm when the maze gets crowded.',
  },
  rooster: {
    title: 'Morning math caller',
    personality: 'Loud, proud, and ready to wake up the next level.',
    power: 'Calls attention to the next problem.',
  },
  lamby: {
    title: 'Cloud-soft helper',
    personality: 'Gentle and kind, but braver than baddies expect.',
    power: 'Softens stressful rescue moments.',
  },
  lion: {
    title: 'Courage king',
    personality: 'Bold, warm, and protective of every tiny buddy.',
    power: 'Brings courage during ghost fights.',
  },
  strawbat: {
    title: 'Berry-wing night scout',
    personality: 'A little spooky, a little sweet, and very loyal.',
    power: 'Finds fruit hiding near dark corners.',
  },
  penguin: {
    title: 'Ice-slide thinker',
    personality: 'Neat, cheerful, and fond of tidy patterns.',
    power: 'Slides through repeated facts.',
  },
  unicorn: {
    title: 'Sparkle problem friend',
    personality: 'Imaginative and bright, with a little extra magic.',
    power: 'Adds sparkle to tough retries.',
  },
  panda: {
    title: 'Snack-time strategist',
    personality: 'Relaxed, thoughtful, and excellent at taking turns.',
    power: 'Keeps practice peaceful.',
  },
  frog: {
    title: 'Hop-count hero',
    personality: 'Jumpy, cheerful, and quick with skip-counting.',
    power: 'Hops across number patterns.',
  },
  bee: {
    title: 'Busy fact finder',
    personality: 'Fast, focused, and always buzzing toward the answer.',
    power: 'Helps with multiplication facts.',
  },
  crab: {
    title: 'Side-step defender',
    personality: 'Snappy but sweet, with a funny sideways walk.',
    power: 'Dodges pressure in narrow halls.',
  },
  seal: {
    title: 'Splashy celebrator',
    personality: 'Playful, proud, and very good at clapping for wins.',
    power: 'Celebrates streaks and clean solves.',
  },
  dragon: {
    title: 'Little flame learner',
    personality: 'Fierce when needed, but secretly cuddly.',
    power: 'Burns through harder challenge problems.',
  },
  meerkat: {
    title: 'Lookout learner',
    personality: 'Alert, quick, and always checking the next turn.',
    power: 'Spots baddies early.',
  },
  otter: {
    title: 'River-route helper',
    personality: 'Playful and clever, with a pocket full of tricks.',
    power: 'Finds smooth routes through mazes.',
  },
  beaver: {
    title: 'Builder buddy',
    personality: 'Hardworking, practical, and proud of every solved step.',
    power: 'Builds confidence one answer at a time.',
  },
  dolphin: {
    title: 'Wave jumper',
    personality: 'Bright, social, and quick to leap into action.',
    power: 'Helps with fast mental jumps.',
  },
  shark: {
    title: 'Focus fin',
    personality: 'Intense, brave, and more friendly than it looks.',
    power: 'Cuts through big problem sets.',
  },
  koala: {
    title: 'Calm tree friend',
    personality: 'Cozy, quiet, and good at pausing to think.',
    power: 'Makes big problems feel smaller.',
  },
  bunny: {
    title: 'Quick-hop collector',
    personality: 'Fast, cheerful, and always ready for one more room.',
    power: 'Collects fruit with quick little hops.',
  },
  robo: {
    title: 'Number bot',
    personality: 'Friendly, logical, and learning how to be silly.',
    power: 'Checks patterns like a tiny computer.',
  },
  elephant: {
    title: 'Memory master',
    personality: 'Kind, strong, and great at remembering old tricks.',
    power: 'Remembers 5-friends and 10-friends.',
  },
  chomper: {
    title: 'Classic maze muncher',
    personality: 'Hungry, brave, and built for fruit rescue missions.',
    power: 'Turns maze movement into confidence.',
  },
  starwhisker: {
    title: 'Secret star kitten',
    personality: 'A tiny constellation friend with a very brave heart.',
    power: 'Makes rescue walls sparkle when they crack.',
    rescueLine: 'Starwhisker was hidden behind the first rescue wall and is ready to join your team.',
  },
  mooncalf: {
    title: 'Moonlit dream buddy',
    personality: 'Soft, sleepy, and surprisingly strong when friends need help.',
    power: 'Glows brighter after every careful answer.',
    rescueLine: 'Mooncalf waited quietly beyond the moon gate. You brought the light back.',
  },
  coraldragon: {
    title: 'Tiny reef guardian',
    personality: 'Bold, bright, and protective of every small friend.',
    power: 'Turns hard mistakes into another brave try.',
    rescueLine: 'Coral Dragon was trapped in the ocean wall. The reef has its guardian again.',
  },
  gearfox: {
    title: 'Clockwork problem solver',
    personality: 'Inventive, focused, and a little mysterious.',
    power: 'Sees the moving parts inside bigger math problems.',
    rescueLine: 'Gear Fox was locked in the machine room. Now those gears are working for you.',
  },
  mewtwo: {
    title: 'Super secret mind master',
    personality: 'Quiet, powerful, and only found by players who refuse to give up.',
    power: 'Carries the final spark of the whole PacAbacus journey.',
    rescueLine: 'You saved the super secret character. This is the legend at the end of the whole adventure.',
  },
}

export function characterDetailFor(id: HeroId): CharacterDetail {
  return details[id] ?? {
    title: 'Adventure friend',
    personality: 'A cheerful teammate with a knack for brave counting.',
    power: 'Adds extra courage to the next room.',
  }
}
