import React from 'react';
import { X, Loader2, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { t } from '../../i18n';
import { handleSchedulePlaceSearch, handleSelectSchedulePlace } from '../../handlers/locationHandlers';
import { handleScheduleAdd } from '../../handlers/scheduleHandlers';

/**
 * 일정 추가 모달 컴포넌트
 */
const ScheduleAddModal = ({
    showScheduleModal,
    setShowScheduleModal,
    newSchedule,
    setNewSchedule,
    schedulePlaceSearchKeyword,
    setSchedulePlaceSearchKeyword,
    schedulePlaceSearchResults,
    setSchedulePlaceSearchResults,
    schedulePlaceSearchLoading,
    setSchedulePlaceSearchLoading,
    confirmedTasks,
    setConfirmedTasks,
    setSelectedTaskId,
    setChatHistory,
    locationInfo,
    currentGPSLocation,
    language
}) => {
    if (!showScheduleModal) return null;

    const handleClose = () => {
        setShowScheduleModal(false);
        setSchedulePlaceSearchKeyword('');
        setSchedulePlaceSearchResults([]);
        setNewSchedule({ title: '', date: '', time: '', location: '', repeat: false });
    };

    const handleSave = () => {
        handleScheduleAdd(newSchedule, false, confirmedTasks, setConfirmedTasks, setSelectedTaskId, setChatHistory, locationInfo, currentGPSLocation);
        setChatHistory(prev => [...prev, {
            role: 'assistant',
            content: `"${newSchedule.title}" 일정이 등록되었어요.`,
            timestamp: Date.now()
        }]);
        handleClose();
    };

    const handleSearch = () => {
        handleSchedulePlaceSearch(schedulePlaceSearchKeyword, setSchedulePlaceSearchLoading, setSchedulePlaceSearchResults);
    };

    const handleSelectPlace = (place) => {
        handleSelectSchedulePlace(place, newSchedule, setNewSchedule, setSchedulePlaceSearchResults, setSchedulePlaceSearchKeyword);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-black text-slate-900">{t('addSchedule', language)}</h3>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-base font-black text-slate-700 mb-3 block">일정 제목</label>
                        <input
                            type="text"
                            value={newSchedule.title}
                            onChange={e => setNewSchedule({ ...newSchedule, title: e.target.value })}
                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-lg font-bold outline-none focus:ring-4 focus:ring-pastel-purple"
                            placeholder="예: 병원 예약"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-base font-black text-slate-700 mb-3 block">날짜</label>
                            <input
                                type="date"
                                value={newSchedule.date}
                                onChange={e => setNewSchedule({ ...newSchedule, date: e.target.value })}
                                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-lg font-bold outline-none focus:ring-4 focus:ring-pastel-purple"
                            />
                        </div>
                        <div>
                            <label className="text-base font-black text-slate-700 mb-3 block">시간</label>
                            <input
                                type="time"
                                value={newSchedule.time}
                                onChange={e => setNewSchedule({ ...newSchedule, time: e.target.value })}
                                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-lg font-bold outline-none focus:ring-4 focus:ring-pastel-purple"
                            />
                        </div>
                    </div>

                    {/* 위치 설정 - 지도 검색 기능 포함 */}
                    <div>
                        <label className="text-base font-black text-slate-700 mb-3 block">📍 위치</label>

                        {/* 지도 검색 기능 */}
                        <div className="mb-4">
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={schedulePlaceSearchKeyword}
                                    onChange={(e) => setSchedulePlaceSearchKeyword(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch();
                                        }
                                    }}
                                    placeholder="예: 평택시 병원, 강남역"
                                    className="flex-1 p-4 rounded-2xl border-2 border-purple-300 text-lg font-bold focus:ring-4 focus:ring-purple-400 outline-none"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={schedulePlaceSearchLoading}
                                    className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                                >
                                    {schedulePlaceSearchLoading ? (
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
                            {schedulePlaceSearchResults && schedulePlaceSearchResults.error === 'SERVICE_DISABLED' && (
                                <div className="mt-2 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-2xl">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-base font-black text-yellow-900 mb-2">
                                                ⚠️ 카카오맵 서비스가 아직 활성화되지 않았습니다
                                            </p>
                                            <p className="text-sm text-yellow-800 font-bold">
                                                카카오 개발자 센터에서 "지도/로컬" 서비스를 활성화해주세요.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 검색 성공 안내 */}
                            {Array.isArray(schedulePlaceSearchResults) && schedulePlaceSearchResults.length > 0 && (
                                <div className="mt-2 p-3 bg-green-50 border-2 border-green-300 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={20} className="text-green-600" />
                                        <p className="text-sm font-black text-green-900">
                                            ✅ {schedulePlaceSearchResults.length}개의 장소를 찾았습니다!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 검색 결과 리스트 */}
                            {Array.isArray(schedulePlaceSearchResults) && schedulePlaceSearchResults.length > 0 && (
                                <div className="max-h-60 overflow-y-auto space-y-2 mt-2 border-2 border-purple-200 rounded-2xl p-3 bg-white">
                                    {schedulePlaceSearchResults.map((place, index) => (
                                        <button
                                            key={place.id || index}
                                            onClick={() => handleSelectPlace(place)}
                                            className="w-full text-left p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 transition-all duration-200"
                                        >
                                            <div className="font-black text-purple-900 text-base mb-1">{place.placeName}</div>
                                            <div className="text-sm text-purple-700 font-bold">
                                                {place.roadAddressName || place.addressName || '주소 정보 없음'}
                                            </div>
                                            {place.categoryName && (
                                                <div className="text-xs text-purple-500 font-bold mt-1">{place.categoryName}</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* 검색어 없음 안내 */}
                            {schedulePlaceSearchResults && schedulePlaceSearchResults.error === 'NO_KEYWORD' && (
                                <p className="text-sm text-purple-600 font-bold mt-2">
                                    💡 검색어를 입력하고 검색 버튼을 눌러주세요.
                                </p>
                            )}

                            {Array.isArray(schedulePlaceSearchResults) && schedulePlaceSearchResults.length === 0 && schedulePlaceSearchKeyword && !schedulePlaceSearchLoading && !schedulePlaceSearchResults?.error && (
                                <p className="text-sm text-purple-600 font-bold mt-2">
                                    💡 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-purple-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-purple-700 font-black">또는 직접 입력</span>
                            </div>
                        </div>

                        <input
                            type="text"
                            value={newSchedule.location}
                            onChange={e => setNewSchedule({ ...newSchedule, location: e.target.value })}
                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-lg font-bold outline-none focus:ring-4 focus:ring-pastel-purple mt-4"
                            placeholder="예: 강남역 인근 병원"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={newSchedule.repeat}
                            onChange={e => setNewSchedule({ ...newSchedule, repeat: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <label className="text-base font-black text-slate-700">{t('repeatSchedule', language)}</label>
                    </div>
                    {newSchedule.repeat && (
                        <div className="mt-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <label className="text-sm font-black text-purple-700 mb-2 block">반복 주기</label>
                            <select
                                value={newSchedule.repeatType || 'weekly'}
                                onChange={e => setNewSchedule({ ...newSchedule, repeatType: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-base font-bold"
                            >
                                <option value="weekly">주간 (매주 같은 요일)</option>
                                <option value="monthly">월간 (매달 같은 날짜)</option>
                                <option value="daily">일간 (매일)</option>
                            </select>
                            <p className="text-xs text-purple-600 font-bold mt-2">
                                💡 반복 일정은 앞으로 12개가 자동으로 생성됩니다.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={handleSave}
                            className="flex-1 px-8 py-5 bg-gradient-to-r from-pastel-purple to-pastel-pink text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            {t('save', language)}
                        </button>
                        <button
                            onClick={handleClose}
                            className="px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-200 transition-colors"
                        >
                            {t('cancel', language)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleAddModal;
