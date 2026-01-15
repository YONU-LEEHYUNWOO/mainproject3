/**
 * 카카오 로컬 API 유틸리티
 * 주변 장소 검색 (식당, 마트, 약국 등)
 */

/**
 * 두 좌표 간 거리 계산 (Haversine 공식)
 * @param {number} lat1 - 위도 1
 * @param {number} lng1 - 경도 1
 * @param {number} lat2 - 위도 2
 * @param {number} lng2 - 경도 2
 * @returns {number} 거리 (미터)
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 거리 (미터)
};

/**
 * 거리를 읽기 쉬운 형식으로 변환
 * @param {number} distance - 거리 (미터)
 * @returns {string} 포맷된 거리 문자열
 */
export const formatDistance = (distance) => {
    if (distance < 1000) {
        return `${Math.round(distance)}m`;
    } else {
        return `${(distance / 1000).toFixed(1)}km`;
    }
};

/**
 * 카카오 로컬 API를 통해 주변 장소 검색
 * @param {Object} params - 검색 파라미터
 * @param {number} params.lat - 위도
 * @param {number} params.lng - 경도
 * @param {string} params.category - 카테고리 코드 (FD6: 음식점, MT1: 대형마트, PM9: 약국 등)
 * @param {number} params.radius - 검색 반경 (미터, 기본값: 2000)
 * @param {number} params.size - 결과 개수 (기본값: 15)
 * @returns {Promise<Array>} 장소 목록
 */
