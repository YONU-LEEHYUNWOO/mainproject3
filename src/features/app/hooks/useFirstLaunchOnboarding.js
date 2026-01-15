import { useEffect } from 'react';
import { loadOnboardingCompleted } from '../../../utils/storage';

/**
 * 첫 사용자 온보딩 가이드를 최초 1회 표시한다.
 * - 기존 App.jsx의 useEffect 로직을 그대로 이동(동작/UI 변경 금지).
 */
export function useFirstLaunchOnboarding({ setShowOnboarding }) {
    useEffect(() => {
        const onboardingCompleted = loadOnboardingCompleted();
        if (!onboardingCompleted) {
            // 첫 사용자에게 온보딩 가이드 표시 (약간의 지연 후)
            const timer = setTimeout(() => {
                setShowOnboarding(true);
            }, 2000); // 2초 후 표시
            return () => clearTimeout(timer);
        }
    }, []);
}

