import type { Operation } from '@/types/drill'

/**
 * Abacus-geared problem generation. Each technique maps to a real soroban
 * skill so the game teaches bead thinking, not just arithmetic:
 *  - direct:   plain bead slides, no complements (2+2, 6+3)
 *  - five:     five-complements (4+3 → +5−2)
 *  - ten:      ten-complements (8+6 → +10−4, 12−7 → −10+3)
 *  - twodigit: two-digit ± one-digit with carries/borrows
 *  - plain:    regular mental-math mix-ins for higher levels
 */
export type Technique = 'direct' | 'five' | 'ten' | 'twodigit' | 'plain' | 'challenge'
export type MathLevel = 1 | 2 | 3 | 4 | 5
export type OpsChoice = 'add' | 'sub' | 'mixed'

export interface ArcadeProblem {
  a: number
  b: number
  op: Operation
  /** challenge problems chain a second step: a op b op2 c */
  c?: number
  op2?: Operation
  answer: number
  technique: Technique
  /** 'count' shows a objects to count; 'equation' is normal math */
  kind?: 'count' | 'equation' | 'word' | 'tables'
  /** cute object to render for visual counting problems */
  emoji?: string
  prompt?: string
  answerText?: string
  choices?: string[]
}

/** harder techniques pay out more maze moves */
export const MOVES_FOR_TECHNIQUE: Record<Technique, number> = {
  direct: 4,
  five: 5,
  ten: 6,
  twodigit: 6,
  plain: 5,
  challenge: 10,
}

export function movesForProblem(p: ArcadeProblem): number {
  return MOVES_FOR_TECHNIQUE[p.technique]
}

export function problemText(p: ArcadeProblem): string {
  if (p.prompt) return p.prompt
  const sym = (op: Operation) => (op === 'add' ? '+' : '−')
  const tail = p.c != null && p.op2 ? ` ${sym(p.op2)} ${p.c}` : ''
  return `${p.a} ${sym(p.op)} ${p.b}${tail}`
}

export interface GeneratorOptions {
  mathLevel: MathLevel
  ops: OpsChoice
  maxAnswer: number
}

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T,>(arr: T[]): T => arr[rand(0, arr.length - 1)]

export function techniquesForMathLevel(level: MathLevel): Technique[] {
  switch (level) {
    case 1:
      return ['direct']
    case 2:
      return ['direct', 'five']
    case 3:
      return ['five', 'ten', 'direct']
    case 4:
      return ['ten', 'twodigit', 'five']
    default:
      return ['twodigit', 'ten', 'five', 'plain']
  }
}

function pickOp(ops: OpsChoice): Operation {
  if (ops === 'mixed') return Math.random() < 0.5 ? 'add' : 'sub'
  return ops
}

export function generateProblem(opts: GeneratorOptions): ArcadeProblem {
  let techs = techniquesForMathLevel(opts.mathLevel)
  if (opts.maxAnswer <= 10) techs = techs.filter((t) => t !== 'twodigit')
  const technique = pick<Technique>(techs.length ? techs : ['direct', 'five'])
  const op = pickOp(opts.ops)
  const max = opts.maxAnswer
  let a: number
  let b: number

  if (technique === 'direct') {
    if (op === 'add') {
      if (Math.random() < 0.2) {
        a = rand(0, 4)
        b = 5 // straight onto the heaven bead
      } else {
        do {
          a = rand(0, 8)
          b = rand(1, 4)
        } while ((a % 5) + b > 4)
      }
    } else {
      if (Math.random() < 0.2) {
        a = rand(5, 9)
        b = 5
      } else {
        do {
          a = rand(1, 9)
          b = rand(1, 4)
        } while (a % 5 < b)
      }
    }
  } else if (technique === 'five') {
    if (op === 'add') {
      // crosses the 5 within one rod: 3+4 → +5−1
      do {
        a = rand(1, 4)
        b = rand(1, 4)
      } while (a + b <= 4 || a + b > 9)
    } else {
      // needs the 5 back: 6−2 → −5+3
      do {
        a = rand(5, 9)
        b = rand(1, 4)
      } while (a % 5 >= b)
    }
  } else if (technique === 'ten') {
    if (op === 'add') {
      do {
        a = rand(2, 9)
        b = rand(2, 9)
      } while (a + b < 10 || a + b > Math.min(18, max))
    } else {
      do {
        a = rand(10, Math.min(19, max))
        b = rand(2, 9)
      } while (a % 10 >= b)
    }
  } else if (technique === 'twodigit') {
    if (op === 'add') {
      do {
        a = rand(10, max - 1)
        b = rand(1, 9)
      } while (a + b > max)
    } else {
      a = rand(11, max)
      b = rand(1, 9)
    }
  } else {
    // plain mental-math mix-in
    if (op === 'add') {
      do {
        a = rand(1, max - 1)
        b = rand(1, max - 1)
      } while (a + b > max)
    } else {
      a = rand(2, max)
      b = rand(1, a - 1)
    }
  }

  const answer = op === 'add' ? a + b : a - b
  return { a, b, op, answer, technique }
}

