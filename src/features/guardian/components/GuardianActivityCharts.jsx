import React, { useState } from 'react';
import { Activity, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import HealthChart from '../../../components/HealthChart';
import MovementRadiusChart from '../../../components/MovementRadiusChart';
import { t } from '../../../i18n';

/**
 * 부모의 활동량 및 이동 반경 차트 섹션
 */
const GuardianActivityCharts = ({ language, dailyActivities, selectedDate, setSelectedDate }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    // 선택된 날짜를 YYYY-MM-DD 형식으로 변환
    const getSelectedDateString = () => {
        if (!selectedDate) return new Date().toISOString().split('T')[0];

        if (selectedDate === 'yesterday') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toISOString().split('T')[0];
        }

        if (selectedDate === '2daysAgo') {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            return twoDaysAgo.toISOString().split('T')[0];
        }

        return selectedDate;
    };

    // 날짜를 키 형식으로 변환
    const dateStringToKey = (dateStr) => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        if (dateStr === today) return null;
        if (dateStr === yesterdayStr) return 'yesterday';
        if (dateStr === twoDaysAgoStr) return '2daysAgo';
        return dateStr;
    };

    return (
        <div className="space-y-6">
            {/* 날짜 선택 필터 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-slate-400" />
                        <span className="text-sm font-black text-slate-700">활동 데이터 날짜 선택</span>
                    </div>
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-black transition-colors"
                    >
                        {showDatePicker ? '간단 선택' : '날짜 선택'}
                    </button>
                </div>

                {showDatePicker ? (
                    /* 날짜 선택기 모드 */
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-600 mb-1">날짜 선택</label>
                                <input
                                    type="date"
                                    value={getSelectedDateString()}
                                    onChange={(e) => setSelectedDate(dateStringToKey(e.target.value))}
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-trustBlue transition-all font-bold"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={() => {
                                        const today = new Date();
                                        setSelectedDate(null);
                                    }}
                                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-black transition-colors"
                                >
                                    오늘
                                </button>
                                <button
                                    onClick={() => setSelectedDate('yesterday')}
                                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-black transition-colors"
                                >
                                    어제
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 간단 선택 모드 */
                    <div className="flex gap-2 overflow-x-auto">
                        {[null, 'yesterday', '2daysAgo'].map((dateKey) => {
                            const label = dateKey === null ? '오늘' : dateKey === 'yesterday' ? '어제' : '그저께';
                            return (
                                <button
                                    key={dateKey}
                                    onClick={() => setSelectedDate(dateKey)}
                                    className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap flex-shrink-0 ${
                                        selectedDate === dateKey
                                            ? 'bg-trustBlue text-white shadow-md'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. 활동량 차트 */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 min-h-[350px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-pastel-green/20 rounded-xl flex items-center justify-center">
                            <Activity size={24} className="text-green-600" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800">{t('healthData', language)}</h3>
                    </div>
                    <div className="flex-1 min-h-[250px]">
                        <HealthChart type="steps" t={(key) => t(key, language)} />
                    </div>
                </div>

                {/* 2. 이동 반경 차트 */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 min-h-[350px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-pastel-blue/20 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800">{t('movementRadius', language)}</h3>
                    </div>
                    <div className="flex-1 min-h-[250px]">
                        <MovementRadiusChart language={language} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuardianActivityCharts;
