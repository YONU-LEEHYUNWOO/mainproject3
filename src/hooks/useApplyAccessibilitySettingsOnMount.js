import { useEffect } from 'react';
import { applyAccessibilitySettings } from '../utils/accessibilityUtils';

// 접근성 설정을 마운트 시점에 한 번 적용
const useApplyAccessibilitySettingsOnMount = (accessibilitySettings) => {
    useEffect(() => {
        if (accessibilitySettings) {
            applyAccessibilitySettings(accessibilitySettings);
        }
    }, []);
};

export default useApplyAccessibilitySettingsOnMount;
