/**
 * 로컬스토리지 기반 데이터 저장/로드 유틸리티
 * 브라우저 새로고침 시에도 데이터 유지
 */

const STORAGE_KEYS = {
    TASKS: 'ai_care_assistant_tasks',
    CHAT_HISTORY: 'ai_care_assistant_chat_history',
    DAILY_ACTIVITIES: 'ai_care_assistant_daily_activities',
    GUARDIAN_STATUS: 'ai_care_assistant_guardian_status',
    REST_MODE: 'ai_care_assistant_rest_mode',
    LAST_ACTIVITY_TIME: 'ai_care_assistant_last_activity_time',
    MORNING_CARE_SHOWN: 'ai_care_assistant_morning_care_shown',
    DAILY_SUMMARY_SHOWN: 'ai_care_assistant_daily_summary_shown',
    LAST_SUGGESTION_HOUR: 'ai_care_assistant_last_suggestion_hour',
    LAST_MORNING_CARE_DATE: 'ai_care_assistant_last_morning_care_date',
    LOCATION_INFO: 'ai_care_assistant_location_info',
    BEDTIME_SETTINGS: 'ai_care_assistant_bedtime_settings',
    ACTIVITIES_HISTORY: 'ai_care_assistant_activities_history', // 과거 활동 기록 (날짜별)
    GUARDIANS: 'ai_care_assistant_guardians', // 보호자 목록
    REPORT_SETTINGS: 'ai_care_assistant_report_settings', // 리포트 주기 설정
    REPORTS: 'ai_care_assistant_reports', // 생성된 리포트 목록
    GUARDIAN_CONTACT_AUTH: 'ai_care_assistant_guardian_contact_auth', // 보호자 연락 인증 정보
    INACTIVITY_SETTINGS: 'ai_care_assistant_inactivity_settings', // 무활동 기준시간 설정
    MEDICINE_ALARMS: 'ai_care_assistant_medicine_alarms', // 약 복용 알림 설정
    BEHAVIOR_PATTERNS: 'ai_care_assistant_behavior_patterns', // 행동 패턴 저장
    ACCESSIBILITY_SETTINGS: 'ai_care_assistant_accessibility_settings', // 접근성 설정
    NOTIFICATIONS: 'ai_care_assistant_notifications' // 알림 센터 알림 목록
};

/**
 * 데이터 저장 (JSON 직렬화)
 */
export const saveToStorage = (key, data) => {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error(`[Storage] 저장 실패 (${key}):`, error);
        return false;
    }
};

/**
 * 데이터 로드 (JSON 역직렬화)
 */
export const loadFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`[Storage] 로드 실패 (${key}):`, error);
        return defaultValue;
    }
};

/**
 * 특정 키 삭제
 */
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`[Storage] 삭제 실패 (${key}):`, error);
        return false;
    }
};

/**
 * 모든 앱 데이터 삭제 (초기화)
 */
export const clearAllStorage = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('[Storage] 전체 삭제 실패:', error);
        return false;
    }
};

/**
 * 일정 목록 저장
 */
export const saveTasks = (tasks) => {
    return saveToStorage(STORAGE_KEYS.TASKS, tasks);
};

/**
 * 일정 목록 로드
 */
export const loadTasks = () => {
    return loadFromStorage(STORAGE_KEYS.TASKS, []);
};

/**
 * 채팅 히스토리 저장
 */
export const saveChatHistory = (history) => {
    return saveToStorage(STORAGE_KEYS.CHAT_HISTORY, history);
};

/**
 * 채팅 히스토리 로드
 */
export const loadChatHistory = () => {
    return loadFromStorage(STORAGE_KEYS.CHAT_HISTORY, null);
};

/**
 * 활동 기록 저장
 */
export const saveDailyActivities = (activities) => {
    return saveToStorage(STORAGE_KEYS.DAILY_ACTIVITIES, activities);
};

/**
 * 활동 기록 로드
 */
export const loadDailyActivities = () => {
    return loadFromStorage(STORAGE_KEYS.DAILY_ACTIVITIES, {
        movements: [],
        visits: [],
        treatments: [],
        meals: [],
        shopping: [],
        safetyEvents: []
    });
};

