import { t } from '../i18n';
import { isTaskCompleted } from '../utils/dateFormat';
import { generateUpcomingRecurringTasks } from '../utils/scheduleRecurrence';
import { analyzeAndNotifyNewTask } from '../services/scheduleService';
import { addNotification } from '../utils/storage';

/**
 * 날짜 클릭 핸들러
 * @param {string} dateStr - 선택된 날짜 문자열
 * @param {Array} confirmedTasks - 일정 목록
 * @param {number|null} selectedTaskId - 현재 선택된 일정 ID
 * @param {Function} setSelectedTaskId - 선택된 일정 ID 업데이트 함수
 * @param {Function} setConfirmedTasks - 일정 목록 업데이트 함수
 * @param {Function} setEditingTaskId - 편집 중인 일정 ID 업데이트 함수
 * @param {Function} setTempTask - 임시 일정 정보 업데이트 함수
 * @param {Function} setTaskEditPlaceSearchKeyword - 일정 수정용 장소 검색 키워드 업데이트 함수
 * @param {Function} setTaskEditPlaceSearchResults - 일정 수정용 장소 검색 결과 업데이트 함수
 * @param {string} language - 현재 언어
 * @param {string|null} selectedDate - 현재 선택된 날짜
 * @param {Function} setSelectedDate - 선택된 날짜 업데이트 함수
 */
export const handleDateClick = (
    dateStr,
    confirmedTasks,
    selectedTaskId,
    setSelectedTaskId,
    setConfirmedTasks,
    setEditingTaskId,
    setTempTask,
    setTaskEditPlaceSearchKeyword,
    setTaskEditPlaceSearchResults,
    language,
    selectedDate,
    setSelectedDate
) => {
    // 날짜 선택: 같은 날짜를 다시 클릭하면 선택 해제, 다른 날짜를 클릭하면 해당 날짜 선택
    if (selectedDate === dateStr) {
        // 같은 날짜를 다시 클릭하면 선택 해제 (오늘로 리셋)
        setSelectedDate(null);
        if (setSelectedTaskId && typeof setSelectedTaskId === 'function') {
            setSelectedTaskId(null);
        }
    } else {
        // 다른 날짜를 클릭하면 해당 날짜 선택
        setSelectedDate(dateStr);
        
        const existing = confirmedTasks.find(t => t.date === dateStr);
        if (existing) {
            if (setSelectedTaskId && typeof setSelectedTaskId === 'function') {
                setSelectedTaskId(existing.id);
            }
        } else {
            // 해당 날짜에 일정이 없으면 새 일정 생성
            const newTask = {
                id: Date.now(),
                title: t('newSchedule', language),
                date: dateStr,
                time: '12:00',
                location: '',
                category: 'personal',
                reminderActive: true,
                analysis: { life: "분석을 위해 상세 내용을 입력하세요.", requirements: [], traffic: null }
            };
            setConfirmedTasks(prev => [...prev, newTask]);
            if (setSelectedTaskId && typeof setSelectedTaskId === 'function') {
                setSelectedTaskId(newTask.id);
            }
            setEditingTaskId(newTask.id);
            setTempTask({ ...newTask });
            // 일정 추가 시 장소 검색 상태 초기화
            setTaskEditPlaceSearchKeyword('');
            setTaskEditPlaceSearchResults([]);
        }
    }
};

/**
 * 일정 추가 핸들러
 * @param {Object} schedule - 일정 정보
 * @param {boolean} autoConfirm - 자동 확인 여부
 * @param {Array} confirmedTasks - 일정 목록
 * @param {Function} setConfirmedTasks - 일정 목록 업데이트 함수
 * @param {Function} setSelectedTaskId - 선택된 일정 ID 업데이트 함수
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {Object} locationInfo - 위치 정보
 * @param {Object|null} currentGPSLocation - 현재 GPS 위치
 */