/**
 * Extra-hard optional problem: a three-step chain (a ± b ± c) the player can
 * take on for a big move payout. One try only — that's the gamble.
 */
export function generateChallenge(opts: GeneratorOptions): ArcadeProblem {
  const max = opts.maxAnswer
  let a: number, b: number, c: number, op: Operation, op2: Operation
  do {
    a = rand(3, max)
    op = pickOp(opts.ops)
    b = rand(2, 9)
    op2 = pickOp(opts.ops)
    c = rand(2, 9)
  } while (!challengeFits(a, b, c, op, op2, max))
  const mid = op === 'add' ? a + b : a - b
  const answer = op2 === 'add' ? mid + c : mid - c
  return { a, b, c, op, op2, answer, technique: 'challenge' }
}

function challengeFits(
  a: number,
  b: number,
  c: number,
  op: Operation,
  op2: Operation,
  max: number,
): boolean {
  const mid = op === 'add' ? a + b : a - b
  if (mid < 0 || mid > max) return false
  const answer = op2 === 'add' ? mid + c : mid - c
  return answer >= 0 && answer <= max
}

// ---- gentle problems for Little Counters mode (age ~5) ----

const COUNT_EMOJI = ['🍓', '🍎', '🐟', '🌼', '⭐', '🧁']

export interface EarlyProblemCfg {
  kind: 'early'
  /** chance a problem is pure counting instead of addition */
  countChance: number
  countMin: number
  countMax: number
  /** addition sums stay at or under this (0 = counting only) */
  sumCap: number
}

export interface SumProblemCfg {
  kind: 'sum'
  cap: number
  /** allow sums that cross a ten (needs the make-10 trick) */
  tenCross: boolean
}

export interface TechProblemCfg {
  kind: 'tech'
  mathLevel: MathLevel
  ops: OpsChoice
  maxAnswer: number
}

export interface WordsProblemCfg {
  kind: 'words'
  level: number
}

export interface TablesProblemCfg {
  kind: 'tables'
  maxFactor: number
}

export interface StandardProblemCfg {
  kind: 'standard'
  maxAnswer: number
  ops: OpsChoice
}

export type ProblemCfg =
  | EarlyProblemCfg
  | SumProblemCfg
  | TechProblemCfg
  | WordsProblemCfg
  | TablesProblemCfg
  | StandardProblemCfg

const WORD_BANK = [
  'cat',
  'dog',
  'sun',
  'fox',
  'pig',
  'bat',
  'fish',
  'frog',
  'star',
  'moon',
  'tree',
  'book',
  'cake',
  'ship',
  'train',
  'apple',
  'happy',
  'green',
  'little',
  'friend',
]

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

function makeChoices(answer: string, pool: string[], count = 4) {
  const choices = new Set([answer])
  while (choices.size < count) choices.add(pick(pool))
  return shuffle([...choices])
}

