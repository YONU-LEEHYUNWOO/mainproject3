/**
 * 병원 방문 준비물 생성 유틸리티
 * 병원 방문 유형에 따라 필요한 준비물 목록을 자동 생성
 */

/**
 * 병원 방문 유형별 기본 준비물 목록
 */
const BASE_REQUIREMENTS = {
    // 기본 준비물 (모든 병원 방문에 공통)
    common: [
        '건강보험증',
        '신분증',
        '현금 또는 카드'
    ],
    
    // 초진 (첫 방문)
    firstVisit: [
        '건강보험증',
        '신분증',
        '증명사진 (필요시)',
        '기존 진단서 (다른 병원에서 받은 경우)',
        '복용 중인 약 목록',
        '알레르기 정보',
        '현금 또는 카드'
    ],
    
    // 재진 (재방문)
    followUp: [
        '건강보험증',
        '신분증',
        '처방전',
        '복용 중인 약',
        '증상 기록 (필요시)',
        '현금 또는 카드'
    ],
    
    // 검진/건강검진
    healthCheck: [
        '건강보험증',
        '신분증',
        '검진 예약 확인서',
        '이전 검진 결과 (필요시)',
        '현금 또는 카드'
    ],
    
    // 응급실
    emergency: [
        '건강보험증',
        '신분증',
        '현금 또는 카드',
        '응급 연락처'
    ],
    
    // 수술/시술
    surgery: [
        '건강보험증',
        '신분증',
        '수술 동의서',
        '이전 검사 결과',
        '복용 중인 약 목록',
        '알레르기 정보',
        '현금 또는 카드'
    ]
};

/**
 * 병원 방문 유형 감지
 * @param {Object} task - 일정 정보
 * @returns {string} 방문 유형 ('firstVisit' | 'followUp' | 'healthCheck' | 'emergency' | 'surgery' | 'common')
 */
export const detectVisitType = (task) => {
    if (!task) return 'common';
    
    const title = (task.title || '').toLowerCase();
    const location = (task.location || '').toLowerCase();
    
    // 응급실 키워드
    if (title.includes('응급') || title.includes('응급실') || location.includes('응급')) {
        return 'emergency';
    }
    
    // 수술/시술 키워드
    if (title.includes('수술') || title.includes('시술') || title.includes('수술예정')) {
        return 'surgery';
    }
    
    // 검진 키워드
    if (title.includes('검진') || title.includes('건강검진') || title.includes('정기검진')) {
        return 'healthCheck';
    }
    
    // 초진 키워드
    if (title.includes('초진') || title.includes('첫방문') || title.includes('신규')) {
        return 'firstVisit';
    }
    
    // 재진 키워드 (기본값)
    if (title.includes('재진') || title.includes('복약') || title.includes('처방')) {
        return 'followUp';
    }
    
    // 기본값: 재진으로 가정
    return 'followUp';
};

/**
 * 병원 방문 준비물 목록 생성
 * @param {Object} task - 일정 정보
 * @returns {Array<string>} 준비물 목록
 */
export const generateHospitalRequirements = (task) => {
    const visitType = detectVisitType(task);
    const requirements = [...BASE_REQUIREMENTS[visitType]];
    
    // 기본 공통 준비물 추가 (중복 제거)
    BASE_REQUIREMENTS.common.forEach(item => {
        if (!requirements.includes(item)) {
            requirements.push(item);
        }
    });
    
    return requirements;
};

/**
 * 준비물 안내 메시지 생성
 * @param {Array<string>} requirements - 준비물 목록
 * @param {string} visitType - 방문 유형
 * @returns {string} 안내 메시지
 */
export const generateRequirementsMessage = (requirements, visitType) => {
    const typeNames = {
        'firstVisit': '초진',
        'followUp': '재진',
        'healthCheck': '검진',
        'emergency': '응급실',
        'surgery': '수술/시술',
        'common': '병원 방문'
    };
    
    let message = `📋 ${typeNames[visitType] || '병원 방문'} 준비물 안내:\n\n`;
    requirements.forEach((req, idx) => {
        message += `${idx + 1}. ${req}\n`;
    });
    message += `\n💡 미리 준비하시면 병원에서 대기 시간을 줄일 수 있어요!`;
    
    return message;
};
