import { useEffect } from 'react';

/**
 * 사용자 활동 감지 훅 (입력, 클릭 등)
 * @param {Function} setLastActivityTime - 마지막 활동 시간 업데이트 함수
 * @param {boolean} inactivityWarningShown - 무활동 경고 표시 여부
 * @param {Function} setInactivityWarningShown - 무활동 경고 표시 상태 업데이트 함수
 */
export const useActivityDetection = (setLastActivityTime, inactivityWarningShown, setInactivityWarningShown) => {
    useEffect(() => {
        const handleActivity = () => {
            setLastActivityTime(Date.now());
            if (inactivityWarningShown) {
                setInactivityWarningShown(false);
            }
        };

        window.addEventListener('click', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('touchstart', handleActivity);

        return () => {
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
        };
    }, [inactivityWarningShown, setLastActivityTime, setInactivityWarningShown]);
};
