/**
 * 보호자 리포트 생성 유틸리티
 * 하루 요약 + 위험 알림 + 패턴 변화를 포함한 리포트 생성
 */

import { loadActivitiesHistory, loadTasks, loadChatHistory } from './storage';
import { analyzeEmotionPattern } from './emotionAnalysis';

/**
 * 리포트 생성
 * @param {string} period - 리포트 기간 ('weekly', 'biweekly', 'monthly')
 * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
 * @param {Object} dailyActivities - 오늘의 활동 데이터
 * @returns {Object} 리포트 데이터
 */
export const generateReport = (period, startDate, endDate, dailyActivities = {}) => {
    const activitiesHistory = loadActivitiesHistory();
    const tasks = loadTasks();
    
    // 기간 내 활동 데이터 필터링
    const periodActivities = activitiesHistory.filter(h => {
        return h.date >= startDate && h.date <= endDate;
    });
    
    // 활동 요약 계산
    const activitySummary = calculateActivitySummary(periodActivities);
    
    // 일정 수행률 계산
    const scheduleSummary = calculateScheduleSummary(tasks, startDate, endDate);
    
    // 위험 이벤트 수집
    const safetyEvents = collectSafetyEvents(periodActivities);
    
    // 패턴 변화 분석
    const patternChanges = analyzePatternChanges(periodActivities);
    
    // 이동 거리 계산
    const movementSummary = calculateMovementSummary(periodActivities);
    
    // 이동 반경 변화 분석
    const movementRadiusAnalysis = analyzeMovementRadiusChanges(periodActivities);
    
    // 병원 방문 패턴 분석
    const hospitalVisitPattern = analyzeHospitalVisitPattern(periodActivities);
    
    // 정서 변화 분석
    const chatHistory = loadChatHistory() || [];
    const emotionAnalysis = analyzeEmotionPattern(chatHistory, startDate, endDate);
    
    return {
        period,
        startDate,
        endDate,
        generatedAt: new Date().toISOString(),
        activitySummary,
        scheduleSummary,
        safetyEvents,
        patternChanges,
        movementSummary,
        movementRadiusAnalysis,
        hospitalVisitPattern,
        emotionAnalysis,
        recommendations: generateRecommendations(activitySummary, safetyEvents, patternChanges, movementRadiusAnalysis, hospitalVisitPattern, emotionAnalysis)
    };
};

/**
 * 활동 요약 계산
 */
const calculateActivitySummary = (periodActivities) => {
    let totalVisits = 0;
    let totalMeals = 0;
    let totalShopping = 0;
    let totalTreatments = 0;
    let totalSafetyEvents = 0;
    
    periodActivities.forEach(day => {
        const activities = day.activities || {};
        totalVisits += (activities.visits || []).length;
        totalMeals += (activities.meals || []).length;
        totalShopping += (activities.shopping || []).length;
        totalTreatments += (activities.treatments || []).length;
        totalSafetyEvents += (activities.safetyEvents || []).length;
    });
    
    return {
        totalVisits,
        totalMeals,
        totalShopping,
        totalTreatments,
        totalSafetyEvents,
        activeDays: periodActivities.length
    };
};

/**
 * 일정 수행률 계산
 */
const calculateScheduleSummary = (tasks, startDate, endDate) => {
    const periodTasks = tasks.filter(task => {
        return task.date >= startDate && task.date <= endDate;
    });
    
    const completedTasks = periodTasks.filter(task => task.completed);
    const completionRate = periodTasks.length > 0 
        ? Math.round((completedTasks.length / periodTasks.length) * 100) 
        : 0;
    
    return {
        totalTasks: periodTasks.length,
        completedTasks: completedTasks.length,
        completionRate,
        tasks: periodTasks.map(task => ({
            date: task.date,
            title: task.title,
            completed: task.completed
        }))
    };
};

/**
 * 위험 이벤트 수집
 */
