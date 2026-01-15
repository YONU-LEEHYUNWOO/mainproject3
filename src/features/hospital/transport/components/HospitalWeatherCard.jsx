import React from 'react';
import { Cloud, Loader2 } from 'lucide-react';

/**
 * 병원 이동 관련 날씨 팁 카드
 */
const HospitalWeatherCard = ({ weatherData }) => {
    return (
        <div className="bg-pastel-yellow/30 rounded-3xl p-6 border-2 border-pastel-yellow/50">
            <div className="flex items-center gap-3 mb-4">
                <Cloud size={32} className="text-yellow-600" />
                <h4 className="font-black text-yellow-900 text-xl">날씨 알림</h4>
            </div>
            {weatherData.loading ? (
                <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 size={24} className="text-yellow-600 animate-spin" />
                    <span className="text-yellow-700 font-black">날씨 확인 중...</span>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-yellow-900">
                            {weatherData.condition} {weatherData.temperature}
                        </span>
                    </div>
                    <p className="text-yellow-800 font-bold leading-relaxed">
                        💡 {weatherData.tip}
                    </p>
                </div>
            )}
        </div>
    );
};

export default HospitalWeatherCard;
