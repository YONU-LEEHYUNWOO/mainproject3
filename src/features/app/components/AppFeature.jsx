import React, { useState, useRef } from 'react';
import AppRoot from '../../layout/components/AppRoot';
import AppViewSwitch from '../../layout/components/AppViewSwitch';
import { buildAppRootProps } from '../../layout/utils/buildAppRootProps';
import { t, getLanguage, setLanguage } from '../utils/i18n';
import {
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
} from '../utils/storage';
import {
    handlePlaceSearch,
    handleSelectPlace,
    handleSchedulePlaceSearch,
    handleSelectSchedulePlace,
    handleTaskEditPlaceSearch,
    handleSelectTaskEditPlace
} from '../../location/handlers/locationHandlers';
import {
    handleDateClick,
    handleScheduleAdd,
    confirmProposal,
    deleteTask,
    completeTask,
    saveEdit,
    cancelEdit,
    toggleReminder
} from '../../schedule/handlers/scheduleHandlers';
import { saveLocationEdit, cancelLocationEdit } from '../../location/handlers/locationModalHandlers';
import { isTaskCompleted } from '../../schedule/utils/dateFormat';
import { speakText } from '../../chat/utils/tts';
import { createHandleMessageReceive } from '../../chat/handlers/guardianMessageReceive';
import { apiKey, logEnvConfigInDev } from '../utils/envConfig';
import { buildGuardianMessageReceiveDeps } from '../utils/buildAppFeatureDeps';
import { useAppStates } from '../hooks/useAppStates';
import { useAppSideEffects } from '../hooks/useAppSideEffects';
import { buildAppRootPropsArgs } from '../utils/buildAppRootPropsArgs';

// 개발 환경 설정 로그는 features/app로 이동 (App.jsx는 import/조립 위주로 유지)
logEnvConfigInDev();

/**
 * 함께잇다 메인 앱 컴포넌트(기능 로직)
 * - `src/App.jsx`는 import/조립만 남기기 위해 기능 로직을 여기로 이동한다.
 * - 기존 동작/로직/UI 변경 금지.
 */
export default function AppFeature() {
    // AppFeature의 대량 상태 구성/구조분해는 훅으로 분리
    const app = useAppStates();
    const {
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
    } = app;

    // TTS (Text-to-Speech) 상태 - 접근성 설정에서 관리
    const speechSynthesisRef = useRef(null); // SpeechSynthesis 인스턴스 참조
    const ttsEnabled = accessibilitySettings?.ttsEnabled !== false; // 기본값: true

    // AppFeature 부수효과(자동저장/스케줄/취침/무활동/온보딩 등) 호출은 훅으로 분리
    useAppSideEffects({
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
        restMode,
        lastActivityTime,
        locationInfo,
        currentGPSLocation,
        setCurrentGPSLocation,
        setLocationPermissionStatus,
        locationLoading,
        setLocationLoading,
        setLocationInfo,
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
        setShowOnboarding,
        selectedDate,
        morningCareShown,
        setMorningCareShown,
        setPendingQuestion,
        dailySummaryShown,
        setDailySummaryShown,
        lastSuggestionHour,
        setLastSuggestionHour,
        t
    });

    // 보호자 메시지 수신 핸들러 (App.jsx는 import + 호출만 유지)
    const handleMessageReceive = createHandleMessageReceive(
        buildGuardianMessageReceiveDeps({
            setChatHistory,
            addNotification,
            setNotifications,
            ttsEnabled,
            language,
            speakText,
            speechSynthesisRef,
            currentGPSLocation,
            locationInfo,
            dailyActivities,
            loadActivitiesHistory
        })
    );

    const { modalsProps, layoutProps } = buildAppRootProps(
        buildAppRootPropsArgs({
            app,
            handlers: {
                // schedule/location handlers
                handleTaskEditPlaceSearch,
                handleSelectTaskEditPlace,
                saveEdit,
                cancelEdit,
                handleSchedulePlaceSearch,
                handleSelectSchedulePlace,
                handleScheduleAdd,

                // confirm/progress handlers
                confirmProposal,
                deleteTask,
                completeTask,

                // notifications handlers
                markAllNotificationsAsRead,
                loadNotifications,
                markNotificationAsRead,
                removeNotification,

                // misc helpers
                apiKey,
                t,
                ttsEnabled,
                speechSynthesisRef,
                loadActivitiesHistory,
                saveOnboardingCompleted,
                saveConsentStatus,
                saveInactivitySettings,
                addMedicineAlarm,
                setLanguage,
                isTaskCompleted
            }
        })
    );

    return (
        <AppViewSwitch
            currentView={currentView}
            isViewTransitioning={isViewTransitioning}
            setIsViewTransitioning={setIsViewTransitioning}
            setCurrentView={setCurrentView}
            language={language}
            handleScheduleAdd={handleScheduleAdd}
            handleMessageReceive={handleMessageReceive}
            dailyActivities={dailyActivities}
            confirmedTasks={confirmedTasks}
            locationInfo={locationInfo}
            setLocationInfo={setLocationInfo}
            currentGPSLocation={currentGPSLocation}
            setCurrentGPSLocation={setCurrentGPSLocation}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            confirmedTasks={confirmedTasks}
            setConfirmedTasks={setConfirmedTasks}
            reportSettings={reportSettings}
            setReportSettings={setReportSettings}
            guardians={guardians}
            setGuardians={setGuardians}
            guardianContactAuth={guardianContactAuth}
            setGuardianContactAuth={setGuardianContactAuth}
            guardianContactStatus={guardianContactStatus}
            setGuardianContactStatus={setGuardianContactStatus}
            inactivitySettings={inactivitySettings}
            setInactivitySettings={setInactivitySettings}
            bedtimeSettings={bedtimeSettings}
            setBedtimeSettings={setBedtimeSettings}
        >
            <AppRoot modalsProps={modalsProps} layoutProps={layoutProps} />
        </AppViewSwitch>
    );
}

