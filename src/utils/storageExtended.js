// storage 유틸리티 확장 - 사용자 데이터, 일정, 가족 연결 등
import { loadFromStorage, saveToStorage } from './storage'

const STORAGE_KEYS = {
  USER_DATA: 'carelink_user_data',
  SCHEDULES: 'carelink_schedules',
  FAMILY_LINK: 'carelink_family_link'
}

// storage 객체 생성 (기존 storage와 병행 사용)
export const storage = {
  // 사용자 데이터
  getUserData: () => {
    return loadFromStorage(STORAGE_KEYS.USER_DATA, null)
  },
  setUserData: (userData) => {
    return saveToStorage(STORAGE_KEYS.USER_DATA, userData)
  },
  
  // 일정 데이터
  getSchedules: () => {
    return loadFromStorage(STORAGE_KEYS.SCHEDULES, [])
  },
  setSchedules: (schedules) => {
    return saveToStorage(STORAGE_KEYS.SCHEDULES, schedules)
  },
  
  // 가족 연결
  getFamilyLink: () => {
    return loadFromStorage(STORAGE_KEYS.FAMILY_LINK, null)
  },
  setFamilyLink: (familyLink) => {
    return saveToStorage(STORAGE_KEYS.FAMILY_LINK, familyLink)
  }
}
