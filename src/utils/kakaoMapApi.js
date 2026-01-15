/**
 * 카카오맵 API 유틸리티
 * 교통 정보, 경로 검색, 거리 계산 등 제공
 */

import { getCachedRoute, setCachedRoute } from './apiCache';

/**
 * 카카오맵 API를 통해 경로 검색
 * @param {Object} origin - 출발지 { address: string, lat?: number, lng?: number }
 * @param {Object} destination - 도착지 { address: string, lat?: number, lng?: number }
 * @returns {Promise<Object>} 경로 정보 객체
 */
export const searchRoute = async (origin, destination) => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY || '';
    
    // API 키가 없으면 시뮬레이션 데이터 반환
    if (!apiKey || apiKey === '') {
        console.warn('⚠️ 카카오맵 API 키가 설정되지 않았습니다. 시뮬레이션 데이터를 사용합니다.');
        return getSimulatedRouteData(origin, destination);
    }

    try {
        // 출발지와 목적지 좌표 확인
        const originLng = origin.lng || 127.1119;
        const originLat = origin.lat || 36.9923;
        const destLng = destination.lng || 127.1119;
        const destLat = destination.lat || 36.9923;
        
        // 좌표 유효성 검사
        if (isNaN(originLng) || isNaN(originLat) || isNaN(destLng) || isNaN(destLat)) {
            console.warn('⚠️ 경로 검색: 좌표가 유효하지 않습니다. 시뮬레이션 데이터를 사용합니다.');
            console.warn('   출발지:', origin);
            console.warn('   목적지:', destination);
            return getSimulatedRouteData(origin, destination);
        }
        
        console.log('📍 경로 검색 시작:', {
            origin: `${origin.address || '현재 위치'} (${originLat}, ${originLng})`,
            destination: `${destination.address || '목적지'} (${destLat}, ${destLng})`
        });
        
        // 카카오맵 API 호출 (경로 검색)
        const response = await fetch(
            `https://apis-navi.kakaomobility.com/v1/directions?origin=${originLng},${originLat}&destination=${destLng},${destLat}&waypoints=&priority=RECOMMEND&car_fuel=GASOLINE&car_hipass=false&alternatives=false&road_details=false`,
            {
                headers: {
                    'Authorization': `KakaoAK ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error(`❌ 카카오모빌리티 API 오류: ${response.status}`, errorText);
            console.error('   요청 URL:', response.url);
            throw new Error(`카카오맵 API 오류: ${response.status}`);
        }

        const data = await response.json();
        
        // 응답 데이터 로깅 (디버깅용)
        if (import.meta.env.DEV) {
            console.log('📥 카카오모빌리티 API 응답:', {
                hasRoutes: !!data.routes,
                routesLength: data.routes?.length || 0,
                firstRoute: data.routes?.[0] ? {
                    hasSummary: !!data.routes[0].summary,
                    summary: data.routes[0].summary
                } : null
            });
        }
        
        // API 응답 구조 안전하게 확인
        if (!data || !data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
            console.warn('⚠️ 카카오모빌리티 API 응답에 경로 정보가 없습니다. 시뮬레이션 데이터를 사용합니다.');
            console.warn('   응답 데이터:', data);
            return getSimulatedRouteData(origin, destination);
        }
        
        const route = data.routes[0];
        
        // 실제 응답 구조를 로깅하여 디버깅
        if (import.meta.env.DEV) {
            console.log('📥 카카오모빌리티 API route 객체 상세:', JSON.stringify(route, null, 2));
        }
        
        if (!route) {
            console.warn('⚠️ 카카오모빌리티 API 응답에 route 정보가 없습니다. 시뮬레이션 데이터를 사용합니다.');
            console.warn('   전체 응답:', data);
            return getSimulatedRouteData(origin, destination);
        }
        
        // result_code가 0이 아니면 오류 (길찾기 실패)
        if (route.result_code !== undefined && route.result_code !== 0) {
            console.warn(`⚠️ 카카오모빌리티 API 길찾기 실패 (result_code: ${route.result_code}): ${route.result_msg || '알 수 없는 오류'}`);
            console.warn('   출발지:', origin);
            console.warn('   목적지:', destination);
            return getSimulatedRouteData(origin, destination);
        }
        
        // summary 확인 (응답 구조에 따라 다를 수 있음)
        let summary = route.summary;
        
        // summary가 없으면 다른 필드 확인 (응답 구조가 다를 수 있음)
        if (!summary) {
            // 일부 API 응답에서는 summary 대신 다른 필드에 정보가 있을 수 있음
            if (route.distance !== undefined && route.duration !== undefined) {
                summary = { distance: route.distance, duration: route.duration };
                console.log('📍 summary 대신 route.distance/duration 사용');
            } else if (route.totalDistance !== undefined && route.totalTime !== undefined) {
                summary = { distance: route.totalDistance, duration: route.totalTime };
                console.log('📍 summary 대신 route.totalDistance/totalTime 사용');
            } else {
                console.warn('⚠️ 카카오모빌리티 API 응답에 summary 정보가 없습니다. 시뮬레이션 데이터를 사용합니다.');
                console.warn('   route 객체:', route);
                console.warn('   출발지:', origin);
                console.warn('   목적지:', destination);
                return getSimulatedRouteData(origin, destination);
            }
        }
        
        // duration과 distance가 있는지 확인
        if (summary.duration === undefined || summary.distance === undefined) {
            console.warn('⚠️ 카카오모빌리티 API 응답에 소요 시간 또는 거리 정보가 없습니다. 시뮬레이션 데이터를 사용합니다.');
            console.warn('   summary 객체:', summary);
            console.warn('   출발지:', origin);
            console.warn('   목적지:', destination);
            return getSimulatedRouteData(origin, destination);
        }
        
        // duration과 distance 값 유효성 검사
        if (isNaN(summary.duration) || isNaN(summary.distance) || summary.duration <= 0 || summary.distance <= 0) {
            console.warn('⚠️ 카카오모빌리티 API 응답의 소요 시간 또는 거리가 유효하지 않습니다. 시뮬레이션 데이터를 사용합니다.');
            console.warn('   duration:', summary.duration, 'distance:', summary.distance);
            console.warn('   출발지:', origin);
            console.warn('   목적지:', destination);
            return getSimulatedRouteData(origin, destination);
        }
        
        // API 응답을 앱 형식으로 변환
        const duration = Math.round(summary.duration / 60); // 초를 분으로 변환
        const distance = Math.round(summary.distance / 1000); // 미터를 km로 변환
        
        // guides 배열 추출 (상세 길 안내 정보)
        const guides = [];
        // vertexes 좌표 배열 추출 (경로 시각화용)
        const routePath = [];
        
        if (route.sections && route.sections.length > 0) {
            route.sections.forEach(section => {
                // guides 추출
                if (section.guides && Array.isArray(section.guides)) {
                    section.guides.forEach(guide => {
                        if (guide.guidance && guide.guidance !== '출발지' && guide.guidance !== '목적지') {
                            guides.push({
                                name: guide.name || '',
                                guidance: guide.guidance,
                                distance: guide.distance || 0,
                                duration: guide.duration || 0,
                                type: guide.type || 0,
                                x: guide.x,
                                y: guide.y
                            });
                        }
                    });
                }
                
                // vertexes 추출 (경로 좌표) - roads 배열에서
                if (section.roads && Array.isArray(section.roads)) {
                    section.roads.forEach(road => {
                        if (road.vertexes && Array.isArray(road.vertexes)) {
                            // vertexes는 [lng, lat, lng, lat, ...] 형식
                            for (let i = 0; i < road.vertexes.length; i += 2) {
                                if (road.vertexes[i + 1] !== undefined) {
                                    routePath.push({
                                        lng: road.vertexes[i],
                                        lat: road.vertexes[i + 1]
                                    });
                                }
                            }
                        }
                    });
                }
            });
        }
        
        const routeData = {
            departure: origin.address || '현재 위치',
            destination: destination.address || '목적지',
            duration: formatDuration(duration),
            distance: `${distance}km`,
            tollFare: summary.fare?.toll || 0,
            taxiFare: estimateTaxiFare(distance, duration),
            tip: getRouteTip(duration, distance),
            guides: guides, // 상세 길 안내 정보
            routePath: routePath, // 경로 좌표 배열 (시각화용)
            bounds: summary.bound, // 경계 정보 (시각화용)
            origin: summary.origin, // 출발지 좌표
            destinationCoord: summary.destination, // 목적지 좌표
            timestamp: Date.now(),
            simulated: false // 실제 API 데이터
        };
        
        console.log('✅ 경로 검색 성공:', routeData);
        
        // 캐시에 저장 (실제 좌표가 있는 경우만)
        if (origin.lat && origin.lng && destination.lat && destination.lng) {
            setCachedRoute(origin, destination, routeData);
        }
        
        return routeData;
    } catch (error) {
        console.error('❌ 카카오모빌리티 API 오류:', error.message || error);
        console.error('   출발지:', origin);
        console.error('   목적지:', destination);
        console.error('   상세 오류:', error);
        // 오류 발생 시 시뮬레이션 데이터 반환
        return getSimulatedRouteData(origin, destination);
    }
};

/**
 * 대중교통 경로 검색 (실제 좌표 기반)
 * 카카오모빌리티 API에는 대중교통 전용 API가 없으므로, 자동차 경로를 기반으로 대중교통 시간을 추정
 * @param {Object} origin - 출발지 { address: string, lat: number, lng: number }
 * @param {Object} destination - 도착지 { address: string, lat: number, lng: number }
 * @returns {Promise<Object>} 대중교통 경로 정보
 */
export const searchPublicTransportRoute = async (origin, destination) => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY || '';
    
    // 실제 좌표가 있는지 확인
    const hasRealCoordinates = origin.lat && origin.lng && destination.lat && destination.lng &&
                               !isNaN(origin.lat) && !isNaN(origin.lng) && 
                               !isNaN(destination.lat) && !isNaN(destination.lng);
    
    if (!apiKey || !hasRealCoordinates) {
        console.log('📍 대중교통 경로: 실제 좌표가 없어 시뮬레이션 데이터를 사용합니다.');
        return getSimulatedPublicTransportData(origin, destination);
    }

    try {
        // 실제 좌표를 사용하여 자동차 경로 검색 (대중교통 시간 추정의 기반)
        const response = await fetch(
            `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin.lng},${origin.lat}&destination=${destination.lng},${destination.lat}&waypoints=&priority=RECOMMEND&car_fuel=GASOLINE&car_hipass=false&alternatives=false&road_details=false`,
            {
                headers: {
                    'Authorization': `KakaoAK ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`카카오맵 API 오류: ${response.status}`);
        }

        const data = await response.json();
        
        // API 응답 구조 안전하게 확인
        if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
            console.warn('⚠️ 카카오모빌리티 API 응답에 경로 정보가 없습니다. 시뮬레이션 데이터를 사용합니다.');
            return getSimulatedPublicTransportData(origin, destination);
        }
        
        const route = data.routes[0];
        
        if (!route) {
            console.warn('⚠️ 카카오모빌리티 API 응답에 route 정보가 없습니다. 시뮬레이션 데이터를 사용합니다.');
            console.warn('   전체 응답:', data);
            return getSimulatedPublicTransportData(origin, destination);
        }
        
        // result_code가 0이 아니면 오류 (길찾기 실패)
        if (route.result_code !== undefined && route.result_code !== 0) {
            console.warn(`⚠️ 카카오모빌리티 API 길찾기 실패 (result_code: ${route.result_code}): ${route.result_msg || '알 수 없는 오류'}`);
            return getSimulatedPublicTransportData(origin, destination);
        }
        
        if (!route.summary) {
            console.warn('⚠️ 카카오모빌리티 API 응답에 summary 정보가 없습니다. 시뮬레이션 데이터를 사용합니다.');
            console.warn('   route 객체:', route);
            return getSimulatedPublicTransportData(origin, destination);
        }
        
        const summary = route.summary;
        
        // duration과 distance가 있는지 확인
        if (summary.duration === undefined || summary.distance === undefined) {
            console.warn('⚠️ 카카오모빌리티 API 응답에 소요 시간 또는 거리 정보가 없습니다. 시뮬레이션 데이터를 사용합니다.');
            console.warn('   summary 객체:', summary);
            return getSimulatedPublicTransportData(origin, destination);
        }
        
        // 자동차 경로를 기반으로 대중교통 시간 추정
        // 대중교통은 자동차보다 보통 1.5~2배 정도 더 걸림 (거리와 교통 상황에 따라)
        const carDurationMinutes = Math.round(summary.duration / 60);
        const distanceKm = summary.distance / 1000;
        
        // 거리와 시간에 따라 대중교통 소요 시간 추정
        let publicTransportDurationMinutes;
        if (distanceKm < 5) {
            // 5km 미만: 버스 중심, 자동차 대비 1.3~1.5배
            publicTransportDurationMinutes = Math.round(carDurationMinutes * 1.4);
        } else if (distanceKm < 20) {
            // 5~20km: 지하철/버스 혼합, 자동차 대비 1.5~1.8배
            publicTransportDurationMinutes = Math.round(carDurationMinutes * 1.6);
        } else {
            // 20km 이상: 지하철 중심, 자동차 대비 1.2~1.5배 (고속도로 구간)
            publicTransportDurationMinutes = Math.round(carDurationMinutes * 1.3);
        }
        
        // 환승 정보 추정
        let routes = [];
        let tip = '';
        if (distanceKm < 5) {
            routes = ['버스'];
            tip = '버스를 이용하시면 편리합니다.';
        } else if (distanceKm < 20) {
            routes = ['지하철', '버스 환승'];
            tip = '지하철을 이용하시고 목적지 근처에서 버스로 환승하시면 됩니다.';
        } else {
            routes = ['지하철'];
            tip = '지하철을 이용하시는 것이 가장 빠릅니다.';
        }
        
        console.log(`✅ 대중교통 경로 계산 완료 (실제 좌표 기반): ${origin.address} → ${destination.address}, ${publicTransportDurationMinutes}분`);
        
        const publicTransportData = {
            departure: origin.address || '현재 위치',
            destination: destination.address || '목적지',
            duration: formatDuration(publicTransportDurationMinutes),
            routes: routes,
            tip: tip,
            distance: `${distanceKm.toFixed(1)}km`,
            timestamp: Date.now(),
            simulated: false // 실제 좌표 기반 계산
        };
        
        // 캐시는 searchRoute에서 이미 저장되므로 여기서는 저장하지 않음
        
        return publicTransportData;
    } catch (error) {
        console.error('카카오맵 API 오류:', error);
        return getSimulatedPublicTransportData(origin, destination);
    }
};

