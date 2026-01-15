import { useEffect, useRef } from 'react';
import { getCurrentPosition, requestLocationPermission, reverseGeocode } from '../utils/geolocation';

/**
 * GPS 위치 정보 로드 훅
 * @param {Object|null} currentGPSLocation - 현재 GPS 위치 상태
 * @param {Function} setCurrentGPSLocation - GPS 위치 업데이트 함수
 * @param {Function} setLocationPermissionStatus - 위치 권한 상태 업데이트 함수
 * @param {boolean} locationLoading - 위치 로딩 상태
 * @param {Function} setLocationLoading - 위치 로딩 상태 업데이트 함수
 * @param {Object} locationInfo - 위치 정보 상태
 * @param {Function} setLocationInfo - 위치 정보 업데이트 함수
 */
export const useGPSLocation = (
    currentGPSLocation,
    setCurrentGPSLocation,
    setLocationPermissionStatus,
    locationLoading,
    setLocationLoading,
    locationInfo,
    setLocationInfo
) => {
    const gpsLoadingRef = useRef(false);
    const gpsMountedRef = useRef(true);

    useEffect(() => {
        gpsMountedRef.current = true;

        const loadGPSLocation = async () => {
            // 이미 위치를 가져왔거나 로딩 중이면 스킵
            if (currentGPSLocation || locationLoading || gpsLoadingRef.current) {
                console.log('⚠️ GPS 위치 가져오기 건너뜀 (이미 로드됨 또는 로딩 중)');
                return;
            }

            // 마운트 상태 확인
            if (!gpsMountedRef.current) {
                return;
            }

            gpsLoadingRef.current = true;
            setLocationLoading(true);

            try {
                // 위치 권한 요청
                const hasPermission = await requestLocationPermission();

                if (!hasPermission) {
                    setLocationPermissionStatus('denied');
                    console.warn('⚠️ 위치 권한이 거부되었습니다. GPS 없이도 서비스를 이용할 수 있습니다.');
                    if (gpsMountedRef.current) {
                        setLocationLoading(false);
                    }
                    gpsLoadingRef.current = false;
                    return;
                }

                // 마운트 상태 다시 확인
                if (!gpsMountedRef.current) {
                    gpsLoadingRef.current = false;
                    return;
                }

                setLocationPermissionStatus('granted');

                // 현재 위치 가져오기 (타임아웃 시간 증가)
                const position = await getCurrentPosition({ timeout: 30000 });

                // 마운트 상태 확인 후 상태 업데이트
                if (gpsMountedRef.current) {
                    setCurrentGPSLocation({
                        lat: position.lat,
                        lng: position.lng,
                        accuracy: position.accuracy,
                        timestamp: position.timestamp
                    });

                    console.log('✅ GPS 위치 가져오기 성공:', {
                        lat: position.lat,
                        lng: position.lng,
                        accuracy: `${position.accuracy}m`,
                        timestamp: new Date(position.timestamp).toLocaleString(),
                        coordinates: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
                    });

                    // 주소 변환 시도
                    try {
                        const address = await reverseGeocode(position.lat, position.lng);
                        console.log('📍 주소 변환 성공:', {
                            address,
                            from: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
                        });

                        // locationInfo에 현재 위치 업데이트 (home 주소가 없을 때만)
                        if (!locationInfo?.home?.address) {
                            console.log('💡 집 주소가 없어서 GPS 위치를 집 주소로 설정합니다:', address);
                            setLocationInfo(prev => ({
                                ...prev,
                                home: {
                                    ...prev.home,
                                    address: address,
                                    lat: position.lat,
                                    lng: position.lng
                                }
                            }));
                        } else {
                            console.log('💡 집 주소가 이미 설정되어 있습니다:', locationInfo.home.address);
                        }
                    } catch (geocodeError) {
                        console.warn('⚠️ 주소 변환 실패, 좌표만 사용:', geocodeError);
                    }
                }
            } catch (error) {
                console.error('❌ GPS 위치 가져오기 실패:', error);
                if (gpsMountedRef.current) {
                    setLocationPermissionStatus('denied');
                }
            } finally {
                if (gpsMountedRef.current) {
                    setLocationLoading(false);
                }
                gpsLoadingRef.current = false;
            }
        };

        // 위치 정보 가져오기 (한 번만 실행)
        loadGPSLocation();

        // 컴포넌트 언마운트 시 정리
        return () => {
            gpsMountedRef.current = false;
            gpsLoadingRef.current = false;
        };
    }, []); // 빈 배열로 마운트 시 한 번만 실행
};
