import type { AgeTier } from './profile'

export interface LessonStepExplain {
  type: 'explain'
  title: string
  body: string
}

export interface LessonStepDemo {
  type: 'demo'
  targetValue: number
  narration: string
}

export interface LessonStepPractice {
  type: 'practice'
  prompt: string
  targetValue: number
  hint?: string
}

export interface LessonStepQuiz {
  type: 'quiz'
  question: string
  answer: number
}

export type LessonStep =
  | LessonStepExplain
  | LessonStepDemo
  | LessonStepPractice
  | LessonStepQuiz

export interface Lesson {
  id: string
  tier: AgeTier
  title: string
  description: string
  rodCount: number
  steps: LessonStep[]
}