function shuffle<T>(items: T[]) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand(0, i)
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out
}

function generateWordProblem(level: number): ArcadeProblem {
  const words = WORD_BANK.slice(0, Math.min(WORD_BANK.length, 6 + level * 2))
  const word = pick(words)
  const missing = rand(0, word.length - 1)
  const answerText = word[missing]
  const prompt = `${word.slice(0, missing)}_${word.slice(missing + 1)}`
  return {
    a: 0,
    b: 0,
    op: 'add',
    answer: 0,
    answerText,
    choices: makeChoices(answerText, LETTERS),
    prompt,
    technique: 'plain',
    kind: 'word',
  }
}

function generateTableProblem(maxFactor: number): ArcadeProblem {
  const a = rand(1, maxFactor)
  const b = rand(1, maxFactor)
  return {
    a,
    b,
    op: 'add',
    answer: a * b,
    prompt: `${a} × ${b}`,
    technique: 'plain',
    kind: 'tables',
  }
}

function generateStandardProblem(cfg: StandardProblemCfg): ArcadeProblem {
  const op = pickOp(cfg.ops)
  let a: number
  let b: number
  if (op === 'add') {
    a = rand(1, cfg.maxAnswer - 1)
    b = rand(1, cfg.maxAnswer - a)
  } else {
    a = rand(2, cfg.maxAnswer)
    b = rand(1, a - 1)
  }
  return { a, b, op, answer: op === 'add' ? a + b : a - b, technique: 'plain', kind: 'equation' }
}

export function generateFromCfg(cfg: ProblemCfg): ArcadeProblem {
  if (cfg.kind === 'words') return generateWordProblem(cfg.level)
  if (cfg.kind === 'tables') return generateTableProblem(cfg.maxFactor)
  if (cfg.kind === 'standard') return generateStandardProblem(cfg)
  if (cfg.kind === 'tech') {
    return generateProblem({
      mathLevel: cfg.mathLevel,
      ops: cfg.ops,
      maxAnswer: cfg.maxAnswer,
    })
  }
  if (cfg.kind === 'sum') {
    let a: number, b: number
    do {
      a = rand(1, cfg.cap - 1)
      b = rand(1, Math.min(9, cfg.cap - 1))
    } while (a + b > cfg.cap || (!cfg.tenCross && (a % 10) + (b % 10) >= 10))
    const problem: ArcadeProblem = {
      a,
      b,
      op: 'add',
      answer: a + b,
      technique: (a % 10) + (b % 10) >= 10 ? 'ten' : 'direct',
      kind: 'equation',
    }
    if (a <= 5 && b <= 5) problem.emoji = pick(COUNT_EMOJI)
    return problem
  }
  // 'early': counting or tiny visual addition
  if (cfg.sumCap === 0 || Math.random() < cfg.countChance) {
    const count = rand(cfg.countMin, cfg.countMax)
    return {
      a: count,
      b: 0,
      op: 'add',
      answer: count,
      technique: 'direct',
      kind: 'count',
      emoji: pick(COUNT_EMOJI),
    }
  }
  let a: number, b: number
  do {
    a = rand(1, cfg.sumCap - 1)
    b = rand(1, cfg.sumCap - 1)
  } while (a + b > cfg.sumCap)
  return {
    a,
    b,
    op: 'add',
    answer: a + b,
    technique: 'direct',
    kind: 'equation',
    emoji: pick(COUNT_EMOJI),
  }
}

// ---- delta stream for Number Rain mode: one falling ±N at a time ----

export interface DeltaOptions {
  mathLevel: MathLevel
  ops: OpsChoice
  maxAnswer: number
  current: number
}

export interface DeltaStep {
  op: Operation
  amount: number
  next: number
  technique: Technique
}

/**
 * Pick a falling operation (+5, −3, …) that keeps the running total in
 * range AND exercises the bead techniques for the chosen math level.
 */
