import React from 'react';
import { Cloud, Loader2 } from 'lucide-react';
import { t } from '../../../i18n';

/**
 * 날씨 정보를 표시하는 카드 컴포넌트
 */
const LocationWeatherCard = ({ weatherData, language }) => {
    return (
        <div className="bg-pastel-yellow/30 rounded-3xl p-6 border-2 border-pastel-yellow/50">
            <div className="flex items-center gap-3 mb-4">
                <Cloud size={32} className="text-yellow-600" />
                <h4 className="font-black text-yellow-900 text-xl">{t('weatherInfo', language)}</h4>
            </div>
            {weatherData.loading ? (
                <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 size={24} className="text-yellow-600 animate-spin" />
                    <span className="text-lg text-yellow-700 font-black">날씨 정보를 불러오는 중...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lg text-yellow-700 font-black">날씨</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-yellow-900">{weatherData.condition} {weatherData.temperature}</span>
                            {weatherData.simulated && (
                                <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">시뮬레이션</span>
                            )}
                        </div>
                    </div>
                    <p className="text-lg text-yellow-800 mt-3 font-bold">💡 {weatherData.tip}</p>
                    {weatherData.simulated && (
                        <p className="text-xs text-yellow-600 font-bold mt-2">
                            ⚠️ 실제 날씨 API 연결 실패로 시뮬레이션 데이터를 사용 중입니다.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default LocationWeatherCard;