export const handleScheduleAdd = async (
    schedule,
    autoConfirm,
    confirmedTasks,
    setConfirmedTasks,
    setSelectedTaskId,
    setChatHistory,
    locationInfo,
    currentGPSLocation
) => {
    const baseTaskId = Date.now();

    // 병원 방문 유형에 따른 준비물 자동 생성
    let requirements = [];
    if (schedule.category === 'hospital') {
        const { generateHospitalRequirements } = await import('../utils/hospitalRequirements');
        const tempTask = { title: schedule.title, location: schedule.location };
        requirements = generateHospitalRequirements(tempTask);
    }

    const newTask = {
        id: baseTaskId,
        title: schedule.title,
        date: schedule.date || new Date().toISOString().split('T')[0],
        time: schedule.time || '12:00',
        location: schedule.location || '',
        category: schedule.category === 'hospital' ? 'personal' : 'personal',
        reminderActive: true,
        repeat: schedule.repeat || false,
        repeatType: schedule.repeatType || 'weekly',
        analysis: {
            work: schedule.category === 'hospital' ? '병원 방문 전 건강 상태를 체크하고 필요한 서류를 준비하세요.' : '',
            life: '일정을 잘 수행하시길 바랍니다.',
            requirements: requirements,
            traffic: null
        }
    };

    // 일정 추가 (자동 확인이면 바로 추가, 아니면 제안)
    if (autoConfirm) {
        // 자동으로 일정 추가
        console.log('📅 [handleScheduleAdd] 자동 일정 추가 시작:', newTask);
        console.log('📅 [handleScheduleAdd] setConfirmedTasks 타입:', typeof setConfirmedTasks);
        console.log('📅 [handleScheduleAdd] 현재 confirmedTasks 개수:', confirmedTasks?.length || 0);

        if (!setConfirmedTasks || typeof setConfirmedTasks !== 'function') {
            console.error('❌ [handleScheduleAdd] setConfirmedTasks가 함수가 아닙니다!', setConfirmedTasks);
            throw new Error('setConfirmedTasks가 함수가 아닙니다');
        }

        setConfirmedTasks(prev => {
            console.log('📅 [handleScheduleAdd] setConfirmedTasks 콜백 실행, 이전 일정 개수:', prev?.length || 0);
            
            // 중복 체크
            const isDuplicate = prev.some(t =>
                t.date === newTask.date &&
                t.time === newTask.time &&
                t.title === newTask.title
            );

            if (isDuplicate) {
                console.log('⚠️ [handleScheduleAdd] 중복 일정 감지, 추가하지 않음:', newTask);
                return prev;
            }

            const updated = [...prev, newTask];
            console.log('✅ [handleScheduleAdd] 일정 추가 완료, 새로운 일정 개수:', updated.length);
            return updated;
        });

        // setSelectedTaskId가 함수인 경우에만 호출
        if (setSelectedTaskId && typeof setSelectedTaskId === 'function') {
            setSelectedTaskId(newTask.id);
        }

        // 반복 일정인 경우 다음 12개 일정 생성
        if (schedule.repeat) {
            const recurringTasks = generateUpcomingRecurringTasks(newTask, schedule.repeatType || 'weekly');
            console.log('🔄 반복 일정 생성:', recurringTasks.length, '개');
            setConfirmedTasks(prev => {
                // 중복 제거
                const existingIds = new Set(prev.map(t => `${t.date}-${t.time}-${t.title}`));
                const newTasks = recurringTasks.filter(t =>
                    !existingIds.has(`${t.date}-${t.time}-${t.title}`)
                );
                return [...prev, ...newTasks];
            });
        }

        // 일정 분석 및 안내 메시지 생성
        analyzeAndNotifyNewTask(newTask, locationInfo, currentGPSLocation, setConfirmedTasks, setChatHistory);

        // 부모 앱 채팅에 일정 추가 알림
        if (setChatHistory && typeof setChatHistory === 'function') {
            try {
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: `📅 "${newTask.title}" 일정이 추가되었습니다.\n날짜: ${newTask.date}\n시간: ${newTask.time}${newTask.location ? `\n장소: ${newTask.location}` : ''}`,
                    timestamp: Date.now()
                }]);
            } catch (error) {
                console.warn('setChatHistory 호출 실패 (무시됨):', error);
            }
        }
    } else {
        // 부모 앱에서 사용자 확인 후 추가
        if (setChatHistory && typeof setChatHistory === 'function') {
            try {
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    type: 'proposal',
                    proposal: {
                        type: 'add',
                        question: `${newTask.date} ${newTask.time}에 "${newTask.title}" 일정을 등록할까요?`,
                        data: newTask
                    },
                    timestamp: Date.now()
                }]);
            } catch (error) {
                console.warn('setChatHistory 호출 실패 (무시됨):', error);
            }
        }
    }
};

