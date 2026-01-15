/**
 * 능동적 제안/요약 관련 유틸
 * - 훅 파일이 과하게 길어지는 것을 방지
 */

export function buildTimeBasedSuggestion({ hour, language, t }) {
    if (hour >= 9 && hour < 11) return t('medicineTime', language);
    if (hour >= 11 && hour < 15) return t('usualWalkTime', language);
    if (hour >= 17 && hour < 20) return t('dinnerMenu', language);
    if (hour >= 20 && hour < 22) return t('restNeeded', language);
    return null;
}

export function hasMessageType(history, type) {
    return Array.isArray(history) && history.some(msg => msg?.type === type);
}

