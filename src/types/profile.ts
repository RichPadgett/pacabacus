export type AgeTier = 'explorer' | 'builder' | 'master'

export interface Profile {
  id: string
  name: string
  ageTier: AgeTier
  createdAt: number
}

export const AGE_TIERS: { tier: AgeTier; label: string; ageRange: string }[] = [
  { tier: 'explorer', label: 'Explorer', ageRange: '5–10' },
  { tier: 'builder', label: 'Builder', ageRange: '11–15' },
  { tier: 'master', label: 'Master', ageRange: '16+' },
]
