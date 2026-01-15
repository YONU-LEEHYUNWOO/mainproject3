import { formatDateForReport } from '../utils/formatUtils';
import { generateReport, calculateReportPeriod, formatReportForGuardian } from '../utils/reportGenerator';
import { addReport } from '../utils/storage';

/**
 * 리포트 스케줄 체크 및 자동 생성
 * @param {Object} reportSettings - 리포트 설정
 * @param {Object} dailyActivities - 일일 활동 기록
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 */
export const checkReportSchedule = (reportSettings, dailyActivities, setChatHistory) => {
    const today = new Date();
    const todayStr = formatDateForReport(today);
    const lastSentDate = reportSettings.lastSentDate;

    // 마지막 전송일이 없거나, 주기에 맞는 날짜인지 확인
    let shouldGenerate = false;

    if (!lastSentDate) {
        // 첫 리포트 생성
        shouldGenerate = true;
    } else {
        const daysSinceLastReport = Math.floor((today - new Date(lastSentDate)) / (1000 * 60 * 60 * 24));

        switch (reportSettings.period) {
            case 'weekly':
                shouldGenerate = daysSinceLastReport >= 7;
                break;
            case 'biweekly':
                shouldGenerate = daysSinceLastReport >= 14;
                break;
            case 'monthly':
                shouldGenerate = daysSinceLastReport >= 30;
                break;
        }
    }

    if (shouldGenerate) {
        // 리포트 생성
        const { startDate, endDate } = calculateReportPeriod(reportSettings.period);
        const report = generateReport(reportSettings.period, startDate, endDate, dailyActivities);

        // 리포트 저장
        const savedReport = addReport({
            period: reportSettings.period,
            startDate,
            endDate,
            data: report
        });

        // 보호자에게 전송 (자식 앱에 알림)
        const formattedReport = formatReportForGuardian(report);
        setChatHistory(prev => [...prev, {
            role: 'assistant',
            type: 'guardianReport',
            content: `📊 ${formattedReport.period} 리포트가 생성되었습니다.\n\n기간: ${formattedReport.periodRange}\n\n요약:\n${Object.entries(formattedReport.summary).map(([key, value]) => `• ${key}: ${value}`).join('\n')}\n\n일정 수행률: ${formattedReport.일정수행률}\n이동 거리: ${formattedReport.이동거리}\n\n패턴 분석: ${formattedReport.패턴분석}\n\n추천사항:\n${formattedReport.추천사항.map(r => `• ${r}`).join('\n')}`,
            timestamp: Date.now(),
            reportId: savedReport.id
        }]);
    }
};
