import { useEffect, useRef } from 'react';
import { showNotification } from '../utils/notificationUtils';
import { addNotification } from '../utils/storage';
import { isTaskCompleted, calculateDepartureTime, formatDepartureTime } from '../utils/dateFormat';

/**
 * 일정 알림 체크 훅 (일정 시간 알림, 병원 일정 출발 안내 등)
 * @param {Array} confirmedTasks - 일정 목록
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {Function} setNotifications - 알림 목록 업데이트 함수
 */
export const useScheduleAlerts = (confirmedTasks, setChatHistory, setNotifications) => {
    // 출발 안내를 이미 표시한 일정 추적 (중복 방지) - useRef로 관리
    const shownDepartureAlertsRef = useRef(new Set());
    // 미체크 알림을 이미 표시한 일정 추적 (중복 방지)
    const shownUncheckedAlertsRef = useRef(new Set());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const currentFullTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            confirmedTasks.forEach(task => {
                // 완료된 일정은 알림 제외
                if (isTaskCompleted(task.date, task.time, task.completed)) return;

                // 기본 일정 시간 알림
                if (task.reminderActive && `${task.date} ${task.time}` === currentFullTime) {
                    showNotification(task.title, `에이전트 브리핑: ${task.analysis?.work || '일정 시간이 되었습니다.'}`);
                    // 알림 센터에 추가
                    const notification = addNotification({
                        type: 'schedule',
                        title: `📅 ${task.title}`,
                        message: `에이전트 브리핑: ${task.analysis?.work || '일정 시간이 되었습니다.'}`,
                        priority: 'high',
                        actionUrl: `task:${task.id}`
                    });
                    setNotifications(prev => [notification, ...prev]);
                }

                // 병원 일정 출발 시간 자동 안내
                if (task.date && task.time && task.location) {
                    // 병원 일정인지 확인 (제목에 "병원"이 포함되거나 location에 "병원"이 포함)
                    const isHospitalTask = task.title?.includes('병원') ||
                        task.location?.includes('병원') ||
                        task.title?.includes('진료') ||
                        task.title?.includes('검진');

                    if (isHospitalTask) {
                        // 교통 정보에서 소요 시간 가져오기 (저장된 분석 데이터 또는 기본값)
                        const duration = task.analysis?.traffic?.duration ||
                            task.analysis?.traffic?.publicTransportDuration ||
                            '1시간'; // 기본값

                        const departureTime = calculateDepartureTime(task.date, task.time, duration, 10);

                        if (departureTime) {
                            const timeDiff = departureTime - now;
                            const minutesUntilDeparture = Math.floor(timeDiff / (1000 * 60));
                            const alertKey = `${task.id}_departure`;

                            // 출발 시간 30분 전 안내 (한 번만)
                            if (minutesUntilDeparture <= 30 && minutesUntilDeparture > 10 && !shownDepartureAlertsRef.current.has(`${alertKey}_30min`)) {
                                const formattedTime = formatDepartureTime(departureTime);
                                shownDepartureAlertsRef.current.add(`${alertKey}_30min`);

                                showNotification(
                                    '🏥 병원 일정 출발 안내',
                                    `${task.title} - ${formattedTime}에 출발하시면 시간에 맞춰 도착할 수 있습니다.`
                                );

                                const notification = addNotification({
                                    type: 'schedule',
                                    title: `🏥 ${task.title} 출발 안내`,
                                    message: `${formattedTime}에 출발하시면 시간에 맞춰 도착할 수 있습니다.`,
                                    priority: 'high',
                                    actionUrl: `task:${task.id}`
                                });
                                setNotifications(prev => [notification, ...prev]);

                                // 채팅에도 자동으로 병원 이동 안내 표시
                                setChatHistory(prev => {
                                    // 중복 체크: 이미 같은 task.id의 hospitalTransport 메시지가 있는지 확인
                                    const alreadyExists = prev.some(msg =>
                                        msg.type === 'hospitalTransport' &&
                                        msg.task?.id === task.id &&
                                        msg.timestamp &&
                                        (now - msg.timestamp) < 5 * 60 * 1000 // 5분 이내
                                    );
                                    if (alreadyExists) return prev;

                                    return [...prev, {
                                        role: 'assistant',
                                        type: 'hospitalTransport',
                                        content: `${task.time}까지 ${task.location}에 도착하시려면 이동 준비가 필요합니다.`,
                                        task: task,
                                        timestamp: Date.now()
                                    }];
                                });
                            }

                            // 출발 시간 10분 전 긴급 안내 (한 번만)
                            if (minutesUntilDeparture <= 10 && minutesUntilDeparture > 0 && !shownDepartureAlertsRef.current.has(`${alertKey}_10min`)) {
                                const formattedTime = formatDepartureTime(departureTime);
                                shownDepartureAlertsRef.current.add(`${alertKey}_10min`);

                                showNotification(
                                    '⚠️ 곧 출발해야 합니다!',
                                    `${task.title} - 지금 출발하시면 시간에 맞춰 도착할 수 있습니다. 늦으면 순번이 밀릴 수 있습니다.`
                                );

                                const notification = addNotification({
                                    type: 'safety',
                                    title: `⚠️ ${task.title} - 곧 출발해야 합니다!`,
                                    message: `지금 출발하시면 시간에 맞춰 도착할 수 있습니다.`,
                                    priority: 'high',
                                    actionUrl: `task:${task.id}`
                                });
                                setNotifications(prev => [notification, ...prev]);
                            }

                            // 출발 시간이 지났을 때 긴급 안내 (한 번만)
                            if (minutesUntilDeparture <= 0 && !shownDepartureAlertsRef.current.has(`${alertKey}_overdue`)) {
                                shownDepartureAlertsRef.current.add(`${alertKey}_overdue`);

                                showNotification(
                                    '🚨 지금 바로 출발하세요!',
                                    `${task.title} - 출발 시간이 지났습니다. 지금 바로 출발하시는 것을 권장합니다.`
                                );

                                const notification = addNotification({
                                    type: 'safety',
                                    title: `🚨 ${task.title} - 지금 바로 출발하세요!`,
                                    message: `출발 시간이 지났습니다. 지금 바로 출발하시는 것을 권장합니다.`,
                                    priority: 'high',
                                    actionUrl: `task:${task.id}`
                                });
                                setNotifications(prev => [notification, ...prev]);
                            }
                        }
                    }
                }

                // 병원/약 복용 일정 미체크 알림 (일정 시간 경과 후 30분 이상 지났을 때)
                if (task.date && task.time) {
                    const isHospitalTask = task.title?.includes('병원') ||
                        task.location?.includes('병원') ||
                        task.title?.includes('진료') ||
                        task.title?.includes('검진');
                    const isMedicineTask = task.title?.includes('약') ||
                        task.title?.includes('복용');

                    if ((isHospitalTask || isMedicineTask) && !isTaskCompleted(task.date, task.time, task.completed)) {
                        const taskDateTime = new Date(`${task.date} ${task.time}`);
                        const timeDiff = now - taskDateTime;
                        const minutesPast = Math.floor(timeDiff / (1000 * 60));

                        // 일정 시간이 지나고 30분 이상 경과했을 때 미체크 알림 (한 번만)
                        if (minutesPast >= 30 && minutesPast < 60 && !shownUncheckedAlertsRef.current.has(`${task.id}_unchecked`)) {
                            shownUncheckedAlertsRef.current.add(`${task.id}_unchecked`);

                            const alertMessage = isHospitalTask
                                ? `"${task.title}" 병원 일정이 아직 완료되지 않았습니다. 확인해주세요.`
                                : `"${task.title}" 약 복용이 아직 완료되지 않았습니다. 확인해주세요.`;

                            showNotification(
                                isHospitalTask ? '🏥 병원 일정 미완료' : '💊 약 복용 미완료',
                                alertMessage
                            );

                            const notification = addNotification({
                                type: 'safety',
                                title: isHospitalTask ? '🏥 병원 일정 미완료 알림' : '💊 약 복용 미완료 알림',
                                message: alertMessage,
                                priority: 'high',
                                actionUrl: `task:${task.id}`
                            });
                            setNotifications(prev => [notification, ...prev]);
                        }
                    }
                }
            });
        }, 60000); // 1분마다 체크

        return () => clearInterval(timer);
    }, [confirmedTasks, setChatHistory, setNotifications]);
};
