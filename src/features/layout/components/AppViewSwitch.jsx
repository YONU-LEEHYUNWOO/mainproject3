import React from 'react';
import GuardianView from '../../../components/GuardianView';

// 뷰 전환(guardian/chat) 스위치 컴포넌트
const AppViewSwitch = ({
    currentView,
    isViewTransitioning,
    setIsViewTransitioning,
    setCurrentView,
    language,
    handleScheduleAdd,
    handleMessageReceive,
    dailyActivities,
    confirmedTasks,
    locationInfo,
    setLocationInfo,
    currentGPSLocation,
    setCurrentGPSLocation,
    chatHistory,
    reportSettings,
    setReportSettings,
    guardians,
    setGuardians,
    guardianContactAuth,
    setGuardianContactAuth,
    guardianContactStatus,
    setGuardianContactStatus,
    inactivitySettings,
    setInactivitySettings,
    bedtimeSettings,
    setBedtimeSettings,
    children
}) => {
    if (currentView === 'guardian') {
        return (
            <GuardianView
                isViewTransitioning={isViewTransitioning}
                setIsViewTransitioning={setIsViewTransitioning}
                setCurrentView={setCurrentView}
                language={language}
                handleScheduleAdd={handleScheduleAdd}
                handleMessageReceive={handleMessageReceive}
                dailyActivities={dailyActivities}
                confirmedTasks={confirmedTasks}
                locationInfo={locationInfo}
                setLocationInfo={setLocationInfo}
                currentGPSLocation={currentGPSLocation}
                setCurrentGPSLocation={setCurrentGPSLocation}
                chatHistory={chatHistory}
                reportSettings={reportSettings}
                setReportSettings={setReportSettings}
                guardians={guardians}
                setGuardians={setGuardians}
                guardianContactAuth={guardianContactAuth}
                setGuardianContactAuth={setGuardianContactAuth}
                guardianContactStatus={guardianContactStatus}
                setGuardianContactStatus={setGuardianContactStatus}
                inactivitySettings={inactivitySettings}
                setInactivitySettings={setInactivitySettings}
                bedtimeSettings={bedtimeSettings}
                setBedtimeSettings={setBedtimeSettings}
            />
        );
    }

    return <>{children}</>;
};

export default AppViewSwitch;
