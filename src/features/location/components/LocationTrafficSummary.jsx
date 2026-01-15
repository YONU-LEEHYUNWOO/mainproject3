import React from 'react';
import { Train, Car, Clock, Navigation2, Loader2 } from 'lucide-react';
import { t } from '../../../i18n';

/**
 * 교통 수단별 소요 시간 및 요약 정보를 표시하는 카드
 */
const LocationTrafficSummary = ({ trafficData, language, destinationType }) => {
    // 테마 설정 (기본값)
    const destInfo = {
        iconColor: 'text-blue-500',
        textColorStrong: 'text-blue-900',
        textColorLight: 'text-blue-600',
        lightBg: 'bg-blue-50/30',
        lightBorder: 'border-blue-100'
    };

    return (
        <div className={`${destInfo.lightBg} rounded-3xl p-6 border-2 ${destInfo.lightBorder}`}>
            <div className="flex items-center gap-3 mb-4">
                <Train size={32} className={destInfo.iconColor} />
                <h4 className={`font-black ${destInfo.textColorStrong} text-xl`}>{t('trafficInfo', language)}</h4>
            </div>
            
            {trafficData.loading ? (
                <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 size={24} className={destInfo.iconColor + ' animate-spin'} />
                    <span className={`text-lg ${destInfo.textColorLight} font-black`}>교통 정보를 불러오는 중...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className={`text-lg ${destInfo.textColorLight} font-black`}>{t('departure', language)}</span>
                        <span className={`text-xl font-black ${destInfo.textColorStrong}`}>{trafficData.departure}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className={`text-lg ${destInfo.textColorLight} font-black`}>목적지</span>
                        <span className={`text-xl font-black ${destInfo.textColorStrong}`}>{trafficData.destination}</span>
                    </div>
                    
                    {/* 택시 정보 */}
                    <div className="bg-white/50 rounded-2xl p-4 border-2 border-blue-200 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Car size={20} className="text-blue-600" />
                            <span className={`text-base ${destInfo.textColorLight} font-black`}>🚕 택시</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-base ${destInfo.textColorLight} font-bold`}>예상 소요 시간</span>
                            <span className={`text-xl font-black ${destInfo.textColorStrong} flex items-center gap-2`}>
                                <Clock size={20} />
                                {trafficData.duration}
                            </span>
                        </div>
                        {trafficData.taxiFare > 0 && (
                            <div className="flex items-center justify-between">
                                <span className={`text-base ${destInfo.textColorLight} font-bold`}>예상 요금</span>
                                <span className={`text-xl font-black ${destInfo.textColorStrong}`}>
                                    약 {trafficData.taxiFare.toLocaleString()}원
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* 대중교통 정보 */}
                    {trafficData.publicTransportDuration && (
                        <div className="bg-white/50 rounded-2xl p-4 border-2 border-blue-200 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Train size={20} className="text-blue-600" />
                                <span className={`text-base ${destInfo.textColorLight} font-black`}>🚌 대중교통</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-base ${destInfo.textColorLight} font-bold`}>예상 소요 시간</span>
                                <span className={`text-xl font-black ${destInfo.textColorStrong} flex items-center gap-2`}>
                                    <Clock size={20} />
                                    {trafficData.publicTransportDuration}
                                </span>
                            </div>
                            {trafficData.publicTransportTip && (
                                <p className={`text-sm ${destInfo.textColorLight} mt-2 font-bold`}>💡 {trafficData.publicTransportTip}</p>
                            )}
                        </div>
                    )}

                    {/* 도보 정보 */}
                    {trafficData.walkingDuration && (
                        <div className="bg-white/50 rounded-2xl p-4 border-2 border-green-200 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Navigation2 size={20} className="text-green-600" />
                                <span className={`text-base ${destInfo.textColorLight} font-black`}>🚶 도보</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-base ${destInfo.textColorLight} font-bold`}>거리</span>
                                <span className={`text-xl font-black ${destInfo.textColorStrong}`}>
                                    {trafficData.walkingDistance}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-base ${destInfo.textColorLight} font-bold`}>예상 소요 시간</span>
                                <span className={`text-xl font-black ${destInfo.textColorStrong} flex items-center gap-2`}>
                                    <Clock size={20} />
                                    {trafficData.walkingDuration}
                                </span>
                            </div>
                        </div>
                    )}
                    
                    <p className={`text-lg ${destInfo.textColorLight} mt-4 leading-relaxed font-bold`}>💡 {trafficData.tip}</p>
                </div>
            )}
        </div>
    );
};

export default LocationTrafficSummary;
