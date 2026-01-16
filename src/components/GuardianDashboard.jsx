import React, { useState, useEffect } from 'react';
import { useGuardianDashboard } from '../features/guardian/hooks/useGuardianDashboard';
import GuardianHeader from '../features/guardian/components/GuardianHeader';
import GuardianTopActions from '../features/guardian/components/GuardianTopActions';
import GuardianLiveLocation from '../features/guardian/components/GuardianLiveLocation';
import GuardianActivityCharts from '../features/guardian/components/GuardianActivityCharts';
import GuardianActionButtons from '../features/guardian/components/GuardianActionButtons';
import GuardianModals from '../features/guardian/components/GuardianModals';

/**
 * 보호자 대시보드 컴포넌트 (Refactored)
 */
const GuardianDashboard = (props) => {
    // props에서 필요한 값들을 추출
    const language = props.language;
    const onScheduleAdd = props.onScheduleAdd;
    const onMessageSend = props.onMessageSend;
    const dailyActivities = props.dailyActivities;
    const confirmedTasks = props.confirmedTasks;
    const setConfirmedTasks = props.setConfirmedTasks; // 명시적으로 추출
    const onContactComplete = props.onContactComplete;
    const locationInfo = props.locationInfo;
    const currentGPSLocation = props.currentGPSLocation;
    const setCurrentGPSLocation = props.setCurrentGPSLocation;
    const chatHistory = props.chatHistory;
    const setChatHistory = props.setChatHistory;
    const guardians = props.guardians;
    const reportSettings = props.reportSettings;
    const onReportSettingsChange = props.onReportSettingsChange;
    const guardianContactStatus = props.guardianContactStatus;
    const parentInactivitySettings = props.inactivitySettings;
    const onInactivitySettingsChange = props.onInactivitySettingsChange;
    const parentBedtimeSettings = props.bedtimeSettings;
    const onBedtimeSettingsChange = props.onBedtimeSettingsChange;
    
    // 나머지 props (onScheduleAdd 제외)
    const restProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => 
            key !== 'onScheduleAdd' && 
            key !== 'language' && 
            key !== 'onMessageSend' && 
            key !== 'dailyActivities' && 
            key !== 'confirmedTasks' && 
            key !== 'setConfirmedTasks' && 
            key !== 'onContactComplete' && 
            key !== 'locationInfo' && 
            key !== 'currentGPSLocation' && 
            key !== 'setCurrentGPSLocation' && 
            key !== 'chatHistory' && 
            key !== 'setChatHistory' && 
            key !== 'guardians' && 
            key !== 'reportSettings' && 
            key !== 'onReportSettingsChange' && 
            key !== 'guardianContactStatus' && 
            key !== 'inactivitySettings' && 
            key !== 'onInactivitySettingsChange' && 
            key !== 'bedtimeSettings' && 
            key !== 'onBedtimeSettingsChange'
        )
    );
    
    // 디버깅: props 확인
    console.log('🔍 [가디언 모드] GuardianDashboard props 확인:', {
        hasSetConfirmedTasks: 'setConfirmedTasks' in props,
        setConfirmedTasksType: typeof props.setConfirmedTasks,
        setConfirmedTasksValue: props.setConfirmedTasks,
        confirmedTasksCount: props.confirmedTasks?.length || 0,
        allPropsKeys: Object.keys(props).slice(0, 10) // 처음 10개만
    });

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
    
    // setConfirmedTasks가 없으면 에러
    if (!setConfirmedTasks) {
        console.error('❌ [가디언 모드] setConfirmedTasks가 props에 없습니다!');
        console.error('❌ [가디언 모드] props 키들:', Object.keys(props));
    }

    // 디버깅: confirmedTasks 변경 추적
    useEffect(() => {
        console.log('🟣 [가디언 모드] confirmedTasks 변경됨:', confirmedTasks?.length || 0, '개');
        if (confirmedTasks && confirmedTasks.length > 0) {
            console.log('🟣 [가디언 모드] 최근 일정:', confirmedTasks.slice(-3).map(t => `${t.title} (${t.date} ${t.time})`));
        }
    }, [confirmedTasks]);

    // 2. 대시보드 내부 UI 상태
    const [contactCompleted, setContactCompleted] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [showGuardianSettingsModal, setShowGuardianSettingsModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [newSchedule, setNewSchedule] = useState({
        title: '', date: '', time: '', location: '', repeat: false
    });

    // 3. handleScheduleAdd 래퍼 함수 - 가디언 모드에서 일정 추가 시 필요한 모든 파라미터를 바인딩
    // 부모님 앱의 달력(confirmedTasks)에 일정이 추가되도록 함
    const wrappedHandleScheduleAdd = async (schedule) => {
        console.log('🔵 [가디언 모드] ========== wrappedHandleScheduleAdd 호출됨 ==========');
        console.log('🔵 [가디언 모드] 일정 데이터:', schedule);
        console.log('🔵 [가디언 모드] onScheduleAdd 존재:', !!onScheduleAdd);
        console.log('🔵 [가디언 모드] onScheduleAdd 타입:', typeof onScheduleAdd);
        console.log('🔵 [가디언 모드] setConfirmedTasks 존재:', !!setConfirmedTasks);
        console.log('🔵 [가디언 모드] setConfirmedTasks 타입:', typeof setConfirmedTasks);
        console.log('🔵 [가디언 모드] 현재 confirmedTasks 개수:', confirmedTasks?.length || 0);
        
        if (!onScheduleAdd) {
            console.error('❌ [가디언 모드] onScheduleAdd 함수가 전달되지 않았습니다.');
            return;
        }

        if (!setConfirmedTasks) {
            console.error('❌ [가디언 모드] setConfirmedTasks 함수가 전달되지 않았습니다.');
            return;
        }

        // handleScheduleAdd는 많은 파라미터를 필요로 하므로, 
        // GuardianView에서 전달받은 props를 사용하여 호출
        // 일정 추가 (autoConfirm = true로 자동 확인)
        try {
            // setChatHistory가 함수인지 확인하고, 아니면 빈 함수 전달
            // setChatHistory가 없으면 빈 함수를 사용하여 오류 방지
            const safeSetChatHistory = (typeof setChatHistory === 'function' && setChatHistory !== null) 
                ? setChatHistory 
                : (callback) => {
                    // 빈 함수로 오류 방지, 하지만 콜백이 함수면 실행
                    if (typeof callback === 'function') {
                        try {
                            callback([]);
                        } catch (e) {
                            // 무시
                        }
                    }
                };
            
            console.log('🔵 [가디언 모드] handleScheduleAdd 호출 시작');
            console.log('🔵 [가디언 모드] 파라미터:', {
                schedule,
                autoConfirm: true,
                confirmedTasksCount: confirmedTasks?.length || 0,
                hasSetConfirmedTasks: !!setConfirmedTasks,
                hasLocationInfo: !!locationInfo,
                hasGPSLocation: !!currentGPSLocation
            });
            
            // onScheduleAdd는 handleScheduleAdd 함수이므로 모든 파라미터를 전달
            // setSelectedTaskId는 null로 전달해도 handleScheduleAdd 내부에서 안전하게 처리됨
            const result = await onScheduleAdd(
                schedule,
                true, // autoConfirm: 가디언 모드에서는 자동으로 일정 추가
                confirmedTasks, // 부모님 앱의 일정 목록 (함수형 업데이트를 사용하므로 최신 값이 필요 없지만 참조용)
                setConfirmedTasks, // 일정 목록 업데이트 함수
                null, // setSelectedTaskId (가디언 모드에서는 필요 없음)
                safeSetChatHistory, // 부모님 앱의 채팅 히스토리에 알림 추가 (안전하게 처리)
                locationInfo, // 위치 정보
                currentGPSLocation // 현재 GPS 위치
            );
            
            console.log('✅ [가디언 모드] onScheduleAdd 반환값:', result);
            
            // 상태 업데이트가 완료될 때까지 약간의 대기 (React 상태 업데이트는 비동기)
            // 실제로는 필요 없지만 디버깅을 위해 추가
            setTimeout(() => {
                console.log('🔵 [가디언 모드] 상태 업데이트 후 확인 (비동기)');
            }, 100);
            
            console.log('✅ [가디언 모드] handleScheduleAdd 호출 완료');
            console.log('🔵 [가디언 모드] 호출 후 confirmedTasks 개수:', confirmedTasks?.length || 0);
        } catch (error) {
            console.error('❌ [가디언 모드] 일정 추가 실패:', error);
            console.error('❌ [가디언 모드] 에러 상세:', error.stack);
            alert('일정 추가 중 오류가 발생했습니다: ' + error.message);
        }
    };

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

                {/* 1-1. 상단 주요 액션 버튼 (AI 채팅, 일정 관리, 안심 리포트, 보호자 설정) */}
                <GuardianTopActions
                    language={language}
                    setShowChatModal={setShowChatModal}
                    setShowScheduleModal={setShowScheduleModal}
                    setShowReportModal={setShowReportModal}
                    setShowGuardianSettingsModal={setShowGuardianSettingsModal}
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

                {/* 4. 부모님께 보낼 간단한 메시지 */}
                <GuardianActionButtons
                    language={language}
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
                showChatModal={showChatModal}
                setShowChatModal={setShowChatModal}
                showGuardianSettingsModal={showGuardianSettingsModal}
                setShowGuardianSettingsModal={setShowGuardianSettingsModal}
                messageText={messageText}
                setMessageText={setMessageText}
                onMessageSend={onMessageSend}
                newSchedule={newSchedule}
                setNewSchedule={setNewSchedule}
                // wrappedHandleScheduleAdd를 명시적으로 전달 (props의 onScheduleAdd를 덮어씀)
                onScheduleAdd={wrappedHandleScheduleAdd}
                // ... 기타 리포트 및 설정 관련 props 전달 (onScheduleAdd 제외)
                {...restProps}
                inactivitySettings={inactivitySettings}
                setInactivitySettings={setInactivitySettings}
                bedtimeSettings={bedtimeSettings}
                setBedtimeSettings={setBedtimeSettings}
            />
        </div>
    );
};

export default GuardianDashboard;
