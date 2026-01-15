import React from 'react';
import { t } from '../../../../i18n';

/**
 * 병원 목록 관리 섹션 컴포넌트
 */
const HospitalListSection = ({
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
     * 병원 목록 렌더링
     */
    const renderHospitalList = () => {
        const allHospitals = [];
        if (locationInfo.frequentPlaces?.hospital?.address) {
            allHospitals.push({
                ...locationInfo.frequentPlaces.hospital,
                isDefault: true,
                index: -1
            });
        }
        (locationInfo.hospitals || []).forEach((hospital, idx) => {
            allHospitals.push({
                ...hospital,
                isDefault: false,
                index: idx
            });
        });

        return (
            <div className="pt-4 border-t-2 border-purple-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏥</span>
                        <h4 className="text-lg font-black text-purple-900">병원 목록</h4>
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            {allHospitals.length}개 등록됨
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            setEditingLocationType('hospital_new');
                            setTempLocation({ name: '', address: '', details: '' });
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-black text-sm hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                    >
                        <span>+</span>
                        병원 추가
                    </button>
                </div>

                <div className="space-y-3">
                    {allHospitals.length === 0 ? (
                        <p className="text-sm text-purple-600 font-bold p-4 bg-purple-50 rounded-xl text-center">
                            등록된 병원이 없습니다. "병원 추가" 버튼을 눌러 병원을 등록해주세요.
                        </p>
                    ) : (
                        allHospitals.map((hospital, displayIdx) => (
                            <div key={displayIdx} className="bg-white/70 rounded-xl p-4 border-2 border-red-200 hover:border-red-300 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">🏥</span>
                                            <span className="text-base font-black text-red-900">
                                                {hospital.name || hospital.address || '병원'}
                                            </span>
                                            {hospital.isDefault && (
                                                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">기본</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-red-700 font-bold">{hospital.address}</p>
                                        {hospital.lat && hospital.lng && (
                                            <p className="text-xs text-red-500 font-bold mt-1">위치 정보: 저장됨 ✓</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {!hospital.isDefault && hospital.index !== -1 && (
                                            <button
                                                onClick={() => {
                                                    const updatedLocationInfo = { ...locationInfo };
                                                    updatedLocationInfo.frequentPlaces = updatedLocationInfo.frequentPlaces || {};
                                                    updatedLocationInfo.frequentPlaces.hospital = {
                                                        ...hospital,
                                                        name: hospital.name || '',
                                                        address: hospital.address || ''
                                                    };
                                                    const updatedHospitals = [...(updatedLocationInfo.hospitals || [])];
                                                    updatedHospitals.splice(hospital.index, 1);
                                                    updatedLocationInfo.hospitals = updatedHospitals;
                                                    setLocationInfo(updatedLocationInfo);
                                                }}
                                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg font-bold text-xs hover:bg-yellow-200 transition-colors"
                                                title="기본 병원으로 설정"
                                            >
                                                기본 설정
                                            </button>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    if (hospital.isDefault) {
                                                        setEditingLocationType('hospital');
                                                        setTempLocation({ ...hospital });
                                                    } else {
                                                        setEditingLocationType(`hospital_${hospital.index}`);
                                                        setTempLocation({ ...hospital });
                                                    }
                                                }}
                                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-xs hover:bg-red-200 transition-colors"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const updatedLocationInfo = { ...locationInfo };
                                                    if (hospital.isDefault) {
                                                        updatedLocationInfo.frequentPlaces = updatedLocationInfo.frequentPlaces || {};
                                                        delete updatedLocationInfo.frequentPlaces.hospital;
                                                    } else {
                                                        const updatedHospitals = [...(updatedLocationInfo.hospitals || [])];
                                                        updatedHospitals.splice(hospital.index, 1);
                                                        updatedLocationInfo.hospitals = updatedHospitals;
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

                {/* 병원 편집 모달 */}
                {editingLocationType && editingLocationType.startsWith('hospital') && (
                    <div className="mt-4 p-4 bg-white rounded-xl border-2 border-red-300">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-black text-red-700 mb-1 block">📍 지도에서 검색하기</label>
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
                                        placeholder="예: 병원 검색"
                                        className="flex-1 p-3 rounded-xl border-2 border-red-300 text-base font-bold focus:ring-2 focus:ring-red-400 outline-none"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={placeSearchLoading}
                                        className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-black text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        검색
                                    </button>
                                </div>
                                {Array.isArray(placeSearchResults) && placeSearchResults.length > 0 && (
                                    <div className="max-h-48 overflow-y-auto space-y-2 mt-2 border-2 border-red-200 rounded-xl p-2 bg-white">
                                        {placeSearchResults.map((place, index) => (
                                            <button
                                                key={place.id || index}
                                                onClick={() => handleSelect(place)}
                                                className="w-full text-left p-2 rounded-lg bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 transition-all duration-200"
                                            >
                                                <div className="font-black text-red-900 text-sm mb-1">{place.placeName}</div>
                                                <div className="text-xs text-red-700 font-bold">
                                                    {place.roadAddressName || place.addressName || '주소 정보 없음'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-red-300"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-3 bg-red-50 text-red-700 font-black">또는 직접 입력</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-black text-red-700 mb-1 block">병원 이름</label>
                                <input
                                    type="text"
                                    value={tempLocation?.name || ''}
                                    onChange={(e) => setTempLocation({ ...tempLocation, name: e.target.value })}
                                    placeholder="예: 평택시 병원"
                                    className="w-full p-3 rounded-xl border-2 border-red-300 text-base font-bold focus:ring-2 focus:ring-red-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-black text-red-700 mb-1 block">주소</label>
                                <input
                                    type="text"
                                    value={tempLocation?.address || ''}
                                    onChange={(e) => setTempLocation({ ...tempLocation, address: e.target.value })}
                                    placeholder={t('addressPlaceholder', language)}
                                    className="w-full p-3 rounded-xl border-2 border-red-300 text-base font-bold focus:ring-2 focus:ring-red-400 outline-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-black text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
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

    return renderHospitalList();
};

export default HospitalListSection;