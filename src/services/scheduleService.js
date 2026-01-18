import { isTaskCompleted, formatDateTimeShort } from '../utils/dateFormat';
import { storage } from '../utils/storage';

/**
 * 일정 쿼리 처리 함수
 * @param {string} userQuery - 사용자 쿼리
 * @param {Array} confirmedTasks - 일정 목록
 * @returns {Object|null} 일정 정보 또는 null
 */
export const handleScheduleQuery = (userQuery, confirmedTasks) => {
    const queryLower = userQuery.toLowerCase();

    // 일정 조회 관련 키워드 (확장)
    const scheduleQueryKeywords = [
        '일정', '스케줄', '예약', '약속',
        '오늘 일정', '내일 일정', '오늘 약속', '내일 약속',
        '일정 알려줘', '일정 보여줘', '일정 확인', '일정 조회',
        '예약 있니', '약속 있니', '일정 있니', '예정 있니',
        '일정 뭐야', '일정 뭐 있니', '일정 뭐 있어', '일정 알려줘',
        '오늘 뭐 해', '내일 뭐 해', '오늘 할 일', '내일 할 일',
        '병원 언제', '약국 언제', '마트 언제', '언제 가'
    ];

    const isScheduleQuery = scheduleQueryKeywords.some(keyword =>
        queryLower.includes(keyword.toLowerCase())
    );

    if (!isScheduleQuery) return null;

    // 날짜 추출
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let targetDate = todayStr;
    let dateLabel = '오늘';

    if (queryLower.includes('내일')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        targetDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        dateLabel = '내일';
    } else if (queryLower.includes('어제')) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        targetDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        dateLabel = '어제';
    }

    // 해당 날짜의 일정 필터링
    const tasksForDate = confirmedTasks.filter(task =>
        task.date === targetDate && !isTaskCompleted(task.date, task.time, task.completed)
    );

    if (tasksForDate.length === 0) {
        return {
            content: `${dateLabel} 예정된 일정은 없어요.`
        };
    }

    // 일정 목록 생성 (더 상세한 정보 포함)
    const taskList = tasksForDate.map((task, idx) => {
        const timeStr = task.time ? ` ${formatDateTimeShort(task.date, task.time).split(' ')[1] || task.time}` : '';
        const locationStr = task.location ? ` - ${task.location}` : '';
        const categoryStr = task.category === 'hospital' ? ' 🏥' : task.category === 'medicine' ? ' 💊' : '';
        return `${idx + 1}. ${task.title}${categoryStr}${timeStr}${locationStr}`;
    }).join('\n');

    // 일정 상세 정보 추가
    const hospitalTasks = tasksForDate.filter(t => t.category === 'hospital' || t.title.includes('병원'));
    const otherTasks = tasksForDate.filter(t => !(t.category === 'hospital' || t.title.includes('병원')));

    let detailInfo = '';
    if (hospitalTasks.length > 0) {
        detailInfo += `\n\n🏥 병원 일정: ${hospitalTasks.length}개`;
        hospitalTasks.forEach(task => {
            if (task.analysis?.traffic) {
                detailInfo += `\n  • ${task.title}: ${task.analysis.traffic.duration || '시간 확인 중'}`;
            }
        });
    }
    if (otherTasks.length > 0) {
        detailInfo += `\n\n📋 기타 일정: ${otherTasks.length}개`;
    }

    return {
        content: `${dateLabel} 일정이에요:\n\n${taskList}${detailInfo}\n\n총 ${tasksForDate.length}개 일정이 있어요.`
    };
};

