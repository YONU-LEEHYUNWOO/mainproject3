/**
 * 택시 호출 유틸리티
 * 전화 연결 및 앱 링크를 통한 택시 호출 기능 제공
 * 
 * 참고: 카카오택시 앱 연동 기능은 상용화 후 활성화 예정
 * (앱 등록 및 API 승인이 필요)
 */

/**
 * 주요 택시 회사 전화번호
 */
const TAXI_COMPANIES = {
    '일반택시': '1588-0000',
    '카카오택시': null, // 앱 링크 사용
    '타다': null, // 앱 링크 사용
    '우버': null // 앱 링크 사용
};

/**
 * 전화로 택시 호출
 * @param {string} phoneNumber - 전화번호 (선택사항, 없으면 일반 택시 번호 사용)
 * @returns {void}
 */
export const callTaxiByPhone = (phoneNumber = TAXI_COMPANIES['일반택시']) => {
    if (!phoneNumber) {
        console.error('택시 전화번호가 없습니다.');
        return;
    }
    
    // 전화번호에서 하이픈 제거
    const cleanPhoneNumber = phoneNumber.replace(/-/g, '');
    
    // tel: 링크로 전화 연결
    window.location.href = `tel:${cleanPhoneNumber}`;
    
    console.log(`📞 택시 호출: ${phoneNumber}`);
};

/**
 * 카카오택시 앱 열기 또는 웹으로 이동
 * 
 * ⚠️ 주의: 이 기능은 상용화 후 활성화 예정입니다.
 * 카카오택시 앱 연동을 위해서는 앱 등록 및 API 승인이 필요합니다.
 * 
 * @param {Object} origin - 출발지 { lat, lng, address }
 * @param {Object} destination - 목적지 { lat, lng, address }
 * @returns {void}
 */
export const openKakaoTaxi = (origin, destination) => {
    // 카카오택시 앱 스킴 (앱이 설치되어 있으면 앱 열기)
    // 카카오택시 앱 URL 스킴 형식
    const kakaoTaxiScheme = `kakaot://taxi?from=${origin.lat},${origin.lng}&to=${destination.lat},${destination.lng}`;
    
    // 카카오택시 웹 링크 (앱이 없으면 웹으로 이동)
    const kakaoTaxiWeb = `https://taxi.kakao.com/`;
    
    // 앱 열기 시도
    try {
        // iframe을 사용하여 앱 열기 시도 (더 안정적)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = kakaoTaxiScheme;
        document.body.appendChild(iframe);
        
        // 2초 후 iframe 제거 및 웹으로 리다이렉트
        setTimeout(() => {
            document.body.removeChild(iframe);
            // 앱이 없을 경우 웹으로 이동
            window.open(kakaoTaxiWeb, '_blank');
        }, 2000);
    } catch (error) {
        // 오류 발생 시 웹으로 이동
        console.warn('카카오택시 앱 열기 실패, 웹으로 이동:', error);
        window.open(kakaoTaxiWeb, '_blank');
    }
    
    console.log('🚕 카카오택시 열기:', { origin, destination });
};

/**
 * 택시 호출 옵션 표시 (전화 또는 앱)
 * @param {Object} origin - 출발지
 * @param {Object} destination - 목적지
 * @param {Function} onSelect - 선택 콜백
 * @returns {void}
 */
export const showTaxiOptions = (origin, destination, onSelect) => {
    // 사용자에게 택시 호출 방법 선택 옵션 제공
    // 실제로는 모달이나 UI를 통해 선택하게 함
    // 여기서는 기본 동작만 정의
    
    if (onSelect) {
        onSelect({
            type: 'phone',
            phoneNumber: TAXI_COMPANIES['일반택시'],
            action: () => callTaxiByPhone()
        });
    }
};

/**
 * 목적지 정보를 포함한 택시 호출 메시지 생성
 * @param {Object} origin - 출발지
 * @param {Object} destination - 목적지
 * @returns {string} 택시 호출 안내 메시지
 */
export const getTaxiCallMessage = (origin, destination) => {
    const originAddress = origin?.address || '현재 위치';
    const destinationAddress = destination?.address || '목적지';
    
    return `${originAddress}에서 ${destinationAddress}로 가는 택시를 호출하시겠어요?`;
};

/**
 * 택시 요금 추정 (이미 kakaoMapApi.js에 있지만 여기서도 사용 가능)
 * @param {number} distance - 거리 (km)
 * @param {number} duration - 소요 시간 (분)
 * @returns {number} 추정 택시 요금 (원)
 */
export const estimateTaxiFare = (distance, duration) => {
    // 기본 요금: 4,800원 (기본 2km)
    const baseFare = 4800;
    const baseDistance = 2; // km
    
    // 거리당 추가 요금: 2km 초과 시 100m당 200원
    let additionalFare = 0;
    if (distance > baseDistance) {
        const extraDistance = distance - baseDistance;
        additionalFare = Math.ceil(extraDistance * 10) * 200; // 100m 단위로 계산
    }
    
    // 시간당 대기 요금: 분당 200원 (교통 정체 시)
    const waitingFare = Math.floor(duration / 60) * 200;
    
    const totalFare = baseFare + additionalFare + waitingFare;
    
    return totalFare;
};

/**
 * 택시 호출 정보 포맷팅
 * @param {Object} origin - 출발지
 * @param {Object} destination - 목적지
 * @param {number} estimatedFare - 추정 요금
 * @returns {Object} 포맷된 택시 호출 정보
 */
export const formatTaxiCallInfo = (origin, destination, estimatedFare) => {
    return {
        origin: origin?.address || '현재 위치',
        destination: destination?.address || '목적지',
        estimatedFare: estimatedFare ? `약 ${estimatedFare.toLocaleString()}원` : '요금 정보 없음',
        estimatedTime: '도착 시간은 택시 회사에 문의하세요.'
    };
};
