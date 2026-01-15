import { useState } from 'react';

/**
 * 모달 표시 상태 관리 훅
 * @returns {Object} 모달 관련 상태와 setter 함수들
 */
export const useModalState = () => {
    // 위치 설정 모달
    const [showLocationSettings, setShowLocationSettings] = useState(false);

    // 개인설정 모달
    const [showPersonalSettings, setShowPersonalSettings] = useState(false);
    const [showMedicineSettings, setShowMedicineSettings] = useState(false); // 약 복용 관리 모달 (개인설정 내부에서 사용)

    // 약 복용 관리 모달
    const [showMedicineAlarmModal, setShowMedicineAlarmModal] = useState(false);
    const [editingMedicineAlarm, setEditingMedicineAlarm] = useState(null);

    // 일정 추가 모달
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // 접근성 설정 모달
    const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);

    // 하루 요약 상세 모달
    const [showDailySummaryDetail, setShowDailySummaryDetail] = useState(false);

    // 알림 센터 모달
    const [showNotificationCenter, setShowNotificationCenter] = useState(false);

    // 고객지원 모달
    const [showCustomerSupport, setShowCustomerSupport] = useState(false);
    const [customerSupportTab, setCustomerSupportTab] = useState('faq'); // 'faq', 'screenGuide', 'supportRequest', 'security'
    const [selectedScreenGuide, setSelectedScreenGuide] = useState('home');

    // 온보딩 가이드 모달
    const [showOnboarding, setShowOnboarding] = useState(false);

    // 동의 모달
    const [showLocationConsent, setShowLocationConsent] = useState(false);
    const [showHealthConsent, setShowHealthConsent] = useState(false);

    return {
        // 위치 설정 모달
        showLocationSettings,
        setShowLocationSettings,
        // 일정 추가 모달
        showScheduleModal,
        setShowScheduleModal,
        // 개인설정 모달
        showPersonalSettings,
        setShowPersonalSettings,
        showMedicineSettings,
        setShowMedicineSettings,
        // 약 복용 관리 모달
        showMedicineAlarmModal,
        setShowMedicineAlarmModal,
        editingMedicineAlarm,
        setEditingMedicineAlarm,
        // 일정 추가 모달
        showScheduleModal,
        setShowScheduleModal,
        // 접근성 설정 모달
        showAccessibilitySettings,
        setShowAccessibilitySettings,
        // 하루 요약 상세 모달
        showDailySummaryDetail,
        setShowDailySummaryDetail,
        // 알림 센터 모달
        showNotificationCenter,
        setShowNotificationCenter,
        // 고객지원 모달
        showCustomerSupport,
        setShowCustomerSupport,
        customerSupportTab,
        setCustomerSupportTab,
        selectedScreenGuide,
        setSelectedScreenGuide,
        // 온보딩 가이드 모달
        showOnboarding,
        setShowOnboarding,
        // 동의 모달
        showLocationConsent,
        setShowLocationConsent,
        showHealthConsent,
        setShowHealthConsent
    };
};
