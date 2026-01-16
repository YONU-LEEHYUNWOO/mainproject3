import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import GuardianDashboard from './GuardianDashboard';
import { formatDateForReport } from '../utils/formatUtils';

// 보호자 대시보드 전용 뷰 컴포넌트
const GuardianView = ({
    isViewTransitioning,
    setIsViewTransitioning,
    setCurrentView,
    language,
    handleScheduleAdd,
    handleMessageReceive,
    dailyActivities,
    confirmedTasks,
    setConfirmedTasks,
    locationInfo,
    setLocationInfo,
    currentGPSLocation,
    setCurrentGPSLocation,
    chatHistory,
    setChatHistory,
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
    setBedtimeSettings
}) => {
    // 보호자 연락 완료 상태를 업데이트하는 핸들러
    const handleGuardianContactComplete = (completed) => {
        if (completed) {
            const today = new Date();
            const todayStr = formatDateForReport(today);
            setGuardianContactAuth(prev => ({
                ...prev,
                lastContactDate: todayStr,
                verified: true,
                contactMethod: 'phone'
            }));
            setGuardianContactStatus('connected');
        }
        if (completed) {
            setGuardianContactStatus('connected');
        }
    };

    // 보호자 뷰에서 채팅 뷰로 이동
    const handleReturnToChatView = () => {
        setIsViewTransitioning(true);
        setTimeout(() => {
            setCurrentView('chat');
            setTimeout(() => setIsViewTransitioning(false), 300);
        }, 500);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-pastel-pink/10 via-pastel-blue/10 to-pastel-purple/10 overflow-hidden relative">
            {/* 뷰 전환 로고 오버레이 */}
            {isViewTransitioning && (
                <div className="fixed inset-0 bg-white/98 backdrop-blur-lg z-[9999] flex items-center justify-center animate-fade-in">
                    <div className="flex flex-col items-center gap-10">
                        <img
                            src="/logo.png"
                            alt="함께잇다 로고"
                            className="w-[512px] h-[512px] rounded-3xl object-contain bg-gradient-to-br from-pastel-purple/20 to-pastel-pink/20 backdrop-blur-sm p-8 shadow-2xl animate-scale-in"
                            style={{ imageRendering: 'high-quality' }}
                        />
                        <p className="text-4xl font-black text-slate-800 animate-fade-in-delay">부모용 앱으로 전환 중...</p>
                    </div>
                </div>
            )}
            <div className="fixed top-6 left-6 z-50">
                <div className="px-4 py-2 bg-pastel-blue/20 rounded-lg border border-pastel-blue/30 backdrop-blur-sm">
                    <span className="text-xs font-black text-pastel-blue">자식용 앱 (보호자)</span>
                </div>
            </div>
            <GuardianDashboard
                language={language}
                onScheduleAdd={handleScheduleAdd}
                onMessageSend={handleMessageReceive}
                dailyActivities={dailyActivities}
                confirmedTasks={confirmedTasks}
                setConfirmedTasks={setConfirmedTasks}
                locationInfo={locationInfo}
                setLocationInfo={setLocationInfo}
                currentGPSLocation={currentGPSLocation}
                setCurrentGPSLocation={setCurrentGPSLocation}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                reportSettings={reportSettings}
                onReportSettingsChange={setReportSettings}
                guardians={guardians}
                onGuardiansChange={setGuardians}
                guardianContactAuth={guardianContactAuth}
                onGuardianContactAuthChange={setGuardianContactAuth}
                guardianContactStatus={guardianContactStatus}
                inactivitySettings={inactivitySettings}
                onInactivitySettingsChange={setInactivitySettings}
                bedtimeSettings={bedtimeSettings}
                onBedtimeSettingsChange={setBedtimeSettings}
                onContactComplete={handleGuardianContactComplete}
            />
            <div className="fixed bottom-6 right-6">
                <button
                    onClick={handleReturnToChatView}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-200 border-4 border-white/30 hover:border-white/50"
                    title="부모용 앱으로 이동"
                >
                    <LayoutDashboard size={28} />
                </button>
            </div>
        </div>
    );
};

export default GuardianView;