export function generateDelta(opts: DeltaOptions): DeltaStep {
  const { mathLevel, maxAnswer, current } = opts
  const allowed = new Set(techniquesForMathLevel(mathLevel))
  const wildcard = allowed.has('plain')
  const opsAllowed: Operation[] =
    opts.ops === 'mixed' ? ['add', 'sub'] : [opts.ops]
  const maxAmt = mathLevel >= 4 ? Math.min(19, maxAnswer) : 9

  const candidates: DeltaStep[] = []
  for (const op of opsAllowed) {
    for (let amount = 1; amount <= maxAmt; amount++) {
      const next = op === 'add' ? current + amount : current - amount
      if (next < 0 || next > maxAnswer) continue
      const crossTen = Math.floor(current / 10) !== Math.floor(next / 10)
      const crossFive = !crossTen && (current % 10 < 5) !== (next % 10 < 5)
      const technique: Technique = crossTen
        ? amount > 9
          ? 'twodigit'
          : 'ten'
        : amount === 5
          ? 'direct' // ±5 is one heaven-bead slide
          : crossFive
            ? 'five'
            : 'direct'
      if (wildcard || allowed.has(technique)) {
        candidates.push({ op, amount, next, technique })
      }
    }
  }
  if (candidates.length) return pick(candidates)

  // safety net: any in-range small step
  for (const op of opsAllowed) {
    for (let amount = 1; amount <= 9; amount++) {
      const next = op === 'add' ? current + amount : current - amount
      if (next >= 0 && next <= maxAnswer)
        candidates.push({ op, amount, next, technique: 'direct' })
    }
  }
  return pick(candidates)
}

export function beadHint(p: ArcadeProblem, techniqueHints = true): string {
  const sym = p.op === 'add' ? '+' : '−'
  const friendOfFive = 5 - p.b
  const friendOfTen = 10 - p.b
  if (p.kind === 'word') {
    return `Say the word out loud, then choose the missing letter.`
  }
  if (p.kind === 'tables') {
    return `Think of ${p.a} groups with ${p.b} in each group.`
  }
  if (p.kind === 'count') {
    return `Count them one by one — slide one blue bead up for each ${p.emoji ?? 'one'}!${p.answer > 5 ? ' The gold bead counts as 5!' : ''}`
  }
  if (p.emoji) {
    return `Count all the ${p.emoji} together — slide a bead for each one!`
  }
  if (p.technique === 'challenge' && p.c != null && p.op2) {
    const mid = p.op === 'add' ? p.a + p.b : p.a - p.b
    return `Two steps! First ${p.a} ${sym} ${p.b} = ${mid}, then ${mid} ${p.op2 === 'add' ? '+' : '−'} ${p.c}.`
  }
  const generic =
    p.op === 'add'
      ? `${p.a} ${sym} ${p.b} means start at ${p.a} and add ${p.b} more.`
      : `${p.a} ${sym} ${p.b} means take ${p.b} away from ${p.a}.`
  if (!techniqueHints) return generic

  if (p.technique === 'five') {
    return p.op === 'add'
      ? `${friendOfFive} is ${p.b}'s 5's friend. Push 5 down, then take away ${friendOfFive}.`
      : `${friendOfFive} is ${p.b}'s 5's friend. Lift the 5 bead up, then give back ${friendOfFive}.`
  }
  if (p.technique === 'ten') {
    return p.op === 'add'
      ? `${friendOfTen} is ${p.b}'s 10's friend. Add 10, then take away ${friendOfTen}.`
      : `${friendOfTen} is ${p.b}'s 10's friend. Take away 10, then add back ${friendOfTen}.`
  }
  if (p.technique === 'direct') {
    return p.op === 'add'
      ? `Just slide ${p.b === 5 ? 'the 5 bead down' : `${p.b} ones beads up`}!`
      : `Just slide ${p.b === 5 ? 'the 5 bead up' : `${p.b} ones beads down`}!`
  }
  return generic
}
