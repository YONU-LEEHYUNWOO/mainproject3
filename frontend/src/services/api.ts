import axios, { AxiosInstance, AxiosResponse } from 'axios'

// API 기본 설정
// 직접 백엔드 서버로 요청 (프록시 사용 안 함)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Axios 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // CORS 문제 해결을 위해 일단 false로 설정
  timeout: 30000, // AI 응답 대기를 위해 30초로 연장
})

// 요청 인터셉터: 인증 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 요청 로깅 (디버깅용)
    const fullUrl = `${config.baseURL}${config.url}`
    console.log(`🌐 [${config.method?.toUpperCase()}] ${fullUrl}`)
    console.log('📤 요청 헤더:', config.headers)
    console.log('📤 요청 데이터:', config.data)

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

    // 401 인증 오류 처리
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      // 현재 페이지가 로그인 페이지가 아닐 때만 리다이렉트
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
      return Promise.reject(new Error('인증이 만료되었습니다. 다시 로그인해주세요.'))
    }

    // 403 권한 오류 처리
    if (error.response?.status === 403) {
      return Promise.reject(new Error('접근 권한이 없습니다.'))
    }

    // 404 리소스 없음 처리
    if (error.response?.status === 404) {
      return Promise.reject(new Error('요청한 리소스를 찾을 수 없습니다.'))
    }

    // 422 유효성 검사 오류 처리
    if (error.response?.status === 422) {
      const detail = error.response.data?.detail
      let errorMessage = '입력한 데이터가 올바르지 않습니다.'

      if (Array.isArray(detail)) {
        errorMessage = detail.map((err: any) => {
          const field = err.loc?.join('.') || '알 수 없는 필드'
          return `${field}: ${err.msg}`
        }).join(', ')
      } else if (typeof detail === 'string') {
        errorMessage = detail
      }

      return Promise.reject(new Error(errorMessage))
    }

    // 500 서버 오류 처리
    if (error.response?.status >= 500) {
      // 백엔드에서 전달된 상세 오류 정보를 프론트엔드 콘솔에 출력
      const errorDetail = error.response?.data?.detail
      console.error('❌ 백엔드 서버 오류:', {
        status: error.response?.status,
        error_type: typeof errorDetail === 'object' ? errorDetail?.error_type : null,
        error_message: typeof errorDetail === 'object' ? errorDetail?.error_message : errorDetail,
        traceback: typeof errorDetail === 'object' ? errorDetail?.traceback : null,
        full_response: error.response?.data
      })

      // 사용자에게는 간단한 메시지만 표시
      const userMessage = typeof errorDetail === 'object' && errorDetail?.message
        ? errorDetail.message
        : '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'

      return Promise.reject(new Error(userMessage))
    }

    // 기타 오류 처리
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      '알 수 없는 오류가 발생했습니다.'

    console.error('API 오류:', {
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data
    })

    return Promise.reject(new Error(errorMessage))
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

  getTodayCount: (userId?: number) =>
    api.get('/api/tasks/today/count', { params: { user_id: userId } }),

  analyzeTask: (id: number, params?: { lat?: number; lng?: number }) =>
    api.get(`/api/tasks/${id}/analyze`, { params }),
}

// AI 채팅 API
export const aiAPI = {
  analyze: (data: { text: string; analysis_type?: string; context?: any }) =>
    api.post('/api/ai/analyze', data),

  extractSchedule: (text: string) =>
    api.post('/api/ai/schedule-extract', { text }),

  chat: (data: { message: string; message_type?: string; context?: any; latitude?: number; longitude?: number }) =>
    api.post('/api/ai/chat', data),

  getConversations: (params?: any) =>
    api.get('/api/ai/conversations', { params }),

  getProactiveMessage: () =>
    api.get('/api/ai/proactive'),

  getHealth: () =>
    api.get('/api/ai/health'),
}

// 보호자 API
export const guardiansAPI = {
  getGuardians: () =>
    api.get('/api/guardians/'),

  getManagedUsers: () =>
    api.get('/api/guardians/managed-users'),

  getParentReport: (parentId: number) =>
    api.get(`/api/guardians/parents/${parentId}/report`),

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

  getTodayAlarms: (userId?: number) =>
    api.get('/api/medicine/today', { params: { user_id: userId } }),

  getDueAlarms: (userId?: number) =>
    api.get('/api/medicine/due-now', { params: { user_id: userId } }),

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

// 즐겨찾는 장소 API
export const favoritesAPI = {
  getFavorites: (userId?: number) =>
    api.get('/api/favorites/', { params: { user_id: userId } }),

  createFavorite: (favorite: { name: string; category: string; address: string; latitude: number; longitude: number; is_primary?: boolean }, userId?: number) =>
    api.post('/api/favorites/', favorite, { params: { user_id: userId } }),

  deleteFavorite: (id: number) =>
    api.delete(`/api/favorites/${id}`),

  setPrimary: (id: number) =>
    api.patch(`/api/favorites/${id}/set-primary`),
}

// 위치 및 경로 API
export const locationAPI = {
  // 현재 위치 저장
  saveLocation: (data: { latitude: number; longitude: number; accuracy: number; address?: string }) =>
    api.post('/api/location/', { ...data, location_type: 'current' }),

  // 현재 사용자 최신 위치 조회
  getMyLocation: () =>
    api.get('/api/location/current'),

  // 부모님 위치 조회
  getParentLocation: (parentId: number) =>
    api.get(`/api/location/parent/${parentId}`),

  // 위치 공유 설정 토글
  toggleSharing: (enabled: boolean) =>
    api.patch(`/api/location/sharing`, null, { params: { enabled } }),

  // 경로 계산
  getRoute: (origin: { lat: number; lng: number }, dest: { lat: number; lng: number }) =>
    api.post('/api/location/route', {
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      dest_lat: dest.lat,
      dest_lng: dest.lng
    }),
}

// 무활동 감지 API
export const inactivityAPI = {
  // 설정 조회
  getSettings: (targetUserId: number) =>
    api.get(`/api/inactivity/settings/${targetUserId}`),

  // 설정 업데이트
  updateSettings: (targetUserId: number, settings: any) =>
    api.put(`/api/inactivity/settings/${targetUserId}`, settings),

  // 활동 업데이트 (심장박동)
  updateActivity: (activityType: string = 'heartbeat') =>
    api.post('/api/inactivity/activity', { activity_type: activityType }),

  // 현재 상태 조회
  getStatus: (targetUserId: number) =>
    api.get(`/api/inactivity/status/${targetUserId}`),
}

export default api