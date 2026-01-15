/**
 * 아침 케어 관련 작은 유틸 모음
 * - App.jsx에서 분리된 훅/로직을 짧게 유지하기 위한 헬퍼들
 */

// "오늘" 기준 문자열들을 생성한다. (기존 App.jsx 로직 유지)
export function getTodayStrings(date = new Date()) {
    const todayDateStr = date.toDateString();
    const todayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
    ).padStart(2, '0')}`;
    return { todayDateStr, todayStr };
}

// morningCare 메시지가 있는지 확인한다.
export function hasMorningCareMessage(history) {
    return Array.isArray(history) && history.some(msg => msg?.type === 'morningCare');
}

// morningCare 질문 문구 생성 (기존 템플릿 유지)
export function buildMorningCareQuestion({ firstTask, language, t }) {
    return `오늘은 ${firstTask.time}에 "${firstTask.title}" 일정이 있습니다. ${t('visitConfirm', language)}`;
}

