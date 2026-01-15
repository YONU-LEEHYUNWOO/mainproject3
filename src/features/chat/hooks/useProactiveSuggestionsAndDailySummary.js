import { useEffect } from 'react';
import { saveDailySummaryShown, saveLastSuggestionHour, loadActivitiesHistory } from '../../../utils/storage';
import { generatePersonalizedRecommendation } from '../../../utils/patternAnalysis';
import { buildTimeBasedSuggestion, hasMessageType } from '../utils/proactiveSuggestionsUtils';

/**
 * 시간대별 능동적 제안 + 하루 마무리 요약을 주기적으로 수행한다.
 * - 기존 App.jsx의 useEffect 로직을 그대로 이동(동작/UI 변경 금지).
 */
export function useProactiveSuggestionsAndDailySummary({
    confirmedTasks,
    dailySummaryShown,
    setDailySummaryShown,
    language,
    lastSuggestionHour,
    setLastSuggestionHour,
    setChatHistory,
    t
}) {
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const hour = now.getHours();

            // 시간대별 제안 (한 시간에 한 번만) - 패턴 기반 개선
            if (hour !== lastSuggestionHour) {
                // 과거 활동 기록 로드
                const activitiesHistory = loadActivitiesHistory();

                // 패턴 기반 개인화 추천 시도
                let personalizedRec = null;
                if (activitiesHistory.length > 0) {
                    personalizedRec = generatePersonalizedRecommendation(activitiesHistory, now);
                }

                // 패턴 기반 추천이 있으면 우선 사용, 없으면 기본 시간대별 제안
                const suggestion = personalizedRec
                    ? personalizedRec.message
                    : buildTimeBasedSuggestion({ hour, language, t });

                if (suggestion) {
                    setChatHistory(prev => {
                        // 중복 체크: 같은 시간대 제안이 이미 있는지 확인
                        const alreadyExists = Array.isArray(prev) && prev.some(msg => msg?.type === 'suggestion' && msg?.content === suggestion);
                        if (alreadyExists) return prev;

                        return [
                            ...prev,
                            {
                                role: 'assistant',
                                type: 'suggestion',
                                content: suggestion,
                                personalized: !!personalizedRec, // 패턴 기반 추천 여부
                                timestamp: Date.now()
                            }
                        ];
                    });
                    setLastSuggestionHour(hour);
                    saveLastSuggestionHour(hour);
                }
            }

            // 하루 마무리 요약 (21시 이후 1회)
            if (!dailySummaryShown && hour >= 21) {
                const activeReminders = confirmedTasks.filter(task => task.reminderActive).length;
                const summary = {
                    tasks: confirmedTasks.length,
                    activeReminders
                };
                setChatHistory(prev => {
                    // 중복 체크: 이미 dailySummary가 있는지 확인
                    if (hasMessageType(prev, 'dailySummary')) return prev;
                    return [...prev, { role: 'assistant', type: 'dailySummary', summary }];
                });
                setDailySummaryShown(true);
                saveDailySummaryShown(true);
            }
        }, 60000);

        return () => clearInterval(timer);
    }, [confirmedTasks, dailySummaryShown, language, lastSuggestionHour]);
}