const collectSafetyEvents = (periodActivities) => {
    const events = [];
    
    periodActivities.forEach(day => {
        const activities = day.activities || {};
        const safetyEvents = activities.safetyEvents || [];
        safetyEvents.forEach(event => {
            events.push({
                date: day.date,
                type: event.type || 'unknown',
                time: event.time || '',
                description: event.description || ''
            });
        });
    });
    
    return events;
};

/**
 * 패턴 변화 분석
 */
const analyzePatternChanges = (periodActivities) => {
    if (periodActivities.length < 2) {
        return {
            movementChange: null,
            activityChange: null,
            visitFrequencyChange: null
        };
    }
    
    // 전반기 vs 후반기 비교
    const midPoint = Math.floor(periodActivities.length / 2);
    const firstHalf = periodActivities.slice(0, midPoint);
    const secondHalf = periodActivities.slice(midPoint);
    
    const firstHalfVisits = firstHalf.reduce((sum, day) => 
        sum + ((day.activities || {}).visits || []).length, 0);
    const secondHalfVisits = secondHalf.reduce((sum, day) => 
        sum + ((day.activities || {}).visits || []).length, 0);
    
    const visitChange = secondHalfVisits - firstHalfVisits;
    const visitChangePercent = firstHalfVisits > 0 
        ? Math.round((visitChange / firstHalfVisits) * 100) 
        : 0;
    
    return {
        movementChange: visitChangePercent > 10 ? 'increase' : visitChangePercent < -10 ? 'decrease' : 'stable',
        activityChange: visitChangePercent > 10 ? 'increase' : visitChangePercent < -10 ? 'decrease' : 'stable',
        visitFrequencyChange: visitChangePercent,
        analysis: visitChangePercent > 10 
            ? '활동량이 증가했습니다.' 
            : visitChangePercent < -10 
            ? '활동량이 감소했습니다. 주의가 필요합니다.' 
            : '활동량이 안정적입니다.'
    };
};

/**
 * 이동 거리 요약 계산
 */
const calculateMovementSummary = (periodActivities) => {
    // 실제 GPS 데이터가 있으면 사용, 없으면 추정
    let totalDistance = 0;
    let averageDailyDistance = 0;
    
    if (periodActivities.length > 0) {
        // 간단한 추정: 방문 횟수 기반
        const totalVisits = periodActivities.reduce((sum, day) => 
            sum + ((day.activities || {}).visits || []).length, 0);
        // 방문당 평균 2km 추정
        totalDistance = totalVisits * 2;
        averageDailyDistance = totalDistance / periodActivities.length;
    }
    
    return {
        totalDistance: Math.round(totalDistance * 10) / 10,
        averageDailyDistance: Math.round(averageDailyDistance * 10) / 10,
        unit: 'km'
    };
};

/**
 * 이동 반경 변화 분석
 * @param {Array} periodActivities - 기간 내 활동 데이터
 * @returns {Object} 이동 반경 변화 분석 결과
 */
