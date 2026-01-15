import { useEffect } from 'react';
import { generateUpcomingRecurringTasks, shouldGenerateRecurringTask } from '../utils/scheduleRecurrence';

/**
 * 반복 일정 자동 생성 훅
 * @param {Array} confirmedTasks - 현재 일정 목록
 * @param {Function} setConfirmedTasks - 일정 목록 업데이트 함수
 */
export const useRecurringTasks = (confirmedTasks, setConfirmedTasks) => {
    useEffect(() => {
        const checkAndGenerateRecurringTasks = () => {
            const recurringTasks = confirmedTasks.filter(task => task.repeat);
            const newRecurringTasks = [];

            recurringTasks.forEach(baseTask => {
                if (shouldGenerateRecurringTask(baseTask, baseTask.repeatType || 'weekly', confirmedTasks)) {
                    const upcomingTasks = generateUpcomingRecurringTasks(baseTask, baseTask.repeatType || 'weekly');
                    newRecurringTasks.push(...upcomingTasks);
                }
            });

            if (newRecurringTasks.length > 0) {
                setConfirmedTasks(prev => [...prev, ...newRecurringTasks]);
            }
        };

        // 매일 자정에 체크
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const msUntilMidnight = tomorrow - now;

        const timeout = setTimeout(() => {
            checkAndGenerateRecurringTasks();
            // 이후 매일 자정에 체크
            const interval = setInterval(checkAndGenerateRecurringTasks, 24 * 60 * 60 * 1000);
            return () => clearInterval(interval);
        }, msUntilMidnight);

        return () => clearTimeout(timeout);
    }, [confirmedTasks, setConfirmedTasks]);
};
