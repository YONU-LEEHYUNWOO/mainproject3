import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { getCurrentPosition, requestLocationPermission, reverseGeocode } from '../../../utils/geolocation';

/**
 * GPS 위치 권한 설정 섹션 컴포넌트
 */
const GPSSettingsSection = ({
    locationLoading,
    setLocationLoading,
    currentGPSLocation,
    setCurrentGPSLocation,
    locationPermissionStatus,
    setLocationPermissionStatus,
    locationInfo,
    setLocationInfo
}) => {
    /**
     * 위치 새로고침 핸들러
     * GPS 위치를 다시 가져와서 업데이트
     * 고정밀도 실패 시 네트워크 기반 위치로 재시도
     */
    const handleRefreshLocation = async () => {
        setLocationLoading(true);
        
        try {
            console.log('🔄 위치 새로고침 시작...');
            
            // 1. 위치 권한 확인
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                console.error('❌ 위치 권한이 거부되었습니다.');
                alert('위치 권한이 필요합니다.\n\n브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭하여\n위치 권한을 "허용"으로 변경해주세요.');
                setLocationPermissionStatus('denied');
                setLocationLoading(false);
                return;
            }

            console.log('✅ 위치 권한 확인 완료');

            let position = null;
            
            // 2. 현재 위치 가져오기 (고정밀도 우선 시도)
            try {
                console.log('📡 1차 시도: 고정밀도(GPS) 모드...');
                position = await getCurrentPosition({ 
                    enableHighAccuracy: true,
                    timeout: 15000, // 15초
                    maximumAge: 10000 
                });
                console.log('✅ 고정밀도 위치 가져오기 성공');
            } catch (highAccuracyError) {
                console.warn('⚠️ 고정밀도 위치 실패, 네트워크 기반으로 재시도...', highAccuracyError.message);
                
                // 2-2. 고정밀도 실패 시 네트워크 기반으로 재시도
                try {
                    console.log('📡 2차 시도: 네트워크 기반 위치...');
                    position = await getCurrentPosition({ 
                        enableHighAccuracy: false, // 네트워크 기반 위치 사용
                        timeout: 10000, // 10초
                        maximumAge: 60000 // 1분
                    });
                    console.log('✅ 네트워크 기반 위치 가져오기 성공 (정확도 낮음)');
                } catch (networkError) {
                    // 둘 다 실패하면 에러 throw
                    throw new Error('GPS 및 네트워크 기반 위치를 모두 가져올 수 없습니다.\n\n- 실내에 있다면 창가로 이동해보세요.\n- Wi-Fi를 켜보세요.\n- 브라우저를 새로고침해보세요.');
                }
            }
            
            console.log('📍 위치 가져오기 최종 성공:', {
                lat: position.lat,
                lng: position.lng,
                accuracy: `${Math.round(position.accuracy)}m`
            });

            // 3. 정확도 검증 (1000m 이상이면 거부)
            if (position.accuracy > 1000) {
                console.warn('⚠️ 위치 정확도가 너무 낮습니다:', {
                    accuracy: `${Math.round(position.accuracy)}m`,
                    threshold: '1000m',
                    action: '위치 업데이트 거부 (기존 위치 유지)'
                });
                
                const currentAccuracyKm = (position.accuracy / 1000).toFixed(1);
                alert(`⚠️ 위치 정확도가 너무 낮습니다.\n\n현재 정확도: ±${currentAccuracyKm}km\n\n더 정확한 위치를 위해:\n- 실외로 이동하거나 창가로 가보세요\n- Wi-Fi를 켜보세요\n- 잠시 후 다시 시도해보세요\n\n기존 위치를 유지합니다.`);
                setLocationLoading(false);
                return;
            }

            console.log('✅ 위치 정확도 검증 통과:', `${Math.round(position.accuracy)}m < 1000m`);

            // 4. GPS 위치 상태 업데이트
            setCurrentGPSLocation({
                lat: position.lat,
                lng: position.lng,
                accuracy: position.accuracy,
                timestamp: position.timestamp
            });
            setLocationPermissionStatus('granted');

            // 5. 주소 변환 시도
            try {
                console.log('🔍 역지오코딩 시작...');
                const address = await reverseGeocode(position.lat, position.lng);
                console.log('✅ 역지오코딩 성공:', address);
                
                // home 주소가 없으면 GPS 위치를 home으로 설정
                if (!locationInfo?.home?.address) {
                    console.log('💡 집 주소 설정:', address);
                    setLocationInfo(prev => ({
                        ...prev,
                        home: {
                            ...prev.home,
                            address: address,
                            lat: position.lat,
                            lng: position.lng
                        }
                    }));
                }
                
                const accuracyText = position.accuracy < 100 
                    ? `정확도: ±${Math.round(position.accuracy)}m` 
                    : '정확도: 낮음';
                
                alert(`✅ 위치 새로고침 완료!\n\n📍 ${address}\n${accuracyText}`);
            } catch (geocodeError) {
                console.warn('⚠️ 주소 변환 실패:', geocodeError);
                alert(`✅ 위치 새로고침 완료!\n\n📍 좌표: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}\n정확도: ±${Math.round(position.accuracy)}m`);
            }

            console.log('🎉 위치 새로고침 완료!');
            
        } catch (error) {
            console.error('❌ 위치 새로고침 실패:', error);
            
            let errorMessage = '위치 정보를 가져올 수 없습니다.';
            if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`❌ ${errorMessage}`);
            // 권한 문제가 아니면 상태 유지
            if (!error.message?.includes('권한')) {
                setLocationPermissionStatus('prompt');
            }
        } finally {
            setLocationLoading(false);
        }
    };

    /**
     * 위치 권한 요청 핸들러
     */
    const handleRequestPermission = async () => {
        setLocationLoading(true);
        try {
            const hasPermission = await requestLocationPermission();
            if (hasPermission) {
                const position = await getCurrentPosition();
                setCurrentGPSLocation({
                    lat: position.lat,
                    lng: position.lng,
                    accuracy: position.accuracy,
                    timestamp: position.timestamp
                });
                setLocationPermissionStatus('granted');

                // 주소 변환 시도
                try {
                    const address = await reverseGeocode(position.lat, position.lng);
                    if (!locationInfo?.home?.address) {
                        setLocationInfo(prev => ({
                            ...prev,
                            home: {
                                ...prev.home,
                                address: address,
                                lat: position.lat,
                                lng: position.lng
                            }
                        }));
                    }
                } catch (geocodeError) {
                    console.warn('주소 변환 실패:', geocodeError);
                }
            } else {
                setLocationPermissionStatus('denied');
            }
        } catch (error) {
            console.error('위치 권한 요청 실패:', error);
            setLocationPermissionStatus('denied');
        } finally {
            setLocationLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
                <MapPin size={32} className="text-green-600" />
                <h3 className="text-xl font-black text-green-900">현재 위치 (GPS)</h3>
            </div>
            {locationLoading ? (
                <div className="flex items-center gap-3 py-4">
                    <Loader2 size={24} className="text-green-600 animate-spin" />
                    <span className="text-lg text-green-700 font-black">위치 정보를 가져오는 중...</span>
                </div>
            ) : currentGPSLocation ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-lg text-green-700 font-black">위도</span>
                        <span className="text-xl font-black text-green-900">{currentGPSLocation.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-lg text-green-700 font-black">경도</span>
                        <span className="text-xl font-black text-green-900">{currentGPSLocation.lng.toFixed(6)}</span>
                    </div>
                    {currentGPSLocation.accuracy && (
                        <div className="flex items-center justify-between">
                            <span className="text-lg text-green-700 font-black">정확도</span>
                            <span className="text-xl font-black text-green-900">±{Math.round(currentGPSLocation.accuracy)}m</span>
                        </div>
                    )}
                    <p className="text-sm text-green-600 font-bold mt-2">
                        ✅ GPS 위치가 활성화되어 있습니다. 날씨 정보에 실제 위치가 사용됩니다.
                    </p>
                    <button
                        onClick={handleRefreshLocation}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 mt-3"
                    >
                        위치 새로고침
                    </button>
                </div>
            ) : locationPermissionStatus === 'denied' ? (
                <div className="space-y-4">
                    <p className="text-lg text-green-700 font-bold">
                        ⚠️ 위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.
                    </p>
                    <button
                        onClick={handleRequestPermission}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        위치 권한 다시 요청
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-lg text-green-700 font-bold">
                        위치 권한을 허용하면 정확한 날씨 정보를 제공할 수 있습니다.
                    </p>
                    <button
                        onClick={handleRequestPermission}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        위치 권한 허용하기
                    </button>
                </div>
            )}
        </div>
    );
};

export default GPSSettingsSection;
