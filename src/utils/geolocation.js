/**
 * 위치 정보 유틸리티
 * 브라우저 Geolocation API를 사용하여 실제 GPS 위치 정보 가져오기
 */

/**
 * 현재 위치 가져오기
 * @param {Object} options - Geolocation API 옵션
 * @returns {Promise<Object>} { lat, lng, accuracy, timestamp }
 */
export const getCurrentPosition = (options = {}) => {
    return new Promise((resolve, reject) => {
        // Geolocation API 지원 확인
        if (!navigator.geolocation) {
            reject(new Error('이 브라우저는 위치 정보를 지원하지 않습니다.'));
            return;
        }

        // 기본 옵션 설정
        const defaultOptions = {
            enableHighAccuracy: true, // 높은 정확도 사용 (GPS 정확도 향상)
            timeout: 30000, // 30초 타임아웃
            maximumAge: 10000 // 10초간만 캐시된 위치 허용 (더 최신 위치 사용)
        };

        const geolocationOptions = { ...defaultOptions, ...options };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy, // 미터 단위 정확도
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: position.timestamp
                };
                
                console.log('📍 현재 위치 가져오기 성공:', location);
                resolve(location);
            },
            (error) => {
                let errorMessage = '위치 정보를 가져올 수 없습니다.';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '위치 정보를 사용할 수 없습니다.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
                        break;
                    default:
                        errorMessage = '알 수 없는 오류가 발생했습니다.';
                        break;
                }
                
                console.error('❌ 위치 정보 가져오기 실패:', errorMessage, error);
                reject(new Error(errorMessage));
            },
            geolocationOptions
        );
    });
};

/**
 * 위치 권한 상태 확인
 * @returns {Promise<string>} 'granted' | 'denied' | 'prompt'
 */
export const getLocationPermission = async () => {
    if (!navigator.permissions) {
        // 일부 브라우저는 permissions API를 지원하지 않음
        // 이 경우 navigator.geolocation을 직접 사용
        return 'prompt';
    }

    try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state; // 'granted', 'denied', 'prompt'
    } catch (error) {
        console.warn('⚠️ 위치 권한 확인 실패:', error);
        return 'prompt';
    }
};

/**
 * 위치 권한 요청
 * @returns {Promise<boolean>} 권한 허용 여부
 */
export const requestLocationPermission = async () => {
    try {
        const permission = await getLocationPermission();
        
        if (permission === 'granted') {
            return true;
        }
        
        if (permission === 'denied') {
            return false;
        }
        
        // 'prompt' 상태인 경우 위치 정보 요청으로 권한 확인
        try {
            await getCurrentPosition({ timeout: 5000 });
            return true;
        } catch (error) {
            return false;
        }
    } catch (error) {
        console.error('❌ 위치 권한 요청 실패:', error);
        return false;
    }
};

/**
 * 위치 정보를 주소로 변환 (역 지오코딩)
 * 카카오맵 API 또는 다른 지오코딩 서비스 사용
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {Promise<string>} 주소 문자열
 */
