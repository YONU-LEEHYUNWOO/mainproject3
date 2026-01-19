/**
 * API 응답 관련 타입 정의
 */
export interface ApiResponse<T = any> {
  status: number
  message: string
  data: T
}

export interface ApiError {
  status: number
  message: string
  detail?: string | Array<{ loc: string[]; msg: string; type: string }>
  data?: null
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
