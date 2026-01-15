/**
 * AppRoot props 구성 인자 생성 유틸
 * - AppFeature.jsx에서 `buildAppRootProps({ ... })`에 넘기는 거대한 객체 생성을 분리한다.
 * - 기존 동작/로직/UI 변경 금지: 동일한 key/value를 그대로 구성해 반환한다.
 */

/**
 * `buildAppRootProps`에 전달할 인자 객체를 구성한다.
 * - state 값들은 `app`(useAppStates 반환 객체)에서 가져온다.
 * - 함수/유틸/핸들러는 `handlers`로 주입한다.
 *
 * @param {object} params
 * @param {object} params.app
 * @param {object} params.handlers
 * @returns {object}
 */
export function buildAppRootPropsArgs({ app, handlers }) {
    return {
        // schedule edit state
        editingTaskId: app.editingTaskId,
        tempTask: app.tempTask,
        setTempTask: app.setTempTask,
        taskEditPlaceSearchKeyword: app.taskEditPlaceSearchKeyword,
        setTaskEditPlaceSearchKeyword: app.setTaskEditPlaceSearchKeyword,
        taskEditPlaceSearchResults: app.taskEditPlaceSearchResults,
        setTaskEditPlaceSearchResults: app.setTaskEditPlaceSearchResults,
        taskEditPlaceSearchLoading: app.taskEditPlaceSearchLoading,
        setTaskEditPlaceSearchLoading: app.setTaskEditPlaceSearchLoading,

        // schedule state
        confirmedTasks: app.confirmedTasks,
        setConfirmedTasks: app.setConfirmedTasks,
        setEditingTaskId: app.setEditingTaskId,
        selectedTaskId: app.selectedTaskId,
        setSelectedTaskId: app.setSelectedTaskId,

        // location state
        locationInfo: app.locationInfo,
        currentGPSLocation: app.currentGPSLocation,
        setLocationInfo: app.setLocationInfo,
        locationLoading: app.locationLoading,
        setLocationLoading: app.setLocationLoading,
        setCurrentGPSLocation: app.setCurrentGPSLocation,
        locationPermissionStatus: app.locationPermissionStatus,
        setLocationPermissionStatus: app.setLocationPermissionStatus,
        editingLocationType: app.editingLocationType,
        setEditingLocationType: app.setEditingLocationType,
        tempLocation: app.tempLocation,
        setTempLocation: app.setTempLocation,
        placeSearchKeyword: app.placeSearchKeyword,
        setPlaceSearchKeyword: app.setPlaceSearchKeyword,
        placeSearchResults: app.placeSearchResults,
        setPlaceSearchResults: app.setPlaceSearchResults,
        placeSearchLoading: app.placeSearchLoading,
        setPlaceSearchLoading: app.setPlaceSearchLoading,

        // chat
        setChatHistory: app.setChatHistory,
        chatHistory: app.chatHistory,
        selectedDate: app.selectedDate,
        setSelectedDate: app.setSelectedDate,
        pendingQuestion: app.pendingQuestion,
        setPendingQuestion: app.setPendingQuestion,

        // language & view
        language: app.language,
        showLanguageMenu: app.showLanguageMenu,
        setShowLanguageMenu: app.setShowLanguageMenu,
        isViewTransitioning: app.isViewTransitioning,
        setIsViewTransitioning: app.setIsViewTransitioning,
        setCurrentView: app.setCurrentView,

        // schedule modal
        showScheduleModal: app.showScheduleModal,
        setShowScheduleModal: app.setShowScheduleModal,
        newSchedule: app.newSchedule,
        setNewSchedule: app.setNewSchedule,
        schedulePlaceSearchKeyword: app.schedulePlaceSearchKeyword,
        setSchedulePlaceSearchKeyword: app.setSchedulePlaceSearchKeyword,
        schedulePlaceSearchResults: app.schedulePlaceSearchResults,
        setSchedulePlaceSearchResults: app.setSchedulePlaceSearchResults,
        schedulePlaceSearchLoading: app.schedulePlaceSearchLoading,
        setSchedulePlaceSearchLoading: app.setSchedulePlaceSearchLoading,

        // accessibility
        showAccessibilitySettings: app.showAccessibilitySettings,
        setShowAccessibilitySettings: app.setShowAccessibilitySettings,
        accessibilitySettings: app.accessibilitySettings,
        setAccessibilitySettings: app.setAccessibilitySettings,

        // onboarding/support
        showOnboarding: app.showOnboarding,
        setShowOnboarding: app.setShowOnboarding,
        showCustomerSupport: app.showCustomerSupport,
        setShowCustomerSupport: app.setShowCustomerSupport,
        customerSupportTab: app.customerSupportTab,
        setCustomerSupportTab: app.setCustomerSupportTab,
        selectedScreenGuide: app.selectedScreenGuide,
        setSelectedScreenGuide: app.setSelectedScreenGuide,

        // consent
        consentStatus: app.consentStatus,
        setShowLocationConsent: app.setShowLocationConsent,
        setShowHealthConsent: app.setShowHealthConsent,
        showLocationConsent: app.showLocationConsent,
        setConsentStatus: app.setConsentStatus,
        showHealthConsent: app.showHealthConsent,

        // personal settings
        showPersonalSettings: app.showPersonalSettings,
        setShowPersonalSettings: app.setShowPersonalSettings,

        // location settings modal
        showLocationSettings: app.showLocationSettings,
        setShowLocationSettings: app.setShowLocationSettings,

        // inactivity settings
        inactivitySettings: app.inactivitySettings,
        setInactivitySettings: app.setInactivitySettings,

        // medicine
        medicineAlarms: app.medicineAlarms,
        setMedicineAlarms: app.setMedicineAlarms,
        setMedicineAlarmForm: app.setMedicineAlarmForm,
        setEditingMedicineAlarm: app.setEditingMedicineAlarm,
        setShowMedicineAlarmModal: app.setShowMedicineAlarmModal,
        showMedicineSettings: app.showMedicineSettings,
        setShowMedicineSettings: app.setShowMedicineSettings,
        showMedicineAlarmModal: app.showMedicineAlarmModal,
        editingMedicineAlarm: app.editingMedicineAlarm,
        medicineAlarmForm: app.medicineAlarmForm,

        // notifications center
        showNotificationCenter: app.showNotificationCenter,
        setShowNotificationCenter: app.setShowNotificationCenter,
        notifications: app.notifications,
        setNotifications: app.setNotifications,

        // daily summary
        showDailySummaryDetail: app.showDailySummaryDetail,
        setShowDailySummaryDetail: app.setShowDailySummaryDetail,

        // activity/report/guardian
        dailyActivities: app.dailyActivities,
        guardianContactStatus: app.guardianContactStatus,

        // rest mode & refs
        speechSynthesisRef: handlers.speechSynthesisRef,
        restMode: app.restMode,
        setRestMode: app.setRestMode,
        setLastActivityTime: app.setLastActivityTime,
        setDailyActivities: app.setDailyActivities,
        currentHospitalTask: app.currentHospitalTask,
        setCurrentHospitalTask: app.setCurrentHospitalTask,
        hospitalArrivalState: app.hospitalArrivalState,
        setHospitalArrivalState: app.setHospitalArrivalState,
        currentShoppingCart: app.currentShoppingCart,
        setCurrentShoppingCart: app.setCurrentShoppingCart,

        // injected helpers/handlers (non-state)
        apiKey: handlers.apiKey,
        t: handlers.t,
        ttsEnabled: handlers.ttsEnabled,
        loadActivitiesHistory: handlers.loadActivitiesHistory,
        saveOnboardingCompleted: handlers.saveOnboardingCompleted,
        saveConsentStatus: handlers.saveConsentStatus,
        saveInactivitySettings: handlers.saveInactivitySettings,
        addMedicineAlarm: handlers.addMedicineAlarm,
        markAllNotificationsAsRead: handlers.markAllNotificationsAsRead,
        loadNotifications: handlers.loadNotifications,
        markNotificationAsRead: handlers.markNotificationAsRead,
        removeNotification: handlers.removeNotification,
        setLanguageState: handlers.setLanguage,
        isTaskCompleted: handlers.isTaskCompleted,
        confirmProposal: handlers.confirmProposal,
        deleteTask: handlers.deleteTask,
        completeTask: handlers.completeTask,

        // place/task handlers
        handleTaskEditPlaceSearch: handlers.handleTaskEditPlaceSearch,
        handleSelectTaskEditPlace: handlers.handleSelectTaskEditPlace,
        saveEdit: handlers.saveEdit,
        cancelEdit: handlers.cancelEdit,
        handleSchedulePlaceSearch: handlers.handleSchedulePlaceSearch,
        handleSelectSchedulePlace: handlers.handleSelectSchedulePlace,
        handleScheduleAdd: handlers.handleScheduleAdd
    };
}

