import {
    useAutoSaveAccessibilitySettings,
    useAutoSaveBedtimeSettings,
    useAutoSaveChatHistory,
    useAutoSaveDailyActivities,
    useAutoSaveGuardianContactAuth,
    useAutoSaveGuardianStatus,
    useAutoSaveGuardians,
    useAutoSaveInactivitySettings,
    useAutoSaveMedicineAlarms,
    useAutoSaveNotifications,
    useAutoSaveReportSettings,
    useAutoSaveTasks
} from './autoSaveHooks';
import {
    useActivityDetection,
    useBedtimeMode,
    useGPSLocation,
    useInactivity,
    useMedicineAlarms,
    useRecurringTasks,
    useScheduleAlerts,
    useApplyAccessibilitySettingsOnMount
} from './appBehaviorHooks';
import { useAutoReportSchedule } from './useAutoReportSchedule';
import { useChatDateRolloverCheck } from './useChatDateRolloverCheck';
import { useFirstLaunchOnboarding } from './useFirstLaunchOnboarding';
import { useGuardianContactAuthCheck } from './useGuardianContactAuthCheck';
import { useMorningCareInit } from './useMorningCareInit';
import { usePersistCoreAppState } from './usePersistCoreAppState';
import { useProactiveSuggestionsAndDailySummary } from '../../chat/hooks/useProactiveSuggestionsAndDailySummary';

/**
 * AppFeature에서 발생하는 "부수 효과" 호출을 모아 분리한다.
 * - autoSave / 스케줄링 / 취침모드 / 무활동감지 / 온보딩 / 날짜롤오버 / 아침케어 / 능동제안 등을 포함
 * - 기존 동작/로직/UI 변경 금지: 기존 AppFeature.jsx의 호출을 그대로 옮긴다.
 */
export function useAppSideEffects(params) {
    const {
        // auto-save deps
        inactivitySettings,
        medicineAlarms,
        accessibilitySettings,
        notifications,
        confirmedTasks,
        setConfirmedTasks,
        chatHistory,
        setChatHistory,
        dailyActivities,
        guardians,
        reportSettings,
        guardianContactAuth,
        guardianContactStatus,
        setReportSettings,
        setGuardianContactStatus,

        // core persist deps
        restMode,
        lastActivityTime,
        locationInfo,

        // GPS deps
        currentGPSLocation,
        setCurrentGPSLocation,
        setLocationPermissionStatus,
        locationLoading,
        setLocationLoading,
        setLocationInfo,

        // schedule/bedtime/inactivity deps
        bedtimeSettings,
        bedtimeModeActive,
        setBedtimeModeActive,
        bedtimeNotificationShown,
        setBedtimeNotificationShown,
        setRestMode,
        language,
        inactivityWarningShown,
        setInactivityWarningShown,
        setNotifications,
        setDailyActivities,
        setLastActivityTime,

        // onboarding / date rollover deps
        setShowOnboarding,
        selectedDate,

        // morning care deps
        morningCareShown,
        setMorningCareShown,
        setPendingQuestion,

        // proactive suggestion deps
        dailySummaryShown,
        setDailySummaryShown,
        lastSuggestionHour,
        setLastSuggestionHour,
        t
    } = params;

    // 데이터 자동 저장 훅들 사용
    useAutoSaveInactivitySettings(inactivitySettings);
    useAutoSaveMedicineAlarms(medicineAlarms);

    // 컴포넌트 마운트 시 접근성 설정 적용
    useApplyAccessibilitySettingsOnMount(accessibilitySettings);

    // 데이터 자동 저장 훅들 사용
    useAutoSaveAccessibilitySettings(accessibilitySettings);
    useAutoSaveNotifications(notifications);

    // 반복 일정 생성 체크 (매일 자정)
    useRecurringTasks(confirmedTasks, setConfirmedTasks);

    // 약 복용 알림 체크 (매 분)
    useMedicineAlarms(medicineAlarms, setChatHistory, setNotifications);

    // 데이터 자동 저장 훅들 사용
    useAutoSaveTasks(confirmedTasks);
    useAutoSaveChatHistory(chatHistory);
    useAutoSaveDailyActivities(dailyActivities);
    useAutoSaveGuardianStatus(guardianContactStatus);
    useAutoSaveGuardians(guardians);
    useAutoSaveReportSettings(reportSettings);
    useAutoSaveGuardianContactAuth(guardianContactAuth);

    // 리포트 자동 생성 및 전송(주기별)
    useAutoReportSchedule({ reportSettings, dailyActivities, setChatHistory, setReportSettings });

    // 보호자 연락 인증 체크(매일)
    useGuardianContactAuthCheck({ guardianContactAuth, setGuardianContactStatus });

    // 데이터 자동 저장(휴식 모드/활동 시간/위치 정보)
    usePersistCoreAppState({ restMode, lastActivityTime, locationInfo });

    // GPS 위치 정보 가져오기
    useGPSLocation(
        currentGPSLocation,
        setCurrentGPSLocation,
        setLocationPermissionStatus,
        locationLoading,
        setLocationLoading,
        locationInfo,
        setLocationInfo
    );

    // 데이터 자동 저장 훅들 사용
    useAutoSaveBedtimeSettings(bedtimeSettings);

    // 일정 알림 체크 (완료된 일정 제외)
    useScheduleAlerts(confirmedTasks, setChatHistory, setNotifications);

    // 취침 모드 자동 활성화/비활성화
    useBedtimeMode(
        bedtimeSettings,
        bedtimeModeActive,
        setBedtimeModeActive,
        bedtimeNotificationShown,
        setBedtimeNotificationShown,
        setRestMode,
        setChatHistory,
        language
    );

    // 휴식 모드 무활동 감지 (취침 모드일 때는 비활성화)
    useInactivity(
        restMode,
        bedtimeModeActive,
        lastActivityTime,
        inactivityWarningShown,
        setInactivityWarningShown,
        inactivitySettings,
        setChatHistory,
        setNotifications,
        setDailyActivities
    );

    // 사용자 활동 감지 (입력, 클릭 등)
    useActivityDetection(setLastActivityTime, inactivityWarningShown, setInactivityWarningShown);

    // 첫 실행 온보딩 가이드 표시 (한 번만)
    useFirstLaunchOnboarding({ setShowOnboarding });

    // 날짜가 바뀌면 자동으로 오늘 대화만 표시
    useChatDateRolloverCheck({ selectedDate });

    // 아침 케어: 앱 시작 시 오늘 일정 확인 (하루에 한 번만)
    useMorningCareInit({
        morningCareShown,
        setMorningCareShown,
        confirmedTasks,
        chatHistory,
        setChatHistory,
        setPendingQuestion,
        language,
        t
    });

    // 시간대별 능동적 제안 및 하루 요약
    useProactiveSuggestionsAndDailySummary({
        confirmedTasks,
        dailySummaryShown,
        setDailySummaryShown,
        language,
        lastSuggestionHour,
        setLastSuggestionHour,
        setChatHistory,
        t
    });
}

