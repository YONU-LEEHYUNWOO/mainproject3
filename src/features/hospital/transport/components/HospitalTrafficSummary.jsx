import React from 'react';
import { Car, Train, Clock, MapPin, Loader2 } from 'lucide-react';

/**
 * 병원까지의 교통 정보 요약 카드
 */
const HospitalTrafficSummary = ({ trafficData }) => {
    return (
        <div className="bg-blue-50/30 rounded-3xl p-6 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-4">
                <Car size={32} className="text-blue-500" />
                <h4 className="font-black text-blue-900 text-xl">교통 정보</h4>
            </div>
            
            {trafficData.loading ? (
                <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 size={24} className="text-blue-500 animate-spin" />
                    <span className="text-lg text-blue-700 font-black">교통 정보를 불러오는 중...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-black">출발지</span>
                        <span className="text-blue-900 font-black">{trafficData.departure}</span>
                    </div>
                    
                    {/* 택시 소요시간 */}
                    <div className="bg-white/50 rounded-2xl p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Car size={20} className="text-blue-600" />
                                <span className="font-black">🚕 택시</span>
                            </div>
                            <span className="text-xl font-black text-blue-900 flex items-center gap-2">
                                <Clock size={20} />
                                {trafficData.duration}
                            </span>
                        </div>
                    </div>
                    
                    {/* 대중교통 소요시간 */}
                    {trafficData.publicTransportDuration && (
                        <div className="bg-white/50 rounded-2xl p-4 border-2 border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Train size={20} className="text-blue-600" />
                                    <span className="font-black">🚌 대중교통</span>
                                </div>
                                <span className="text-xl font-black text-blue-900 flex items-center gap-2">
                                    <Clock size={20} />
                                    {trafficData.publicTransportDuration}
                                </span>
                            </div>
                        </div>
                    )}
                    
                    <p className="text-sm text-blue-700 font-bold leading-relaxed mt-2">
                        💡 {trafficData.tip}
                    </p>
                </div>
            )}
        </div>
    );
};

export default HospitalTrafficSummary;
