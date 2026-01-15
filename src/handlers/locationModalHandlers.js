import { t } from '../i18n';

/**
 * 위치 편집 저장 핸들러
 * @param {string|null} editingLocationType - 편집 중인 위치 타입
 * @param {Object|null} tempLocation - 임시 위치 정보
 * @param {Object} locationInfo - 현재 위치 정보
 * @param {Function} setLocationInfo - 위치 정보 업데이트 함수
 * @param {Function} setEditingLocationType - 편집 중인 위치 타입 업데이트 함수
 * @param {Function} setTempLocation - 임시 위치 정보 업데이트 함수
 * @param {Function} setShowLocationSettings - 위치 설정 모달 표시 상태 업데이트 함수
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {string} language - 현재 언어
 */
export const saveLocationEdit = (
    editingLocationType,
    tempLocation,
    locationInfo,
    setLocationInfo,
    setEditingLocationType,
    setTempLocation,
    setPlaceSearchKeyword,
    setPlaceSearchResults,
    setShowLocationSettings,
    setChatHistory,
    language
) => {
    if (!editingLocationType || !tempLocation) return;

    if (!tempLocation.address || tempLocation.address.trim() === '') {
        alert('주소를 입력해주세요.');
        return;
    }

    const updatedLocationInfo = { ...locationInfo };

    if (editingLocationType === 'home') {
        updatedLocationInfo.home = tempLocation;
    } else if (editingLocationType === 'mart' || editingLocationType === 'pharmacy' || editingLocationType === 'hospital') {
        updatedLocationInfo.frequentPlaces = updatedLocationInfo.frequentPlaces || {};
        updatedLocationInfo.frequentPlaces[editingLocationType] = {
            name: tempLocation.name || tempLocation.address,
            address: tempLocation.address,
            lat: tempLocation.lat,
            lng: tempLocation.lng,
            details: tempLocation.details || ''
        };
    } else if (editingLocationType === 'hospital_new') {
        // 새 병원 추가
        if (!updatedLocationInfo.hospitals) {
            updatedLocationInfo.hospitals = [];
        }
        updatedLocationInfo.hospitals.push({
            name: tempLocation.name || tempLocation.address,
            address: tempLocation.address,
            lat: tempLocation.lat,
            lng: tempLocation.lng,
            details: tempLocation.details || ''
        });
    } else if (editingLocationType.startsWith('hospital_')) {
        // 추가 병원 수정
        const idx = parseInt(editingLocationType.split('_')[1]);
        const updatedHospitals = [...(updatedLocationInfo.hospitals || [])];
        updatedHospitals[idx] = {
            name: tempLocation.name || tempLocation.address,
            address: tempLocation.address,
            lat: tempLocation.lat,
            lng: tempLocation.lng,
            details: tempLocation.details || ''
        };
        updatedLocationInfo.hospitals = updatedHospitals;
    } else if (editingLocationType === 'mart_new') {
        // 새 마트 추가
        if (!updatedLocationInfo.marts) {
            updatedLocationInfo.marts = [];
        }
        updatedLocationInfo.marts.push({
            name: tempLocation.name || tempLocation.address,
            address: tempLocation.address,
            lat: tempLocation.lat,
            lng: tempLocation.lng,
            details: tempLocation.details || ''
        });
    } else if (editingLocationType.startsWith('mart_')) {
        // 추가 마트 수정
        const idx = parseInt(editingLocationType.split('_')[1]);
        const updatedMarts = [...(updatedLocationInfo.marts || [])];
        updatedMarts[idx] = {
            name: tempLocation.name || tempLocation.address,
            address: tempLocation.address,
            lat: tempLocation.lat,
            lng: tempLocation.lng,
            details: tempLocation.details || ''
        };
        updatedLocationInfo.marts = updatedMarts;
    } else if (editingLocationType === 'pharmacy_new') {
        // 새 약국 추가
        if (!updatedLocationInfo.pharmacies) {
            updatedLocationInfo.pharmacies = [];
        }
        updatedLocationInfo.pharmacies.push({
            name: tempLocation.name || tempLocation.address,
            address: tempLocation.address,
            lat: tempLocation.lat,
            lng: tempLocation.lng,
            details: tempLocation.details || ''
        });
    } else if (editingLocationType.startsWith('pharmacy_')) {
        // 추가 약국 수정
        const idx = parseInt(editingLocationType.split('_')[1]);
        const updatedPharmacies = [...(updatedLocationInfo.pharmacies || [])];
        updatedPharmacies[idx] = {
            name: tempLocation.name || tempLocation.address,
            address: tempLocation.address,
            lat: tempLocation.lat,
            lng: tempLocation.lng,
            details: tempLocation.details || ''
        };
        updatedLocationInfo.pharmacies = updatedPharmacies;
    }

    setLocationInfo(updatedLocationInfo);
    setEditingLocationType(null);
    setTempLocation(null);
    setPlaceSearchKeyword('');
    setPlaceSearchResults([]);
    setShowLocationSettings(false);

    setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: t('locationSaved', language),
        timestamp: Date.now()
    }]);
};

/**
 * 위치 편집 취소 핸들러
 * @param {Function} setEditingLocationType - 편집 중인 위치 타입 업데이트 함수
 * @param {Function} setTempLocation - 임시 위치 정보 업데이트 함수
 * @param {Function} setPlaceSearchKeyword - 장소 검색 키워드 업데이트 함수
 * @param {Function} setPlaceSearchResults - 장소 검색 결과 업데이트 함수
 * @param {Function} setShowLocationSettings - 위치 설정 모달 표시 상태 업데이트 함수
 */
export const cancelLocationEdit = (
    setEditingLocationType,
    setTempLocation,
    setPlaceSearchKeyword,
    setPlaceSearchResults,
    setShowLocationSettings
) => {
    setEditingLocationType(null);
    setTempLocation(null);
    setPlaceSearchKeyword('');
    setPlaceSearchResults([]);
    setShowLocationSettings(false);
};

/**
 * 위치 저장 핸들러 (집 주소용)
 * @param {string|null} editingLocationType - 편집 중인 위치 타입
 * @param {Object|null} tempLocation - 임시 위치 정보
 * @param {Object} locationInfo - 현재 위치 정보
 * @param {Function} setLocationInfo - 위치 정보 업데이트 함수
 * @param {Function} setEditingLocationType - 편집 중인 위치 타입 업데이트 함수
 * @param {Function} setTempLocation - 임시 위치 정보 업데이트 함수
 * @param {Function} setShowLocationSettings - 위치 설정 모달 표시 상태 업데이트 함수
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {string} language - 현재 언어
 */
export const saveHomeLocation = (
    editingLocationType,
    tempLocation,
    locationInfo,
    setLocationInfo,
    setEditingLocationType,
    setTempLocation,
    setShowLocationSettings,
    setChatHistory,
    language
) => {
    if (editingLocationType === 'home' && tempLocation) {
        const updatedLocationInfo = { ...locationInfo };
        updatedLocationInfo.home = tempLocation;
        setLocationInfo(updatedLocationInfo);
        setEditingLocationType(null);
        setTempLocation(null);
        setShowLocationSettings(false);

        setChatHistory(prev => [...prev, {
            role: 'assistant',
            content: t('locationSaved', language),
            timestamp: Date.now()
        }]);
    }
};
