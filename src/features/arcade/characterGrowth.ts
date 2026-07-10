import type { AgeBand } from '@/features/learning/learningWorlds'

export type CharacterGrowthStage = 'baby' | 'kid' | 'guardian' | 'legend'
export type GhostSkill = 'none' | 'defend' | 'attack'

export interface CharacterGrowthProfile {
  stage: CharacterGrowthStage
  buddyStage: CharacterGrowthStage
  label: string
  shortLabel: string
  heroScale: number
  buddyScale: number
  powerBuddyScale: number
  ghostSkill: GhostSkill
}

export const GROWTH_STAGE_LABELS: Record<CharacterGrowthStage, string> = {
  baby: 'Baby',
  kid: 'Big Kid',
  guardian: 'Guardian',
  legend: 'Legend',
}

export function growthForAgeBand(ageBand: AgeBand): CharacterGrowthProfile {
  if (ageBand === 'little') {
    return {
      stage: 'baby',
      buddyStage: 'baby',
      label: 'Baby characters',
      shortLabel: 'Baby',
      heroScale: 0.76,
      buddyScale: 0.38,
      powerBuddyScale: 0.62,
      ghostSkill: 'none',
    }
  }
  if (ageBand === 'early') {
    return {
      stage: 'kid',
      buddyStage: 'baby',
      label: 'Growing characters',
      shortLabel: 'Grow',
      heroScale: 0.9,
      buddyScale: 0.52,
      powerBuddyScale: 0.72,
      ghostSkill: 'none',
    }
  }
  if (ageBand === 'growing') {
    return {
      stage: 'guardian',
      buddyStage: 'kid',
      label: 'Guardian characters',
      shortLabel: 'Guard',
      heroScale: 0.98,
      buddyScale: 0.6,
      powerBuddyScale: 0.82,
      ghostSkill: 'defend',
    }
  }
  return {
    stage: 'legend',
    buddyStage: 'guardian',
    label: 'Legend characters',
    shortLabel: 'Legend',
    heroScale: 1.05,
    buddyScale: 0.68,
    powerBuddyScale: 0.9,
    ghostSkill: 'attack',
  }
}
