import { useState, useEffect, useRef } from 'react';
import { requestLocationPermission, getCurrentPosition, reverseGeocode } from '../../../utils/geolocation';
import { 
    loadInactivitySettings, 
    saveInactivitySettings, 
    loadBedtimeSettings, 
    saveBedtimeSettings 
} from '../../../utils/storage';

/**
 * 보호자 대시보드의 비즈니스 로직 및 상태 관리 훅
 */
export const useGuardianDashboard = ({
    parentInactivitySettings,
    onInactivitySettingsChange,
    parentBedtimeSettings,
    onBedtimeSettingsChange,
    currentGPSLocation,
    setCurrentGPSLocation,
    locationInfo
}) => {
    // 1. 설정 관련 상태
    const [inactivitySettings, setInactivitySettings] = useState(parentInactivitySettings || loadInactivitySettings());
    const [bedtimeSettings, setBedtimeSettings] = useState(parentBedtimeSettings || loadBedtimeSettings());
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

    // 2. 설정 변경 감지 및 저장/전달
    useEffect(() => {
        if (onInactivitySettingsChange) onInactivitySettingsChange(inactivitySettings);
        if (inactivitySettings?.warningMinutes) saveInactivitySettings(inactivitySettings);
    }, [inactivitySettings, onInactivitySettingsChange]);

    useEffect(() => {
        if (onBedtimeSettingsChange) onBedtimeSettingsChange(bedtimeSettings);
        if (bedtimeSettings?.bedtimeHour !== undefined) saveBedtimeSettings(bedtimeSettings);
    }, [bedtimeSettings, onBedtimeSettingsChange]);

    // 3. 부모 위치 정보 실시간 업데이트
    useEffect(() => {
        const updateLocation = async () => {
            if (currentGPSLocation?.lat && currentGPSLocation?.lng) {
                try {
                    const address = await reverseGeocode(currentGPSLocation.lat, currentGPSLocation.lng);
                    setCurrentLocation({
                        ...currentGPSLocation,
                        address,
                        lastUpdate: new Date().toLocaleTimeString()
                    });
                } catch (error) {
                    setCurrentLocation({
                        ...currentGPSLocation,
                        address: `위도 ${currentGPSLocation.lat.toFixed(4)}, 경도 ${currentGPSLocation.lng.toFixed(4)}`,
                        lastUpdate: new Date().toLocaleTimeString()
                    });
                }
            } else if (locationInfo?.home?.address) {
                setCurrentLocation({
                    lat: locationInfo.home.lat || null,
                    lng: locationInfo.home.lng || null,
                    address: locationInfo.home.address,
                    lastUpdate: '저장된 위치'
                });
            } else {
                setCurrentLocation(null);
            }
        };
        updateLocation();
    }, [currentGPSLocation, locationInfo]);

    // 4. 위치 새로고침 핸들러
    const handleRefreshLocation = async () => {
        setIsRefreshingLocation(true);
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                alert('위치 권한이 필요합니다.');
                return;
            }

            let position;
            try {
                position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
            } catch {
                position = await getCurrentPosition({ enableHighAccuracy: false, timeout: 10000 });
            }

            if (position?.lat && position?.lng) {
                if (position.accuracy > 1000) {
                    alert('정확도가 너무 낮아 위치 업데이트를 거부합니다.');
                    return;
                }
                if (setCurrentGPSLocation) setCurrentGPSLocation(position);
                const address = await reverseGeocode(position.lat, position.lng);
                alert(`✅ 위치 새로고침 완료: ${address}`);
            }
        } catch (error) {
            alert(`❌ 위치 정보를 가져올 수 없습니다: ${error.message}`);
        } finally {
            setIsRefreshingLocation(false);
        }
    };

    return {
        inactivitySettings, setInactivitySettings,
        bedtimeSettings, setBedtimeSettings,
        currentLocation,
        isRefreshingLocation,
        handleRefreshLocation
    };
};
