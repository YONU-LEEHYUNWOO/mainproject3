import React from 'react';
import DailySummaryDetailModal from '../../../components/modals/DailySummaryDetailModal';

// 하루 요약 상세 모달 진입 컴포넌트
const DailySummaryDetailModalFeature = ({
    showDailySummaryDetail,
    setShowDailySummaryDetail,
    dailyActivities,
    language
}) => {
    return (
        <DailySummaryDetailModal
            showDailySummaryDetail={showDailySummaryDetail}
            setShowDailySummaryDetail={setShowDailySummaryDetail}
            dailyActivities={dailyActivities}
            language={language}
        />
    );
};

export default DailySummaryDetailModalFeature;
