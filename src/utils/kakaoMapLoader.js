/**
 * 카카오맵 SDK 동적 로드 유틸리티
 * 스크립트가 로드되지 않은 경우에만 동적으로 로드
 */

let kakaoMapScriptLoaded = false;
let kakaoMapScriptLoading = false;
let kakaoMapScriptCallbacks = [];

/**
 * 카카오맵 SDK 스크립트를 동적으로 로드
 * @returns {Promise<void>} SDK 로드 완료 Promise
 */
export const loadKakaoMapSDK = () => {
    return new Promise((resolve, reject) => {
        // 이미 로드되어 있으면 바로 resolve
        if (typeof window !== 'undefined' && window.kakao && window.kakao.maps && window.kakao.maps.Map) {
            resolve();
            return;
        }
        
        // 이미 로딩 중이면 콜백에 추가
        if (kakaoMapScriptLoading) {
            kakaoMapScriptCallbacks.push({ resolve, reject });
            return;
        }
        
        // 이미 로드된 스크립트 태그가 있는지 확인
        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
        if (existingScript) {
            // SDK가 이미 로드되었는지 먼저 확인
            if (typeof window !== 'undefined' && window.kakao && window.kakao.maps && window.kakao.maps.Map) {
                kakaoMapScriptLoaded = true;
                kakaoMapScriptLoading = false;
                resolve();
                kakaoMapScriptCallbacks.forEach(cb => cb.resolve());
                kakaoMapScriptCallbacks = [];
                return;
            }
            
            // 스크립트가 있지만 SDK가 초기화되지 않은 경우
            // 스크립트가 로드되었지만 SDK 초기화가 지연될 수 있으므로 더 오래 기다림
            console.log('📋 카카오맵 스크립트가 이미 HTML에 있습니다. SDK 초기화를 기다리는 중...');
            console.log('   스크립트 src:', existingScript.src);
            
            let retryCount = 0;
            const maxRetries = 200; // 40초 대기 (더 긴 시간)
            const checkSDK = setInterval(() => {
                retryCount++;
                if (retryCount <= 5 || retryCount % 30 === 0) {
                    console.log(`⏳ 카카오맵 SDK 초기화 대기 중... (${retryCount}/${maxRetries})`);
                    console.log('   window.kakao:', typeof window !== 'undefined' ? !!window.kakao : false);
                    console.log('   window.kakao.maps:', typeof window !== 'undefined' && window.kakao ? !!window.kakao.maps : false);
                }
                if (typeof window !== 'undefined' && window.kakao && window.kakao.maps && window.kakao.maps.Map) {
                    clearInterval(checkSDK);
                    kakaoMapScriptLoaded = true;
                    kakaoMapScriptLoading = false;
                    console.log('✅ 카카오맵 SDK 초기화 완료');
                    resolve();
                    kakaoMapScriptCallbacks.forEach(cb => cb.resolve());
                    kakaoMapScriptCallbacks = [];
                } else if (retryCount >= maxRetries) {
                    clearInterval(checkSDK);
                    kakaoMapScriptLoading = false;
                    // SDK 초기화 실패는 정상적인 경우일 수 있으므로 조용하게 처리
                    // (경로 안내는 RouteGuidanceCard로 제공되므로 경고 불필요)
                    // console.warn('⚠️ 카카오맵 SDK 초기화 시간 초과. 지도 없이 길 안내를 계속합니다.');
                    // 지도 없이도 길 안내는 계속 진행 (에러를 reject하지 않고 resolve)
                    resolve(); // reject 대신 resolve하여 지도 없이도 진행 가능하도록
                    kakaoMapScriptCallbacks.forEach(cb => cb.resolve());
                    kakaoMapScriptCallbacks = [];
                }
            }, 200);
            return;
        }
        
        // 스크립트 로딩 시작
        kakaoMapScriptLoading = true;
        
        console.log('📥 카카오맵 SDK 스크립트를 동적으로 로드합니다...');
        
        // 스크립트 태그 생성
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=c40046143e0d37a4d64a5003d6b6a1ae&libraries=services,drawing';
        script.async = true; // 비동기 로드
        
        script.onload = () => {
            // 스크립트 로드 완료 후 SDK 초기화를 기다림
            console.log('📥 카카오맵 스크립트 로드 완료. SDK 초기화 대기 중...');
            let retryCount = 0;
            const maxRetries = 100; // 20초 대기
            const checkSDK = setInterval(() => {
                retryCount++;
                if (retryCount <= 5 || retryCount % 20 === 0) {
                    console.log(`⏳ 카카오맵 SDK 초기화 대기 중... (${retryCount}/${maxRetries})`);
                }
                if (typeof window !== 'undefined' && window.kakao && window.kakao.maps && window.kakao.maps.Map) {
                    clearInterval(checkSDK);
                    kakaoMapScriptLoaded = true;
                    kakaoMapScriptLoading = false;
                    console.log('✅ 카카오맵 SDK 초기화 완료');
                    resolve();
                    kakaoMapScriptCallbacks.forEach(cb => cb.resolve());
                    kakaoMapScriptCallbacks = [];
                } else if (retryCount >= maxRetries) {
                    clearInterval(checkSDK);
                    kakaoMapScriptLoading = false;
                    console.warn('⚠️ 카카오맵 SDK 초기화 시간 초과. 지도 없이 길 안내를 계속합니다.');
                    // 지도 없이도 길 안내는 계속 진행
                    resolve(); // reject 대신 resolve하여 지도 없이도 진행 가능하도록
                    kakaoMapScriptCallbacks.forEach(cb => cb.resolve());
                    kakaoMapScriptCallbacks = [];
                }
            }, 200);
        };
        
        script.onerror = (errorEvent) => {
            kakaoMapScriptLoading = false;
            const error = new Error('카카오맵 SDK 스크립트 로드 실패');
            console.error('❌ 카카오맵 SDK 스크립트 로드 실패:', errorEvent);
            console.error('   스크립트 URL:', script.src);
            console.error('   Network 탭에서 스크립트 로드 상태를 확인해주세요.');
            console.error('   가능한 원인: 네트워크 오류, CORS 문제, API 키 오류');
            reject(error);
            kakaoMapScriptCallbacks.forEach(cb => cb.reject(error));
            kakaoMapScriptCallbacks = [];
        };
        
        // head에 스크립트 추가
        document.head.appendChild(script);
    });
};

/**
 * 카카오맵 SDK가 로드되었는지 확인
 * @returns {boolean} SDK 로드 여부
 */
export const isKakaoMapSDKLoaded = () => {
    return typeof window !== 'undefined' && window.kakao && window.kakao.maps && window.kakao.maps.Map;
};
