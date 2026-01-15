import React from 'react';
import { Map, MapPin, RefreshCw, Loader2, Navigation2 } from 'lucide-react';
import OpenStreetMapView from '../../../components/OpenStreetMapView';

/**
 * 부모의 실시간 위치 지도 컴포넌트
 */
const GuardianLiveLocation = ({ 
    currentLocation, 
    isRefreshingLocation, 
    handleRefreshLocation 
}) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <MapPin size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800">부모님 현재 위치</h3>
                        <p className="text-sm text-slate-500 font-bold">
                            {currentLocation?.lastUpdate ? `${currentLocation.lastUpdate} 업데이트` : '위치 정보 확인 중'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleRefreshLocation}
                    disabled={isRefreshingLocation}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                        isRefreshingLocation 
                            ? 'bg-slate-100 text-slate-400' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                >
                    {isRefreshingLocation ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <RefreshCw size={20} />
                    )}
                </button>
            </div>

            <div className="h-[300px] rounded-2xl overflow-hidden border-2 border-slate-100 relative mb-4">
                {currentLocation ? (
                    <OpenStreetMapView 
                        origin={currentLocation}
                        zoom={15}
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3">
                        <Map size={48} className="text-slate-300" />
                        <p className="text-slate-500 font-bold text-sm">위치 정보를 불러올 수 없습니다.</p>
                    </div>
                )}
                
                {/* 실시간 정보 레이어 */}
                {currentLocation?.address && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 flex items-start gap-3 z-10">
                        <Navigation2 size={20} className="text-blue-600 shrink-0 mt-1" />
                        <div className="flex-1">
                            <p className="text-sm font-black text-slate-800 leading-tight">
                                {currentLocation.address}
                            </p>
                            <p className="text-xs text-slate-500 font-bold mt-1">현재 위치 기준</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuardianLiveLocation;
