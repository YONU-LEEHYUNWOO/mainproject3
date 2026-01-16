import React from 'react';
import { MessageCircle, Activity, Utensils, ShoppingCart } from 'lucide-react';
import { t } from '../../../i18n';

/**
 * 보호자 액션 버튼 모음 (부모님께 보낼 간단한 메시지)
 * - AI 채팅, 일정 관리, 안심 리포트, 보호자 설정은 GuardianTopActions로 이동됨
 */
const GuardianActionButtons = ({
    language,
    onMessageSend
}) => {
    return (
        <div className="space-y-6">
            {/* 부모님께 보낼 간단한 메시지 섹션 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-pastel-pink/30">
                <div className="mb-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <MessageCircle size={20} className="text-pastel-pink" />
                        부모님께 보낼 간단한 메시지
                    </h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                    한 번의 클릭으로 부모님께 안부 메시지를 보낼 수 있습니다.<br/>
                    산책, 식사, 장보기 등 일상적인 케어 메시지를 빠르게 전송하세요.
                </p>
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
        </div>
    );
};

export default GuardianActionButtons;