/**
 * 보호자 연락 상태 저장
 */
export const saveGuardianStatus = (status) => {
    return saveToStorage(STORAGE_KEYS.GUARDIAN_STATUS, status);
};

/**
 * 보호자 연락 상태 로드
 */
export const loadGuardianStatus = () => {
    return loadFromStorage(STORAGE_KEYS.GUARDIAN_STATUS, 'connected');
};

/**
 * 휴식 모드 상태 저장
 */
export const saveRestMode = (restMode) => {
    return saveToStorage(STORAGE_KEYS.REST_MODE, restMode);
};

/**
 * 휴식 모드 상태 로드
 */
export const loadRestMode = () => {
    return loadFromStorage(STORAGE_KEYS.REST_MODE, false);
};

/**
 * 마지막 활동 시간 저장
 */
export const saveLastActivityTime = (timestamp) => {
    return saveToStorage(STORAGE_KEYS.LAST_ACTIVITY_TIME, timestamp);
};

/**
 * 마지막 활동 시간 로드
 */
export const loadLastActivityTime = () => {
    return loadFromStorage(STORAGE_KEYS.LAST_ACTIVITY_TIME, Date.now());
};

/**
 * 아침 케어 표시 여부 저장
 */
export const saveMorningCareShown = (shown) => {
    return saveToStorage(STORAGE_KEYS.MORNING_CARE_SHOWN, shown);
};

/**
 * 아침 케어 표시 여부 로드
 */
export const loadMorningCareShown = () => {
    return loadFromStorage(STORAGE_KEYS.MORNING_CARE_SHOWN, false);
};

/**
 * 마지막 아침 케어 날짜 저장 (하루에 한 번만 표시)
 */
export const saveLastMorningCareDate = (date) => {
    return saveToStorage(STORAGE_KEYS.LAST_MORNING_CARE_DATE, date);
};

/**
 * 마지막 아침 케어 날짜 로드
 */
export const loadLastMorningCareDate = () => {
    return loadFromStorage(STORAGE_KEYS.LAST_MORNING_CARE_DATE, null);
};

/**
 * 하루 요약 표시 여부 저장
 */
export const saveDailySummaryShown = (shown) => {
    return saveToStorage(STORAGE_KEYS.DAILY_SUMMARY_SHOWN, shown);
};

/**
 * 하루 요약 표시 여부 로드
 */
export const loadDailySummaryShown = () => {
    return loadFromStorage(STORAGE_KEYS.DAILY_SUMMARY_SHOWN, false);
};

/**
 * 마지막 제안 시간 저장
 */
export const saveLastSuggestionHour = (hour) => {
    return saveToStorage(STORAGE_KEYS.LAST_SUGGESTION_HOUR, hour);
};

/**
 * 마지막 제안 시간 로드
 */
export const loadLastSuggestionHour = () => {
    return loadFromStorage(STORAGE_KEYS.LAST_SUGGESTION_HOUR, null);
};

/**
 * 위치 정보 저장 (집 주소, 자주 가는 장소)
 */
export const saveLocationInfo = (locationInfo) => {
    return saveToStorage(STORAGE_KEYS.LOCATION_INFO, locationInfo);
};

/**
 * 위치 정보 로드
 */
export const loadLocationInfo = () => {
    return loadFromStorage(STORAGE_KEYS.LOCATION_INFO, {
        home: {
            address: '경기도 평택시',
            details: ''
        },
        frequentPlaces: {
            mart: {
                name: '마트',
                address: '',
                details: ''
            },
            pharmacy: {
                name: '약국',
                address: '',
                details: ''
            },
            hospital: {
                name: '병원',
                address: '',
                details: ''
            }
        },
        // 여러 병원 저장 (배열)
        hospitals: [],
        // 여러 마트 저장 (배열)
        marts: [],
        // 여러 약국 저장 (배열)
        pharmacies: []
    });
};

/**
 * 취침 모드 설정 저장
 */
export const saveBedtimeSettings = (settings) => {
    return saveToStorage(STORAGE_KEYS.BEDTIME_SETTINGS, settings);
};

/**
 * 취침 모드 설정 로드
 */
