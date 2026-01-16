import React from 'react';
import { MessageCircle, Calendar, FileText, Settings } from 'lucide-react';
import { t } from '../../../i18n';

/**
 * 보호자 모드 상단 주요 액션 버튼 컴포넌트
 * - AI 채팅 버튼
 * - 일정 관리
 * - 안심 리포트
 * - 보호자 설정
 */
const GuardianTopActions = ({
    language,
    setShowChatModal,
    setShowScheduleModal,
    setShowReportModal,
    setShowGuardianSettingsModal
}) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-pastel-pink/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* AI 채팅 버튼 */}
                <button
                    onClick={() => setShowChatModal(true)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-200 rounded-3xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
                >
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <MessageCircle size={28} className="text-white" />
                    </div>
                    <span className="font-black text-slate-700 text-sm">AI 채팅</span>
                </button>

                {/* 일정 관리 */}
                <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-pastel-blue/10 border-2 border-pastel-blue/30 rounded-3xl shadow-sm hover:shadow-md hover:border-pastel-blue/50 transition-all group"
                >
                    <div className="w-14 h-14 bg-pastel-blue/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar size={28} className="text-trustBlue" />
                    </div>
                    <span className="font-black text-slate-700 text-sm">일정 관리</span>
                </button>

                {/* 안심 리포트 */}
                <button
                    onClick={() => setShowReportModal(true)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-pastel-purple/10 border-2 border-pastel-purple/30 rounded-3xl shadow-sm hover:shadow-md hover:border-pastel-purple/50 transition-all group"
                >
                    <div className="w-14 h-14 bg-pastel-purple/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText size={28} className="text-purple-600" />
                    </div>
                    <span className="font-black text-slate-700 text-sm">안심 리포트</span>
                </button>

                {/* 보호자 설정 */}
                <button
                    onClick={() => setShowGuardianSettingsModal(true)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                >
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Settings size={28} className="text-slate-600" />
                    </div>
                    <span className="font-black text-slate-700 text-sm">보호자 설정</span>
                </button>
            </div>
        </div>
    );
};

export default GuardianTopActions;
