/**
 * API 호출 캐시 관리 유틸리티
 * API 호출 수와 토큰 사용을 최소화하기 위한 캐싱 시스템
 */

// 경로 검색 캐시 (30분 TTL)
const routeCache = new Map();
const ROUTE_CACHE_TTL = 30 * 60 * 1000; // 30분

// 지오코딩 캐시 (24시간 TTL - 주소는 자주 변하지 않음)
const geocodeCache = new Map();
const GEOCODE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

// Gemini API 응답 캐시 (1시간 TTL)
const geminiCache = new Map();
const GEMINI_CACHE_TTL = 60 * 60 * 1000; // 1시간

/**
 * 경로 검색 캐시 키 생성
 * @param {Object} origin - 출발지 { lat, lng }
 * @param {Object} destination - 목적지 { lat, lng }
 * @returns {string} 캐시 키
 */
const getRouteCacheKey = (origin, destination) => {
    // 좌표를 반올림하여 근사치로 캐싱 (100m 단위)
    const roundCoord = (coord) => Math.round(coord * 1000) / 1000;
    return `${roundCoord(origin.lat)},${roundCoord(origin.lng)}_${roundCoord(destination.lat)},${roundCoord(destination.lng)}`;
};

/**
 * 경로 검색 결과 캐시에서 가져오기
 * @param {Object} origin - 출발지
 * @param {Object} destination - 목적지
 * @returns {Object|null} 캐시된 데이터 또는 null
 */
export const getCachedRoute = (origin, destination) => {
    const key = getRouteCacheKey(origin, destination);
    const cached = routeCache.get(key);
    
    if (!cached) return null;
    
    // TTL 확인
    if (Date.now() - cached.timestamp > ROUTE_CACHE_TTL) {
        routeCache.delete(key);
        return null;
    }
    
    console.log('✅ 경로 검색 캐시 히트:', key);
    return cached.data;
};

/**
 * 경로 검색 결과를 캐시에 저장
 * @param {Object} origin - 출발지
 * @param {Object} destination - 목적지
 * @param {Object} data - 경로 데이터
 */
export const setCachedRoute = (origin, destination, data) => {
    const key = getRouteCacheKey(origin, destination);
    routeCache.set(key, {
        data: data,
        timestamp: Date.now()
    });
    
    // 캐시 크기 제한 (최대 50개)
    if (routeCache.size > 50) {
        const firstKey = routeCache.keys().next().value;
        routeCache.delete(firstKey);
    }
};

/**
 * 지오코딩 결과 캐시에서 가져오기
 * @param {string} address - 주소
 * @returns {Object|null} 캐시된 데이터 또는 null
 */
export const getCachedGeocode = (address) => {
    const key = address.trim().toLowerCase();
    const cached = geocodeCache.get(key);
    
    if (!cached) return null;
    
    // TTL 확인
    if (Date.now() - cached.timestamp > GEOCODE_CACHE_TTL) {
        geocodeCache.delete(key);
        return null;
    }
    
    console.log('✅ 지오코딩 캐시 히트:', address);
    return cached.data;
};

/**
 * 지오코딩 결과를 캐시에 저장
 * @param {string} address - 주소
 * @param {Object} data - 지오코딩 데이터
 */
export const setCachedGeocode = (address, data) => {
    const key = address.trim().toLowerCase();
    geocodeCache.set(key, {
        data: data,
        timestamp: Date.now()
    });
    
    // 캐시 크기 제한 (최대 100개)
    if (geocodeCache.size > 100) {
        const firstKey = geocodeCache.keys().next().value;
        geocodeCache.delete(firstKey);
    }
};

/**
 * Gemini API 응답 캐시에서 가져오기
 * @param {string} query - 사용자 질문
 * @returns {Object|null} 캐시된 데이터 또는 null
 */
export const getCachedGeminiResponse = (query) => {
    const key = query.trim().toLowerCase();
    const cached = geminiCache.get(key);
    
    if (!cached) return null;
    
    // TTL 확인
    if (Date.now() - cached.timestamp > GEMINI_CACHE_TTL) {
        geminiCache.delete(key);
        return null;
    }
    
    console.log('✅ Gemini API 캐시 히트:', query.substring(0, 50) + '...');
    return cached.data;
};

/**
 * Gemini API 응답을 캐시에 저장
 * @param {string} query - 사용자 질문
 * @param {Object} data - API 응답 데이터
 */
export const setCachedGeminiResponse = (query, data) => {
    const key = query.trim().toLowerCase();
    geminiCache.set(key, {
        data: data,
        timestamp: Date.now()
    });
    
    // 캐시 크기 제한 (최대 20개)
    if (geminiCache.size > 20) {
        const firstKey = geminiCache.keys().next().value;
        geminiCache.delete(firstKey);
    }
};

/**
 * 모든 캐시 초기화 (필요시 사용)
 */
export const clearAllCaches = () => {
    routeCache.clear();
    geocodeCache.clear();
    geminiCache.clear();
    console.log('🗑️ 모든 API 캐시가 초기화되었습니다.');
};

/**
 * 캐시 통계 조회
 * @returns {Object} 캐시 통계
 */
export const getCacheStats = () => {
    return {
        routeCache: routeCache.size,
        geocodeCache: geocodeCache.size,
        geminiCache: geminiCache.size,
        total: routeCache.size + geocodeCache.size + geminiCache.size
    };
};
