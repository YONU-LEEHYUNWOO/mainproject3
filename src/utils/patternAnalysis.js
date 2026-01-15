/**
 * 사용자 행동 패턴 분석 유틸리티
 * 과거 활동 데이터를 기반으로 패턴을 분석하고 추천 생성
 */

/**
 * 활동 기록에서 시간대별 패턴 분석
 * @param {Array} activitiesHistory - 과거 활동 기록 배열 [{ date, activities }, ...]
 * @param {string} activityType - 분석할 활동 타입 ('movements', 'meals', 'shopping', 'visits')
 * @returns {Object} 시간대별 패턴 (예: { '14': 3, '18': 5 })
 */
export const analyzeTimePattern = (activitiesHistory, activityType) => {
    const timePattern = {};
    
    activitiesHistory.forEach(dayData => {
        if (!dayData.activities || !dayData.activities[activityType]) return;
        
        dayData.activities[activityType].forEach(activity => {
            if (activity.time) {
                // 시간 문자열에서 시간 추출 (예: "14:30:15" -> 14)
                const hour = parseInt(activity.time.split(':')[0]);
                if (!isNaN(hour)) {
                    timePattern[hour] = (timePattern[hour] || 0) + 1;
                }
            }
        });
    });
    
    return timePattern;
};

/**
 * 가장 자주 활동하는 시간대 찾기
 * @param {Object} timePattern - analyzeTimePattern 결과
 * @returns {number|null} 가장 빈번한 시간 (0-23)
 */
export const getMostFrequentHour = (timePattern) => {
    if (!timePattern || Object.keys(timePattern).length === 0) return null;
    
    let maxCount = 0;
    let mostFrequentHour = null;
    
    Object.entries(timePattern).forEach(([hour, count]) => {
        if (count > maxCount) {
            maxCount = count;
            mostFrequentHour = parseInt(hour);
        }
    });
    
    return mostFrequentHour;
};

/**
 * 요일별 패턴 분석
 * @param {Array} activitiesHistory - 과거 활동 기록
 * @param {string} activityType - 활동 타입
 * @returns {Object} 요일별 패턴 (예: { '월요일': 3, '화요일': 2 })
 */
export const analyzeDayOfWeekPattern = (activitiesHistory, activityType) => {
    const dayPattern = {};
    
    activitiesHistory.forEach(dayData => {
        if (!dayData.date) return;
        
        const date = new Date(dayData.date);
        const dayOfWeek = date.getDay(); // 0=일요일, 1=월요일, ...
        const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const dayName = dayNames[dayOfWeek];
        
        if (dayData.activities && dayData.activities[activityType]) {
            const count = dayData.activities[activityType].length;
            dayPattern[dayName] = (dayPattern[dayName] || 0) + count;
        }
    });
    
    return dayPattern;
};

/**
 * 장소별 방문 빈도 분석
 * @param {Array} activitiesHistory - 과거 활동 기록
 * @returns {Object} 장소별 방문 횟수
 */
export const analyzeLocationFrequency = (activitiesHistory) => {
    const locationFreq = {};
    
    activitiesHistory.forEach(dayData => {
        if (!dayData.activities) return;
        
        // movements 분석
        if (dayData.activities.movements) {
            dayData.activities.movements.forEach(movement => {
                if (movement.destination) {
                    locationFreq[movement.destination] = (locationFreq[movement.destination] || 0) + 1;
                }
            });
        }
        
        // visits 분석
        if (dayData.activities.visits) {
            dayData.activities.visits.forEach(visit => {
                if (visit.place) {
                    locationFreq[visit.place] = (locationFreq[visit.place] || 0) + 1;
                }
            });
        }
    });
    
    return locationFreq;
};

/**
 * 병원 방문 후 일반적인 행동 패턴 분석
 * @param {Array} activitiesHistory - 과거 활동 기록
 * @returns {Object} 병원 방문 후 행동 패턴
 */
