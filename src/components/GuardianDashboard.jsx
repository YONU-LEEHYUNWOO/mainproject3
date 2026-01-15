import React, { useState } from 'react';
import { useGuardianDashboard } from '../features/guardian/hooks/useGuardianDashboard';
import GuardianHeader from '../features/guardian/components/GuardianHeader';
import GuardianLiveLocation from '../features/guardian/components/GuardianLiveLocation';
import GuardianActivityCharts from '../features/guardian/components/GuardianActivityCharts';
import GuardianActionButtons from '../features/guardian/components/GuardianActionButtons';
import GuardianModals from '../features/guardian/components/GuardianModals';

/**
 * 보호자 대시보드 컴포넌트 (Refactored)
 */
const GuardianDashboard = (props) => {
    const {
        language,
        onScheduleAdd,
        onMessageSend,
        dailyActivities,
        confirmedTasks,
        onContactComplete,
        locationInfo,
        currentGPSLocation,
        setCurrentGPSLocation,
        guardians,
        reportSettings,
        onReportSettingsChange,
        guardianContactStatus,
        inactivitySettings: parentInactivitySettings,
        onInactivitySettingsChange,
        bedtimeSettings: parentBedtimeSettings,
        onBedtimeSettingsChange
    } = props;

    // 1. 비즈니스 로직 및 상태 관리 훅
    const {
        inactivitySettings, setInactivitySettings,
        bedtimeSettings, setBedtimeSettings,
        currentLocation,
        isRefreshingLocation,
        handleRefreshLocation
    } = useGuardianDashboard({
        parentInactivitySettings,
        onInactivitySettingsChange,
        parentBedtimeSettings,
        onBedtimeSettingsChange,
        currentGPSLocation,
        setCurrentGPSLocation,
        locationInfo
    });

    // 2. 대시보드 내부 UI 상태
    const [contactCompleted, setContactCompleted] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showGuardianSettingsModal, setShowGuardianSettingsModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [newSchedule, setNewSchedule] = useState({
        title: '', date: '', time: '', location: '', repeat: false
    });

    return (
        <div className="flex-1 overflow-y-auto bg-lightBg p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-10">
                
                {/* 1. 상단 헤더 및 안부 확인 미션 */}
                <GuardianHeader 
                    language={language}
                    onContactComplete={() => {
                        setContactCompleted(true);
                        if (onContactComplete) onContactComplete();
                    }}
                    contactCompleted={contactCompleted}
                    guardianContactStatus={guardianContactStatus}
                />

                {/* 2. 실시간 부모님 위치 지도 */}
                <GuardianLiveLocation 
                    currentLocation={currentLocation}
                    isRefreshingLocation={isRefreshingLocation}
                    handleRefreshLocation={handleRefreshLocation}
                />

                {/* 3. 활동량 및 이동 반경 차트 */}
                <GuardianActivityCharts 
                    language={language}
                    dailyActivities={dailyActivities}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />

                {/* 4. 액션 버튼 (메시지, 일정, 리포트, 설정) */}
                <GuardianActionButtons 
                    language={language}
                    setShowMessageModal={setShowMessageModal}
                    setShowScheduleModal={setShowScheduleModal}
                    setShowReportModal={setShowReportModal}
                    setShowGuardianSettingsModal={setShowGuardianSettingsModal}
                    onMessageSend={onMessageSend}
                />

            </div>

            {/* 5. 각종 기능 모달 묶음 */}
            <GuardianModals 
                language={language}
                showReportModal={showReportModal}
                setShowReportModal={setShowReportModal}
                showScheduleModal={showScheduleModal}
                setShowScheduleModal={setShowScheduleModal}
                showMessageModal={showMessageModal}
                setShowMessageModal={setShowMessageModal}
                showGuardianSettingsModal={showGuardianSettingsModal}
                setShowGuardianSettingsModal={setShowGuardianSettingsModal}
                messageText={messageText}
                setMessageText={setMessageText}
                onMessageSend={onMessageSend}
                newSchedule={newSchedule}
                setNewSchedule={setNewSchedule}
                onScheduleAdd={onScheduleAdd}
                // ... 기타 리포트 및 설정 관련 props 전달
                {...props}
                inactivitySettings={inactivitySettings}
                setInactivitySettings={setInactivitySettings}
                bedtimeSettings={bedtimeSettings}
                setBedtimeSettings={setBedtimeSettings}
            />
        </div>
    );
};

export default GuardianDashboard;
