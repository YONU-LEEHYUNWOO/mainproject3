import React from 'react';
import { t } from '../../../../i18n';

/**
 * 마트 목록 관리 섹션 컴포넌트
 */
const MartListSection = ({
    locationInfo,
    setLocationInfo,
    editingLocationType,
    setEditingLocationType,
    tempLocation,
    setTempLocation,
    placeSearchKeyword,
    setPlaceSearchKeyword,
    placeSearchResults,
    setPlaceSearchResults,
    placeSearchLoading,
    setPlaceSearchLoading,
    handleSearch,
    handleSelect,
    handleSave,
    handleCancel,
    language
}) => {
    /**
     * 마트 목록 렌더링 (병원과 유사한 구조)
     */
    const renderMartList = () => {
        const allMarts = [];
        if (locationInfo.frequentPlaces?.mart?.address) {
            allMarts.push({ ...locationInfo.frequentPlaces.mart, isDefault: true, index: -1 });
        }
        (locationInfo.marts || []).forEach((mart, idx) => {
            allMarts.push({ ...mart, isDefault: false, index: idx });
        });

        return (
            <div className="mt-6 pt-6 border-t-2 border-green-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🛒</span>
                        <h4 className="text-lg font-black text-green-900">마트 목록</h4>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            {allMarts.length}개 등록됨
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            setEditingLocationType('mart_new');
                            setTempLocation({ name: '', address: '', details: '' });
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-black text-sm hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                    >
                        <span>+</span>
                        마트 추가
                    </button>
                </div>

                <div className="space-y-3">
                    {allMarts.length === 0 ? (
                        <p className="text-sm text-green-600 font-bold p-4 bg-green-50 rounded-xl text-center">
                            등록된 마트가 없습니다. "마트 추가" 버튼을 눌러 마트를 등록해주세요.
                        </p>
                    ) : (
                        allMarts.map((mart, displayIdx) => (
                            <div key={displayIdx} className="bg-white/70 rounded-xl p-4 border-2 border-green-200 hover:border-green-300 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">🛒</span>
                                            <span className="text-base font-black text-green-900">
                                                {mart.name || mart.address || '마트'}
                                            </span>
                                            {mart.isDefault && (
                                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">기본</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-green-700 font-bold">{mart.address}</p>
                                        {mart.lat && mart.lng && (
                                            <p className="text-xs text-green-500 font-bold mt-1">위치 정보: 저장됨 ✓</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {!mart.isDefault && mart.index !== -1 && (
                                            <button
                                                onClick={() => {
                                                    const updatedLocationInfo = { ...locationInfo };
                                                    updatedLocationInfo.frequentPlaces = updatedLocationInfo.frequentPlaces || {};
                                                    updatedLocationInfo.frequentPlaces.mart = {
                                                        ...mart,
                                                        name: mart.name || '',
                                                        address: mart.address || ''
                                                    };
                                                    const updatedMarts = [...(updatedLocationInfo.marts || [])];
                                                    updatedMarts.splice(mart.index, 1);
                                                    updatedLocationInfo.marts = updatedMarts;
                                                    setLocationInfo(updatedLocationInfo);
                                                }}
                                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg font-bold text-xs hover:bg-yellow-200 transition-colors"
                                                title="기본 마트로 설정"
                                            >
                                                기본 설정
                                            </button>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    if (mart.isDefault) {
                                                        setEditingLocationType('mart');
                                                        setTempLocation({ ...mart });
                                                    } else {
                                                        setEditingLocationType(`mart_${mart.index}`);
                                                        setTempLocation({ ...mart });
                                                    }
                                                }}
                                                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-xs hover:bg-green-200 transition-colors"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const updatedLocationInfo = { ...locationInfo };
                                                    if (mart.isDefault) {
                                                        updatedLocationInfo.frequentPlaces = updatedLocationInfo.frequentPlaces || {};
                                                        delete updatedLocationInfo.frequentPlaces.mart;
                                                    } else {
                                                        const updatedMarts = [...(updatedLocationInfo.marts || [])];
                                                        updatedMarts.splice(mart.index, 1);
                                                        updatedLocationInfo.marts = updatedMarts;
                                                    }
                                                    setLocationInfo(updatedLocationInfo);
                                                }}
                                                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-200 transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 마트 편집 모달 */}
                {editingLocationType && (editingLocationType === 'mart' || editingLocationType === 'mart_new' || editingLocationType.startsWith('mart_')) && (
                    <div className="mt-4 p-4 bg-white rounded-xl border-2 border-green-300">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-black text-green-700 mb-1 block">📍 지도에서 검색하기</label>
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
                                        placeholder="예: 마트 검색"
                                        className="flex-1 p-3 rounded-xl border-2 border-green-300 text-base font-bold focus:ring-2 focus:ring-green-400 outline-none"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={placeSearchLoading}
                                        className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-black text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        검색
                                    </button>
                                </div>
                                {Array.isArray(placeSearchResults) && placeSearchResults.length > 0 && (
                                    <div className="max-h-48 overflow-y-auto space-y-2 mt-2 border-2 border-green-200 rounded-xl p-2 bg-white">
                                        {placeSearchResults.map((place, index) => (
                                            <button
                                                key={place.id || index}
                                                onClick={() => handleSelect(place)}
                                                className="w-full text-left p-2 rounded-lg bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 transition-all duration-200"
                                            >
                                                <div className="font-black text-green-900 text-sm mb-1">{place.placeName}</div>
                                                <div className="text-xs text-green-700 font-bold">
                                                    {place.roadAddressName || place.addressName || '주소 정보 없음'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-green-300"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-3 bg-green-50 text-green-700 font-black">또는 직접 입력</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-black text-green-700 mb-1 block">마트 이름</label>
                                <input
                                    type="text"
                                    value={tempLocation?.name || ''}
                                    onChange={(e) => setTempLocation({ ...tempLocation, name: e.target.value })}
                                    placeholder="예: 이마트 평택점"
                                    className="w-full p-3 rounded-xl border-2 border-green-300 text-base font-bold focus:ring-2 focus:ring-green-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-black text-green-700 mb-1 block">주소</label>
                                <input
                                    type="text"
                                    value={tempLocation?.address || ''}
                                    onChange={(e) => setTempLocation({ ...tempLocation, address: e.target.value })}
                                    placeholder={t('addressPlaceholder', language)}
                                    className="w-full p-3 rounded-xl border-2 border-green-300 text-base font-bold focus:ring-2 focus:ring-green-400 outline-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-black text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                                >
                                    {t('saveLocation', language)}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-6 py-3 bg-white text-slate-600 rounded-xl font-black text-base border-2 border-slate-300 hover:bg-slate-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                                >
                                    {t('cancel', language)}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return renderMartList();
};

export default MartListSection;