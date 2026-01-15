import React from 'react';
import { ShoppingBag, Navigation2, Activity } from 'lucide-react';
import { t } from '../../../i18n';

/**
 * 채팅 상단 빠른 실행 버튼 영역
 */
const ChatQuickActions = ({ language, setChatHistory, setRestMode, setLastActivityTime }) => {
    return (
        <div className="px-6 lg:px-8 py-4 bg-white/50 border-b border-slate-200">
            <p className="font-black text-slate-500 uppercase tracking-wider mb-3 px-1" style={{ fontSize: 'var(--font-size-base)' }}>
                {t('quickActions', language)}
            </p>
            <div className="grid grid-cols-3 gap-3">
                {/* 장보기 버튼 */}
                <button
                    onClick={() => {
                        setChatHistory(prev => [...prev, {
                            role: 'user',
                            content: t('quickShopping', language),
                            timestamp: Date.now()
                        }, {
                            role: 'assistant',
                            type: 'shopping',
                            content: t('shoppingRecommendation', language),
                            timestamp: Date.now()
                        }]);
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                    style={{ minHeight: 'var(--button-size-large)', minWidth: '100%' }}
                >
                    <div className="rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md" style={{ width: 'var(--button-size-medium)', height: 'var(--button-size-medium)' }}>
                        <ShoppingBag size={24} className="text-white" />
                    </div>
                    <span className="font-black text-blue-700" style={{ fontSize: 'var(--font-size-base)' }}>{t('quickShopping', language)}</span>
                </button>

                {/* 이동 버튼 */}
                <button
                    onClick={() => {
                        setChatHistory(prev => [...prev, {
                            role: 'user',
                            content: t('quickNavigation', language),
                            timestamp: Date.now()
                        }, {
                            role: 'assistant',
                            type: 'destinationSelection',
                            content: t('selectDestination', language),
                            timestamp: Date.now()
                        }]);
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 hover:border-green-300 hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                    style={{ minHeight: 'var(--button-size-large)', minWidth: '100%' }}
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-md">
                        <Navigation2 size={24} className="text-white" />
                    </div>
                    <span className="font-black text-green-700" style={{ fontSize: 'var(--font-size-base)' }}>{t('quickNavigation', language)}</span>
                </button>

                {/* 휴식 버튼 */}
                <button
                    onClick={() => {
                        setRestMode(true);
                        setLastActivityTime(Date.now());
                        setChatHistory(prev => [...prev, {
                            role: 'user',
                            content: t('quickRest', language),
                            timestamp: Date.now()
                        }, {
                            role: 'assistant',
                            content: '편안히 휴식하세요. 필요하시면 언제든 말씀해주세요.',
                            type: 'restMode',
                            restMode: true,
                            timestamp: Date.now()
                        }]);
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                    style={{ minHeight: 'var(--button-size-large)', minWidth: '100%' }}
                >
                    <div className="rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md" style={{ width: 'var(--button-size-medium)', height: 'var(--button-size-medium)' }}>
                        <Activity size={24} className="text-white" />
                    </div>
                    <span className="font-black text-purple-700" style={{ fontSize: 'var(--font-size-base)' }}>{t('quickRest', language)}</span>
                </button>
            </div>
        </div>
    );
};

export default ChatQuickActions;
