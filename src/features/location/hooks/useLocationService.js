import { useState, useEffect, useRef } from 'react';
import { fetchWeatherData, fetchWeatherByLocation } from '../../../utils/weatherApi';
import { searchRoute, searchPublicTransportRoute, calculateWalkingRoute } from '../../../utils/kakaoMapApi';
import { reverseGeocode } from '../../../utils/geolocation';

/**
 * 위치 기반 안내 서비스를 위한 상태 및 로직을 관리하는 훅
 */
export const useLocationService = ({ 
    destination, 
    destinationType, 
    locationInfo, 
    currentGPSLocation,
    onMovementStart,
    destinationPlace
}) => {
    // 이동 상태
    const [transportStatus, setTransportStatus] = useState('preparation');
    const [selectedTransportMode, setSelectedTransportMode] = useState(null);
    
    // 모달 상태
    const [showTaxiModal, setShowTaxiModal] = useState(false);
    const [showTransportModeModal, setShowTransportModeModal] = useState(false);
    const [showPublicTransportModal, setShowPublicTransportModal] = useState(false);
    const [showNavigationModal, setShowNavigationModal] = useState(false);
    
    // 데이터 상태
    const [originAddress, setOriginAddress] = useState(null);
    const [weatherData, setWeatherData] = useState({
        condition: '확인 중...',
        temperature: '-',
        tip: '날씨 정보를 확인하고 있습니다...',
        loading: true
    });
    const [trafficData, setTrafficData] = useState({
        departure: '현재 위치 확인 중...',
        destination: destination,
        duration: '계산 중...',
        tip: '경로를 계산하고 있습니다...',
        loading: true,
        guides: [],
        routePath: [],
        bounds: null,
        origin: null,
        destinationCoords: null
    });
    
    const [realtimeNavigation, setRealtimeNavigation] = useState({
        remainingDistance: null,
        remainingDuration: null,
        lastUpdate: null,
        isUpdating: false
    });

    const weatherLoadingRef = useRef(false);
    const trafficLoadingRef = useRef(false);
    const lastLocationRef = useRef(null);

    // 1. 출발지 역지오코딩
    useEffect(() => {
        const loadOriginAddress = async () => {
            if (currentGPSLocation?.lat && currentGPSLocation?.lng && !originAddress) {
                try {
                    const address = await reverseGeocode(currentGPSLocation.lat, currentGPSLocation.lng);
                    setOriginAddress(address);
                } catch (error) {
                    setOriginAddress('현재 위치');
                }
            } else if (!currentGPSLocation) {
                setOriginAddress(null);
            }
        };
        loadOriginAddress();
    }, [currentGPSLocation, originAddress]);

    // 2. 날씨 정보 로드
    useEffect(() => {
        const loadWeather = async () => {
            if (weatherLoadingRef.current) return;
            weatherLoadingRef.current = true;
            try {
                let data;
                if (currentGPSLocation?.lat && currentGPSLocation?.lng) {
                    data = await fetchWeatherData(currentGPSLocation.lat, currentGPSLocation.lng);
                } else {
                    const location = locationInfo?.home?.address || '평택시';
                    if (lastLocationRef.current === location) {
                        weatherLoadingRef.current = false;
                        return;
                    }
                    lastLocationRef.current = location;
                    data = await fetchWeatherByLocation(location);
                }
                setWeatherData({
                    condition: data.condition,
                    temperature: data.temperature,
                    tip: destinationType === 'home' 
                        ? `집으로 가는 길 날씨가 ${data.condition.toLowerCase()}이에요. ${data.tip}`
                        : `${destination}로 가는 길 날씨가 ${data.condition.toLowerCase()}이에요. ${data.tip}`,
                    loading: false,
                    simulated: data.simulated || !data.isRealData
                });
            } catch (error) {
                setWeatherData(prev => ({ ...prev, loading: false }));
            } finally {
                weatherLoadingRef.current = false;
            }
        };
        loadWeather();
    }, [destinationType, locationInfo?.home?.address, destination, currentGPSLocation]);

    // 3. 교통 정보 로드 (헬퍼 함수 포함)
    const loadTrafficInfo = async () => {
        if (trafficLoadingRef.current) return;
        trafficLoadingRef.current = true;
        setTrafficData(prev => ({ ...prev, loading: true }));

        try {
            const departureAddress = originAddress || (currentGPSLocation ? '현재 위치' : (locationInfo?.home?.address || '출발지'));
            const destinationAddress = getDestinationAddress(destinationType, destination, locationInfo);
            const originCoords = getOriginCoords(currentGPSLocation, locationInfo);
            const destCoords = getDestinationCoords(destinationType, destination, locationInfo, destinationPlace);

            const distanceKm = calculateDistance(originCoords, destCoords);

            if (distanceKm < 0.05) {
                setTrafficData({
                    departure: departureAddress,
                    destination: destinationAddress,
                    duration: '0분',
                    distance: distanceKm < 0.001 ? '0m' : `${Math.round(distanceKm * 1000)}m`,
                    tip: destinationType === 'home' ? '이미 집에 있습니다.' : '이미 목적지에 있습니다.',
                    loading: false,
                    simulated: false
                });
                return;
            }

            const [routeData, publicTransportData] = await Promise.all([
                searchRoute(originCoords, destCoords).catch(() => ({
                    departure: departureAddress,
                    destination: destinationAddress,
                    duration: '계산 중...',
                    distance: `${distanceKm.toFixed(1)}km`,
                    tip: '교통 정보를 불러오지 못했습니다.',
                    simulated: true
                })),
                searchPublicTransportRoute(originCoords, destCoords).catch(() => null)
            ]);

            const walkingData = calculateWalkingRoute(originCoords, destCoords);

            setTrafficData({
                ...routeData,
                departure: departureAddress,
                destination: destinationAddress,
                publicTransportDuration: publicTransportData?.duration || null,
                publicTransportTip: publicTransportData?.tip || null,
                walkingDuration: walkingData?.duration || null,
                walkingDistance: walkingData?.distance || null,
                walkingTip: walkingData?.tip || null,
                loading: false,
                origin: originCoords,
                destinationCoords: destCoords
            });
        } catch (error) {
            setTrafficData(prev => ({ ...prev, loading: false }));
        } finally {
            trafficLoadingRef.current = false;
        }
    };

    // 목적지 주소 및 좌표 획득용 유틸리티 (내부용)
    const getDestinationAddress = (type, dest, info) => {
        if (type === 'home' && info?.home?.address) return info.home.address;
        return dest;
    };

    const getOriginCoords = (gps, info) => {
        if (gps?.lat && gps?.lng) return { lat: gps.lat, lng: gps.lng };
        if (info?.home?.lat && info?.home?.lng) return { lat: info.home.lat, lng: info.home.lng };
        return { lat: 36.9923, lng: 127.1119 }; // 기본값
    };

    const getDestinationCoords = (type, dest, info, place) => {
        if (type === 'home' && info?.home?.lat && info?.home?.lng) {
            return { lat: info.home.lat, lng: info.home.lng };
        }
        
        // 마트/약국/병원 등 목록에서 일치하는 장소 찾기
        const findInList = (list, frequentItem) => {
            const combinedList = [
                ...(list || []),
                ...(frequentItem ? [frequentItem] : [])
            ].filter(item => item && item.address);

            return combinedList.find(item => 
                item.address === dest || 
                dest?.includes(item.address) || 
                item.address?.includes(dest) ||
                (item.name && (dest?.includes(item.name) || item.name?.includes(dest)))
            );
        };

        if (type === 'mart') {
            const mart = findInList(info?.marts, info?.frequentPlaces?.mart);
            if (mart?.lat && mart?.lng) return { lat: mart.lat, lng: mart.lng };
        }
        
        if (type === 'pharmacy') {
            const pharmacy = findInList(info?.pharmacies, info?.frequentPlaces?.pharmacy);
            if (pharmacy?.lat && pharmacy?.lng) return { lat: pharmacy.lat, lng: pharmacy.lng };
        }

        if (type === 'hospital') {
            // frequentPlaces 내 병원 정보 확인
            if (info?.frequentPlaces?.hospital?.lat && info?.frequentPlaces?.hospital?.lng) {
                return { lat: info.frequentPlaces.hospital.lat, lng: info.frequentPlaces.hospital.lng };
            }
            // 일반 병원 목록이 있다면 검색
            const hospital = findInList(info?.hospitals);
            if (hospital?.lat && hospital?.lng) return { lat: hospital.lat, lng: hospital.lng };
        }

        // 전달받은 destinationPlace 좌표가 최우선
        if (place?.lat && place?.lng) {
            return { lat: place.lat, lng: place.lng };
        }

        // 최후의 수단: 기본 위치
        return { lat: 36.9923, lng: 127.1119 };
    };

    const calculateDistance = (p1, p2) => {
        const R = 6371;
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLng = (p2.lng - p1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    useEffect(() => {
        loadTrafficInfo();
    }, [destination, destinationType, locationInfo, currentGPSLocation, originAddress]);

    return {
        transportStatus, setTransportStatus,
        selectedTransportMode, setSelectedTransportMode,
        showTaxiModal, setShowTaxiModal,
        showTransportModeModal, setShowTransportModeModal,
        showPublicTransportModal, setShowPublicTransportModal,
        showNavigationModal, setShowNavigationModal,
        weatherData,
        trafficData,
        realtimeNavigation, setRealtimeNavigation,
        originAddress
    };
};
