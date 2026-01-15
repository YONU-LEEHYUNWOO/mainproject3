/**
 * 카카오 API 키 테스트 유틸리티
 * REST API 키가 각 카카오 서비스에서 작동하는지 확인
 */

/**
 * 카카오 로컬 API 테스트 (지오코딩)
 * @param {string} apiKey - 카카오 REST API 키
 * @returns {Promise<Object>} 테스트 결과
 */
export const testKakaoLocalApi = async (apiKey) => {
    if (!apiKey) {
        return { success: false, error: 'API 키가 없습니다.' };
    }

    try {
        // 간단한 주소 검색 테스트
        const testAddress = '서울특별시 강남구';
        const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(testAddress)}`,
            {
                headers: {
                    'Authorization': `KakaoAK ${apiKey}`
                }
            }
        );

        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                error: `HTTP ${response.status}: ${data.message || '알 수 없는 오류'}`,
                details: data
            };
        }

        if (data.documents && data.documents.length > 0) {
            return {
                success: true,
                service: '카카오 로컬 API (지오코딩)',
                message: '✅ 정상 작동합니다!',
                testResult: data.documents[0]
            };
        }

        return {
            success: false,
            error: '응답 데이터가 없습니다.',
            details: data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};

/**
 * 카카오모빌리티 API 테스트 (경로 검색)
 * @param {string} apiKey - 카카오 REST API 키
 * @returns {Promise<Object>} 테스트 결과
 */
export const testKakaoMobilityApi = async (apiKey) => {
    if (!apiKey) {
        return { success: false, error: 'API 키가 없습니다.' };
    }

    try {
        // 간단한 경로 검색 테스트 (서울 강남구 → 서울 종로구)
        const origin = '127.0276,37.4979'; // 강남구 좌표
        const destination = '126.9780,37.5665'; // 종로구 좌표
        
        const response = await fetch(
            `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}&waypoints=&priority=RECOMMEND&car_fuel=GASOLINE&car_hipass=false&alternatives=false&road_details=false`,
            {
                headers: {
                    'Authorization': `KakaoAK ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                error: `HTTP ${response.status}: ${data.message || '알 수 없는 오류'}`,
                details: data,
                note: '카카오모빌리티 API는 별도의 키가 필요할 수 있습니다.'
            };
        }

        if (data.routes && data.routes.length > 0) {
            return {
                success: true,
                service: '카카오모빌리티 API (경로 검색)',
                message: '✅ 정상 작동합니다!',
                testResult: {
                    duration: data.routes[0].summary?.duration,
                    distance: data.routes[0].summary?.distance
                }
            };
        }

        return {
            success: false,
            error: '응답 데이터가 없습니다.',
            details: data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            details: error,
            note: '카카오모빌리티 API는 별도의 키가 필요할 수 있습니다.'
        };
    }
};

/**
 * 모든 카카오 API 테스트
 * @returns {Promise<Object>} 전체 테스트 결과
 */
export const testAllKakaoApis = async () => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY || '';
    
    if (!apiKey) {
        return {
            apiKeyExists: false,
            message: '⚠️ VITE_KAKAO_MAP_API_KEY가 .env 파일에 설정되지 않았습니다.'
        };
    }

    console.log('🔍 카카오 API 키 테스트 시작...');
    console.log('📝 API 키:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));

    const results = {
        apiKeyExists: true,
        apiKeyPreview: apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5),
        tests: {}
    };

    // 1. 카카오 로컬 API 테스트 (지오코딩)
    console.log('1️⃣ 카카오 로컬 API 테스트 중...');
    results.tests.localApi = await testKakaoLocalApi(apiKey);
    console.log('카카오 로컬 API 결과:', results.tests.localApi);

    // 2. 카카오모빌리티 API 테스트 (경로 검색)
    console.log('2️⃣ 카카오모빌리티 API 테스트 중...');
    results.tests.mobilityApi = await testKakaoMobilityApi(apiKey);
    console.log('카카오모빌리티 API 결과:', results.tests.mobilityApi);

    // 요약
    const localSuccess = results.tests.localApi.success;
    const mobilitySuccess = results.tests.mobilityApi.success;

    if (localSuccess && mobilitySuccess) {
        results.summary = '✅ 모든 카카오 API가 정상 작동합니다!';
    } else if (localSuccess) {
        results.summary = '⚠️ 카카오 로컬 API는 작동하지만, 카카오모빌리티 API는 별도 키가 필요할 수 있습니다.';
    } else if (mobilitySuccess) {
        results.summary = '⚠️ 카카오모빌리티 API는 작동하지만, 카카오 로컬 API에 문제가 있습니다.';
    } else {
        results.summary = '❌ 카카오 API가 작동하지 않습니다. API 키를 확인해주세요.';
    }

    return results;
};
