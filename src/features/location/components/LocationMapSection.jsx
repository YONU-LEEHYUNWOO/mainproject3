import React, { useEffect, useRef, useState } from 'react';
import { Map, AlertCircle, Loader2 } from 'lucide-react';
import { loadKakaoMapSDK, isKakaoMapSDKLoaded } from '../../../utils/kakaoMapLoader';
import OpenStreetMapView from '../../../components/OpenStreetMapView';

/**
 * 지도 표시 및 경로 시각화 컴포넌트
 */
const LocationMapSection = ({ trafficData, currentGPSLocation, transportStatus, selectedTransportMode }) => {
    const mapContainerRef = useRef(null);
    const [sdkLoaded, setSdkLoaded] = useState(isKakaoMapSDKLoaded());
    const [sdkLoadFailed, setSdkLoadFailed] = useState(false);

    useEffect(() => {
        if (!sdkLoaded && !sdkLoadFailed) {
            loadKakaoMapSDK()
                .then(() => setSdkLoaded(true))
                .catch(() => setSdkLoadFailed(true));
        }
    }, [sdkLoaded, sdkLoadFailed]);

    // 카카오맵 렌더링 (SDK 로드 성공 시)
    useEffect(() => {
        if (sdkLoaded && mapContainerRef.current && trafficData.origin && trafficData.destinationCoords) {
            const { kakao } = window;
            
            // SDK가 로드되었더라도 kakao.maps 객체가 없을 수 있으므로 체크 강화
            if (!kakao || !kakao.maps) {
                console.warn('⚠️ 카카오맵 SDK 로드 대기 중...');
                return;
            }

            const options = {
                center: new kakao.maps.LatLng(trafficData.origin.lat, trafficData.origin.lng),
                level: 4
            };
            const map = new kakao.maps.Map(mapContainerRef.current, options);

            // 출발지 마커
            new kakao.maps.Marker({
                position: new kakao.maps.LatLng(trafficData.origin.lat, trafficData.origin.lng),
                map: map,
                title: '출발지'
            });

            // 목적지 마커
            new kakao.maps.Marker({
                position: new kakao.maps.LatLng(trafficData.destinationCoords.lat, trafficData.destinationCoords.lng),
                map: map,
                title: '목적지'
            });

            // 경로 그리기 (trafficData.routePath가 있는 경우)
            if (trafficData.routePath && trafficData.routePath.length > 0) {
                const path = trafficData.routePath.map(pos => new kakao.maps.LatLng(pos.lat, pos.lng));
                const polyline = new kakao.maps.Polyline({
                    path: path,
                    strokeWeight: 5,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 0.7,
                    strokeStyle: 'solid'
                });
                polyline.setMap(map);

                // 지도 범위 조정
                const bounds = new kakao.maps.LatLngBounds();
                path.forEach(p => bounds.extend(p));
                map.setBounds(bounds);
            }
        }
    }, [sdkLoaded, trafficData]);

    return (
        <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-lg h-[400px] relative">
            {sdkLoadFailed ? (
                /* SDK 로드 실패 시 대체 지도 (OSM) */
                <OpenStreetMapView 
                    origin={trafficData.origin}
                    destination={trafficData.destinationCoords}
                    routePath={trafficData.routePath}
                />
            ) : !sdkLoaded ? (
                /* 로딩 중 */
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-4">
                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                    <p className="text-slate-600 font-black">지도를 불러오는 중...</p>
                </div>
            ) : (
                /* 카카오맵 컨테이너 */
                <div ref={mapContainerRef} className="w-full h-full" />
            )}
            
            {/* 하단 정보 레이어 */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-200 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <Map size={24} className="text-blue-500" />
                    <div>
                        <p className="text-xs text-slate-500 font-bold">현재 상태</p>
                        <p className="text-sm text-slate-900 font-black">
                            {transportStatus === 'navigating' ? '길 안내 중' : '위치 확인 완료'}
                        </p>
                    </div>
                </div>
                {trafficData.distance && (
                    <div className="text-right">
                        <p className="text-xs text-slate-500 font-bold">총 거리</p>
                        <p className="text-sm text-blue-600 font-black">{trafficData.distance}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationMapSection;
