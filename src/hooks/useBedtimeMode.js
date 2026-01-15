import { useEffect } from 'react';
import { showNotification } from '../utils/notificationUtils';
import { t } from '../i18n';

/**
 * 취침 모드 자동 활성화/비활성화 훅
 * @param {Object} bedtimeSettings - 취침 모드 설정
 * @param {boolean} bedtimeModeActive - 취침 모드 활성화 여부
 * @param {Function} setBedtimeModeActive - 취침 모드 활성화 상태 업데이트 함수
 * @param {boolean} bedtimeNotificationShown - 취침 모드 알림 표시 여부
 * @param {Function} setBedtimeNotificationShown - 취침 모드 알림 표시 상태 업데이트 함수
 * @param {Function} setRestMode - 휴식 모드 업데이트 함수
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {string} language - 현재 언어
 */
export const useBedtimeMode = (
    bedtimeSettings,
    bedtimeModeActive,
    setBedtimeModeActive,
    bedtimeNotificationShown,
    setBedtimeNotificationShown,
    setRestMode,
    setChatHistory,
    language
) => {
    useEffect(() => {
        if (!bedtimeSettings.autoActivate) return;

        const checkBedtimeMode = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentTimeInMinutes = currentHour * 60 + currentMinutes;

            const bedtimeTimeInMinutes = bedtimeSettings.bedtimeHour * 60;
            const wakeupTimeInMinutes = bedtimeSettings.wakeupHour * 60;

            // 취침 시간 체크 (예: 22시 ~ 7시)
            const shouldActivate = wakeupTimeInMinutes < bedtimeTimeInMinutes
                ? currentTimeInMinutes >= bedtimeTimeInMinutes || currentTimeInMinutes < wakeupTimeInMinutes
                : currentTimeInMinutes >= bedtimeTimeInMinutes && currentTimeInMinutes < wakeupTimeInMinutes;

            if (shouldActivate && !bedtimeModeActive) {
                // 취침 모드 활성화
                setBedtimeModeActive(true);
                setRestMode(false); // 휴식 모드 비활성화 (취침 모드와 분리)

                // 알림 표시 (한 번만)
                if (!bedtimeNotificationShown) {
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        type: 'bedtimeMode',
                        content: t('bedtimeModeActivated', language),
                        timestamp: Date.now()
                    }]);
                    setBedtimeNotificationShown(true);
                    showNotification('취침 모드', '취침 모드가 활성화되었습니다. 편안한 밤 되세요.');
                }
            } else if (!shouldActivate && bedtimeModeActive) {
                // 취침 모드 비활성화
                setBedtimeModeActive(false);
                setBedtimeNotificationShown(false); // 다음 취침 시간을 위해 리셋

                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    type: 'bedtimeMode',
                    content: t('bedtimeModeDeactivated', language),
                    timestamp: Date.now()
                }]);
                showNotification('기상', '좋은 아침입니다! 취침 모드가 해제되었습니다.');
            }
        };

        // 즉시 체크
        checkBedtimeMode();

        // 1분마다 체크
        const bedtimeCheckInterval = setInterval(checkBedtimeMode, 60000);

        return () => clearInterval(bedtimeCheckInterval);
    }, [bedtimeSettings, bedtimeModeActive, bedtimeNotificationShown, language, setBedtimeModeActive, setBedtimeNotificationShown, setRestMode, setChatHistory]);
};
