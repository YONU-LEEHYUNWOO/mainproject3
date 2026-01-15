// 환경 변수에서 API 키와 모델 로드
// - App.jsx에서 분리하여, 메인 파일은 import/조립 위주로 유지한다.

export const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
export const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

/**
 * 개발 환경에서만 환경 변수/외부 API 설정을 콘솔로 점검한다.
 * - 기존 App.jsx의 동작/로직/UI에는 영향을 주지 않는다(로그만).
 */
export const logEnvConfigInDev = () => {
    // 개발 환경에서 설정 확인 (콘솔에만 표시)
    if (!import.meta.env.DEV) return;

    console.log('🔧 환경 변수 설정 확인:');
    console.log('  - Gemini API 키:', apiKey ? `${apiKey.substring(0, 10)}...` : '❌ 설정되지 않음');
    console.log('  - 모델:', GEMINI_MODEL);

    // 카카오맵 API 키 확인 및 테스트
    const kakaoApiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    if (kakaoApiKey) {
        console.log('  - 카카오맵 API 키:', `${kakaoApiKey.substring(0, 10)}...${kakaoApiKey.substring(kakaoApiKey.length - 5)}`);
        console.log('  - 카카오맵 API 키 길이:', kakaoApiKey.length);

        // API 테스트 (비동기로 실행)
        import('../../../utils/testKakaoApi.js').then(({ testAllKakaoApis }) => {
            testAllKakaoApis().then(results => {
                console.log('📊 카카오 API 테스트 결과:');
                console.log('  요약:', results.summary);
                if (results.tests) {
                    console.log('  - 로컬 API:', results.tests.localApi.success ? '✅' : '❌', results.tests.localApi.message || results.tests.localApi.error);
                    console.log('  - 모빌리티 API:', results.tests.mobilityApi.success ? '✅' : '❌', results.tests.mobilityApi.message || results.tests.mobilityApi.error);
                    if (results.tests.mobilityApi.note) {
                        console.log('  - 참고:', results.tests.mobilityApi.note);
                    }
                }
            }).catch(error => {
                console.error('❌ 카카오 API 테스트 중 오류:', error);
            });
        });
    } else {
        console.log('  - 카카오맵 API 키: ❌ 설정되지 않음');
    }
};

