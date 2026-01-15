import React from 'react';
import AccessibilitySettingsModal from '../../../components/modals/AccessibilitySettingsModal';

// 접근성 설정 모달 진입 컴포넌트
const AccessibilitySettingsModalFeature = ({
    showAccessibilitySettings,
    setShowAccessibilitySettings,
    accessibilitySettings,
    setAccessibilitySettings,
    setChatHistory,
    language
}) => {
    return (
        <AccessibilitySettingsModal
            showAccessibilitySettings={showAccessibilitySettings}
            setShowAccessibilitySettings={setShowAccessibilitySettings}
            accessibilitySettings={accessibilitySettings}
            setAccessibilitySettings={setAccessibilitySettings}
            setChatHistory={setChatHistory}
            language={language}
        />
    );
};

export default AccessibilitySettingsModalFeature;
