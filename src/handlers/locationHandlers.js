import { searchPlaces } from '../utils/geolocation';

/**
 * 위치 설정용 장소 검색 핸들러
 * @param {string} placeSearchKeyword - 검색 키워드
 * @param {Function} setPlaceSearchLoading - 로딩 상태 업데이트 함수
 * @param {Function} setPlaceSearchResults - 검색 결과 업데이트 함수
 */
export const handlePlaceSearch = async (
    placeSearchKeyword,
    setPlaceSearchLoading,
    setPlaceSearchResults
) => {
    // 키워드가 없으면 안내 메시지 표시
    if (!placeSearchKeyword.trim()) {
        setPlaceSearchResults({ error: 'NO_KEYWORD', message: '검색어를 입력해주세요.' });
        return;
    }

    setPlaceSearchLoading(true);
    setPlaceSearchResults([]);

    try {
        // 전국 검색을 위해 위치 옵션 없이 검색
        const searchOptions = {};
        const results = await searchPlaces(placeSearchKeyword, searchOptions);

        // 서비스 비활성화 오류 체크
        if (results && results.error === 'SERVICE_DISABLED') {
            setPlaceSearchResults({ error: 'SERVICE_DISABLED', message: results.message });
        } else {
            setPlaceSearchResults(Array.isArray(results) ? results : []);
        }
    } catch (error) {
        console.error('장소 검색 실패:', error);
        setPlaceSearchResults([]);
    } finally {
        setPlaceSearchLoading(false);
    }
};

/**
 * 검색 결과 선택 핸들러 (위치 설정용)
 * @param {Object} place - 선택된 장소
 * @param {string|null} editingLocationType - 편집 중인 위치 타입
 * @param {Function} setTempLocation - 임시 위치 정보 업데이트 함수
 * @param {Function} setPlaceSearchResults - 검색 결과 업데이트 함수
 * @param {Function} setPlaceSearchKeyword - 검색 키워드 업데이트 함수
 */
export const handleSelectPlace = (
    place,
    editingLocationType,
    setTempLocation,
    setPlaceSearchResults,
    setPlaceSearchKeyword
) => {
    const placeNames = {
        mart: '마트',
        pharmacy: '약국',
        hospital: '병원'
    };

    // 자주 가는 장소인 경우 name 필드도 설정
    const isFrequentPlace = editingLocationType && ['mart', 'pharmacy', 'hospital'].includes(editingLocationType);
    const isHospitalEdit = editingLocationType && editingLocationType.startsWith('hospital');

    setTempLocation({
        ...((isFrequentPlace || isHospitalEdit) && { name: place.placeName }),
        address: place.address || place.placeName,
        lat: place.lat,
        lng: place.lng,
        details: place.roadAddressName || place.addressName || ''
    });
    setPlaceSearchResults([]);
    setPlaceSearchKeyword('');
};

/**
 * 일정 추가 모달용 장소 검색 핸들러
 * @param {string} schedulePlaceSearchKeyword - 검색 키워드
 * @param {Function} setSchedulePlaceSearchLoading - 로딩 상태 업데이트 함수
 * @param {Function} setSchedulePlaceSearchResults - 검색 결과 업데이트 함수
 */
export const handleSchedulePlaceSearch = async (
    schedulePlaceSearchKeyword,
    setSchedulePlaceSearchLoading,
    setSchedulePlaceSearchResults
) => {
    // 키워드가 없으면 안내 메시지 표시
    if (!schedulePlaceSearchKeyword.trim()) {
        setSchedulePlaceSearchResults({ error: 'NO_KEYWORD', message: '검색어를 입력해주세요.' });
        return;
    }

    setSchedulePlaceSearchLoading(true);
    setSchedulePlaceSearchResults([]);

    try {
        // 전국 검색을 위해 위치 옵션 없이 검색
        const searchOptions = {};
        const results = await searchPlaces(schedulePlaceSearchKeyword, searchOptions);

        // 서비스 비활성화 오류 체크
        if (results && results.error === 'SERVICE_DISABLED') {
            setSchedulePlaceSearchResults({ error: 'SERVICE_DISABLED', message: results.message });
        } else {
            setSchedulePlaceSearchResults(Array.isArray(results) ? results : []);
        }
    } catch (error) {
        console.error('장소 검색 실패:', error);
        setSchedulePlaceSearchResults([]);
    } finally {
        setSchedulePlaceSearchLoading(false);
    }
};

