import { handlePlaceSearch, handleSelectPlace } from '../../../../handlers/locationHandlers';
import { saveLocationEdit, cancelLocationEdit } from '../../../../handlers/locationModalHandlers';

/**
 * 위치 설정 모달 상태 및 로직 관리 훅
 */
export const useLocationSettingsModal = ({
    placeSearchKeyword,
    setPlaceSearchKeyword,
    placeSearchResults,
    setPlaceSearchResults,
    placeSearchLoading,
    setPlaceSearchLoading,
    editingLocationType,
    setEditingLocationType,
    tempLocation,
    setTempLocation,
    locationInfo,
    setLocationInfo,
    setShowLocationSettings,
    setChatHistory,
    language
}) => {

    /**
     * 장소 검색 핸들러 (병원/마트/약국용)
     */
    const handleSearch = () => {
        handlePlaceSearch(placeSearchKeyword, setPlaceSearchLoading, setPlaceSearchResults);
    };

    /**
     * 장소 선택 핸들러 (병원/마트/약국용)
     */
    const handleSelect = (place) => {
        const selectedPlace = {
            name: place.placeName,
            address: place.address || place.placeName,
            lat: place.lat,
            lng: place.lng,
            details: ''
        };
        setTempLocation(selectedPlace);
        setPlaceSearchResults([]);
        setPlaceSearchKeyword('');
    };

    /**
     * 저장 핸들러 (병원/마트/약국용)
     */
    const handleSave = () => {
        if (!tempLocation?.address || tempLocation.address.trim() === '') {
            alert('주소를 입력해주세요.');
            return;
        }
        saveLocationEdit(
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
        );
    };

    /**
     * 취소 핸들러 (병원/마트/약국용)
     */
    const handleCancel = () => {
        cancelLocationEdit(
            setEditingLocationType,
            setTempLocation,
            setPlaceSearchKeyword,
            setPlaceSearchResults,
            setShowLocationSettings
        );
    };

    return {
        handleSearch,
        handleSelect,
        handleSave,
        handleCancel
    };
};