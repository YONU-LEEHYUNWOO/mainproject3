import { useEffect } from 'react';
import { showNotification } from '../utils/notificationUtils';
import { addNotification } from '../utils/storage';

/**
 * 무활동 감지 및 경고 훅
 * @param {boolean} restMode - 휴식 모드 활성화 여부
 * @param {boolean} bedtimeModeActive - 취침 모드 활성화 여부
 * @param {number} lastActivityTime - 마지막 활동 시간
 * @param {boolean} inactivityWarningShown - 무활동 경고 표시 여부
 * @param {Function} setInactivityWarningShown - 무활동 경고 표시 상태 업데이트 함수
 * @param {Object} inactivitySettings - 무활동 설정
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {Function} setNotifications - 알림 목록 업데이트 함수
 * @param {Function} setDailyActivities - 활동 기록 업데이트 함수
 */
export const useInactivity = (
    restMode,
    bedtimeModeActive,
    lastActivityTime,
    inactivityWarningShown,
    setInactivityWarningShown,
    inactivitySettings,
    setChatHistory,
    setNotifications,
    setDailyActivities
) => {
    useEffect(() => {
        // 취침 모드가 활성화되어 있으면 무활동 감지 비활성화
        if (bedtimeModeActive) {
            if (inactivityWarningShown) {
                setInactivityWarningShown(false);
            }
            return;
        }

        if (!restMode) return;

        const inactivityCheckInterval = setInterval(() => {
            const now = Date.now();
            const inactiveTime = now - lastActivityTime; // 밀리초
            const inactiveMinutes = Math.floor(inactiveTime / 60000);

            // 설정된 경고 시간 이상 무활동 시 경고
            if (inactiveMinutes >= inactivitySettings.warningMinutes && !inactivityWarningShown) {
                setInactivityWarningShown(true);
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    type: 'inactivityWarning',
                    content: '오랫동안 움직임이 감지되지 않았습니다. 괜찮으신가요?',
                    timestamp: now
                }]);
                showNotification('무활동 감지', `오랫동안 움직임이 감지되지 않았습니다. (${inactiveMinutes}분)`);
                // 알림 센터에 추가
                const notification = addNotification({
                    type: 'safety',
                    title: '⚠️ 무활동 감지',
                    message: `오랫동안 움직임이 감지되지 않았습니다. (${inactiveMinutes}분)`,
                    priority: 'high'
                });
                setNotifications(prev => [notification, ...prev]);
            }

            // 설정된 알림 시간 이상 무활동 시 가족 알림
            if (inactiveMinutes >= inactivitySettings.alertMinutes) {
                setDailyActivities(prev => ({
                    ...prev,
                    safetyEvents: [...(prev.safetyEvents || []), {
                        type: 'inactivity',
                        time: new Date().toLocaleTimeString(),
                        duration: `${inactiveMinutes}분`
                    }]
                }));
                showNotification('가족 알림', `${inactiveMinutes}분 이상 무활동이 감지되었습니다. 가족에게 알림이 전송되었습니다.`);
            }
        }, 60000); // 1분마다 체크

        return () => clearInterval(inactivityCheckInterval);
    }, [restMode, lastActivityTime, inactivityWarningShown, bedtimeModeActive, inactivitySettings, setInactivityWarningShown, setChatHistory, setNotifications, setDailyActivities]);
};
