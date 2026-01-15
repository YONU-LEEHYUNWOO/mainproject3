/**
 * 장소 추천 유틸리티
 * 과거 방문 장소를 기반으로 맞춤 추천 제공
 */

/**
 * 과거 방문 장소 목록 추출
 * @param {Object} dailyActivities - 오늘 활동 기록
 * @param {Array} activitiesHistory - 과거 활동 기록 (날짜별)
 * @returns {Array} 방문 장소 목록 (중복 제거, 방문 횟수 포함)
 */
export const getVisitedPlaces = (dailyActivities = {}, activitiesHistory = []) => {
    const visitedPlacesMap = new Map(); // 장소명 -> { count, lastVisit, places }

    // 오늘 방문 장소
    if (dailyActivities.visits && Array.isArray(dailyActivities.visits)) {
        dailyActivities.visits.forEach(visit => {
            if (visit.place) {
                const placeName = visit.place.trim();
                if (placeName) {
                    const existing = visitedPlacesMap.get(placeName) || { count: 0, lastVisit: null, places: [] };
                    existing.count += 1;
                    existing.lastVisit = visit.time || new Date().toISOString();
                    existing.places.push(visit);
                    visitedPlacesMap.set(placeName, existing);
                }
            }
        });
    }

    // 과거 방문 장소 (최근 30일)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    activitiesHistory.forEach(dayRecord => {
        if (dayRecord.visits && Array.isArray(dayRecord.visits)) {
            const recordDate = dayRecord.date ? new Date(dayRecord.date) : null;
            
            // 최근 30일 내 기록만 포함
            if (!recordDate || recordDate >= thirtyDaysAgo) {
                dayRecord.visits.forEach(visit => {
                    if (visit.place) {
                        const placeName = visit.place.trim();
                        if (placeName) {
                            const existing = visitedPlacesMap.get(placeName) || { count: 0, lastVisit: null, places: [] };
                            existing.count += 1;
                            if (recordDate && (!existing.lastVisit || recordDate > new Date(existing.lastVisit))) {
                                existing.lastVisit = recordDate.toISOString();
                            }
                            existing.places.push(visit);
                            visitedPlacesMap.set(placeName, existing);
                        }
                    }
                });
            }
        }
    });

    // 배열로 변환 및 정렬 (방문 횟수 내림차순, 최근 방문일 내림차순)
    return Array.from(visitedPlacesMap.entries())
        .map(([name, data]) => ({
            name,
            count: data.count,
            lastVisit: data.lastVisit,
            visits: data.places
        }))
        .sort((a, b) => {
            // 방문 횟수 우선, 같으면 최근 방문일 우선
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            if (a.lastVisit && b.lastVisit) {
                return new Date(b.lastVisit) - new Date(a.lastVisit);
            }
            return 0;
        });
};

/**
 * 검색 결과를 과거 방문 장소 우선으로 정렬
 * @param {Array} places - 검색된 장소 목록
 * @param {Array} visitedPlaces - 과거 방문 장소 목록
 * @returns {Array} 정렬된 장소 목록
 */
export const sortPlacesByVisitHistory = (places = [], visitedPlaces = []) => {
    if (!places || places.length === 0) return places;
    if (!visitedPlaces || visitedPlaces.length === 0) return places;

    // 방문 장소 이름 목록 (대소문자 무시)
    const visitedNames = visitedPlaces.map(vp => vp.name.toLowerCase().trim());

    // 장소 매칭 함수 (이름 또는 주소로 매칭)
    const isVisitedPlace = (place) => {
        const placeName = (place.name || '').toLowerCase().trim();
        const placeAddress = (place.address || '').toLowerCase().trim();
        const roadAddress = (place.roadAddress || '').toLowerCase().trim();

        return visitedNames.some(visitedName => {
            // 정확히 일치
            if (placeName === visitedName || placeAddress.includes(visitedName) || roadAddress.includes(visitedName)) {
                return true;
            }
            // 부분 일치 (장소명이 방문 장소명을 포함하거나 그 반대)
            if (placeName.includes(visitedName) || visitedName.includes(placeName)) {
                return true;
            }
            return false;
        });
    };

    // 방문 장소 정보 가져오기
    const getVisitInfo = (place) => {
        const placeName = (place.name || '').toLowerCase().trim();
        return visitedPlaces.find(vp => {
            const visitedName = vp.name.toLowerCase().trim();
            return placeName === visitedName || 
                   placeName.includes(visitedName) || 
                   visitedName.includes(placeName);
        });
    };

    // 장소를 분류
    const visited = [];
    const notVisited = [];

    places.forEach(place => {
        if (isVisitedPlace(place)) {
            const visitInfo = getVisitInfo(place);
            visited.push({
                ...place,
                _visitCount: visitInfo?.count || 0,
                _lastVisit: visitInfo?.lastVisit || null,
                _isVisited: true
            });
        } else {
            notVisited.push({
                ...place,
                _visitCount: 0,
                _isVisited: false
            });
        }
    });

    // 방문 장소 정렬: 방문 횟수 내림차순, 최근 방문일 내림차순, 거리 오름차순
    visited.sort((a, b) => {
        if (b._visitCount !== a._visitCount) {
            return b._visitCount - a._visitCount;
        }
        if (a._lastVisit && b._lastVisit) {
            const dateDiff = new Date(b._lastVisit) - new Date(a._lastVisit);
            if (dateDiff !== 0) return dateDiff;
        }
        // 거리순 정렬
        return (a.distance || 0) - (b.distance || 0);
    });

    // 미방문 장소는 거리순 정렬 유지
    notVisited.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    // 방문 장소를 먼저, 그 다음 미방문 장소
    return [...visited, ...notVisited];
};

/**
 * 장소 추천 점수 계산 (방문 횟수, 최근 방문일, 거리 고려)
 * @param {Object} place - 장소 정보
 * @param {Array} visitedPlaces - 과거 방문 장소 목록
 * @returns {number} 추천 점수 (높을수록 우선순위 높음)
 */
export const calculatePlaceScore = (place, visitedPlaces = []) => {
    let score = 0;

    // 방문 이력 확인
    const placeName = (place.name || '').toLowerCase().trim();
    const visitInfo = visitedPlaces.find(vp => {
        const visitedName = vp.name.toLowerCase().trim();
        return placeName === visitedName || 
               placeName.includes(visitedName) || 
               visitedName.includes(placeName);
    });

    if (visitInfo) {
        // 방문 횟수에 따른 점수 (최대 50점)
        score += Math.min(visitInfo.count * 10, 50);

        // 최근 방문일 점수 (최대 30점)
        if (visitInfo.lastVisit) {
            const daysSinceVisit = Math.floor((new Date() - new Date(visitInfo.lastVisit)) / (1000 * 60 * 60 * 24));
            if (daysSinceVisit <= 7) {
                score += 30; // 최근 7일 내 방문
            } else if (daysSinceVisit <= 14) {
                score += 20; // 최근 14일 내 방문
            } else if (daysSinceVisit <= 30) {
                score += 10; // 최근 30일 내 방문
            }
        }
    }

    // 거리 점수 (가까울수록 높음, 최대 20점)
    if (place.distance) {
        if (place.distance <= 500) {
            score += 20; // 500m 이내
        } else if (place.distance <= 1000) {
            score += 15; // 1km 이내
        } else if (place.distance <= 2000) {
            score += 10; // 2km 이내
        } else if (place.distance <= 5000) {
            score += 5; // 5km 이내
        }
    }

    return score;
};
