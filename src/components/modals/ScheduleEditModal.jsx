import React from 'react';
import { X, Loader2, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { t } from '../../i18n';
import { handleTaskEditPlaceSearch, handleSelectTaskEditPlace } from '../../handlers/locationHandlers';
import { saveEdit, cancelEdit } from '../../handlers/scheduleHandlers';

/**
 * 일정 수정 모달 컴포넌트
 */
const ScheduleEditModal = ({
    editingTaskId,
    tempTask,
    setTempTask,
    taskEditPlaceSearchKeyword,
    setTaskEditPlaceSearchKeyword,
    taskEditPlaceSearchResults,
    setTaskEditPlaceSearchResults,
    taskEditPlaceSearchLoading,
    setTaskEditPlaceSearchLoading,
    confirmedTasks,
    setConfirmedTasks,
    setEditingTaskId,
    locationInfo,
    currentGPSLocation,
    setChatHistory,
    language
}) => {
    if (!editingTaskId || !tempTask) return null;

    const handleCancel = () => {
        cancelEdit(setEditingTaskId, setTempTask, setTaskEditPlaceSearchKeyword, setTaskEditPlaceSearchResults);
    };

    const handleSave = () => {
        saveEdit(
            tempTask,
            editingTaskId,
            confirmedTasks,
            setConfirmedTasks,
            setEditingTaskId,
            setTempTask,
            locationInfo,
            currentGPSLocation,
            setChatHistory
        );
    };

    const handleSearch = () => {
        handleTaskEditPlaceSearch(taskEditPlaceSearchKeyword, setTaskEditPlaceSearchLoading, setTaskEditPlaceSearchResults);
    };

    const handleSelectPlace = (place) => {
        handleSelectTaskEditPlace(place, tempTask, setTempTask, setTaskEditPlaceSearchResults, setTaskEditPlaceSearchKeyword);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleCancel();
                }
            }}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-black text-slate-900">{t('editSchedule', language) || '일정 수정'}</h3>
                    <button
                        onClick={handleCancel}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-base font-black text-slate-700 mb-3 block">일정 제목</label>
                        <input
                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-lg font-bold outline-none focus:ring-4 focus:ring-pastel-purple"
                            value={tempTask?.title || ''}
                            onChange={e => setTempTask({ ...tempTask, title: e.target.value })}
                            placeholder="일정 제목"
                        />
                    </div>
                    <div>
                        <label className="text-base font-black text-slate-700 mb-3 block">날짜</label>
                        <input
                            type="date"
                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-lg font-bold outline-none focus:ring-4 focus:ring-pastel-purple"
                            value={tempTask?.date || ''}
                            onChange={e => setTempTask({ ...tempTask, date: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-base font-black text-slate-700 mb-3 block">시간</label>
                            <input
                                type="time"
                                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-lg font-bold outline-none focus:ring-4 focus:ring-pastel-purple"
                                value={tempTask?.time || ''}
                                onChange={e => setTempTask({ ...tempTask, time: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-base font-black text-slate-700 mb-3 block">📍 위치</label>

                            {/* 지도 검색 기능 */}
                            <div className="mb-4">
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={taskEditPlaceSearchKeyword}
                                        onChange={(e) => setTaskEditPlaceSearchKeyword(e.target.value)}
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
                                        disabled={taskEditPlaceSearchLoading}
                                        className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                                    >
                                        {taskEditPlaceSearchLoading ? (
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
                                {taskEditPlaceSearchResults && taskEditPlaceSearchResults.error === 'SERVICE_DISABLED' && (
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
                                {Array.isArray(taskEditPlaceSearchResults) && taskEditPlaceSearchResults.length > 0 && (
                                    <div className="mt-2 p-3 bg-green-50 border-2 border-green-300 rounded-2xl">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={20} className="text-green-600" />
                                            <p className="text-sm font-black text-green-900">
                                                ✅ {taskEditPlaceSearchResults.length}개의 장소를 찾았습니다!
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* 검색 결과 리스트 */}
                                {Array.isArray(taskEditPlaceSearchResults) && taskEditPlaceSearchResults.length > 0 && (
                                    <div className="max-h-60 overflow-y-auto space-y-2 mt-2 border-2 border-purple-200 rounded-2xl p-3 bg-white">
                                        {taskEditPlaceSearchResults.map((place, index) => (
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
                                {taskEditPlaceSearchResults && taskEditPlaceSearchResults.error === 'NO_KEYWORD' && (
                                    <p className="text-sm text-purple-600 font-bold mt-2">
                                        💡 검색어를 입력하고 검색 버튼을 눌러주세요.
                                    </p>
                                )}

                                {Array.isArray(taskEditPlaceSearchResults) && taskEditPlaceSearchResults.length === 0 && taskEditPlaceSearchKeyword && !taskEditPlaceSearchLoading && !taskEditPlaceSearchResults?.error && (
                                    <p className="text-sm text-purple-600 font-bold mt-2">
                                        💡 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                                    </p>
                                )}

                                <div className="relative mt-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t-2 border-purple-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-purple-700 font-black">또는 직접 입력</span>
                                    </div>
                                </div>
                            </div>

                            <input
                                placeholder="예: 강남역 인근 병원"
                                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-lg font-bold outline-none focus:ring-4 focus:ring-pastel-purple mt-4"
                                value={tempTask?.location || ''}
                                onChange={e => setTempTask({ ...tempTask, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={handleSave}
                            className="flex-1 px-8 py-5 bg-gradient-to-r from-pastel-purple to-pastel-pink text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            {t('save', language)}
                        </button>
                        <button
                            onClick={handleCancel}
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

export default ScheduleEditModal;