export const analyzePostHospitalBehavior = (activitiesHistory) => {
    const behaviors = {
        goHome: 0,
        shopping: 0,
        meal: 0,
        other: 0
    };
    
    activitiesHistory.forEach(dayData => {
        if (!dayData.activities) return;
        
        // 병원 방문 확인 (visits나 treatments에서)
        const hasHospitalVisit = 
            (dayData.activities.visits && dayData.activities.visits.some(v => v.place && v.place.includes('병원'))) ||
            (dayData.activities.treatments && dayData.activities.treatments.length > 0);
        
        if (hasHospitalVisit) {
            // 병원 방문 후 2시간 이내의 활동 확인
            const hospitalTime = dayData.activities.treatments?.[0]?.end || 
                                dayData.activities.visits?.find(v => v.place?.includes('병원'))?.time;
            
            if (hospitalTime) {
                const [hospitalHour, hospitalMin] = hospitalTime.split(':').map(Number);
                
                // 병원 후 활동 확인
                if (dayData.activities.movements) {
                    dayData.activities.movements.forEach(movement => {
                        const [movementHour, movementMin] = movement.time?.split(':').map(Number) || [0, 0];
                        const timeDiff = (movementHour * 60 + movementMin) - (hospitalHour * 60 + hospitalMin);
                        
                        if (timeDiff > 0 && timeDiff <= 120) { // 2시간 이내
                            if (movement.destinationType === 'home' || movement.destination?.includes('집')) {
                                behaviors.goHome++;
                            } else if (movement.destinationType === 'mart' || movement.destination?.includes('마트')) {
                                behaviors.shopping++;
                            }
                        }
                    });
                }
                
                if (dayData.activities.meals) {
                    dayData.activities.meals.forEach(meal => {
                        const [mealHour, mealMin] = meal.time?.split(':').map(Number) || [0, 0];
                        const timeDiff = (mealHour * 60 + mealMin) - (hospitalHour * 60 + hospitalMin);
                        if (timeDiff > 0 && timeDiff <= 120) {
                            behaviors.meal++;
                        }
                    });
                }
            }
        }
    });
    
    return behaviors;
};

/**
 * 현재 시간대에 대한 맞춤 추천 생성
 * @param {Array} activitiesHistory - 과거 활동 기록
 * @param {Date} currentTime - 현재 시간
 * @returns {Object|null} 추천 정보
 */
export const generatePersonalizedRecommendation = (activitiesHistory, currentTime) => {
    const currentHour = currentTime.getHours();
    const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][currentTime.getDay()];
    
    // 시간대별 패턴 분석
    const walkTimePattern = analyzeTimePattern(activitiesHistory, 'movements');
    const mealTimePattern = analyzeTimePattern(activitiesHistory, 'meals');
    const shoppingTimePattern = analyzeTimePattern(activitiesHistory, 'shopping');
    
    // 가장 빈번한 시간대 찾기
    const frequentWalkHour = getMostFrequentHour(walkTimePattern);
    const frequentMealHour = getMostFrequentHour(mealTimePattern);
    const frequentShoppingHour = getMostFrequentHour(shoppingTimePattern);
    
    // 현재 시간대와 비교하여 추천 생성
    if (frequentWalkHour !== null && Math.abs(currentHour - frequentWalkHour) <= 1) {
        return {
            type: 'walk',
            message: `평소 이 시간(${frequentWalkHour}시)에는 산책을 자주 하셨어요. 오늘도 산책하시겠어요?`,
            confidence: walkTimePattern[frequentWalkHour] || 1
        };
    }
    
    if (frequentMealHour !== null && Math.abs(currentHour - frequentMealHour) <= 1) {
        return {
            type: 'meal',
            message: `평소 이 시간(${frequentMealHour}시)에는 식사를 하셨어요. 맛있는 식사 준비하시겠어요?`,
            confidence: mealTimePattern[frequentMealHour] || 1
        };
    }
    
    if (frequentShoppingHour !== null && Math.abs(currentHour - frequentShoppingHour) <= 1) {
        return {
            type: 'shopping',
            message: `평소 이 시간(${frequentShoppingHour}시)에는 장보기를 하셨어요. 오늘도 장보기 필요하신가요?`,
            confidence: shoppingTimePattern[frequentShoppingHour] || 1
        };
    }
    
    return null;
};