const analyzeMovementRadiusChanges = (periodActivities) => {
    if (periodActivities.length < 2) {
        return {
            trend: 'stable',
            changePercent: 0,
            analysis: '분석할 활동 데이터가 부족합니다.'
        };
    }
    
    // 주간별 이동 반경 계산
    const weeklyRadii = [];
    const weekGroups = {};
    
    periodActivities.forEach(day => {
        const date = new Date(day.date);
        const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
        
        if (!weekGroups[weekKey]) {
            weekGroups[weekKey] = [];
        }
        weekGroups[weekKey].push(day);
    });
    
    Object.keys(weekGroups).sort().forEach(weekKey => {
        const weekDays = weekGroups[weekKey];
        let weekRadius = 0;
        
        weekDays.forEach(day => {
            const activities = day.activities || {};
            const visits = (activities.visits || []).length;
            const meals = (activities.meals || []).length;
            const shopping = (activities.shopping || []).length;
            const treatments = (activities.treatments || []).length;
            const totalActivity = visits + meals + shopping + treatments;
            weekRadius += totalActivity * 2; // km 추정
        });
        
        weeklyRadii.push({
            week: weekKey,
            radius: Math.round(weekRadius * 10) / 10
        });
    });
    
    if (weeklyRadii.length < 2) {
        return {
            trend: 'stable',
            changePercent: 0,
            analysis: '분석할 주간 데이터가 부족합니다.'
        };
    }
    
    // 첫 주와 마지막 주 비교
    const firstWeekRadius = weeklyRadii[0].radius;
    const lastWeekRadius = weeklyRadii[weeklyRadii.length - 1].radius;
    const changePercent = firstWeekRadius > 0 
        ? Math.round(((lastWeekRadius - firstWeekRadius) / firstWeekRadius) * 100)
        : 0;
    
    let trend = 'stable';
    let analysis = '';
    
    if (changePercent > 15) {
        trend = 'increasing';
        analysis = `이동 반경이 ${changePercent}% 증가했습니다. 활동량이 늘어나고 있습니다.`;
    } else if (changePercent < -15) {
        trend = 'decreasing';
        analysis = `이동 반경이 ${Math.abs(changePercent)}% 감소했습니다. 활동량 감소에 주의가 필요합니다.`;
    } else {
        trend = 'stable';
        analysis = '이동 반경이 안정적입니다.';
    }
    
    return {
        trend,
        changePercent,
        analysis,
        weeklyRadii
    };
};

/**
 * 주차 번호 계산
 */
const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * 병원 방문 패턴 분석
 * @param {Array} periodActivities - 기간 내 활동 데이터
 * @returns {Object} 병원 방문 패턴 분석 결과
 */
const analyzeHospitalVisitPattern = (periodActivities) => {
    const hospitalVisits = [];
    const timeSlots = {
        morning: 0,    // 6-12시
        afternoon: 0, // 12-18시
        evening: 0,   // 18-24시
        night: 0      // 0-6시
    };
    const visitPlaces = {};
    
    periodActivities.forEach(day => {
        const activities = day.activities || {};
        const treatments = activities.treatments || [];
        
        treatments.forEach(treatment => {
            const visitTime = treatment.time || '';
            const visitPlace = treatment.place || treatment.location || '병원';
            
            // 시간대 분석
            if (visitTime) {
                const hour = parseInt(visitTime.split(':')[0]) || 12;
                if (hour >= 6 && hour < 12) {
                    timeSlots.morning++;
                } else if (hour >= 12 && hour < 18) {
                    timeSlots.afternoon++;
                } else if (hour >= 18 && hour < 24) {
                    timeSlots.evening++;
                } else {
                    timeSlots.night++;
                }
            }
            
            // 방문 장소 카운트
            if (!visitPlaces[visitPlace]) {
                visitPlaces[visitPlace] = 0;
            }
            visitPlaces[visitPlace]++;
            
            hospitalVisits.push({
                date: day.date,
                time: visitTime,
                place: visitPlace
            });
        });
    });
    
    // 주요 시간대 찾기
    const dominantTimeSlot = Object.keys(timeSlots).reduce((a, b) => 
        timeSlots[a] > timeSlots[b] ? a : b
    );
    
    // 주요 방문 장소 찾기
    const sortedPlaces = Object.entries(visitPlaces)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    const timeSlotLabels = {
        morning: '오전 (6-12시)',
        afternoon: '오후 (12-18시)',
        evening: '저녁 (18-24시)',
        night: '밤 (0-6시)'
    };
    
    let analysis = '';
    if (hospitalVisits.length === 0) {
        analysis = '병원 방문 기록이 없습니다.';
    } else {
        analysis = `총 ${hospitalVisits.length}회 방문. 주로 ${timeSlotLabels[dominantTimeSlot]}에 방문하시며, ${sortedPlaces.length > 0 ? sortedPlaces[0][0] : '병원'}을 가장 많이 방문하셨습니다.`;
    }
    
    return {
        totalVisits: hospitalVisits.length,
        timeDistribution: timeSlots,
        dominantTimeSlot,
        visitPlaces,
        topPlaces: sortedPlaces.map(([place, count]) => ({ place, count })),
        visits: hospitalVisits,
        analysis
    };
};