export const loadBedtimeSettings = () => {
    return loadFromStorage(STORAGE_KEYS.BEDTIME_SETTINGS, {
        enabled: true,
        bedtimeHour: 22, // 취침 시간 (22시)
        wakeupHour: 7,   // 기상 시간 (7시)
        autoActivate: true // 자동 활성화 여부
    });
};

/**
 * 과거 활동 기록 저장 (날짜별로 저장)
 */
export const saveActivitiesHistory = (history) => {
    return saveToStorage(STORAGE_KEYS.ACTIVITIES_HISTORY, history);
};

/**
 * 과거 활동 기록 로드
 */
export const loadActivitiesHistory = () => {
    return loadFromStorage(STORAGE_KEYS.ACTIVITIES_HISTORY, []);
};

/**
 * 오늘의 활동을 과거 기록에 추가
 * @param {Object} todayActivities - 오늘의 활동 데이터
 */
export const addTodayToHistory = (todayActivities) => {
    const history = loadActivitiesHistory();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 오늘 데이터가 이미 있는지 확인
    const existingIndex = history.findIndex(h => h.date === todayStr);
    
    if (existingIndex >= 0) {
        // 오늘 데이터 업데이트
        history[existingIndex] = {
            date: todayStr,
            activities: todayActivities
        };
    } else {
        // 새 데이터 추가
        history.push({
            date: todayStr,
            activities: todayActivities
        });
    }
    
    // 최근 30일만 유지 (메모리 관리)
    const recentHistory = history.slice(-30);
    saveActivitiesHistory(recentHistory);
    
    return recentHistory;
};

/**
 * 보호자 목록 저장
 * @param {Array} guardians - 보호자 목록
 */
export const saveGuardians = (guardians) => {
    return saveToStorage(STORAGE_KEYS.GUARDIANS, guardians);
};

/**
 * 보호자 목록 로드
 */
export const loadGuardians = () => {
    return loadFromStorage(STORAGE_KEYS.GUARDIANS, []);
};

/**
 * 보호자 추가
 * @param {Object} guardian - 보호자 정보 { id, name, phone, email, role, invitedAt, status }
 */
export const addGuardian = (guardian) => {
    const guardians = loadGuardians();
    const newGuardian = {
        id: guardian.id || `guardian_${Date.now()}`,
        name: guardian.name,
        phone: guardian.phone || '',
        email: guardian.email || '',
        role: guardian.role || 'family', // 'family', 'caregiver', 'doctor' 등
        invitedAt: guardian.invitedAt || new Date().toISOString(),
        status: guardian.status || 'pending', // 'pending', 'accepted', 'active'
        ...guardian
    };
    guardians.push(newGuardian);
    saveGuardians(guardians);
    return newGuardian;
};

/**
 * 보호자 제거
 * @param {string} guardianId - 보호자 ID
 */
export const removeGuardian = (guardianId) => {
    const guardians = loadGuardians();
    const filtered = guardians.filter(g => g.id !== guardianId);
    saveGuardians(filtered);
    return filtered;
};

/**
 * 리포트 설정 저장
 * @param {Object} settings - 리포트 설정 { period: 'weekly'|'biweekly'|'monthly', autoSend: boolean, lastSentDate: string }
 */
export const saveReportSettings = (settings) => {
    return saveToStorage(STORAGE_KEYS.REPORT_SETTINGS, settings);
};

/**
 * 리포트 설정 로드
 */
export const loadReportSettings = () => {
    return loadFromStorage(STORAGE_KEYS.REPORT_SETTINGS, {
        period: 'weekly', // 'weekly', 'biweekly', 'monthly'
        autoSend: true,
        lastSentDate: null
    });
};

/**
 * 리포트 목록 저장
 * @param {Array} reports - 리포트 목록
 */
export const saveReports = (reports) => {
    return saveToStorage(STORAGE_KEYS.REPORTS, reports);
};

/**
 * 리포트 목록 로드
 */
export const loadReports = () => {
    return loadFromStorage(STORAGE_KEYS.REPORTS, []);
};

/**
 * 리포트 추가
 * @param {Object} report - 리포트 정보
 */
