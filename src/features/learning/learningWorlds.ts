import type { HeroId } from '@/features/arcade/sprites'

export type LearningWorldId = 'pacabacus'
export type AgeBand = 'little' | 'early' | 'growing' | 'big' | 'master'

export interface LearningChapter {
  name: string
  emoji: string
  detail: string
}

export const DEFAULT_WORLD_LEVELS: Record<LearningWorldId, number> = {
  pacabacus: 1,
}

export const WORLD_CHAPTERS: Record<LearningWorldId, LearningChapter[]> = {
  pacabacus: [
    { name: 'Berry Bead Park', emoji: '🍓', detail: 'Counting, small sums, and bead confidence' },
    { name: 'Friendship Forest', emoji: '🌲', detail: '5-friends and 10-friends with gentle pressure' },
    { name: 'Moon Bridge', emoji: '🌙', detail: 'Mixed moves and bigger bead patterns' },
    { name: 'Crystal Castle', emoji: '🏰', detail: 'Longer rooms with stronger soroban thinking' },
  ],
}

export function chapterForLevel(world: LearningWorldId, level: number) {
  const chapters = WORLD_CHAPTERS[world]
  const index = Math.min(chapters.length - 1, Math.max(0, Math.floor((level - 1) / 5)))
  return chapters[index]
}

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  little: 'Ages 4-5',
  early: 'Ages 6-7',
  growing: 'Ages 8-9',
  big: 'Ages 10-14',
  master: 'Ages 15+',
}

export function ageFromDateOfBirth(dateOfBirth?: string | null, now = new Date()) {
  if (!dateOfBirth) return null
  const dob = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(dob.getTime())) return null
  let age = now.getFullYear() - dob.getFullYear()
  const monthDelta = now.getMonth() - dob.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) age -= 1
  return Math.max(0, age)
}

export function ageBandFromDateOfBirth(dateOfBirth?: string | null): AgeBand {
  const age = ageFromDateOfBirth(dateOfBirth)
  if (age == null) return 'early'
  if (age <= 5) return 'little'
  if (age <= 7) return 'early'
  if (age <= 9) return 'growing'
  if (age <= 14) return 'big'
  return 'master'
}

export function trainerStartLevel(ageBand: AgeBand, _world: LearningWorldId) {
  if (ageBand === 'little') return 1
  if (ageBand === 'early') return 4
  if (ageBand === 'growing') return 9
  if (ageBand === 'big') return 14
  return 22
}

export const WORLD_CHARACTER_UNLOCKS: Record<LearningWorldId, HeroId[]> = {
  pacabacus: ['monkey', 'dino', 'snake', 'turtle', 'meerkat', 'elephant', 'chomper'],
}

export function characterUnlocksForWorld(world: LearningWorldId, level: number) {
  const roster = WORLD_CHARACTER_UNLOCKS[world]
  return roster.filter((_, index) => level >= (index + 1) * 3)
}
