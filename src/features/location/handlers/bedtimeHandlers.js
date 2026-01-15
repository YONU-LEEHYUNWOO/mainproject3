// 취침 모드 설정 저장 핸들러
export const saveBedtimeSettingsEdit = (setShowLocationSettings, setChatHistory) => {
    setShowLocationSettings(false);
    setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: '취침 모드 설정이 저장되었어요.',
        timestamp: Date.now()
    }]);
};