export const addReport = (report) => {
    const reports = loadReports();
    const newReport = {
        id: report.id || `report_${Date.now()}`,
        period: report.period, // 'weekly', 'biweekly', 'monthly'
        startDate: report.startDate,
        endDate: report.endDate,
        createdAt: report.createdAt || new Date().toISOString(),
        sentAt: report.sentAt || null,
        data: report.data, // 리포트 데이터
        ...report
    };
    reports.push(newReport);
    // 최근 12개월 리포트만 유지
    const recentReports = reports.slice(-12);
    saveReports(recentReports);
    return newReport;
};

/**
 * 보호자 연락 인증 정보 저장
 * @param {Object} authInfo - 인증 정보 { lastContactDate, contactMethod, verificationCode, verified }
 */
export const saveGuardianContactAuth = (authInfo) => {
    return saveToStorage(STORAGE_KEYS.GUARDIAN_CONTACT_AUTH, authInfo);
};

/**
 * 보호자 연락 인증 정보 로드
 */
export const loadGuardianContactAuth = () => {
    return loadFromStorage(STORAGE_KEYS.GUARDIAN_CONTACT_AUTH, {
        lastContactDate: null,
        contactMethod: null, // 'phone', 'message', 'voice'
        verificationCode: null,
        verified: false,
        verificationExpiry: null
    });
};

/**
 * 보호자 연락 인증 코드 생성
 * @returns {string} 6자리 인증 코드
 */
export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 행동 패턴 목록 저장
 * @param {Array} patterns - 행동 패턴 목록
 */
export const saveBehaviorPatterns = (patterns) => {
    return saveToStorage(STORAGE_KEYS.BEHAVIOR_PATTERNS, patterns);
};

/**
 * 행동 패턴 목록 로드
 */
export const loadBehaviorPatterns = () => {
    return loadFromStorage(STORAGE_KEYS.BEHAVIOR_PATTERNS, []);
};

/**
 * 행동 패턴 추가
 * @param {Object} pattern - 행동 패턴 { sequence: [], notes: '', createdAt: string }
 */
export const addBehaviorPattern = (pattern) => {
    const patterns = loadBehaviorPatterns();
    const newPattern = {
        id: pattern.id || `pattern_${Date.now()}`,
        sequence: pattern.sequence || [],
        notes: pattern.notes || '',
        createdAt: pattern.createdAt || new Date().toISOString(),
        ...pattern
    };
    patterns.push(newPattern);
    // 최근 10개만 유지
    const recentPatterns = patterns.slice(-10);
    saveBehaviorPatterns(recentPatterns);
    return newPattern;
};

/**
 * 무활동 기준시간 설정 저장
 * @param {Object} settings - 무활동 설정 { warningMinutes: number, alertMinutes: number }
 */
export const saveInactivitySettings = (settings) => {
    return saveToStorage(STORAGE_KEYS.INACTIVITY_SETTINGS, settings);
};

/**
 * 무활동 기준시간 설정 로드
 */
export const loadInactivitySettings = () => {
    return loadFromStorage(STORAGE_KEYS.INACTIVITY_SETTINGS, {
        warningMinutes: 30, // 경고 표시 시간 (분)
        alertMinutes: 60 // 보호자 알림 시간 (분)
    });
};

/**
 * 약 복용 알림 목록 저장
 * @param {Array} alarms - 약 복용 알림 목록
 */
export const saveMedicineAlarms = (alarms) => {
    return saveToStorage(STORAGE_KEYS.MEDICINE_ALARMS, alarms);
};

/**
 * 약 복용 알림 목록 로드
 */
export const loadMedicineAlarms = () => {
    return loadFromStorage(STORAGE_KEYS.MEDICINE_ALARMS, []);
};

/**
 * 약 복용 알림 추가
 * @param {Object} alarm - 알림 정보 { id, name, time, days: [], enabled: boolean }
 */
export const addMedicineAlarm = (alarm) => {
    const alarms = loadMedicineAlarms();
    const newAlarm = {
        id: alarm.id || `medicine_${Date.now()}`,
        name: alarm.name || '약 복용',
        time: alarm.time, // 'HH:MM' 형식
        days: alarm.days || [0, 1, 2, 3, 4, 5, 6], // 0=일요일, 6=토요일
        enabled: alarm.enabled !== undefined ? alarm.enabled : true,
        ...alarm
    };
    alarms.push(newAlarm);
    saveMedicineAlarms(alarms);
    return newAlarm;
};

