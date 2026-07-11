import type { AgeBand } from '@/features/learning/learningWorlds'

export type CharacterGrowthStage = 'baby' | 'kid' | 'guardian' | 'legend' | 'master'

export interface CharacterGrowthProfile {
  stage: CharacterGrowthStage
  buddyStage: CharacterGrowthStage
  label: string
  shortLabel: string
  heroScale: number
  buddyScale: number
  powerBuddyScale: number
}

export const GROWTH_STAGE_LABELS: Record<CharacterGrowthStage, string> = {
  baby: 'Baby',
  kid: 'Big Kid',
  guardian: 'Guardian',
  legend: 'Legend',
  master: 'Master',
}

function profileForStage(
  stage: CharacterGrowthStage,
  buddyStage: CharacterGrowthStage,
): CharacterGrowthProfile {
  if (stage === 'baby') {
    return {
      stage,
      buddyStage,
      label: 'Baby characters',
      shortLabel: 'Baby',
      heroScale: 0.72,
      buddyScale: 0.34,
      powerBuddyScale: 0.58,
    }
  }
  if (stage === 'kid') {
    return {
      stage,
      buddyStage,
      label: 'Kid characters',
      shortLabel: 'Kid',
      heroScale: 0.88,
      buddyScale: 0.5,
      powerBuddyScale: 0.7,
    }
  }
  if (stage === 'guardian') {
    return {
      stage,
      buddyStage,
      label: 'Teen guardian characters',
      shortLabel: 'Teen',
      heroScale: 0.98,
      buddyScale: 0.6,
      powerBuddyScale: 0.82,
    }
  }
  if (stage === 'legend') {
    return {
      stage,
      buddyStage,
      label: 'Adult legend characters',
      shortLabel: 'Adult',
      heroScale: 1.05,
      buddyScale: 0.68,
      powerBuddyScale: 0.9,
    }
  }
  return {
    stage,
    buddyStage,
    label: 'Master characters',
    shortLabel: 'Master',
    heroScale: 1.12,
    buddyScale: 0.72,
    powerBuddyScale: 0.96,
  }
}

export function growthForProgress(_ageBand: AgeBand, level: number): CharacterGrowthProfile {
  if (level <= 5) return profileForStage('baby', 'baby')
  if (level <= 15) return profileForStage('kid', 'baby')
  if (level <= 25) return profileForStage('guardian', 'baby')
  if (level <= 35) return profileForStage('legend', 'kid')
  if (level <= 45) return profileForStage('legend', 'guardian')
  return profileForStage('master', 'legend')
}

export function buddyStageForUses(uses: number): CharacterGrowthStage {
  if (uses < 3) return 'baby'
  if (uses < 8) return 'kid'
  if (uses < 16) return 'guardian'
  if (uses < 30) return 'legend'
  return 'master'
}

export function buddyScaleForStage(stage: CharacterGrowthStage) {
  if (stage === 'baby') return 0.34
  if (stage === 'kid') return 0.5
  if (stage === 'guardian') return 0.6
  if (stage === 'legend') return 0.68
  return 0.72
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
    }
  }
  if (ageBand === 'big') {
    return {
      stage: 'legend',
      buddyStage: 'guardian',
      label: 'Legend characters',
      shortLabel: 'Legend',
      heroScale: 1.05,
      buddyScale: 0.68,
      powerBuddyScale: 0.9,
    }
  }
  return {
    stage: 'master',
    buddyStage: 'legend',
    label: 'Master characters',
    shortLabel: 'Master',
    heroScale: 1.12,
    buddyScale: 0.72,
    powerBuddyScale: 0.96,
  }
}
