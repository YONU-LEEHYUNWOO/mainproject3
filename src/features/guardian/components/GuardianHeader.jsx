import React from 'react';
import { ArrowLeft, Users, CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import { t } from '../../../i18n';

/**
 * 보호자 대시보드 상단 헤더 및 기본 정보 컴포넌트
 */
const GuardianHeader = ({ 
    language, 
    onContactComplete, 
    contactCompleted, 
    guardianContactStatus 
}) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-pastel-purple to-pastel-pink rounded-2xl flex items-center justify-center shadow-lg">
                        <Users size={32} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">{t('guardianMode', language)}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${guardianContactStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                            <span className="text-sm font-bold text-slate-500">
                                {guardianContactStatus === 'connected' ? '부모님과 연결됨' : '연결 확인 중'}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onContactComplete && onContactComplete()}
                    className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 rounded-xl font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                >
                    <ArrowLeft size={18} />
                    자식용 앱 종료
                </button>
            </div>

            {/* 오늘의 보호 활동 카드 */}
            <div className="bg-gradient-to-br from-trustBlue/10 to-pastel-blue/10 rounded-3xl p-6 border-2 border-trustBlue/20 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-black text-trustBlue uppercase tracking-wider">Today's Mission</p>
                        <h3 className="text-xl font-black text-slate-800">오늘의 안부 확인</h3>
                    </div>
                    {contactCompleted ? (
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-black text-sm flex items-center gap-2 border border-green-200">
                            <CheckCircle2 size={16} />
                            완료됨
                        </div>
                    ) : (
                        <div className="px-4 py-2 bg-warmOrange/10 text-warmOrange rounded-full font-black text-sm flex items-center gap-2 border border-warmOrange/20">
                            <Phone size={16} className="animate-bounce" />
                            연락 대기 중
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuardianHeader;
