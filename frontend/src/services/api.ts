import axios, { AxiosInstance, AxiosResponse } from 'axios'

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Axios 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // CORS 문제 해결을 위해 일단 false로 설정
  timeout: 10000, // 10초 타임아웃 추가
})

// 요청 인터셉터: 인증 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // 타임아웃 오류 처리
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('요청 타임아웃:', error)
      return Promise.reject(new Error('서버 응답 시간이 초과되었습니다. 다시 시도해주세요.'))
    }
    
    // 네트워크 오류 처리
    if (!error.response) {
      console.error('네트워크 오류:', error)
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        return Promise.reject(new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'))
      }
      return Promise.reject(new Error('네트워크 오류가 발생했습니다.'))
    }
    
    if (error.response?.status === 401) {
      // 인증 오류 시 토큰 제거 및 로그인 페이지로 리다이렉트
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    
    // 상세한 오류 메시지 전달
    const errorMessage = error.response?.data?.detail || error.message || '알 수 없는 오류가 발생했습니다.'
    console.error('API 오류:', {
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data
    })
    
    return Promise.reject(error)
  }
)

// 인증 API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),

  register: (userData: any) =>
    api.post('/api/auth/register', userData),

  getMe: (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    return api.get('/api/auth/me', { headers })
  },

  logout: () =>
    api.post('/api/auth/logout'),

  changePassword: (passwords: { current_password: string; new_password: string }) =>
    api.post('/api/auth/change-password', passwords),
}

// 일정 관리 API
export const tasksAPI = {
  getTasks: (params?: any) =>
    api.get('/api/tasks/', { params }),

  createTask: (task: any) =>
    api.post('/api/tasks/', task),

  getTask: (id: number) =>
    api.get(`/api/tasks/${id}`),

  updateTask: (id: number, task: any) =>
    api.put(`/api/tasks/${id}`, task),

  deleteTask: (id: number) =>
    api.delete(`/api/tasks/${id}`),

  toggleComplete: (id: number) =>
    api.patch(`/api/tasks/${id}/complete`),

  getTodayCount: () =>
    api.get('/api/tasks/today/count'),
}

// AI 채팅 API
export const aiAPI = {
  analyze: (data: { text: string; analysis_type?: string; context?: any }) =>
    api.post('/api/ai/analyze', data),

  extractSchedule: (text: string) =>
    api.post('/api/ai/schedule-extract', { text }),

  chat: (data: { message: string; message_type?: string; context?: any }) =>
    api.post('/api/ai/chat', data),

  getConversations: (params?: any) =>
    api.get('/api/ai/conversations', { params }),

  getHealth: () =>
    api.get('/api/ai/health'),
}

// 보호자 API
export const guardiansAPI = {
  getGuardians: () =>
    api.get('/api/guardians/'),

  createGuardian: (guardian: any) =>
    api.post('/api/guardians/', guardian),

  getGuardian: (id: number) =>
    api.get(`/api/guardians/${id}`),

  updateGuardian: (id: number, guardian: any) =>
    api.put(`/api/guardians/${id}`, guardian),

  deleteGuardian: (id: number) =>
    api.delete(`/api/guardians/${id}`),

  setPrimary: (id: number) =>
    api.patch(`/api/guardians/${id}/primary`),

  getEmergencyContacts: () =>
    api.get('/api/guardians/emergency/contacts'),

  getByRelationship: (relationship: string) =>
    api.get(`/api/guardians/by-relationship/${relationship}`),
}

// 약 관리 API
export const medicineAPI = {
  getAlarms: () =>
    api.get('/api/medicine/alarms'),

  createAlarm: (alarm: any) =>
    api.post('/api/medicine/alarms', alarm),

  getAlarm: (id: number) =>
    api.get(`/api/medicine/alarms/${id}`),

  updateAlarm: (id: number, alarm: any) =>
    api.put(`/api/medicine/alarms/${id}`, alarm),

  deleteAlarm: (id: number) =>
    api.delete(`/api/medicine/alarms/${id}`),

  markTaken: (alarmId: number) =>
    api.post('/api/medicine/taken', { alarm_id: alarmId }),

  getTodayAlarms: () =>
    api.get('/api/medicine/today'),

  getDueAlarms: () =>
    api.get('/api/medicine/due-now'),

  toggleAlarm: (id: number) =>
    api.patch(`/api/medicine/alarms/${id}/toggle`),
}

// 알림 로그 API
export const notificationLogsAPI = {
  getLogs: (params?: any) =>
    api.get('/api/notification-logs', { params }),

  createLog: (logData: any) =>
    api.post('/api/notification-logs', logData),

  getLog: (id: number) =>
    api.get(`/api/notification-logs/${id}`),

  updateLog: (id: number, logData: any) =>
    api.put(`/api/notification-logs/${id}`, logData),
}

export default api