/**
 * 일정 추가 모달용 장소 선택 핸들러
 * @param {Object} place - 선택된 장소
 * @param {Object} newSchedule - 현재 일정 정보
 * @param {Function} setNewSchedule - 일정 정보 업데이트 함수
 * @param {Function} setSchedulePlaceSearchResults - 검색 결과 업데이트 함수
 * @param {Function} setSchedulePlaceSearchKeyword - 검색 키워드 업데이트 함수
 */
export const handleSelectSchedulePlace = (
    place,
    newSchedule,
    setNewSchedule,
    setSchedulePlaceSearchResults,
    setSchedulePlaceSearchKeyword
) => {
    setNewSchedule({ ...newSchedule, location: place.address || place.placeName });
    setSchedulePlaceSearchResults([]);
    setSchedulePlaceSearchKeyword('');
};

/**
 * 일정 수정용 장소 검색 핸들러
 * @param {string} taskEditPlaceSearchKeyword - 검색 키워드
 * @param {Function} setTaskEditPlaceSearchLoading - 로딩 상태 업데이트 함수
 * @param {Function} setTaskEditPlaceSearchResults - 검색 결과 업데이트 함수
 */
export const handleTaskEditPlaceSearch = async (
    taskEditPlaceSearchKeyword,
    setTaskEditPlaceSearchLoading,
    setTaskEditPlaceSearchResults
) => {
    // 키워드가 없으면 안내 메시지 표시
    if (!taskEditPlaceSearchKeyword.trim()) {
        setTaskEditPlaceSearchResults({ error: 'NO_KEYWORD', message: '검색어를 입력해주세요.' });
        return;
    }

    setTaskEditPlaceSearchLoading(true);
    setTaskEditPlaceSearchResults([]);

    try {
        // 전국 검색을 위해 위치 옵션 없이 검색
        const searchOptions = {};
        const results = await searchPlaces(taskEditPlaceSearchKeyword, searchOptions);

        // 서비스 비활성화 오류 체크
        if (results && results.error === 'SERVICE_DISABLED') {
            setTaskEditPlaceSearchResults({ error: 'SERVICE_DISABLED', message: results.message });
        } else {
            setTaskEditPlaceSearchResults(Array.isArray(results) ? results : []);
        }
    } catch (error) {
        console.error('장소 검색 실패:', error);
        setTaskEditPlaceSearchResults([]);
    } finally {
        setTaskEditPlaceSearchLoading(false);
    }
};

/**
 * 일정 수정용 장소 선택 핸들러
 * @param {Object} place - 선택된 장소
 * @param {Object|null} tempTask - 임시 일정 정보
 * @param {Function} setTempTask - 임시 일정 정보 업데이트 함수
 * @param {Function} setTaskEditPlaceSearchResults - 검색 결과 업데이트 함수
 * @param {Function} setTaskEditPlaceSearchKeyword - 검색 키워드 업데이트 함수
 */
export const handleSelectTaskEditPlace = (
    place,
    tempTask,
    setTempTask,
    setTaskEditPlaceSearchResults,
    setTaskEditPlaceSearchKeyword
) => {
    if (tempTask) {
        setTempTask({ ...tempTask, location: place.address || place.placeName });
    }
    setTaskEditPlaceSearchResults([]);
    setTaskEditPlaceSearchKeyword('');
};
