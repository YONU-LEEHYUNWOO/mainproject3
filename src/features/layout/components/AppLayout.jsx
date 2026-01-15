import React from 'react';
import ChatFeature from '../../chat/components/ChatFeature';
import DashboardSidebar from '../../../components/DashboardSidebar';
import EmergencyCallButton from '../../emergency/components/EmergencyCallButton';
import RightDashboardPanel from '../../dashboard/components/RightDashboardPanel';

// 앱 메인 레이아웃 묶음
const AppLayout = ({ sidebarProps, chatProps, dashboardProps }) => {
    return (
        <>
            {/* 사이드바 */}
            <DashboardSidebar {...sidebarProps} />

            {/* 채팅 영역 - 부모용 앱 */}
            <ChatFeature {...chatProps} />

            {/* 119 긴급 버튼 - 우측 하단 */}
            <EmergencyCallButton />

            {/* 대시보드 */}
            <RightDashboardPanel {...dashboardProps} />
        </>
    );
};

export default AppLayout;
