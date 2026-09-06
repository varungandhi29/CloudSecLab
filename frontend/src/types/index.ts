export interface User {
  id: string
  username: string
  email: string
  full_name: string
  total_xp: number
  current_level: number
  streak_days: number
  country?: string
  bio?: string
  created_at?: string
}

export interface LevelSummary {
  level_id: number
  title: string
  track: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category?: string
  cloud_platform?: 'aws' | 'azure' | 'gcp' | 'multi-cloud'
  xp_reward: number
  estimated_minutes: number
  status: 'locked' | 'unlocked' | 'completed'
  theory_completed: boolean
  lab_completed: boolean
  problem_solving_score: number
}

export interface Section {
  heading: string
  content: string
  type: 'text' | 'callout' | 'code'
  callout_type?: 'info' | 'warning' | 'danger' | 'success'
}

export interface KeyTerm {
  term: string
  definition: string
}

export interface TaskQuestion {
  type: 'multiple_choice' | 'text_input'
  text: string
  options?: string[]
  correct?: number
  correct_answer?: string
  accepted_answers?: string[]
  explanation: string
}

export interface Task {
  task_number: number
  title: string
  description: string
  question: TaskQuestion
}

export interface LabStep {
  step: number
  instruction: string
  command: string
  expected_output_contains?: string
  explanation?: string
}

export interface ValidationSpec {
  type: string
  check?: string
  expected_contains?: string
  question?: string
  correct_answer?: string
  accepted_answers?: string[]
  case_sensitive?: boolean
}

export interface ForensicsQuestion {
  question_number?: number
  text?: string
  question?: string
  correct_answer?: string
  accepted_answers?: string[]
  correct?: string
  hint?: string
}

export interface LevelDetail {
  level_id: number
  title: string
  track: string
  category?: string
  cloud_platform?: string
  xp_reward: number
  estimated_minutes: number
  prerequisites?: number[]
  theory: {
    intro?: string
    sections: Section[]
    key_terms?: KeyTerm[]
  }
  tasks?: Task[]
  lab: {
    title?: string
    scenario?: string
    objective: string
    setup_commands: string[]
    steps?: LabStep[]
    validation: ValidationSpec
    hints: string[]
  }
  problem_solving?: {
    questions: Array<{
      id: number
      type: 'multiple_choice' | 'policy_analysis' | 'scenario'
      question: string
      options?: string[]
      correct?: string
      policy?: any
      explanation?: string
    }>
    passing_score: number
  }
  forensics?: {
    enabled: boolean
    scenario: string
    log_entries?: any[]
    log_data?: any[]
    questions: ForensicsQuestion[]
  }
  user_progress: {
    status: string
    theory_completed: boolean
    demo_completed: boolean
    lab_completed: boolean
    hints_used: number
    problem_solving_score: number
    forensics_completed: boolean
  }
}

export interface ExamSummary {
  exam_id: string
  title: string
  track: string
  duration_minutes: number
  passing_score: number
  unlocks_after_level: number
  is_unlocked: boolean
  attempts_used: number
  max_attempts: number
  passed: boolean
  latest_score?: number
}

export interface CertificateItem {
  id: string
  certificate_type: string
  verification_id: string
  issued_at: string
  user_full_name: string
  exam_score: number
  pdf_path?: string
}

export interface LeaderboardEntry {
  rank: number
  username: string
  full_name: string
  country: string
  total_xp: number
  completed_levels: number
  certificates_count: number
  streak_days: number
}