/**
 * 제안 확인 핸들러
 * @param {Object} proposal - 제안 객체
 * @param {number|null} selectedTaskId - 현재 선택된 일정 ID
 * @param {Array} confirmedTasks - 일정 목록
 * @param {Function} setConfirmedTasks - 일정 목록 업데이트 함수
 * @param {Function} setSelectedTaskId - 선택된 일정 ID 업데이트 함수
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {Object} locationInfo - 위치 정보
 * @param {Object|null} currentGPSLocation - 현재 GPS 위치
 * @param {string} language - 현재 언어
 */
export const confirmProposal = (
    proposal,
    selectedTaskId,
    confirmedTasks,
    setConfirmedTasks,
    setSelectedTaskId,
    setChatHistory,
    locationInfo,
    currentGPSLocation,
    language
) => {
    const { data } = proposal;
    if (proposal.type === 'delete') {
        setConfirmedTasks(prev => prev.filter(t => !t.title.includes(data.title)));
        setChatHistory(prev => [...prev, { role: 'assistant', content: t('scheduleDeleted', language) }]);
    } else if (proposal.type === 'update') {
        setConfirmedTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, ...data } : t));
        setChatHistory(prev => [...prev, { role: 'assistant', content: t('scheduleUpdated', language) }]);
    } else {
        const newTask = { id: Date.now(), ...data };
        setConfirmedTasks(prev => [...prev, newTask]);
        setSelectedTaskId(newTask.id);
        // 일정 분석 및 안내 메시지 생성
        analyzeAndNotifyNewTask(newTask, locationInfo, currentGPSLocation, setConfirmedTasks, setChatHistory);
    }
};

/**
 * 일정 삭제 핸들러
 * @param {number} taskId - 삭제할 일정 ID
 * @param {Event} e - 이벤트 객체
 * @param {Array} confirmedTasks - 일정 목록
 * @param {number|null} selectedTaskId - 현재 선택된 일정 ID
 * @param {Function} setConfirmedTasks - 일정 목록 업데이트 함수
 * @param {Function} setSelectedTaskId - 선택된 일정 ID 업데이트 함수
 */
export const deleteTask = (taskId, e, confirmedTasks, selectedTaskId, setConfirmedTasks, setSelectedTaskId) => {
    if (e) e.stopPropagation();
    setConfirmedTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId && setSelectedTaskId && typeof setSelectedTaskId === 'function') {
        setSelectedTaskId(null);
    }
};

/**
 * 일정 완료 처리 핸들러
 * @param {number} taskId - 완료할 일정 ID
 * @param {Event} e - 이벤트 객체
 * @param {Array} confirmedTasks - 일정 목록
 * @param {Function} setConfirmedTasks - 일정 목록 업데이트 함수
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {Function} setNotifications - 알림 목록 업데이트 함수
 */
