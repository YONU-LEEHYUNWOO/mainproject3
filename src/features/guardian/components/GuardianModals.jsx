import React from 'react';
import { X, ArrowLeft, Send, CheckCircle2, Clock, MapPin, Activity, Utensils, Home, Plus, Settings } from 'lucide-react';
import { t } from '../../../i18n';
import HealthChart from '../../../components/HealthChart';

/**
 * 보호자 대시보드에서 사용하는 모든 모달 묶음
 */
const GuardianModals = ({
    language,
    showReportModal, setShowReportModal,
    showScheduleModal, setShowScheduleModal,
    showMessageModal, setShowMessageModal,
    showGuardianSettingsModal, setShowGuardianSettingsModal,
    reportData,
    dateActivities,
    selectedDate,
    guardians,
    onGuardiansChange,
    reportSettings,
    onReportSettingsChange,
    inactivitySettings,
    setInactivitySettings,
    bedtimeSettings,
    setBedtimeSettings,
    messageText,
    setMessageText,
    onMessageSend,
    newSchedule,
    setNewSchedule,
    onScheduleAdd
}) => {

    // 1. 안심 리포트 모달
    const renderReportModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowReportModal(false)}>
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-800">{t('weeklyReport', language)}</h3>
                    <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">×</button>
                </div>
                {/* 리포트 내용... (기존 로직 유지) */}
                <div className="space-y-4">
                    <div className="p-4 bg-pastel-blue/20 rounded-2xl">
                        <p className="text-sm font-bold text-slate-600 mb-2">리포트 기간</p>
                        <p className="text-lg font-black text-slate-800">{reportData?.period || '데이터 로드 중'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <HealthChart type="heartRate" t={(k) => t(k, language)} />
                        <HealthChart type="steps" t={(k) => t(k, language)} />
                    </div>
                </div>
                <button onClick={() => setShowReportModal(false)} className="w-full mt-6 py-4 bg-trustBlue text-white rounded-xl font-black">닫기</button>
            </div>
        </div>
    );

    // 2. 메시지 보내기 모달
    const renderMessageModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowMessageModal(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-black text-slate-800 mb-6">부모님께 메시지 보내기</h3>
                <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="내용을 입력하세요..."
                    className="w-full h-40 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-trustBlue transition-all font-bold"
                />
                <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowMessageModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black">취소</button>
                    <button 
                        onClick={() => {
                            if (onMessageSend) onMessageSend({ type: 'text', text: messageText });
                            setShowMessageModal(false);
                            setMessageText('');
                        }}
                        className="flex-1 py-4 bg-trustBlue text-white rounded-xl font-black shadow-lg"
                    >
                        전송하기
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {showReportModal && renderReportModal()}
            {showMessageModal && renderMessageModal()}
            {/* 다른 모달들도 필요에 따라 추가... */}
        </>
    );
};

export default GuardianModals;
