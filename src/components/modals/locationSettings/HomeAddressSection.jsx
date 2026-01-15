import React from 'react';
import { Home, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { t } from '../../../i18n';
import { handlePlaceSearch, handleSelectPlace } from '../../../handlers/locationHandlers';
import { saveLocationEdit, cancelLocationEdit } from '../../../handlers/locationModalHandlers';

/**
 * 집 주소 설정 섹션 컴포넌트
 */
const HomeAddressSection = ({
    editingLocationType,
    setEditingLocationType,
    tempLocation,
    setTempLocation,
    locationInfo,
    placeSearchKeyword,
    setPlaceSearchKeyword,
    placeSearchResults,
    setPlaceSearchResults,
    placeSearchLoading,
    setPlaceSearchLoading,
    setLocationInfo,
    setShowLocationSettings,
    setChatHistory,
    language
}) => {
    /**
     * 장소 검색 핸들러
     */
    const handleSearch = () => {
        handlePlaceSearch(placeSearchKeyword, setPlaceSearchLoading, setPlaceSearchResults);
    };

    /**
     * 장소 선택 핸들러
     */
    const handleSelect = (place) => {
        handleSelectPlace(place, editingLocationType, setTempLocation, setPlaceSearchResults, setPlaceSearchKeyword);
    };

    /**
     * 저장 핸들러
     */
    const handleSave = () => {
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
     * 취소 핸들러
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

    return (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
                <Home size={32} className="text-blue-600" />
                <h3 className="text-xl font-black text-blue-900">{t('homeAddress', language)}</h3>
            </div>
            {editingLocationType === 'home' ? (
                <div className="space-y-4">
                    {/* 지도 검색 기능 */}
                    <div>
                        <label className="text-sm font-black text-blue-700 mb-2 block">📍 지도에서 검색하기</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={placeSearchKeyword}
                                onChange={(e) => setPlaceSearchKeyword(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                placeholder="예: 평택시 병원, 강남역"
                                className="flex-1 p-4 rounded-2xl border-2 border-blue-300 text-lg font-bold focus:ring-4 focus:ring-blue-400 outline-none"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={placeSearchLoading}
                                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                            >
                                {placeSearchLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>검색 중...</span>
                                </>
                            ) : (
                                <>
                                    <MapPin size={20} />
                                    <span>검색</span>
                                </>
                            )}
                            </button>
                        </div>

                        {/* 서비스 비활성화 안내 */}
                        {placeSearchResults && placeSearchResults.error === 'SERVICE_DISABLED' && (
                            <div className="mt-2 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-2xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-base font-black text-yellow-900 mb-2">
                                            ⚠️ 카카오맵 서비스가 아직 활성화되지 않았습니다
                                        </p>
                                        <p className="text-sm text-yellow-800 font-bold mb-3">
                                            지도 검색 기능을 사용하려면 카카오 개발자 센터에서 "지도/로컬" 서비스를 활성화해야 합니다.
                                        </p>
                                        <div className="bg-white rounded-xl p-3 border-2 border-yellow-200">
                                            <p className="text-xs font-black text-yellow-900 mb-2">📋 활성화 방법:</p>
                                            <ol className="text-xs text-yellow-800 font-bold space-y-1 list-decimal list-inside">
                                                <li>카카오 개발자 센터 접속</li>
                                                <li>내 애플리케이션 → "함께잇다" 선택</li>
                                                <li>제품 설정 → 지도/로컬 → 활성화</li>
                                                <li>저장 후 몇 분 대기</li>
                                            </ol>
                                        </div>
                                        <p className="text-xs text-yellow-700 font-bold mt-3">
                                            💡 서비스 활성화 전까지는 주소를 직접 입력하실 수 있습니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 검색 성공 안내 */}
                        {Array.isArray(placeSearchResults) && placeSearchResults.length > 0 && (
                            <div className="mt-2 p-3 bg-green-50 border-2 border-green-300 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={20} className="text-green-600" />
                                    <p className="text-sm font-black text-green-900">
                                        ✅ {placeSearchResults.length}개의 장소를 찾았습니다!
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 검색 결과 리스트 */}
                        {Array.isArray(placeSearchResults) && placeSearchResults.length > 0 && (
                            <div className="max-h-60 overflow-y-auto space-y-2 mt-2 border-2 border-blue-200 rounded-2xl p-3 bg-white">
                                {placeSearchResults.map((place, index) => (
                                    <button
                                        key={place.id || index}
                                        onClick={() => handleSelect(place)}
                                        className="w-full text-left p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 transition-all duration-200"
                                    >
                                        <div className="font-black text-blue-900 text-base mb-1">{place.placeName}</div>
                                        <div className="text-sm text-blue-700 font-bold">
                                            {place.roadAddressName || place.addressName || '주소 정보 없음'}
                                        </div>
                                        {place.categoryName && (
                                            <div className="text-xs text-blue-500 font-bold mt-1">{place.categoryName}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {Array.isArray(placeSearchResults) && placeSearchResults.length === 0 && placeSearchKeyword && !placeSearchLoading && !placeSearchResults?.error && (
                            <p className="text-sm text-blue-600 font-bold mt-2">
                                💡 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-blue-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-blue-50 text-blue-700 font-black">또는 직접 입력</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-black text-blue-700 mb-2 block">{t('addressPlaceholder', language)}</label>
                        <input
                            type="text"
                            value={tempLocation?.address || locationInfo.home?.address || ''}
                            onChange={(e) => setTempLocation({ ...tempLocation, address: e.target.value, details: tempLocation?.details || locationInfo.home?.details || '' })}
                            placeholder="예: 경기도 평택시 신평동 123-45"
                            className="w-full p-4 rounded-2xl border-2 border-blue-300 text-lg font-bold focus:ring-4 focus:ring-blue-400 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-black text-blue-700 mb-2 block">상세 주소 (선택사항)</label>
                        <input
                            type="text"
                            value={tempLocation?.details || locationInfo.home?.details || ''}
                            onChange={(e) => setTempLocation({ ...tempLocation, details: e.target.value, address: tempLocation?.address || locationInfo.home?.address || '' })}
                            placeholder="예: 아파트 101동 1001호"
                            className="w-full p-4 rounded-2xl border-2 border-blue-300 text-lg font-bold focus:ring-4 focus:ring-blue-400 outline-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            {t('save', language)}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-6 py-4 bg-white text-slate-600 rounded-2xl font-black text-lg border-2 border-slate-300 hover:bg-slate-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            {t('cancel', language)}
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <p className="text-lg text-blue-800 font-bold mb-4">
                        {locationInfo.home?.address || '경기도 평택시'}
                        {locationInfo.home?.details && ` (${locationInfo.home.details})`}
                    </p>
                    <button
                        onClick={() => {
                            setEditingLocationType('home');
                            setTempLocation({ ...locationInfo.home });
                        }}
                        className="px-6 py-3 bg-white text-blue-700 rounded-2xl font-black text-base border-2 border-blue-300 hover:bg-blue-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        {locationInfo.home?.address ? t('editLocation', language) : t('setHomeAddress', language)}
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomeAddressSection;
