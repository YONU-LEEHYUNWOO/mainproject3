import React from 'react';
import { MessageCircle, Send, Activity, Utensils, ShoppingCart, Calendar, Plus, FileText, Settings } from 'lucide-react';
import { t } from '../../../i18n';

/**
 * 보호자 액션 버튼 모음 (메시지, 일정, 리포트 등)
 */
const GuardianActionButtons = ({ 
    language, 
    setShowMessageModal, 
    setShowScheduleModal, 
    setShowReportModal, 
    setShowGuardianSettingsModal,
    onMessageSend 
}) => {
    return (
        <div className="space-y-6">
            {/* 1. 메시지/지시 전송 섹션 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-pastel-pink/30">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <MessageCircle size={20} className="text-pastel-pink" />
                        {t('sendMessage', language)}
                    </h3>
                    <button
                        onClick={() => setShowMessageModal(true)}
                        className="px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Send size={16} />
                        자유 메시지
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        onClick={() => onMessageSend && onMessageSend({ type: 'instruction', action: 'walk', text: t('walkRequest', language) })}
                        className="p-4 bg-green-50 rounded-2xl border-2 border-green-100 hover:border-green-200 transition-all text-left"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={18} className="text-green-600" />
                            <span className="font-black text-sm text-slate-800">{t('walkRequest', language)}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold">산책 권유하기</p>
                    </button>
                    <button
                        onClick={() => onMessageSend && onMessageSend({ type: 'instruction', action: 'meal', text: t('mealRequest', language) })}
                        className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-100 hover:border-orange-200 transition-all text-left"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Utensils size={18} className="text-orange-600" />
                            <span className="font-black text-sm text-slate-800">{t('mealRequest', language)}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold">식사 챙겨드리기</p>
                    </button>
                    <button
                        onClick={() => onMessageSend && onMessageSend({ type: 'instruction', action: 'shopping', text: '장보기를 하시겠어요?' })}
                        className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 hover:border-blue-200 transition-all text-left"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <ShoppingCart size={18} className="text-blue-600" />
                            <span className="font-black text-sm text-slate-800">장보기 요청</span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold">장보기 필요 확인</p>
                    </button>
                </div>
            </div>

            {/* 2. 관리 도구 버튼 섹션 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-trustBlue/30 transition-all"
                >
                    <div className="w-12 h-12 bg-pastel-blue/20 rounded-2xl flex items-center justify-center">
                        <Calendar size={24} className="text-trustBlue" />
                    </div>
                    <span className="font-black text-slate-700">일정 관리</span>
                </button>
                <button
                    onClick={() => setShowReportModal(true)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
                >
                    <div className="w-12 h-12 bg-pastel-purple/20 rounded-2xl flex items-center justify-center">
                        <FileText size={24} className="text-purple-600" />
                    </div>
                    <span className="font-black text-slate-700">안심 리포트</span>
                </button>
                <button
                    onClick={() => setShowGuardianSettingsModal(true)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all col-span-2 md:col-span-1"
                >
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Settings size={24} className="text-slate-600" />
                    </div>
                    <span className="font-black text-slate-700">보호자 설정</span>
                </button>
            </div>
        </div>
    );
};

export default GuardianActionButtons;
