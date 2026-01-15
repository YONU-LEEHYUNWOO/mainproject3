/**
 * AppFeature에서 사용하는 의존성(deps) 구성 유틸
 * - AppFeature.jsx를 "조립" 중심으로 유지하기 위해 deps 객체 생성을 분리한다.
 * - 기존 동작/로직/UI 변경 금지: 단순히 객체를 반환한다.
 */

/**
 * 보호자 메시지 수신 핸들러(`createHandleMessageReceive`)에 전달할 deps를 생성한다.
 * @param {object} params
 * @returns {object} guardian message deps
 */
export function buildGuardianMessageReceiveDeps(params) {
    const {
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
    } = params;

    return {
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
    };
}