export const searchNearbyPlaces = async ({ lat, lng, category, radius = 2000, size = 15 }) => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY || '';
    
    // API 키가 없으면 시뮬레이션 데이터 반환
    if (!apiKey || apiKey === '') {
        console.warn('⚠️ 카카오맵 API 키가 설정되지 않았습니다. 시뮬레이션 데이터를 사용합니다.');
        return getSimulatedPlaces(category, lat, lng);
    }

    // 좌표 유효성 검사
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        console.warn('⚠️ 주변 장소 검색: 좌표가 유효하지 않습니다. 시뮬레이션 데이터를 사용합니다.');
        return getSimulatedPlaces(category, lat || 37.5665, lng || 126.9780);
    }

    try {
        console.log('📍 주변 장소 검색 시작:', { lat, lng, category, radius });

        // 카카오 로컬 API 호출 (카테고리별 장소 검색)
        const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${category}&x=${lng}&y=${lat}&radius=${radius}&size=${size}&sort=distance`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `KakaoAK ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`카카오 로컬 API 오류: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.documents || data.documents.length === 0) {
            console.log('📍 검색 결과가 없습니다. 시뮬레이션 데이터를 사용합니다.');
            return getSimulatedPlaces(category, lat, lng);
        }

        // 결과를 표준 형식으로 변환
        const places = data.documents.map((place, index) => {
            const distance = calculateDistance(lat, lng, parseFloat(place.y), parseFloat(place.x));
            
            return {
                id: place.id || `place_${Date.now()}_${index}`,
                name: place.place_name || place.name || '이름 없음',
                address: place.address_name || place.road_address_name || '',
                roadAddress: place.road_address_name || '',
                phone: place.phone || '',
                lat: parseFloat(place.y),
                lng: parseFloat(place.x),
                distance: distance,
                distanceFormatted: formatDistance(distance),
                category: place.category_name || '',
                url: place.place_url || '',
                // 카테고리별 추가 정보
                ...(category === 'FD6' && {
                    // 음식점 정보
                    price: getPriceLevel(place), // 가격대 추정
                    accessible: false // 접근성 정보는 별도로 확인 필요
                })
            };
        });

        // 거리순 정렬
        places.sort((a, b) => a.distance - b.distance);

        console.log(`✅ 주변 장소 검색 완료: ${places.length}개 결과`);
        return places;

    } catch (error) {
        console.error('❌ 주변 장소 검색 실패:', error);
        // 에러 발생 시 시뮬레이션 데이터 반환
        return getSimulatedPlaces(category, lat, lng);
    }
};

/**
 * 가격대 추정 (카테고리명 기반)
 * @param {Object} place - 장소 정보
 * @returns {string} 가격대 ('저렴', '보통', '비쌈')
 */
const getPriceLevel = (place) => {
    const categoryName = place.category_name || '';
    const placeName = place.place_name || '';
    
    // 카테고리명이나 장소명에서 가격대 추정
    if (categoryName.includes('치킨') || categoryName.includes('분식') || categoryName.includes('한식')) {
        return '저렴';
    } else if (categoryName.includes('일식') || categoryName.includes('양식') || categoryName.includes('중식')) {
        return '보통';
    } else {
        return '보통';
    }
};

/**
 * 시뮬레이션 장소 데이터 생성
 * @param {string} category - 카테고리 코드
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {Array} 시뮬레이션 장소 목록
 */
const getSimulatedPlaces = (category, lat = 37.5665, lng = 126.9780) => {
    const basePlaces = {
        'FD6': [ // 음식점
            { name: '한식당 맛나', distance: 200, price: '저렴', accessible: true, phone: '02-1234-5678' },
            { name: '일식집 사쿠라', distance: 500, price: '보통', accessible: true, phone: '02-2345-6789' },
            { name: '중식당 만리장성', distance: 300, price: '저렴', accessible: false, phone: '02-3456-7890' },
            { name: '양식당 로즈', distance: 800, price: '비쌈', accessible: true, phone: '02-4567-8901' },
            { name: '분식집 할머니', distance: 150, price: '저렴', accessible: false, phone: '02-5678-9012' }
        ],
        'MT1': [ // 대형마트
            { name: '이마트', distance: 1000, phone: '02-1111-2222' },
            { name: '롯데마트', distance: 1200, phone: '02-2222-3333' },
            { name: '홈플러스', distance: 1500, phone: '02-3333-4444' }
        ],
        'PM9': [ // 약국
            { name: '건강약국', distance: 300, phone: '02-4444-5555' },
            { name: '우리약국', distance: 500, phone: '02-5555-6666' },
            { name: '행복약국', distance: 700, phone: '02-6666-7777' }
        ],
        'CS2': [ // 편의점
            { name: 'GS25 강남점', distance: 150, phone: '02-1111-8888' },
            { name: 'CU 테헤란로점', distance: 250, phone: '02-2222-8888' },
            { name: '세븐일레븐', distance: 400, phone: '02-3333-8888' },
            { name: '이마트24', distance: 550, phone: '02-4444-8888' },
            { name: '미니스톱', distance: 650, phone: '02-5555-8888' }
        ]
    };

    const places = basePlaces[category] || basePlaces['FD6'];
    
    return places.map((place, index) => ({
        id: `sim_${category}_${index}`,
        name: place.name,
        address: `서울시 강남구 테헤란로 ${index + 1}`,
        roadAddress: `서울시 강남구 테헤란로 ${index + 1}`,
        phone: place.phone || '',
        lat: lat + (Math.random() - 0.5) * 0.01,
        lng: lng + (Math.random() - 0.5) * 0.01,
        distance: place.distance,
        distanceFormatted: formatDistance(place.distance),
        category: category,
        price: place.price,
        accessible: place.accessible !== undefined ? place.accessible : true
    }));
};

/**
 * 카카오 로컬 API를 통해 키워드로 장소 검색
 * @param {Object} params - 검색 파라미터
 * @param {number} params.lat - 위도 (현재 위치)
 * @param {number} params.lng - 경도 (현재 위치)
 * @param {string} params.keyword - 검색 키워드
 * @param {number} params.radius - 검색 반경 (미터, 기본값: 5000)
 * @param {number} params.size - 결과 개수 (기본값: 15)
 * @returns {Promise<Array>} 장소 목록
 */
export const searchPlacesByKeyword = async ({ lat, lng, keyword, radius = 5000, size = 15 }) => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY || '';
    
    // API 키가 없으면 시뮬레이션 데이터 반환
    if (!apiKey || apiKey === '') {
        console.warn('⚠️ 카카오맵 API 키가 설정되지 않았습니다. 시뮬레이션 데이터를 사용합니다.');
        return getSimulatedPlacesByKeyword(keyword, lat, lng);
    }

    // 키워드 유효성 검사
    if (!keyword || keyword.trim() === '') {
        console.warn('⚠️ 키워드가 없습니다.');
        return [];
    }

    // 좌표 유효성 검사
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        console.warn('⚠️ 키워드 장소 검색: 좌표가 유효하지 않습니다. 시뮬레이션 데이터를 사용합니다.');
        return getSimulatedPlacesByKeyword(keyword, lat || 37.5665, lng || 126.9780);
    }

    try {
        console.log('📍 키워드 장소 검색 시작:', { lat, lng, keyword, radius });

        // 카카오 로컬 API 호출 (키워드 검색)
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&x=${lng}&y=${lat}&radius=${radius}&size=${size}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `KakaoAK ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`카카오 로컬 API 오류: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.documents || data.documents.length === 0) {
            console.log('📍 검색 결과가 없습니다.');
            return [];
        }

        // 결과를 표준 형식으로 변환
        const places = data.documents.map((place, index) => {
            const distance = calculateDistance(lat, lng, parseFloat(place.y), parseFloat(place.x));
            
            return {
                id: place.id || `place_${Date.now()}_${index}`,
                name: place.place_name || place.name || '이름 없음',
                address: place.address_name || place.road_address_name || '',
                roadAddress: place.road_address_name || '',
                phone: place.phone || '',
                lat: parseFloat(place.y),
                lng: parseFloat(place.x),
                distance: distance,
                distanceFormatted: formatDistance(distance),
                category: place.category_name || '',
                url: place.place_url || '',
                categoryGroupCode: place.category_group_code || ''
            };
        });

        // 거리순 정렬
        places.sort((a, b) => a.distance - b.distance);

        console.log(`✅ 키워드 장소 검색 완료: ${places.length}개 결과`);
        return places;

    } catch (error) {
        console.error('❌ 키워드 장소 검색 실패:', error);
        // 에러 발생 시 시뮬레이션 데이터 반환
        return getSimulatedPlacesByKeyword(keyword, lat, lng);
    }
};

/**
 * 키워드 기반 시뮬레이션 장소 데이터 생성
 * @param {string} keyword - 검색 키워드
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {Array} 시뮬레이션 장소 목록
 */
const getSimulatedPlacesByKeyword = (keyword, lat = 37.5665, lng = 126.9780) => {
    // 키워드에 따라 다양한 장소 생성
    const keywordPlaces = [
        { name: `${keyword} 1호점`, distance: 300, phone: '02-1111-2222' },
        { name: `${keyword} 본점`, distance: 600, phone: '02-2222-3333' },
        { name: `${keyword} 강남점`, distance: 900, phone: '02-3333-4444' },
        { name: `${keyword} 신규 매장`, distance: 1200, phone: '02-4444-5555' }
    ];
    
    return keywordPlaces.map((place, index) => ({
        id: `sim_keyword_${Date.now()}_${index}`,
        name: place.name,
        address: `서울시 강남구 테헤란로 ${index + 1}`,
        roadAddress: `서울시 강남구 테헤란로 ${index + 1}`,
        phone: place.phone || '',
        lat: lat + (Math.random() - 0.5) * 0.01,
        lng: lng + (Math.random() - 0.5) * 0.01,
        distance: place.distance,
        distanceFormatted: formatDistance(place.distance),
        category: keyword,
        categoryGroupCode: ''
    }));
};

/**
 * 카테고리 코드 매핑
 */
export const CATEGORY_CODES = {
    RESTAURANT: 'FD6',      // 음식점
    MART: 'MT1',            // 대형마트
    PHARMACY: 'PM9',        // 약국
    CAFE: 'CE7',            // 카페
    CONVENIENCE: 'CS2',     // 편의점
    HOSPITAL: 'HP8'         // 병원
};
