import { useState, useEffect, useRef } from 'react';
import { fetchWeatherData, fetchWeatherByLocation } from '../../../../utils/weatherApi';
import { searchRoute, searchPublicTransportRoute, calculateWalkingRoute } from '../../../../utils/kakaoMapApi';
import { reverseGeocode, geocode } from '../../../../utils/geolocation';
import { detectVisitType } from '../utils/visitTypeUtils';

/**
 * 병원 이동 지원을 위한 상태 및 로직 관리 훅
 */
export const useHospitalTransport = ({
    task,
    locationInfo,
    currentGPSLocation,
    onMovementStart
}) => {
    const [transportStatus, setTransportStatus] = useState('preparation');
    const [selectedTransportMode, setSelectedTransportMode] = useState(null);
    const [checkedRequirements, setCheckedRequirements] = useState({});
    
    // 모달 상태
    const [showTaxiModal, setShowTaxiModal] = useState(false);
    const [showTransportModeModal, setShowTransportModeModal] = useState(false);
    const [showPublicTransportModal, setShowPublicTransportModal] = useState(false);

    // 데이터 상태
    const [originAddress, setOriginAddress] = useState(null);
    const [weatherData, setWeatherData] = useState({ condition: '', temperature: '', tip: '', loading: true });
    const [trafficData, setTrafficData] = useState({ departure: '', destination: '', duration: '', distance: '', loading: true });
    
    const visitType = detectVisitType(task);
    const weatherLoadingRef = useRef(false);
    const trafficLoadingRef = useRef(false);

    // 1. 출발지 역지오코딩
    useEffect(() => {
        const loadOrigin = async () => {
            if (currentGPSLocation?.lat && !originAddress) {
                try {
                    const address = await reverseGeocode(currentGPSLocation.lat, currentGPSLocation.lng);
                    setOriginAddress(address);
                } catch {
                    setOriginAddress('현재 위치');
                }
            }
        };
        loadOrigin();
    }, [currentGPSLocation, originAddress]);

    // 2. 날씨 로드
    useEffect(() => {
        const loadWeather = async () => {
            if (weatherLoadingRef.current) return;
            weatherLoadingRef.current = true;
            try {
                let data;
                if (currentGPSLocation?.lat) {
                    data = await fetchWeatherData(currentGPSLocation.lat, currentGPSLocation.lng);
                } else {
                    data = await fetchWeatherByLocation(task?.location || '평택시');
                }
                setWeatherData({ ...data, loading: false });
            } catch {
                setWeatherData(prev => ({ ...prev, loading: false }));
            } finally {
                weatherLoadingRef.current = false;
            }
        };
        loadWeather();
    }, [task?.location, currentGPSLocation]);

    // 3. 교통 로드
    const loadTraffic = async () => {
        if (trafficLoadingRef.current) return;
        trafficLoadingRef.current = true;
        setTrafficData(prev => ({ ...prev, loading: true }));

        try {
            const originCoords = currentGPSLocation?.lat ? currentGPSLocation : (locationInfo?.home || { lat: 36.9923, lng: 127.1119 });
            
            // 목적지 좌표 찾기 로직 (hospitals 목록 또는 frequentPlaces 등 확인)
            let destCoords = { lat: 37.5665, lng: 126.9780 }; // 기본값
            const matched = locationInfo?.hospitals?.find(h => task?.location?.includes(h.name) || h.address?.includes(task?.location));
            
            if (matched?.lat) {
                destCoords = { lat: matched.lat, lng: matched.lng };
            } else if (task?.location) {
                try {
                    const geo = await geocode(task.location);
                    destCoords = { lat: geo.lat, lng: geo.lng };
                } catch { /* fallback 유지 */ }
            }

            const [route, ptRoute] = await Promise.all([
                searchRoute(originCoords, destCoords).catch(() => ({ duration: '계산 불가', distance: '0km' })),
                searchPublicTransportRoute(originCoords, destCoords).catch(() => null)
            ]);

            setTrafficData({
                ...route,
                departure: originAddress || '현재 위치',
                destination: task?.location || '병원',
                publicTransportDuration: ptRoute?.duration,
                publicTransportTip: ptRoute?.tip,
                loading: false,
                origin: originCoords,
                destinationCoords: destCoords
            });
        } catch {
            setTrafficData(prev => ({ ...prev, loading: false }));
        } finally {
            trafficLoadingRef.current = false;
        }
    };

    useEffect(() => {
        loadTraffic();
    }, [task?.location, currentGPSLocation, originAddress]);

    return {
        transportStatus, setTransportStatus,
        selectedTransportMode, setSelectedTransportMode,
        checkedRequirements, setCheckedRequirements,
        showTaxiModal, setShowTaxiModal,
        showTransportModeModal, setShowTransportModeModal,
        showPublicTransportModal, setShowPublicTransportModal,
        weatherData,
        trafficData,
        visitType,
        originAddress
    };
};