/**
 * 약 복용 알림 제거
 * @param {string} alarmId - 알림 ID
 */
export const removeMedicineAlarm = (alarmId) => {
    const alarms = loadMedicineAlarms();
    const filtered = alarms.filter(a => a.id !== alarmId);
    saveMedicineAlarms(filtered);
    return filtered;
};

/**
 * 접근성 설정 저장
 * @param {Object} settings - 접근성 설정 { fontSize: 'normal'|'large'|'xlarge', buttonSize: 'normal'|'large'|'xlarge', highContrast: boolean }
 */
export const saveAccessibilitySettings = (settings) => {
    return saveToStorage(STORAGE_KEYS.ACCESSIBILITY_SETTINGS, settings);
};

/**
 * 접근성 설정 로드
 */
export const loadAccessibilitySettings = () => {
    return loadFromStorage(STORAGE_KEYS.ACCESSIBILITY_SETTINGS, {
        fontSize: 'normal', // 'normal' | 'large' | 'xlarge'
        buttonSize: 'normal', // 'normal' | 'large' | 'xlarge'
        highContrast: false, // 색상 대비 개선
        ttsEnabled: true // TTS (Text-to-Speech) 활성화 여부
    });
};

/**
 * 알림 목록 저장
 * @param {Array} notifications - 알림 목록
 */
export const saveNotifications = (notifications) => {
    return saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
};

/**
 * 알림 목록 로드
 */
export const loadNotifications = () => {
    return loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
};

/**
 * 온보딩 완료 여부 저장
 */
