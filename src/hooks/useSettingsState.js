import { useState } from 'react';
import { getLanguage } from '../i18n';
import {
    loadRestMode,
    loadLastActivityTime,
    loadInactivitySettings,
    loadBedtimeSettings,
    loadAccessibilitySettings,
    loadMedicineAlarms,
    saveMedicineAlarms,
    loadGuardians,
    loadReportSettings,
    loadGuardianContactAuth,
    loadGuardianStatus,
    loadConsentStatus,
    loadDailyActivities,
    loadNotifications
} from '../utils/storage';

/**
 * 약 복용 알림 중복 ID 제거 함수
 */
const loadMedicineAlarmsWithUniqueIds = () => {
    const alarms = loadMedicineAlarms();
    // 중복 ID 제거 및 고유 ID 보장
    const seenIds = new Set();
    const uniqueAlarms = [];
    alarms.forEach((alarm, idx) => {
        if (seenIds.has(alarm.id)) {
            // 중복 ID가 있으면 새로운 고유 ID 생성
            const newId = `medicine_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`;
            uniqueAlarms.push({ ...alarm, id: newId });
        } else {
            seenIds.add(alarm.id);
            uniqueAlarms.push(alarm);
        }
    });
    // 중복 제거된 알림 저장
    if (uniqueAlarms.length !== alarms.length) {
        saveMedicineAlarms(uniqueAlarms);
    }
    return uniqueAlarms;
};

/**
 * 설정 관련 상태 관리 훅
 * @returns {Object} 설정 관련 상태와 setter 함수들
 */
export const useSettingsState = () => {
    // 언어 설정
    const [language, setLanguageState] = useState(getLanguage());
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);

    // 뷰 전환
    const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'guardian'
    const [isViewTransitioning, setIsViewTransitioning] = useState(false);

    // 휴식 모드 및 무활동
    const [restMode, setRestMode] = useState(loadRestMode());
    const [lastActivityTime, setLastActivityTime] = useState(loadLastActivityTime());
    const [inactivityWarningShown, setInactivityWarningShown] = useState(false);
    const [inactivitySettings, setInactivitySettings] = useState(loadInactivitySettings());

    // 취침 모드
    const [bedtimeSettings, setBedtimeSettings] = useState(loadBedtimeSettings());
    const [bedtimeModeActive, setBedtimeModeActive] = useState(false);
    const [bedtimeNotificationShown, setBedtimeNotificationShown] = useState(false);

    // 접근성 설정
    const [accessibilitySettings, setAccessibilitySettings] = useState(loadAccessibilitySettings());

    // 약 복용 알림
    const [medicineAlarms, setMedicineAlarms] = useState(loadMedicineAlarmsWithUniqueIds());
    const [medicineAlarmForm, setMedicineAlarmForm] = useState({
        name: '약 복용',
        time: '09:00',
        days: [0, 1, 2, 3, 4, 5, 6],
        enabled: true,
        afterMeals: ['breakfast'],
        duration: null,
        durationType: 'days',
        startDate: new Date().toISOString().split('T')[0],
        endDate: null
    });

    // 보호자 관리
    const [guardians, setGuardians] = useState(loadGuardians());
    const [reportSettings, setReportSettings] = useState(loadReportSettings());
    const [guardianContactAuth, setGuardianContactAuth] = useState(loadGuardianContactAuth());
    const [guardianContactStatus, setGuardianContactStatus] = useState(loadGuardianStatus());

    // 동의 상태
    const [consentStatus, setConsentStatus] = useState(loadConsentStatus());

    // 기타 상태
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dailyActivities, setDailyActivities] = useState(loadDailyActivities());
    const [notifications, setNotifications] = useState(loadNotifications());
    const [currentShoppingCart, setCurrentShoppingCart] = useState([]);

    return {
        // 언어 설정
        language,
        setLanguageState,
        showLanguageMenu,
        setShowLanguageMenu,
        // 뷰 전환
        currentView,
        setCurrentView,
        isViewTransitioning,
        setIsViewTransitioning,
        // 휴식 모드 및 무활동
        restMode,
        setRestMode,
        lastActivityTime,
        setLastActivityTime,
        inactivityWarningShown,
        setInactivityWarningShown,
        inactivitySettings,
        setInactivitySettings,
        // 취침 모드
        bedtimeSettings,
        setBedtimeSettings,
        bedtimeModeActive,
        setBedtimeModeActive,
        bedtimeNotificationShown,
        setBedtimeNotificationShown,
        // 접근성 설정
        accessibilitySettings,
        setAccessibilitySettings,
        // 약 복용 알림
        medicineAlarms,
        setMedicineAlarms,
        medicineAlarmForm,
        setMedicineAlarmForm,
        // 보호자 관리
        guardians,
        setGuardians,
        reportSettings,
        setReportSettings,
        guardianContactAuth,
        setGuardianContactAuth,
        guardianContactStatus,
        setGuardianContactStatus,
        // 동의 상태
        consentStatus,
        setConsentStatus,
        // 기타 상태
        currentTime,
        setCurrentTime,
        dailyActivities,
        setDailyActivities,
        notifications,
        setNotifications,
        currentShoppingCart,
        setCurrentShoppingCart
    };
};
