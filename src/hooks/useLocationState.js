import { useState } from 'react';
import { loadLocationInfo } from '../utils/storage';

/**
 * 위치 관련 상태 관리 훅
 * @returns {Object} 위치 관련 상태와 setter 함수들
 */
export const useLocationState = () => {
    // 위치 정보
    const [locationInfo, setLocationInfo] = useState(loadLocationInfo());
    const [currentGPSLocation, setCurrentGPSLocation] = useState(null); // 현재 GPS 위치 (lat, lng)
    const [locationPermissionStatus, setLocationPermissionStatus] = useState('prompt'); // 'granted' | 'denied' | 'prompt'
    const [locationLoading, setLocationLoading] = useState(false); // 위치 로딩 중

    // 위치 설정 모달
    const [showLocationSettings, setShowLocationSettings] = useState(false);

    // 장소 검색 (위치 설정용)
    const [placeSearchKeyword, setPlaceSearchKeyword] = useState('');
    const [placeSearchResults, setPlaceSearchResults] = useState([]);
    const [placeSearchLoading, setPlaceSearchLoading] = useState(false);

    // 위치 편집
    const [editingLocationType, setEditingLocationType] = useState(null); // 편집 중인 위치 타입 ('home', 'mart', 'pharmacy', 'hospital')
    const [tempLocation, setTempLocation] = useState(null); // 임시 위치 정보

    return {
        // 위치 정보
        locationInfo,
        setLocationInfo,
        currentGPSLocation,
        setCurrentGPSLocation,
        locationPermissionStatus,
        setLocationPermissionStatus,
        locationLoading,
        setLocationLoading,
        // 장소 검색
        placeSearchKeyword,
        setPlaceSearchKeyword,
        placeSearchResults,
        setPlaceSearchResults,
        placeSearchLoading,
        setPlaceSearchLoading,
        // 위치 편집
        editingLocationType,
        setEditingLocationType,
        tempLocation,
        setTempLocation
    };
};