/**
 * 시간을 "X시간 Y분" 형식으로 변환
 * @param {number} minutes - 총 분 수
 * @returns {string} 포맷된 시간 문자열
 */
const formatDuration = (minutes) => {
    if (minutes < 60) {
        return `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
};

/**
 * 택시 요금 추정
 * @param {number} distance - 거리 (km)
 * @param {number} duration - 소요 시간 (분)
 * @returns {number} 추정 택시 요금 (원)
 */
const estimateTaxiFare = (distance, duration) => {
    // 기본요금 + 거리요금 + 시간요금 (간단한 추정)
    const baseFare = 4800; // 기본 요금
    const distanceFare = Math.max(0, (distance - 2) * 237); // 2km 이후 거리 요금
    const timeFare = Math.max(0, (duration - 5) * 100); // 5분 이후 시간 요금
    return Math.round(baseFare + distanceFare + timeFare);
};

/**
 * 경로에 따른 팁 생성
 * @param {number} duration - 소요 시간 (분)
 * @param {number} distance - 거리 (km)
 * @returns {string} 경로 팁
 */
const getRouteTip = (duration, distance) => {
    if (duration < 30) {
        return '가까운 거리예요. 대중교통을 이용하시면 편리해요.';
    } else if (duration < 60) {
        return '지하철이나 버스를 이용하시는 것을 추천드려요.';
    } else {
        return '거리가 있어요. 대중교통 환승 시 미리 확인하시고, 여유 있게 출발하세요.';
    }
};

/**
 * 시뮬레이션 경로 데이터 생성
 */
const getSimulatedRouteData = (origin, destination) => {
    const duration = 30 + Math.floor(Math.random() * 90); // 30-120분
    const distance = 10 + Math.floor(Math.random() * 50); // 10-60km
    
    return {
        departure: origin.address || '현재 위치',
        destination: destination.address || '목적지',
        duration: formatDuration(duration),
        distance: `${distance}km`,
        tollFare: duration > 60 ? 5000 : 0,
        taxiFare: estimateTaxiFare(distance, duration),
        tip: getRouteTip(duration, distance),
        timestamp: Date.now(),
        simulated: true
    };
};

/**
 * 도보 경로 계산 (실제 좌표 기반)
 * 하버사인 공식을 사용하여 실제 좌표 간 거리를 정확하게 계산
 * @param {Object} origin - 출발지 { address: string, lat: number, lng: number }
 * @param {Object} destination - 도착지 { address: string, lat: number, lng: number }
 * @returns {Object} 도보 경로 정보
 */
export const calculateWalkingRoute = (origin, destination) => {
    // 실제 좌표가 있는지 확인
    const hasRealCoordinates = origin.lat && origin.lng && destination.lat && destination.lng &&
                               !isNaN(origin.lat) && !isNaN(origin.lng) && 
                               !isNaN(destination.lat) && !isNaN(destination.lng);
    
    if (!hasRealCoordinates) {
        console.log('📍 도보 경로: 실제 좌표가 없어 시뮬레이션 데이터를 사용합니다.');
        // 시뮬레이션 거리 (5km로 가정)
        return {
            departure: origin.address || '현재 위치',
            destination: destination.address || '목적지',
            distance: '약 5km',
            duration: formatDuration(75), // 약 1시간 15분
            tip: '거리가 있어요. 대중교통이나 택시를 이용하시는 것이 좋습니다.',
            timestamp: Date.now(),
            simulated: true
        };
    }
    
    // 하버사인 공식을 사용하여 실제 거리 계산
    const R = 6371; // 지구 반경 (km)
    const lat1 = origin.lat * Math.PI / 180;
    const lat2 = destination.lat * Math.PI / 180;
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLng = (destination.lng - origin.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // km (실제 직선 거리)
    
    // 도보 속도: 평균 4km/h (시속 4km, 노인분들을 고려한 속도)
    const walkingSpeed = 4; // km/h
    const durationMinutes = Math.round((distance / walkingSpeed) * 60);
    
    // 거리별 추천 팁
    let tip = '';
    if (distance < 0.5) {
        tip = '가까운 거리예요. 도보로 이동하시면 됩니다.';
    } else if (distance < 1) {
        tip = '도보로 이동 가능한 거리예요. 건강을 위해 걸어가시는 것을 추천드려요.';
    } else if (distance < 3) {
        tip = '도보로 이동 가능하지만 시간이 걸릴 수 있어요. 여유 있게 출발하세요.';
    } else {
        tip = '거리가 있어요. 대중교통이나 택시를 이용하시는 것이 좋습니다.';
    }
    
    console.log(`✅ 도보 경로 계산 완료 (실제 좌표 기반): ${origin.address} → ${destination.address}, ${distance.toFixed(2)}km, ${durationMinutes}분`);
    
    return {
        departure: origin.address || '현재 위치',
        destination: destination.address || '목적지',
        distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
        duration: formatDuration(durationMinutes),
        tip: tip,
        timestamp: Date.now(),
        simulated: false // 실제 좌표 기반 계산
    };
};

/**
 * 시뮬레이션 대중교통 데이터 생성
 */
const getSimulatedPublicTransportData = (origin, destination) => {
    const duration = 40 + Math.floor(Math.random() * 80); // 40-120분
    
    return {
        departure: origin.address || '현재 위치',
        destination: destination.address || '목적지',
        duration: formatDuration(duration),
        routes: ['지하철 1호선', '버스 환승'],
        tip: '지하철 1호선 탑승 후 목적지역에서 버스로 환승하세요.',
        timestamp: Date.now(),
        simulated: true
    };
};