/**
 * 추천사항 생성
 */
const generateRecommendations = (activitySummary, safetyEvents, patternChanges, movementRadiusAnalysis, hospitalVisitPattern, emotionAnalysis) => {
    const recommendations = [];
    
    // 활동량 기반 추천
    if (activitySummary.totalVisits < 3) {
        recommendations.push({
            type: 'activity',
            priority: 'medium',
            message: '외출 빈도가 낮습니다. 가벼운 산책이나 외출을 권장합니다.'
        });
    }
    
    // 위험 이벤트 기반 추천
    if (safetyEvents.length > 0) {
        recommendations.push({
            type: 'safety',
            priority: 'high',
            message: `${safetyEvents.length}건의 안전 이벤트가 발생했습니다. 주의가 필요합니다.`
        });
    }
    
    // 패턴 변화 기반 추천
    if (patternChanges.movementChange === 'decrease') {
        recommendations.push({
            type: 'pattern',
            priority: 'medium',
            message: '활동량이 감소하는 추세입니다. 건강 상태를 확인해주세요.'
        });
    }
    
    // 이동 반경 변화 기반 추천
    if (movementRadiusAnalysis && movementRadiusAnalysis.trend === 'decreasing') {
        recommendations.push({
            type: 'movement',
            priority: 'medium',
            message: '이동 반경이 감소하고 있습니다. 외출을 권장합니다.'
        });
    }
    
    // 정서 변화 기반 추천
    if (emotionAnalysis && emotionAnalysis.emotionTrend === 'declining') {
        recommendations.push({
            type: 'emotion',
            priority: 'high',
            message: '정서 상태가 악화되고 있습니다. 관심과 케어가 필요합니다.'
        });
    }
    
    return recommendations;
};

/**
 * 리포트 기간 계산
 * @param {string} period - 'weekly', 'biweekly', 'monthly'
 * @returns {Object} { startDate, endDate }
 */
export const calculateReportPeriod = (period) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setHours(0, 0, 0, 0);
    
    let startDate = new Date(endDate);
    
    switch (period) {
        case 'weekly':
            startDate.setDate(endDate.getDate() - 7);
            break;
        case 'biweekly':
            startDate.setDate(endDate.getDate() - 14);
            break;
        case 'monthly':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        default:
            startDate.setDate(endDate.getDate() - 7);
    }
    
    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
};

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * 리포트를 보호자에게 전송할 수 있는 형식으로 변환
 */
export const formatReportForGuardian = (report) => {
    return {
        period: report.period === 'weekly' ? '주간' : report.period === 'biweekly' ? '2주간' : '월간',
        periodRange: `${report.startDate} ~ ${report.endDate}`,
        summary: {
            활동일수: `${report.activitySummary.activeDays}일`,
            방문횟수: `${report.activitySummary.totalVisits}회`,
            식사횟수: `${report.activitySummary.totalMeals}회`,
            장보기횟수: `${report.activitySummary.totalShopping}회`,
            진료횟수: `${report.activitySummary.totalTreatments}회`,
            안전이벤트: `${report.activitySummary.totalSafetyEvents}건`
        },
        일정수행률: `${report.scheduleSummary.completionRate}%`,
        이동거리: `${report.movementSummary.totalDistance}km`,
        패턴분석: report.patternChanges.analysis,
        이동반경변화: report.movementRadiusAnalysis?.analysis || '분석 데이터 없음',
        병원방문패턴: report.hospitalVisitPattern?.analysis || '분석 데이터 없음',
        정서변화: report.emotionAnalysis?.analysis || '분석 데이터 없음',
        추천사항: report.recommendations.map(r => r.message),
        위험이벤트: report.safetyEvents.length > 0 
            ? report.safetyEvents.map(e => `${e.date} ${e.time}: ${e.type}`)
            : ['없음']
    };
};
