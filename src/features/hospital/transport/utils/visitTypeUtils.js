/**
 * 병원 방문 유형 감지 및 유형별 준비물 정의
 */

/**
 * 일정 제목에서 병원 방문 유형을 자동으로 감지
 */
export const detectVisitType = (task) => {
    if (!task || !task.title) return 'common';
    
    const title = task.title.toLowerCase();
    
    if (title.includes('초진') || title.includes('첫 방문') || title.includes('신규')) {
        return 'firstVisit';
    }
    if (title.includes('재진') || title.includes('다시') || title.includes('추가')) {
        return 'followUp';
    }
    if (title.includes('검진') || title.includes('건강검진') || title.includes('종합검진')) {
        return 'healthCheck';
    }
    if (title.includes('응급') || title.includes('응급실')) {
        return 'emergency';
    }
    if (title.includes('수술') || title.includes('시술') || title.includes('치료')) {
        return 'surgery';
    }
    
    return 'common';
};

/**
 * 방문 유형별 권장 준비물 목록 반환
 */
export const getRequirementsByType = (visitType, language) => {
    const requirements = {
        firstVisit: [
            { id: 'id_card', label: '신분증', desc: '본인 확인을 위해 꼭 필요해요' },
            { id: 'referral', label: '진료의뢰서', desc: '이전 병원 기록이 있다면 챙겨주세요' },
            { id: 'medicine_list', label: '복용 중인 약 목록', desc: '현재 드시는 약을 알려주셔야 해요' }
        ],
        followUp: [
            { id: 'id_card', label: '신분증', desc: '항상 지참하시는 것이 좋아요' },
            { id: 'appointment_card', label: '진료권/환자카드', desc: '접수가 빨라져요' }
        ],
        healthCheck: [
            { id: 'id_card', label: '신분증', desc: '검진 확인을 위해 필요해요' },
            { id: 'fasting', label: '금식 여부 확인', desc: '8시간 이상 금식을 유지하셨나요?' },
            { id: 'questionnaire', label: '문진표', desc: '미리 작성하셨다면 챙겨주세요' }
        ],
        surgery: [
            { id: 'id_card', label: '신분증', desc: '입원/수술 절차에 필요해요' },
            { id: 'protector', label: '보호자 동행', desc: '수술 후 귀가를 도와줄 분이 필요해요' },
            { id: 'items', label: '입원 물품', desc: '필요한 경우 세면도구 등을 챙겨주세요' }
        ],
        emergency: [
            { id: 'id_card', label: '신분증', desc: '가능하다면 챙겨주세요' },
            { id: 'protector', label: '보호자 연락', desc: '가족에게 상황이 전달되었습니다' }
        ],
        common: [
            { id: 'id_card', label: '신분증', desc: '본인 확인을 위해 필요해요' },
            { id: 'mask', label: '마스크', desc: '병원 내에서는 마스크 착용을 권장해요' }
        ]
    };

    return requirements[visitType] || requirements.common;
};
