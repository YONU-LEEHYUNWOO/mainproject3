import React from 'react';
import { Map, MapPin } from 'lucide-react';
import OpenStreetMapView from '../../../../components/OpenStreetMapView';

/**
 * 병원 경로 지도 표시 컴포넌트
 */
const HospitalMapSection = ({ trafficData, transportStatus }) => {
    return (
        <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-lg h-[350px] relative">
            {trafficData.origin && trafficData.destinationCoords ? (
                <OpenStreetMapView 
                    origin={trafficData.origin}
                    destination={trafficData.destinationCoords}
                    routePath={trafficData.routePath}
                />
            ) : (
                <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3">
                    <Map size={48} className="text-slate-300" />
                    <p className="text-slate-500 font-bold">지도를 불러오는 중입니다...</p>
                </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-200 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <MapPin size={24} className="text-red-500" />
                    <div>
                        <p className="text-xs text-slate-500 font-bold">안내 상태</p>
                        <p className="text-sm text-slate-900 font-black">
                            {transportStatus === 'navigating' ? '병원으로 이동 중' : '경로 확인 완료'}
                        </p>
                    </div>
                </div>
                {trafficData.distance && (
                    <div className="text-right">
                        <p className="text-xs text-slate-500 font-bold">총 거리</p>
                        <p className="text-sm text-red-600 font-black">{trafficData.distance}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalMapSection;
