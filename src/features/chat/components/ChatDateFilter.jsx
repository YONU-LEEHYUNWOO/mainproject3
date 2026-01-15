import React from 'react';
import { Calendar } from 'lucide-react';
import { t } from '../../../i18n';

/**
 * 채팅 날짜 필터 UI
 */
const ChatDateFilter = ({ selectedDate, setSelectedDate, language }) => {
    return (
        <div className="px-6 lg:px-8 pt-4 pb-2 bg-lightBg border-b border-slate-200">
            <div className="flex items-center gap-3">
                <Calendar size={20} className="text-trustBlue" />
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setSelectedDate(null)}
                        className={`px-4 py-2 rounded-xl font-black transition-all duration-200 ${selectedDate === null
                            ? 'bg-trustBlue text-white shadow-lg'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        style={{ fontSize: 'var(--font-size-base)', minHeight: 'var(--button-size-small)' }}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => {
                            const today = new Date();
                            setSelectedDate(today.toISOString().split('T')[0]);
                        }}
                        className={`px-4 py-2 rounded-xl font-black transition-all duration-200 ${selectedDate && (() => {
                            const today = new Date();
                            const todayStr = today.toISOString().split('T')[0];
                            return selectedDate === todayStr;
                        })()
                            ? 'bg-trustBlue text-white shadow-lg'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        style={{ fontSize: 'var(--font-size-base)', minHeight: 'var(--button-size-small)' }}
                    >
                        {t('today', language)}
                    </button>
                    <button
                        onClick={() => {
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            setSelectedDate(yesterday.toISOString().split('T')[0]);
                        }}
                        className="px-4 py-2 rounded-xl font-black bg-white text-slate-600 hover:bg-slate-50 transition-all duration-200"
                        style={{ fontSize: 'var(--font-size-base)', minHeight: 'var(--button-size-small)' }}
                    >
                        {t('yesterday', language)}
                    </button>
                    <input
                        type="date"
                        value={selectedDate || ''}
                        onChange={(e) => setSelectedDate(e.target.value || null)}
                        className="px-4 py-2 rounded-xl font-black bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                        style={{ fontSize: 'var(--font-size-base)', minHeight: 'var(--button-size-small)' }}
                        max={new Date().toISOString().split('T')[0]}
                    />
                    {selectedDate !== null && (
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="px-4 py-2 rounded-xl font-black text-sm bg-pastel-pink/20 text-pastel-purple hover:bg-pastel-pink/30 transition-all duration-200"
                        >
                            필터 해제
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatDateFilter;