export const saveOnboardingCompleted = (completed) => {
    return saveToStorage(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
};

/**
 * 온보딩 완료 여부 로드
 */
export const loadOnboardingCompleted = () => {
    return loadFromStorage(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
};

/**
 * 동의 상태 저장
 * @param {Object} consentStatus - { location: boolean, health: boolean }
 */
export const saveConsentStatus = (consentStatus) => {
    return saveToStorage(STORAGE_KEYS.CONSENT_STATUS, consentStatus);
};

/**
 * 동의 상태 로드
 * @returns {Object} - { location: boolean, health: boolean }
 */
export const loadConsentStatus = () => {
    return loadFromStorage(STORAGE_KEYS.CONSENT_STATUS, { location: false, health: false });
};

/**
 * 알림 추가
 * @param {Object} notification - 알림 정보 { id, type, title, message, timestamp, read, priority, actionUrl }
 */
export const addNotification = (notification) => {
    const notifications = loadNotifications();
    const newNotification = {
        id: notification.id || Date.now().toString(),
        type: notification.type || 'other', // 'schedule' | 'medicine' | 'guardian' | 'safety' | 'other'
        title: notification.title || '알림',
        message: notification.message || '',
        timestamp: notification.timestamp || Date.now(),
        read: notification.read || false,
        priority: notification.priority || 'medium', // 'high' | 'medium' | 'low'
        actionUrl: notification.actionUrl || null
    };
    notifications.unshift(newNotification); // 최신 알림을 앞에 추가
    
    // 최근 100개만 유지 (메모리 관리)
    const recentNotifications = notifications.slice(0, 100);
    saveNotifications(recentNotifications);
    
    return newNotification;
};

/**
 * 알림 읽음 표시
 * @param {string} notificationId - 알림 ID
 */
export const markNotificationAsRead = (notificationId) => {
    const notifications = loadNotifications();
    const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
    );
    saveNotifications(updated);
    return updated;
};

/**
 * 모든 알림 읽음 표시
 */
export const markAllNotificationsAsRead = () => {
    const notifications = loadNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    return updated;
};

/**
 * 알림 삭제
 * @param {string} notificationId - 알림 ID
 */
export const removeNotification = (notificationId) => {
    const notifications = loadNotifications();
    const updated = notifications.filter(n => n.id !== notificationId);
    saveNotifications(updated);
    return updated;
};

/**
 * 읽지 않은 알림 개수 가져오기
 */
export const getUnreadNotificationCount = () => {
    const notifications = loadNotifications();
    return notifications.filter(n => !n.read).length;
};

// storage 객체 (확장 메서드 포함)
const STORAGE_EXT_KEYS = {
  USER_DATA: 'carelink_user_data',
  SCHEDULES: 'carelink_schedules',
  FAMILY_LINK: 'carelink_family_link'
}

export const storage = {
  // 기존 메서드들
  saveTasks,
  loadTasks,
  saveChatHistory,
  loadChatHistory,
  saveDailyActivities,
  loadDailyActivities,
  saveGuardianStatus,
  loadGuardianStatus,
  saveRestMode,
  loadRestMode,
  saveLastActivityTime,
  loadLastActivityTime,
  saveMorningCareShown,
  loadMorningCareShown,
  saveLastMorningCareDate,
  loadLastMorningCareDate,
  saveDailySummaryShown,
  loadDailySummaryShown,
  saveLastSuggestionHour,
  loadLastSuggestionHour,
  saveLocationInfo,
  loadLocationInfo,
  saveBedtimeSettings,
  loadBedtimeSettings,
  saveActivitiesHistory,
  loadActivitiesHistory,
  addTodayToHistory,
  saveGuardians,
  loadGuardians,
  addGuardian,
  removeGuardian,
  saveReportSettings,
  loadReportSettings,
  saveReports,
  loadReports,
  addReport,
  saveGuardianContactAuth,
  loadGuardianContactAuth,
  generateVerificationCode,
  saveInactivitySettings,
  loadInactivitySettings,
  saveMedicineAlarms,
  loadMedicineAlarms,
  addMedicineAlarm,
  removeMedicineAlarm,
  saveAccessibilitySettings,
  loadAccessibilitySettings,
  saveBehaviorPatterns,
  loadBehaviorPatterns,
  addBehaviorPattern,
  saveNotifications,
  loadNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  getUnreadNotificationCount,
  clearAllStorage,
  saveConsentStatus,
  loadConsentStatus,
  
  // 확장 메서드들
  getUserData: () => loadFromStorage(STORAGE_EXT_KEYS.USER_DATA, null),
  setUserData: (userData) => saveToStorage(STORAGE_EXT_KEYS.USER_DATA, userData),
  getSchedules: () => loadFromStorage(STORAGE_EXT_KEYS.SCHEDULES, []),
  setSchedules: (schedules) => saveToStorage(STORAGE_EXT_KEYS.SCHEDULES, schedules),
  getFamilyLink: () => loadFromStorage(STORAGE_EXT_KEYS.FAMILY_LINK, null),
  setFamilyLink: (familyLink) => saveToStorage(STORAGE_EXT_KEYS.FAMILY_LINK, familyLink)
}

export default {
    saveTasks,
    loadTasks,
    saveChatHistory,
    loadChatHistory,
    saveDailyActivities,
    loadDailyActivities,
    saveGuardianStatus,
    loadGuardianStatus,
    saveRestMode,
    loadRestMode,
    saveLastActivityTime,
    loadLastActivityTime,
    saveMorningCareShown,
    loadMorningCareShown,
    saveLastMorningCareDate,
    loadLastMorningCareDate,
    saveDailySummaryShown,
    loadDailySummaryShown,
    saveLastSuggestionHour,
    loadLastSuggestionHour,
    saveLocationInfo,
    loadLocationInfo,
    saveBedtimeSettings,
    loadBedtimeSettings,
    saveActivitiesHistory,
    loadActivitiesHistory,
    addTodayToHistory,
    saveGuardians,
    loadGuardians,
    addGuardian,
    removeGuardian,
    saveReportSettings,
    loadReportSettings,
    saveReports,
    loadReports,
    addReport,
    saveGuardianContactAuth,
    loadGuardianContactAuth,
    generateVerificationCode,
    saveInactivitySettings,
    loadInactivitySettings,
    saveMedicineAlarms,
    loadMedicineAlarms,
    addMedicineAlarm,
    removeMedicineAlarm,
    saveAccessibilitySettings,
    loadAccessibilitySettings,
    saveBehaviorPatterns,
    loadBehaviorPatterns,
    addBehaviorPattern,
    saveNotifications,
    loadNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    getUnreadNotificationCount,
    clearAllStorage,
    saveConsentStatus,
    loadConsentStatus
};

