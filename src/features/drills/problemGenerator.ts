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

export function beadHint(p: ArcadeProblem, techniqueHints = true): string {
  const sym = p.op === 'add' ? '+' : '−'
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
      ? `Not enough ones beads? Use the 5 bead! Push 5 down, then take away ${5 - p.b}.`
      : `Not enough ones beads? Lift the 5 bead up, then give back ${5 - p.b}.`
  }
  if (p.technique === 'ten') {
    return p.op === 'add'
      ? `Make 10! Add 10 on the tens rod, then take away ${10 - p.b}.`
      : `Break a 10! Take 10 away, then add back ${10 - p.b}.`
  }
  if (p.technique === 'direct') {
    return p.op === 'add'
      ? `Just slide ${p.b === 5 ? 'the 5 bead down' : `${p.b} ones beads up`}!`
      : `Just slide ${p.b === 5 ? 'the 5 bead up' : `${p.b} ones beads down`}!`
  }
  return generic
}
