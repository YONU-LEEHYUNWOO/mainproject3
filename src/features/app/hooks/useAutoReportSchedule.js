import { useEffect } from 'react';
import { checkReportSchedule } from '../../../services/reportService';
import { formatDateForReport } from '../../../utils/formatUtils';

/**
 * 리포트 자동 생성 및 전송(주기별)을 스케줄링한다.
 * - 기존 App.jsx의 useEffect 로직을 그대로 이동(동작/UI 변경 금지).
 */
export function useAutoReportSchedule({ reportSettings, dailyActivities, setChatHistory, setReportSettings }) {
    useEffect(() => {
        if (!reportSettings.autoSend) return;

        const checkReport = () => {
            checkReportSchedule(reportSettings, dailyActivities, setChatHistory);

            // 마지막 전송일 업데이트
            const today = new Date();
            const todayStr = formatDateForReport(today);
            const lastSentDate = reportSettings.lastSentDate;

            // 리포트가 생성되었는지 확인 (간단한 체크)
            if (
                !lastSentDate ||
                Math.floor((today - new Date(lastSentDate)) / (1000 * 60 * 60 * 24)) >=
                    (reportSettings.period === 'weekly' ? 7 : reportSettings.period === 'biweekly' ? 14 : 30)
            ) {
                setReportSettings(prev => ({
                    ...prev,
                    lastSentDate: todayStr
                }));
            }
        };

        // 매일 자정에 체크
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const msUntilMidnight = tomorrow - now;

        const timeout = setTimeout(() => {
            // 기존 코드 그대로 유지: 인자 없이 호출
            checkReportSchedule();
            // 이후 매일 자정에 체크
            const interval = setInterval(checkReport, 24 * 60 * 60 * 1000);
            return () => clearInterval(interval);
        }, msUntilMidnight);

        return () => clearTimeout(timeout);
    }, [reportSettings, dailyActivities]);
}

