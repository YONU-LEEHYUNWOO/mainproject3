import React from 'react';
import { Activity, TrendingUp, Calendar } from 'lucide-react';
import HealthChart from '../../../components/HealthChart';
import MovementRadiusChart from '../../../components/MovementRadiusChart';
import { t } from '../../../i18n';

/**
 * 부모의 활동량 및 이동 반경 차트 섹션
 */
const GuardianActivityCharts = ({ language, dailyActivities, selectedDate, setSelectedDate }) => {
    return (
        <div className="space-y-6">
            {/* 날짜 선택 필터 */}
            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <Calendar size={20} className="text-slate-400 shrink-0" />
                <div className="flex gap-2">
                    {[null, 'yesterday', '2daysAgo'].map((dateKey) => {
                        const label = dateKey === null ? '오늘' : dateKey === 'yesterday' ? '어제' : '그저께';
                        return (
                            <button
                                key={dateKey}
                                onClick={() => setSelectedDate(dateKey)}
                                className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. 활동량 차트 */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-pastel-green/20 rounded-xl flex items-center justify-center">
                            <Activity size={24} className="text-green-600" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800">{t('healthData', language)}</h3>
                    </div>
                    <div className="h-[250px]">
                        <HealthChart type="steps" t={(key) => t(key, language)} />
                    </div>
                </div>

                {/* 2. 이동 반경 차트 */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-pastel-blue/20 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800">{t('movementRadius', language)}</h3>
                    </div>
                    <div className="h-[250px]">
                        <MovementRadiusChart language={language} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuardianActivityCharts;
