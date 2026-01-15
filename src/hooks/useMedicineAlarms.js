import { useEffect } from 'react';
import { showNotification } from '../utils/notificationUtils';
import { addNotification } from '../utils/storage';

/**
 * 약 복용 알림 체크 훅
 * @param {Array} medicineAlarms - 약 복용 알림 목록
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {Function} setNotifications - 알림 목록 업데이트 함수
 */
export const useMedicineAlarms = (medicineAlarms, setChatHistory, setNotifications) => {
    useEffect(() => {
        const checkMedicineAlarms = () => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const currentDay = now.getDay(); // 0=일요일, 6=토요일

            medicineAlarms.forEach(alarm => {
                if (!alarm.enabled) return;

                // 오늘 해당 요일인지 확인
                if (!alarm.days || !alarm.days.includes(currentDay)) return;

                // 시간이 일치하는지 확인 (1-2분 전에 알림)
                const alarmTime = alarm.time.split(':');
                const alarmHour = parseInt(alarmTime[0]);
                const alarmMinute = parseInt(alarmTime[1]);
                const nowHour = now.getHours();
                const nowMinute = now.getMinutes();

                // 정확한 시간 또는 1-2분 전에 알림
                if ((nowHour === alarmHour && nowMinute >= alarmMinute && nowMinute <= alarmMinute + 2) ||
                    (nowHour === alarmHour && nowMinute === alarmMinute - 1)) {
                    // 중복 알림 방지 (같은 시간에 여러 번 알림이 가지 않도록)
                    const lastAlarmKey = `medicine_alarm_${alarm.id}_${now.toDateString()}_${currentTime}`;
                    const lastAlarm = localStorage.getItem(lastAlarmKey);

                    if (!lastAlarm) {
                        localStorage.setItem(lastAlarmKey, 'true');
                        // 24시간 후 자동 삭제
                        setTimeout(() => localStorage.removeItem(lastAlarmKey), 24 * 60 * 60 * 1000);

                        // 알림 표시
                        setChatHistory(prev => [...prev, {
                            role: 'assistant',
                            type: 'medicineAlarm',
                            content: `💊 ${alarm.name} 시간입니다. 약을 복용해주세요.`,
                            timestamp: Date.now(),
                            alarmId: alarm.id
                        }]);
                        showNotification('약 복용 알림', `${alarm.name} 시간입니다.`);
                        // 알림 센터에 추가
                        const notification = addNotification({
                            type: 'medicine',
                            title: '💊 약 복용 알림',
                            message: `${alarm.name} 시간입니다. 약을 복용해주세요.`,
                            priority: 'high'
                        });
                        setNotifications(prev => [notification, ...prev]);
                    }
                }
            });
        };

        // 매 분 체크
        const interval = setInterval(checkMedicineAlarms, 60000);
        // 초기 체크
        checkMedicineAlarms();

        return () => clearInterval(interval);
    }, [medicineAlarms, setChatHistory, setNotifications]);
};