export const reverseGeocode = async (lat, lng) => {
    // 입력 검증
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        console.error('❌ 역지오코딩: 잘못된 좌표', { lat, lng });
        return '현재 위치';
    }

    console.log('🔍 역지오코딩 시작:', { 
        lat: lat.toFixed(6), 
        lng: lng.toFixed(6),
        url: `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`
    });

    // 카카오맵 API를 사용한 역 지오코딩
    const kakaoApiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    
    if (!kakaoApiKey) {
        console.warn('⚠️ 카카오맵 API 키가 없어 주소 변환을 할 수 없습니다.');
        console.warn('💡 .env 파일에 VITE_KAKAO_MAP_API_KEY를 설정하세요.');
        return '현재 위치';
    }

    try {
        const response = await fetch(
            `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
            {
                headers: {
                    'Authorization': `KakaoAK ${kakaoApiKey}`
                }
            }
        );

        console.log('📡 API 응답 상태:', response.status, response.statusText);

        if (!response.ok) {
            // 403 오류는 "지도/로컬" 서비스가 비활성화된 경우
            if (response.status === 403) {
                console.warn('⚠️ 카카오 로컬 API 서비스가 비활성화되어 있습니다.');
                console.warn('💡 해결방법:');
                console.warn('   1. https://developers.kakao.com/console/app 접속');
                console.warn('   2. 앱 선택 → 제품 설정 → 지도/로컬');
                console.warn('   3. "활성화 설정" 버튼 클릭');
                return '현재 위치';
            }
            const errorText = await response.text().catch(() => '');
            console.error(`❌ 역 지오코딩 API 오류: ${response.status}`, errorText);
            return '현재 위치';
        }

        const data = await response.json();
        console.log('📦 API 응답 데이터:', JSON.stringify(data, null, 2));
        
        // 응답 구조 확인
        if (!data || !data.documents || !Array.isArray(data.documents) || data.documents.length === 0) {
            console.warn('⚠️ 역 지오코딩 응답에 주소 정보가 없습니다.');
            console.warn('   응답 데이터:', data);
            return '현재 위치';
        }
        
        // 도로명 주소 우선, 지번 주소 후순위
        const doc = data.documents[0];
        let addressName = null;

        // 1. 도로명 주소 시도
        if (doc.road_address && doc.road_address.address_name) {
            addressName = doc.road_address.address_name;
            console.log('✅ 도로명 주소:', addressName);
        }
        // 2. 지번 주소 시도
        else if (doc.address && doc.address.address_name) {
            addressName = doc.address.address_name;
            console.log('✅ 지번 주소:', addressName);
        }
        // 3. region 정보로 조합
        else if (doc.address) {
            const addr = doc.address;
            if (addr.region_1depth_name && addr.region_2depth_name) {
                addressName = `${addr.region_1depth_name} ${addr.region_2depth_name}`;
                if (addr.region_3depth_name) {
                    addressName += ` ${addr.region_3depth_name}`;
                }
                console.log('✅ Region 조합 주소:', addressName);
            }
        }
        
        if (addressName) {
            console.log('🎉 역지오코딩 최종 성공:', addressName);
            return addressName;
        }
        
        console.warn('⚠️ 역 지오코딩 응답에 유효한 주소가 없습니다.');
        console.warn('   문서 내용:', doc);
        return '현재 위치';
        
    } catch (error) {
        console.error('❌ 역 지오코딩 실패:', error);
        console.error('   오류 상세:', {
            message: error.message,
            stack: error.stack,
            lat, lng
        });
        return '현재 위치';
    }
};

/**
 * 주소를 좌표로 변환 (지오코딩)
 * 카카오맵 API를 사용하여 주소를 좌표로 변환
 * API 키가 없으면 시뮬레이션 좌표 반환
 * @param {string} address - 주소 문자열
 * @returns {Promise<Object>} { lat, lng, address } 좌표 정보
 */
export const geocode = async (address) => {
    // 카카오맵 API를 사용한 지오코딩
    const kakaoApiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    
    if (!kakaoApiKey) {
        console.warn('⚠️ 카카오맵 API 키가 없어 시뮬레이션 좌표를 사용합니다.');
        // API 키가 없으면 주소에서 간단한 패턴 매칭으로 좌표 추정
        return getSimulatedCoordinates(address);
    }
    
    // 카카오 로컬 API는 "지도/로컬" 서비스 활성화가 필요합니다
    // 활성화되지 않으면 403 오류가 발생하므로 시뮬레이션 좌표 사용

    try {
        const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
            {
                headers: {
                    'Authorization': `KakaoAK ${kakaoApiKey}`
                }
            }
        );

        if (!response.ok) {
            // 403 오류는 "지도/로컬" 서비스가 비활성화된 경우
            if (response.status === 403) {
                console.warn('⚠️ 카카오 로컬 API 서비스가 비활성화되어 있습니다. 시뮬레이션 좌표를 사용합니다.');
                console.warn('💡 카카오 개발자 센터에서 "지도/로컬" 서비스를 활성화하면 실제 좌표를 사용할 수 있습니다.');
                return getSimulatedCoordinates(address);
            }
            throw new Error(`지오코딩 API 오류: ${response.status}`);
        }

        const data = await response.json();
        
        // 응답 구조 안전하게 확인
        if (!data || !data.documents || !Array.isArray(data.documents) || data.documents.length === 0) {
            console.warn('⚠️ 지오코딩 응답에 주소 정보가 없습니다. 시뮬레이션 좌표를 사용합니다.');
            console.warn('   검색한 주소:', address);
            return getSimulatedCoordinates(address);
        }
        
        const result = data.documents[0];
        
        // 좌표 값 확인
        if (!result.x || !result.y) {
            console.warn('⚠️ 지오코딩 응답에 좌표 정보가 없습니다. 시뮬레이션 좌표를 사용합니다.');
            return getSimulatedCoordinates(address);
        }
        
        const coords = {
            lat: parseFloat(result.y), // 카카오맵 API는 y가 위도
            lng: parseFloat(result.x), // 카카오맵 API는 x가 경도
            address: result.address_name || address,
            simulated: false
        };
        
        // 좌표 유효성 검사
        if (isNaN(coords.lat) || isNaN(coords.lng) || coords.lat === 0 || coords.lng === 0) {
            console.warn('⚠️ 지오코딩 응답의 좌표가 유효하지 않습니다. 시뮬레이션 좌표를 사용합니다.');
            return getSimulatedCoordinates(address);
        }
        
        console.log('✅ 지오코딩 성공 (카카오 로컬 API):', address, '→', coords);
        
        // 캐시에 저장
        const { setCachedGeocode } = await import('./apiCache');
        setCachedGeocode(address, coords);
        
        return coords;
    } catch (error) {
        // 403 오류는 이미 처리했으므로 다른 오류만 처리
        if (error.message && !error.message.includes('403')) {
            console.error('❌ 지오코딩 실패, 시뮬레이션 좌표 사용:', error.message);
            console.error('   검색한 주소:', address);
            console.error('   상세 오류:', error);
        }
        return getSimulatedCoordinates(address);
    }
};

/**
 * 주소에서 시뮬레이션 좌표 생성 (API 키가 없을 때 사용)
 * @param {string} address - 주소 문자열
 * @returns {Object} { lat, lng, address } 시뮬레이션 좌표
 */
const getSimulatedCoordinates = (address) => {
    // 주요 도시/지역 패턴 매칭
    const addressLower = address.toLowerCase();
    
    // 서울 지역
    if (addressLower.includes('서울') || addressLower.includes('강남') || addressLower.includes('강북') || 
        addressLower.includes('송파') || addressLower.includes('강동') || addressLower.includes('서초')) {
        return {
            lat: 37.5665 + (Math.random() - 0.5) * 0.1, // 서울 중심 ±0.05도
            lng: 126.9780 + (Math.random() - 0.5) * 0.1,
            address: address,
            simulated: true
        };
    }
    
    // 경기도 (평택, 수원, 성남 등)
    if (addressLower.includes('평택') || addressLower.includes('수원') || addressLower.includes('성남') ||
        addressLower.includes('안양') || addressLower.includes('용인') || addressLower.includes('안산')) {
        return {
            lat: 36.9923 + (Math.random() - 0.5) * 0.2, // 경기도 중심 ±0.1도
            lng: 127.1119 + (Math.random() - 0.5) * 0.2,
            address: address,
            simulated: true
        };
    }
    
    // 부산
    if (addressLower.includes('부산')) {
        return {
            lat: 35.1796 + (Math.random() - 0.5) * 0.1,
            lng: 129.0756 + (Math.random() - 0.5) * 0.1,
            address: address,
            simulated: true
        };
    }
    
    // 대구
    if (addressLower.includes('대구')) {
        return {
            lat: 35.8714 + (Math.random() - 0.5) * 0.1,
            lng: 128.6014 + (Math.random() - 0.5) * 0.1,
            address: address,
            simulated: true
        };
    }
    
    // 인천
    if (addressLower.includes('인천')) {
        return {
            lat: 37.4563 + (Math.random() - 0.5) * 0.1,
            lng: 126.7052 + (Math.random() - 0.5) * 0.1,
            address: address,
            simulated: true
        };
    }
    
    // 기본값: 평택시 좌표 (약간의 랜덤 오프셋)
    return {
        lat: 36.9923 + (Math.random() - 0.5) * 0.3,
        lng: 127.1119 + (Math.random() - 0.5) * 0.3,
        address: address,
        simulated: true
    };
};

/**
 * 카카오 로컬 API를 사용한 장소 키워드 검색
 * @param {string} keyword - 검색 키워드 (예: "평택시 병원", "강남역")
 * @param {Object} options - 검색 옵션 { x?: number, y?: number, radius?: number, page?: number, size?: number }
 * @returns {Promise<Array>} 검색 결과 배열 [{ place_name, address_name, road_address_name, x, y, ... }]
 */
export const searchPlaces = async (keyword, options = {}) => {
    const kakaoApiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    
    if (!kakaoApiKey) {
        console.warn('⚠️ 카카오맵 API 키가 없어 장소 검색을 할 수 없습니다.');
        return [];
    }

    try {
        // 검색 파라미터 구성
        const params = new URLSearchParams({
            query: keyword,
            size: options.size || 15, // 기본 15개 결과
            page: options.page || 1
        });

        // 중심 좌표가 있으면 추가
        if (options.x && options.y) {
            params.append('x', options.x);
            params.append('y', options.y);
        }

        // 검색 반경이 있으면 추가 (미터 단위)
        if (options.radius) {
            params.append('radius', options.radius);
        }

        const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`,
            {
                headers: {
                    'Authorization': `KakaoAK ${kakaoApiKey}`
                }
            }
        );

        if (!response.ok) {
            // 403 오류는 "지도/로컬" 서비스가 비활성화된 경우
            if (response.status === 403) {
                const errorData = await response.json().catch(() => ({}));
                console.warn('⚠️ 카카오 로컬 API 서비스가 비활성화되어 있습니다.');
                console.warn('💡 카카오 개발자 센터 → 제품 설정 → 지도/로컬 → 활성화');
                // 403 오류를 명확히 구분하기 위해 특별한 객체 반환
                return { error: 'SERVICE_DISABLED', message: errorData.message || '지도/로컬 서비스가 비활성화되어 있습니다.' };
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`장소 검색 API 오류: ${response.status} - ${errorData.message || '알 수 없는 오류'}`);
        }

        const data = await response.json();
        
        if (data.documents && data.documents.length > 0) {
            // 검색 결과를 정리하여 반환
            const results = data.documents.map(doc => ({
                id: doc.id,
                placeName: doc.place_name, // 장소명
                addressName: doc.address_name, // 지번 주소
                roadAddressName: doc.road_address_name, // 도로명 주소
                categoryName: doc.category_name, // 카테고리
                phone: doc.phone, // 전화번호
                placeUrl: doc.place_url, // 장소 상세 URL
                distance: doc.distance, // 중심 좌표로부터의 거리 (미터)
                lat: parseFloat(doc.y), // 위도
                lng: parseFloat(doc.x), // 경도
                // 주소 우선순위: 도로명 주소 > 지번 주소
                address: doc.road_address_name || doc.address_name
            }));
            
            console.log(`✅ 장소 검색 성공: "${keyword}" → ${results.length}개 결과`);
            return results;
        }
        
        console.log(`⚠️ 검색 결과가 없습니다: "${keyword}"`);
        return [];
    } catch (error) {
        // 403 오류는 이미 처리했으므로 다른 오류만 처리
        if (error.message && !error.message.includes('403')) {
            console.error('❌ 장소 검색 실패:', error.message);
        }
        return [];
    }
};

/**
 * 위치 정보를 간단한 주소 문자열로 변환 (API 없이)
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {string} 간단한 위치 설명
 */
export const formatLocationString = (lat, lng) => {
    // 간단한 좌표 기반 위치 설명
    // 실제로는 지오코딩 API를 사용하는 것이 좋지만, 
    // API 키가 없을 때를 대비한 폴백
    return `위도 ${lat.toFixed(4)}, 경도 ${lng.toFixed(4)}`;
};
