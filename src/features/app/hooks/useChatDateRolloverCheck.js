import { useEffect } from 'react';

/**
 * 날짜가 바뀌었을 때(자정 이후) "오늘" 대화 표시 상태를 점검한다.
 * - 기존 App.jsx의 useEffect 로직을 그대로 이동(동작/UI 변경 금지).
 * - 현재 로직은 상태를 변경하지 않고 점검만 수행한다.
 */
export function useChatDateRolloverCheck({ selectedDate }) {
    useEffect(() => {
        const today = new Date();
        const todayDateStr = today.toDateString();
        const checkDate = setInterval(() => {
            const now = new Date();
            const nowDateStr = now.toDateString();
            // 날짜가 바뀌었고 selectedDate가 null(오늘)이면 자동으로 오늘로 리셋
            if (nowDateStr !== todayDateStr && selectedDate === null) {
                // 날짜가 바뀌었지만 selectedDate가 null이면 그대로 유지 (사용자가 다른 날짜를 보고 있을 수 있음)
            }
        }, 60000); // 1분마다 체크
        return () => clearInterval(checkDate);
    }, [selectedDate]);
}

