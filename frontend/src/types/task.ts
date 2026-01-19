/**
 * 일정 관련 타입 정의
 */
export interface Task {
  id: number
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  completed: boolean
  priority: number
  category: string
  created_at: string
  completed_at?: string
}

export interface TaskCreate {
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  priority?: number
  category?: string
}

export interface TaskUpdate {
  title?: string
  description?: string
  date?: string
  time?: string
  location?: string
  completed?: boolean
  priority?: number
  category?: string
}
