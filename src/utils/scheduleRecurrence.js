/**
 * 반복 일정 생성 유틸리티
 * 주간, 월간 반복 일정 자동 생성
 */

/**
 * 반복 일정 생성
 * @param {Object} baseTask - 기본 일정 정보
 * @param {string} repeatType - 반복 유형 ('weekly', 'monthly', 'daily')
 * @param {number} count - 생성할 일정 개수 (기본 12개)
 * @returns {Array} 생성된 일정 목록
 */
export const generateRecurringTasks = (baseTask, repeatType = 'weekly', count = 12) => {
    const tasks = [];
    const baseDate = new Date(baseTask.date);
    
    for (let i = 0; i < count; i++) {
        const taskDate = new Date(baseDate);
        
        switch (repeatType) {
            case 'daily':
                taskDate.setDate(baseDate.getDate() + i);
                break;
            case 'weekly':
                taskDate.setDate(baseDate.getDate() + (i * 7));
                break;
            case 'monthly':
                taskDate.setMonth(baseDate.getMonth() + i);
                break;
            default:
                taskDate.setDate(baseDate.getDate() + (i * 7)); // 기본값: 주간
        }
        
        const dateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
        
        tasks.push({
            ...baseTask,
            id: baseTask.id + i, // 고유 ID 생성
            date: dateStr,
            originalTaskId: baseTask.id, // 원본 일정 ID 참조
            repeatType,
            repeatIndex: i
        });
    }
    
    return tasks;
};

/**
 * 다음 반복 일정 생성 (오늘 이후만)
 * @param {Object} baseTask - 기본 일정 정보
 * @param {string} repeatType - 반복 유형
 * @returns {Array} 생성된 일정 목록 (오늘 이후)
 */
export const generateUpcomingRecurringTasks = (baseTask, repeatType = 'weekly') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const baseDate = new Date(baseTask.date);
    baseDate.setHours(0, 0, 0, 0);
    
    const tasks = [];
    
    // 약 복용 일정이고 repeatDays가 있으면 요일 기반으로 생성
    if (baseTask.isMedicineAlarm && baseTask.repeatDays && Array.isArray(baseTask.repeatDays)) {
        const repeatDays = baseTask.repeatDays;
        let weekOffset = 0;
        let taskCount = 0;
        const maxTasks = 12; // 최대 12개 일정 생성
        
        while (taskCount < maxTasks && weekOffset < 8) { // 최대 8주치
            repeatDays.forEach(dayOfWeek => {
                if (taskCount >= maxTasks) return;
                
                const taskDate = new Date(today);
                const daysUntilTargetDay = (dayOfWeek - taskDate.getDay() + 7) % 7;
                taskDate.setDate(taskDate.getDate() + daysUntilTargetDay + (weekOffset * 7));
                
                // 오늘 이후 날짜만 추가
                if (taskDate >= today) {
                    const dateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
                    
                    tasks.push({
                        ...baseTask,
                        id: `${baseTask.id}_${weekOffset}_${dayOfWeek}`,
                        date: dateStr,
                        originalTaskId: baseTask.id,
                        repeatType: 'weekly',
                        repeatDays: repeatDays,
                        repeatIndex: taskCount
                    });
                    taskCount++;
                }
            });
            weekOffset++;
        }
        
        return tasks;
    }
    
    // 기존 로직 (일반 반복 일정)
    let nextDate = new Date(baseDate);
    let index = 0;
    
    // 다음 반복 일정 찾기 (오늘 이후)
    while (nextDate < today && index < 100) { // 무한 루프 방지
        switch (repeatType) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
        }
        index++;
    }
    
    // 다음 12개 일정 생성
    for (let i = 0; i < 12; i++) {
        const taskDate = new Date(nextDate);
        
        switch (repeatType) {
            case 'daily':
                taskDate.setDate(nextDate.getDate() + i);
                break;
            case 'weekly':
                taskDate.setDate(nextDate.getDate() + (i * 7));
                break;
            case 'monthly':
                taskDate.setMonth(nextDate.getMonth() + i);
                break;
        }
        
        const dateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
        
        tasks.push({
            ...baseTask,
            id: baseTask.id + index + i,
            date: dateStr,
            originalTaskId: baseTask.id,
            repeatType,
            repeatIndex: index + i
        });
    }
    
    return tasks;
};

/**
 * 반복 일정이 오늘 또는 미래에 있는지 확인
 */
export const shouldGenerateRecurringTask = (baseTask, repeatType, existingTasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 이미 생성된 반복 일정 확인
    const hasUpcomingTask = existingTasks.some(task => 
        task.originalTaskId === baseTask.id && 
        task.date >= today.toISOString().split('T')[0]
    );
    
    // 이미 생성된 일정이 있으면 추가 생성 불필요
    if (hasUpcomingTask) {
        return false;
    }
    
    // 다음 반복 일정 생성
    return true;
};
