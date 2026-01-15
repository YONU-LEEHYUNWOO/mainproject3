// App(최상위)에서 사용하는 storage 유틸 재-export
// - App.jsx는 기능별 features 경로로 import하도록 정리하기 위함
// - 실제 로직/동작은 기존 `src/utils/storage.js`를 그대로 사용한다 (UI/로직 변경 금지)

export {
    loadActivitiesHistory,
    saveInactivitySettings,
    addMedicineAlarm,
    loadNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    saveOnboardingCompleted,
    saveConsentStatus
} from '../../../utils/storage';