/**
 * 새 일정 분석 및 알림 함수
 * @param {Object} task - 일정 객체
 * @param {Object} locationInfo - 위치 정보
 * @param {Object|null} currentGPSLocation - 현재 GPS 위치
 * @param {Function} setConfirmedTasks - 일정 목록 업데이트 함수
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 */
export const analyzeAndNotifyNewTask = async (
    task,
    locationInfo,
    currentGPSLocation,
    setConfirmedTasks,
    setChatHistory
) => {
    try {
        // 출발지 설정 (GPS 위치 > 저장된 집 주소 > 기본값)
        const origin = {
            address: locationInfo?.home?.address || '현재 위치',
            lat: currentGPSLocation?.lat || locationInfo?.home?.lat || 36.9923,
            lng: currentGPSLocation?.lng || locationInfo?.home?.lng || 127.1119
        };

        // 목적지 설정
        let destination = {
            address: task.location || '목적지',
            lat: null,
            lng: null
        };

        // 장소가 있으면 지오코딩 시도
        let geocodeFailed = false;
        if (task.location) {
            try {
                const { geocode } = await import('../utils/geolocation');
                const geocoded = await geocode(task.location);
                destination = {
                    address: geocoded.address || task.location,
                    lat: geocoded.lat,
                    lng: geocoded.lng
                };
            } catch (error) {
                console.warn('⚠️ 목적지 지오코딩 실패:', error);
                geocodeFailed = true;
            }
        }

        // 교통 정보 분석
        let trafficInfo = null;
        let publicTransportInfo = null;
        let walkingInfo = null;

        if (destination.lat && destination.lng) {
            try {
                const { searchRoute, searchPublicTransportRoute, calculateWalkingRoute } = await import('../utils/kakaoMapApi');

                // 자동차 경로 (택시)
                trafficInfo = await searchRoute(origin, destination);

                // 대중교통 경로
                try {
                    publicTransportInfo = await searchPublicTransportRoute(origin, destination);
                } catch (error) {
                    console.warn('⚠️ 대중교통 경로 검색 실패:', error);
                }

                // 도보 경로
                walkingInfo = calculateWalkingRoute(origin, destination);
            } catch (error) {
                console.warn('⚠️ 경로 분석 실패:', error);
            }
        }

        // 일정 분석 업데이트
        setConfirmedTasks(prev => prev.map(t =>
            t.id === task.id ? {
                ...t,
                analysis: {
                    ...t.analysis,
                    traffic: trafficInfo ? {
                        departure: trafficInfo.departure,
                        destination: trafficInfo.destination,
                        duration: trafficInfo.duration,
                        distance: trafficInfo.distance,
                        tip: trafficInfo.tip,
                        taxiFare: trafficInfo.taxiFare || 0,
                        publicTransportDuration: publicTransportInfo?.duration || null,
                        walkingDuration: walkingInfo?.duration || null,
                        walkingDistance: walkingInfo?.distance || null
                    } : null
                }
            } : t
        ));

        // 대화창에 안내 메시지 생성
        const todayDate = new Date();
        const todayDateStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
        const isToday = task.date === todayDateStr;

        let notificationContent = `📅 새로운 일정이 추가되었어요!\n\n`;
        notificationContent += `**${task.title}**\n`;
        notificationContent += `📆 ${task.date} ${task.time || ''}\n`;
        if (task.location) {
            notificationContent += `📍 ${task.location}\n`;
        }
        notificationContent += `\n`;

        if (trafficInfo) {
            notificationContent += `🚗 **이동 정보**\n`;
            notificationContent += `• 자동차(택시): ${trafficInfo.duration} (${trafficInfo.distance})\n`;
            if (publicTransportInfo) {
                notificationContent += `• 대중교통: ${publicTransportInfo.duration}\n`;
            }
            if (walkingInfo) {
                notificationContent += `• 도보: ${walkingInfo.duration} (${walkingInfo.distance})\n`;
            }
            notificationContent += `\n💡 ${trafficInfo.tip}\n\n`;
        }

        if (task.analysis?.requirements && task.analysis.requirements.length > 0) {
            notificationContent += `📋 **준비물**\n`;
            task.analysis.requirements.forEach(req => {
                notificationContent += `• ${req}\n`;
            });
            notificationContent += `\n`;
        }

        if (task.analysis?.work) {
            notificationContent += `💬 ${task.analysis.work}\n`;
        }

        // 위치 검색 실패 시 안내 메시지 추가
        if (geocodeFailed && task.location) {
            notificationContent += `\n⚠️ **위치 정보 안내**\n`;
            notificationContent += `검색 키워드로 찾기가 어려워요. 일정에서 수정해주세요!\n`;
        }

        if (setChatHistory && typeof setChatHistory === 'function') {
            try {
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: notificationContent,
                    timestamp: Date.now()
                }]);
            } catch (error) {
                console.warn('setChatHistory 호출 실패 (무시됨):', error);
            }
        }

    } catch (error) {
        console.error('❌ 일정 분석 실패:', error);
        // 분석 실패해도 기본 안내 메시지 추가
        if (setChatHistory && typeof setChatHistory === 'function') {
            try {
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: `📅 "${task.title}" 일정이 추가되었어요. ${task.date} ${task.time || ''}에 ${task.location || '예정된 장소'}로 가시면 돼요.`,
                    timestamp: Date.now()
                }]);
            } catch (err) {
                console.warn('setChatHistory 호출 실패 (무시됨):', err);
            }
        }
    }
};

// 일정 생성 (구조화된 데이터로 생성)
export const createSchedule = (scheduleData, seniorId, createdBy = 'senior') => {
  const schedule = {
    id: Date.now(),
    seniorId: seniorId,
    createdBy: createdBy,
    title: scheduleData.title || '일정',
    dateTime: scheduleData.dateTime || new Date().toISOString(),
    place: scheduleData.place || '',
    memo: scheduleData.memo || '',
    checklist: {
      insuranceCard: false,
      prescription: false,
      companion: false
    },
    notificationSent: {
      dMinus1: false,
      threeHoursBefore: false,
      thirtyMinutesBefore: false
    },
    createdAt: new Date().toISOString()
  }

  const schedules = storage.getSchedules()
  schedules.push(schedule)
  storage.setSchedules(schedules)

  return schedule
}

// 일정 조회
export const getSchedules = (seniorId = null) => {
  const schedules = storage.getSchedules()
  if (seniorId) {
    return schedules.filter(s => s.seniorId === seniorId).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
  }
  return schedules.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
}

// 오늘 일정 조회
export const getTodaySchedules = (seniorId) => {
  const schedules = getSchedules(seniorId)
  const today = new Date().toISOString().split('T')[0]
  return schedules.filter(s => s.dateTime.startsWith(today))
}

// 일정 삭제
export const deleteSchedule = (scheduleId) => {
  const schedules = storage.getSchedules()
  const filtered = schedules.filter(s => s.id !== scheduleId)
  storage.setSchedules(filtered)
  return true
}
