import { useChatState, useLocationState, useModalState, useScheduleState, useSettingsState } from './stateHooks';

/**
 * AppFeature에서 필요한 상태들을 한 곳에서 구성한다.
 * - AppFeature.jsx의 "대량 구조분해"를 분리해 파일을 짧게 유지한다.
 * - 기존 동작/로직/UI 변경 금지: 단순히 동일한 값들을 반환한다.
 */
export function useAppStates() {
    // 상태 관리 훅들 사용
    const chatState = useChatState();
    const scheduleState = useScheduleState();
    const locationState = useLocationState();
    const settingsState = useSettingsState();
    const modalState = useModalState();

    // 상태 구조 분해 할당 (기존 코드와의 호환성을 위해)
    const {
        chatHistory, setChatHistory,
        selectedDate, setSelectedDate,
        pendingQuestion, setPendingQuestion,
        lastSuggestionHour, setLastSuggestionHour,
        dailySummaryShown, setDailySummaryShown,
        morningCareShown, setMorningCareShown,
        currentHospitalTask, setCurrentHospitalTask,
        hospitalArrivalState, setHospitalArrivalState
    } = chatState;

    const {
        confirmedTasks, setConfirmedTasks,
        selectedTaskId, setSelectedTaskId,
        editingTaskId, setEditingTaskId,
        tempTask, setTempTask,
        newSchedule, setNewSchedule,
        schedulePlaceSearchKeyword, setSchedulePlaceSearchKeyword,
        schedulePlaceSearchResults, setSchedulePlaceSearchResults,
        schedulePlaceSearchLoading, setSchedulePlaceSearchLoading,
        taskEditPlaceSearchKeyword, setTaskEditPlaceSearchKeyword,
        taskEditPlaceSearchResults, setTaskEditPlaceSearchResults,
        taskEditPlaceSearchLoading, setTaskEditPlaceSearchLoading
    } = scheduleState;

    const {
        locationInfo, setLocationInfo,
        currentGPSLocation, setCurrentGPSLocation,
        locationPermissionStatus, setLocationPermissionStatus,
        locationLoading, setLocationLoading,
        placeSearchKeyword, setPlaceSearchKeyword,
        placeSearchResults, setPlaceSearchResults,
        placeSearchLoading, setPlaceSearchLoading,
        editingLocationType, setEditingLocationType,
        tempLocation, setTempLocation
    } = locationState;

    const {
        language, setLanguageState,
        showLanguageMenu, setShowLanguageMenu,
        currentView, setCurrentView,
        isViewTransitioning, setIsViewTransitioning,
        restMode, setRestMode,
        lastActivityTime, setLastActivityTime,
        inactivityWarningShown, setInactivityWarningShown,
        inactivitySettings, setInactivitySettings,
        bedtimeSettings, setBedtimeSettings,
        bedtimeModeActive, setBedtimeModeActive,
        bedtimeNotificationShown, setBedtimeNotificationShown,
        accessibilitySettings, setAccessibilitySettings,
        medicineAlarms, setMedicineAlarms,
        medicineAlarmForm, setMedicineAlarmForm,
        guardians, setGuardians,
        reportSettings, setReportSettings,
        guardianContactAuth, setGuardianContactAuth,
        guardianContactStatus, setGuardianContactStatus,
        consentStatus, setConsentStatus,
        dailyActivities, setDailyActivities,
        notifications, setNotifications,
        currentShoppingCart, setCurrentShoppingCart
    } = settingsState;

    const {
        showLocationSettings, setShowLocationSettings,
        showScheduleModal, setShowScheduleModal,
        showPersonalSettings, setShowPersonalSettings,
        showMedicineSettings, setShowMedicineSettings,
        showMedicineAlarmModal, setShowMedicineAlarmModal,
        editingMedicineAlarm, setEditingMedicineAlarm,
        showAccessibilitySettings, setShowAccessibilitySettings,
        showDailySummaryDetail, setShowDailySummaryDetail,
        showNotificationCenter, setShowNotificationCenter,
        showCustomerSupport, setShowCustomerSupport,
        customerSupportTab, setCustomerSupportTab,
        selectedScreenGuide, setSelectedScreenGuide,
        showOnboarding, setShowOnboarding,
        showLocationConsent, setShowLocationConsent,
        showHealthConsent, setShowHealthConsent
    } = modalState;

    return {
        // chat
        chatHistory, setChatHistory,
        selectedDate, setSelectedDate,
        pendingQuestion, setPendingQuestion,
        lastSuggestionHour, setLastSuggestionHour,
        dailySummaryShown, setDailySummaryShown,
        morningCareShown, setMorningCareShown,
        currentHospitalTask, setCurrentHospitalTask,
        hospitalArrivalState, setHospitalArrivalState,

        // schedule
        confirmedTasks, setConfirmedTasks,
        selectedTaskId, setSelectedTaskId,
        editingTaskId, setEditingTaskId,
        tempTask, setTempTask,
        newSchedule, setNewSchedule,
        schedulePlaceSearchKeyword, setSchedulePlaceSearchKeyword,
        schedulePlaceSearchResults, setSchedulePlaceSearchResults,
        schedulePlaceSearchLoading, setSchedulePlaceSearchLoading,
        taskEditPlaceSearchKeyword, setTaskEditPlaceSearchKeyword,
        taskEditPlaceSearchResults, setTaskEditPlaceSearchResults,
        taskEditPlaceSearchLoading, setTaskEditPlaceSearchLoading,

        // location
        locationInfo, setLocationInfo,
        currentGPSLocation, setCurrentGPSLocation,
        locationPermissionStatus, setLocationPermissionStatus,
        locationLoading, setLocationLoading,
        placeSearchKeyword, setPlaceSearchKeyword,
        placeSearchResults, setPlaceSearchResults,
        placeSearchLoading, setPlaceSearchLoading,
        editingLocationType, setEditingLocationType,
        tempLocation, setTempLocation,

        // settings
        language, setLanguageState,
        showLanguageMenu, setShowLanguageMenu,
        currentView, setCurrentView,
        isViewTransitioning, setIsViewTransitioning,
        restMode, setRestMode,
        lastActivityTime, setLastActivityTime,
        inactivityWarningShown, setInactivityWarningShown,
        inactivitySettings, setInactivitySettings,
        bedtimeSettings, setBedtimeSettings,
        bedtimeModeActive, setBedtimeModeActive,
        bedtimeNotificationShown, setBedtimeNotificationShown,
        accessibilitySettings, setAccessibilitySettings,
        medicineAlarms, setMedicineAlarms,
        medicineAlarmForm, setMedicineAlarmForm,
        guardians, setGuardians,
        reportSettings, setReportSettings,
        guardianContactAuth, setGuardianContactAuth,
        guardianContactStatus, setGuardianContactStatus,
        consentStatus, setConsentStatus,
        dailyActivities, setDailyActivities,
        notifications, setNotifications,
        currentShoppingCart, setCurrentShoppingCart,

        // modals
        showLocationSettings, setShowLocationSettings,
        showScheduleModal, setShowScheduleModal,
        showPersonalSettings, setShowPersonalSettings,
        showMedicineSettings, setShowMedicineSettings,
        showMedicineAlarmModal, setShowMedicineAlarmModal,
        editingMedicineAlarm, setEditingMedicineAlarm,
        showAccessibilitySettings, setShowAccessibilitySettings,
        showDailySummaryDetail, setShowDailySummaryDetail,
        showNotificationCenter, setShowNotificationCenter,
        showCustomerSupport, setShowCustomerSupport,
        customerSupportTab, setCustomerSupportTab,
        selectedScreenGuide, setSelectedScreenGuide,
        showOnboarding, setShowOnboarding,
        showLocationConsent, setShowLocationConsent,
        showHealthConsent, setShowHealthConsent
    };
}

