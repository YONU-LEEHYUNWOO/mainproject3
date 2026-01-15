import { formatDistance } from './kakaoLocalApi';

/**
 * 리포트용 날짜 포맷팅
 * @param {Date} date - 포맷팅할 날짜
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const formatDateForReport = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * 메시지 객체에서 읽을 텍스트 추출 (TTS용)
 * @param {Object} msg - 메시지 객체
 * @returns {string} 읽을 텍스트
 */
export const getMessageTextForTTS = (msg) => {
    if (!msg) return '';

    // 타입별로 텍스트 추출
    switch (msg.type) {
        case 'proposal':
            return msg.proposal?.question || msg.content || '';
        case 'behaviorPattern':
            if (msg.behaviorPattern?.sequence) {
                const sequenceText = msg.behaviorPattern.sequence.join(' → ');
                return `${msg.content || ''} 방문 순서: ${sequenceText}${msg.behaviorPattern.notes ? ` 참고사항: ${msg.behaviorPattern.notes}` : ''}`;
            }
            return msg.content || '';
        case 'dailySummary':
            return `오늘 하루 요약입니다. 일정은 ${msg.summary?.tasks || 0}건, 알림은 ${msg.summary?.activeReminders || 0}건입니다.`;
        case 'voiceCommandHelp':
            return msg.content || '';
        case 'guardianReport':
            return msg.content || '';
        case 'medicineAlarm':
            return msg.content || '';
        case 'restMode':
            return msg.content || '';
        case 'inactivityWarning':
            return msg.content || '';
        case 'bedtimeMode':
            return msg.content || '';
        case 'morningCare':
            return msg.content || '';
        case 'alternatives':
            const altTexts = msg.alternatives?.map(alt => alt.text).join(', ') || '';
            return `${msg.content || ''} ${altTexts ? `선택지: ${altTexts}` : ''}`;
        case 'hospitalTransport':
            return msg.content || '';
        case 'hospitalArrival':
            return msg.content || '';
        case 'afterTreatment':
            return msg.content || '';
        case 'hospitalSelection':
            return msg.content || '';
        case 'destinationSelection':
            return msg.content || '';
        case 'shopping':
            return msg.content || '';
        case 'meal':
            return msg.content || '';
        case 'nearbyPlaces':
            return msg.content || '';
        case 'voiceMessage':
            return msg.content || '';
        case 'placeSearchPrompt':
            return msg.content || '';
        case 'placeSearchResults':
            const placesText = msg.places?.map((p, idx) => `${idx + 1}. ${p.name} (${p.distanceFormatted || formatDistance(p.distance || 0)})`).join(', ') || '';
            return `${msg.content || ''} 검색 결과: ${placesText}`;
        default:
            // 기본적으로 content 사용
            return msg.content || '';
    }
};
