// Leaflet 동적 로드 (CDN만 사용)
let L = null;
let leafletLoaded = false;

/**
 * CDN에서 Leaflet 로드 (npm 패키지 없이도 작동)
 * @returns {Promise} Leaflet 객체
 */
export const loadLeaflet = () => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('브라우저 환경이 아닙니다.'));
            return;
        }

        // 이미 로드되어 있으면 사용
        if (window.L) {
            L = window.L;
            leafletLoaded = true;
            resolve(L);
            return;
        }

        // CSS 로드
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            cssLink.crossOrigin = '';
            document.head.appendChild(cssLink);
        }

        // JavaScript 로드
        const existingScript = document.querySelector('script[src*="leaflet"]');
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = () => {
                if (window.L) {
                    L = window.L;
                    leafletLoaded = true;
                    resolve(L);
                } else {
                    reject(new Error('Leaflet이 로드되었지만 window.L이 없습니다.'));
                }
            };
            script.onerror = () => {
                reject(new Error('Leaflet CDN 로드 실패'));
            };
            document.head.appendChild(script);
        } else {
            // 이미 스크립트가 있으면 대기
            let retryCount = 0;
            const maxRetries = 50; // 5초 대기
            const checkInterval = setInterval(() => {
                retryCount++;
                if (window.L) {
                    clearInterval(checkInterval);
                    L = window.L;
                    leafletLoaded = true;
                    resolve(L);
                } else if (retryCount >= maxRetries) {
                    clearInterval(checkInterval);
                    reject(new Error('Leaflet 로드 시간 초과'));
                }
            }, 100);
        }
    });
};

/**
 * Leaflet이 로드되었는지 확인
 * @returns {boolean} 로드 상태
 */
export const isLeafletLoaded = () => leafletLoaded;