export const completeTask = (taskId, e, confirmedTasks, setConfirmedTasks, setChatHistory, setNotifications) => {
    if (e) e.stopPropagation();
    const task = confirmedTasks.find(t => t.id === taskId);
    if (!task) return;

    const isHospitalTask = task.title?.includes('병원') ||
        task.location?.includes('병원') ||
        task.title?.includes('진료') ||
        task.title?.includes('검진');
    const isMedicineTask = task.title?.includes('약') ||
        task.title?.includes('복용') ||
        task.isMedicineAlarm;

    setConfirmedTasks(prev => prev.map(t =>
        t.id === taskId
            ? { ...t, completed: true, completedAt: new Date().toISOString() }
            : t
    ));

    // 완료 메시지
    const completionMessage = isHospitalTask
        ? `🏥 "${task.title}" 병원 일정이 완료되었습니다. 수고하셨습니다!`
        : isMedicineTask
            ? `💊 "${task.title}" 약 복용이 완료되었습니다.`
            : `"${task.title}" 일정이 완료되었습니다.`;

    setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: completionMessage,
        timestamp: Date.now()
    }]);

    // 병원/약 복용 일정의 경우 보호자에게 알림 전송
    if (isHospitalTask || isMedicineTask) {
        // 알림 센터에 추가
        const notification = addNotification({
            type: 'schedule',
            title: isHospitalTask ? '🏥 병원 일정 완료' : '💊 약 복용 완료',
            message: completionMessage,
            priority: 'medium',
            actionUrl: `task:${taskId}`
        });
        setNotifications(prev => [notification, ...prev]);

        // 보호자에게 메시지 전송
        const guardianNotification = {
            role: 'assistant',
            type: 'guardianMessage',
            content: completionMessage,
            timestamp: Date.now(),
            message: {
                type: 'taskCompleted',
                taskId: taskId,
                taskTitle: task.title,
                isHospital: isHospitalTask,
                isMedicine: isMedicineTask,
                priority: 'medium'
            }
        };
        setChatHistory(prev => [...prev, guardianNotification]);
    }
};

/**
 * 알림 토글 핸들러
 * @param {number} taskId - 일정 ID
 * @param {Event} e - 이벤트 객체
 * @param {Array} confirmedTasks - 일정 목록
 * @param {Function} setConfirmedTasks - 일정 목록 업데이트 함수
 */
export const toggleReminder = (taskId, e, confirmedTasks, setConfirmedTasks) => {
    e.stopPropagation();
    setConfirmedTasks(prev => prev.map(t => t.id === taskId ? { ...t, reminderActive: !t.reminderActive } : t));
};

/**
 * 일정 수정 저장 핸들러
 * @param {Object|null} tempTask - 임시 일정 정보
 * @param {number|null} editingTaskId - 편집 중인 일정 ID
 * @param {Array} confirmedTasks - 일정 목록
 * @param {Function} setConfirmedTasks - 일정 목록 업데이트 함수
 * @param {Function} setEditingTaskId - 편집 중인 일정 ID 업데이트 함수
 * @param {Function} setTempTask - 임시 일정 정보 업데이트 함수
 * @param {Object} locationInfo - 위치 정보
 * @param {Object|null} currentGPSLocation - 현재 GPS 위치
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 */
export const saveEdit = async (
    tempTask,
    editingTaskId,
    confirmedTasks,
    setConfirmedTasks,
    setEditingTaskId,
    setTempTask,
    locationInfo,
    currentGPSLocation,
    setChatHistory
) => {
    if (!tempTask || !editingTaskId) return;
    const updatedTask = { ...tempTask };
    setConfirmedTasks(prev => prev.map(t => t.id === editingTaskId ? updatedTask : t));
    setEditingTaskId(null);
    setTempTask(null);

    // 일정 수정 시에도 분석 및 안내 (장소가 변경되었거나 새로 추가된 경우)
    const originalTask = confirmedTasks.find(t => t.id === editingTaskId);
    if (updatedTask.location &&
        (updatedTask.location !== originalTask?.location || !originalTask?.analysis?.traffic)) {
        analyzeAndNotifyNewTask(updatedTask, locationInfo, currentGPSLocation, setConfirmedTasks, setChatHistory);
    }
};

/**
 * 일정 수정 취소 핸들러
 * @param {Function} setEditingTaskId - 편집 중인 일정 ID 업데이트 함수
 * @param {Function} setTempTask - 임시 일정 정보 업데이트 함수
 * @param {Function} setTaskEditPlaceSearchKeyword - 일정 수정용 장소 검색 키워드 업데이트 함수
 * @param {Function} setTaskEditPlaceSearchResults - 일정 수정용 장소 검색 결과 업데이트 함수
 */
export const cancelEdit = (
    setEditingTaskId,
    setTempTask,
    setTaskEditPlaceSearchKeyword,
    setTaskEditPlaceSearchResults
) => {
    setEditingTaskId(null);
    setTempTask(null);
    setTaskEditPlaceSearchKeyword('');
    setTaskEditPlaceSearchResults([]);
};
