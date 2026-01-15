import React from 'react';
import {
    X,
    Map,
    MapPin,
    Building2,
    Utensils,
    ShoppingBag,
    AlertTriangle,
    BarChart3
} from 'lucide-react';
import { t } from '../../i18n';

/**
 * 하루 요약 상세 모달 컴포넌트
 * - 이동 기록, 방문 장소, 진료 기록, 식사 기록, 장보기 기록, 안전 이벤트, 통계 요약 표시
 * 
 * @param {boolean} showDailySummaryDetail - 모달 표시 여부
 * @param {function} setShowDailySummaryDetail - 모달 표시 상태 변경 함수
 * @param {object} dailyActivities - 일일 활동 데이터
 * @param {string} language - 현재 언어 설정
 */
const DailySummaryDetailModal = ({
    showDailySummaryDetail,
    setShowDailySummaryDetail,
    dailyActivities,
    language
}) => {
    // 모달이 표시되지 않으면 null 반환
    if (!showDailySummaryDetail) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowDailySummaryDetail(false)}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-3xl)' }}>
                        📊 {t('dailySummary', language)} 상세
                    </h2>
                    <button
                        onClick={() => setShowDailySummaryDetail(false)}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        style={{ minWidth: 'var(--button-size-min)', minHeight: 'var(--button-size-min)' }}
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* 이동 기록 상세 */}
                    {dailyActivities.movements && dailyActivities.movements.length > 0 ? (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Map size={32} className="text-blue-600" />
                                <h3 className="font-black text-blue-900" style={{ fontSize: 'var(--font-size-xl)' }}>이동 기록</h3>
                            </div>
                            <div className="space-y-3">
                                {dailyActivities.movements.map((movement, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-blue-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                {movement.from} → {movement.to}
                                            </span>
                                            <span className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                {movement.time}
                                            </span>
                                        </div>
                                        {movement.distance && (
                                            <p className="text-slate-700 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                거리: {movement.distance}
                                            </p>
                                        )}
                                        {movement.duration && (
                                            <p className="text-slate-700 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                소요 시간: {movement.duration}
                                            </p>
                                        )}
                                        {movement.route && (
                                            <p className="text-slate-600 font-bold mt-2" style={{ fontSize: 'var(--font-size-base)' }}>
                                                경로: {movement.route}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Map size={32} className="text-blue-600" />
                                <h3 className="font-black text-blue-900" style={{ fontSize: 'var(--font-size-xl)' }}>이동 기록</h3>
                            </div>
                            <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>오늘 이동 기록이 없습니다.</p>
                        </div>
                    )}

                    {/* 방문 장소 목록 상세 */}
                    {dailyActivities.visits && dailyActivities.visits.length > 0 ? (
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin size={32} className="text-green-600" />
                                <h3 className="font-black text-green-900" style={{ fontSize: 'var(--font-size-xl)' }}>방문 장소</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {dailyActivities.visits.map((visit, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-green-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin size={20} className="text-green-600" />
                                            <span className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                {visit.place}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                            방문 시간: {visit.time}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin size={32} className="text-green-600" />
                                <h3 className="font-black text-green-900" style={{ fontSize: 'var(--font-size-xl)' }}>방문 장소</h3>
                            </div>
                            <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>오늘 방문한 장소가 없습니다.</p>
                        </div>
                    )}

                    {/* 진료 기록 상세 */}
                    {dailyActivities.treatments && dailyActivities.treatments.length > 0 ? (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Building2 size={32} className="text-purple-600" />
                                <h3 className="font-black text-purple-900" style={{ fontSize: 'var(--font-size-xl)' }}>진료 기록</h3>
                            </div>
                            <div className="space-y-3">
                                {dailyActivities.treatments.map((treatment, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-purple-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                진료 {idx + 1}
                                            </span>
                                            {treatment.hospital && (
                                                <span className="text-purple-700 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                    {treatment.hospital}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-700 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                시작: {treatment.start}
                                            </p>
                                            {treatment.end ? (
                                                <p className="text-slate-700 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                    종료: {treatment.end}
                                                </p>
                                            ) : (
                                                <p className="text-purple-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                    (진행 중)
                                                </p>
                                            )}
                                            {treatment.content && (
                                                <p className="text-slate-600 font-bold mt-2" style={{ fontSize: 'var(--font-size-base)' }}>
                                                    진료 내용: {treatment.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Building2 size={32} className="text-purple-600" />
                                <h3 className="font-black text-purple-900" style={{ fontSize: 'var(--font-size-xl)' }}>진료 기록</h3>
                            </div>
                            <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>오늘 진료 기록이 없습니다.</p>
                        </div>
                    )}

                    {/* 식사 기록 상세 */}
                    {dailyActivities.meals && dailyActivities.meals.length > 0 ? (
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 border-2 border-orange-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Utensils size={32} className="text-orange-600" />
                                <h3 className="font-black text-orange-900" style={{ fontSize: 'var(--font-size-xl)' }}>식사 기록</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {dailyActivities.meals.map((meal, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-orange-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Utensils size={20} className="text-orange-600" />
                                            <span className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                {meal.place}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                            시간: {meal.time}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 border-2 border-orange-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Utensils size={32} className="text-orange-600" />
                                <h3 className="font-black text-orange-900" style={{ fontSize: 'var(--font-size-xl)' }}>식사 기록</h3>
                            </div>
                            <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>오늘 식사 기록이 없습니다.</p>
                        </div>
                    )}

                    {/* 장보기 기록 상세 */}
                    {dailyActivities.shopping && dailyActivities.shopping.length > 0 ? (
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-6 border-2 border-pink-200">
                            <div className="flex items-center gap-3 mb-4">
                                <ShoppingBag size={32} className="text-pink-600" />
                                <h3 className="font-black text-pink-900" style={{ fontSize: 'var(--font-size-xl)' }}>장보기 기록</h3>
                            </div>
                            <div className="space-y-3">
                                {dailyActivities.shopping.map((shopping, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-pink-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                장보기 {idx + 1}
                                            </span>
                                            <span className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                {shopping.time}
                                            </span>
                                        </div>
                                        {shopping.items && shopping.items.length > 0 ? (
                                            <div className="mt-2">
                                                <p className="text-slate-700 font-bold mb-2" style={{ fontSize: 'var(--font-size-base)' }}>
                                                    구매 항목:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {shopping.items.map((item, itemIdx) => (
                                                        <span key={itemIdx} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-xl font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                            {item.name || item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                구매 항목 정보 없음
                                            </p>
                                        )}
                                        {shopping.amount && (
                                            <p className="text-slate-700 font-bold mt-2" style={{ fontSize: 'var(--font-size-base)' }}>
                                                총 금액: {shopping.amount}원
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-6 border-2 border-pink-200">
                            <div className="flex items-center gap-3 mb-2">
                                <ShoppingBag size={32} className="text-pink-600" />
                                <h3 className="font-black text-pink-900" style={{ fontSize: 'var(--font-size-xl)' }}>장보기 기록</h3>
                            </div>
                            <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>오늘 장보기 기록이 없습니다.</p>
                        </div>
                    )}

                    {/* 안전 이벤트 로그 상세 */}
                    {dailyActivities.safetyEvents && dailyActivities.safetyEvents.length > 0 ? (
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-6 border-2 border-red-200">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle size={32} className="text-red-600" />
                                <h3 className="font-black text-red-900" style={{ fontSize: 'var(--font-size-xl)' }}>안전 이벤트</h3>
                            </div>
                            <div className="space-y-3">
                                {dailyActivities.safetyEvents.map((event, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-red-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-red-700" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                {event.type}
                                            </span>
                                            <span className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                {event.time}
                                            </span>
                                        </div>
                                        {event.duration && (
                                            <p className="text-slate-700 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                                                지속 시간: {event.duration}
                                            </p>
                                        )}
                                        {event.description && (
                                            <p className="text-slate-600 font-bold mt-2" style={{ fontSize: 'var(--font-size-base)' }}>
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-6 border-2 border-red-200">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle size={32} className="text-red-600" />
                                <h3 className="font-black text-red-900" style={{ fontSize: 'var(--font-size-xl)' }}>안전 이벤트</h3>
                            </div>
                            <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>오늘 안전 이벤트가 없습니다.</p>
                        </div>
                    )}

                    {/* 통계 요약 */}
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-6 border-2 border-indigo-200">
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart3 size={32} className="text-indigo-600" />
                            <h3 className="font-black text-indigo-900" style={{ fontSize: 'var(--font-size-xl)' }}>오늘의 통계</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl p-4 border-2 border-indigo-200 text-center">
                                <p className="text-slate-600 font-bold mb-1" style={{ fontSize: 'var(--font-size-base)' }}>방문 장소</p>
                                <p className="font-black text-indigo-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                    {dailyActivities.visits?.length || 0}곳
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border-2 border-indigo-200 text-center">
                                <p className="text-slate-600 font-bold mb-1" style={{ fontSize: 'var(--font-size-base)' }}>진료</p>
                                <p className="font-black text-indigo-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                    {dailyActivities.treatments?.length || 0}회
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border-2 border-indigo-200 text-center">
                                <p className="text-slate-600 font-bold mb-1" style={{ fontSize: 'var(--font-size-base)' }}>식사</p>
                                <p className="font-black text-indigo-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                    {dailyActivities.meals?.length || 0}회
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border-2 border-indigo-200 text-center">
                                <p className="text-slate-600 font-bold mb-1" style={{ fontSize: 'var(--font-size-base)' }}>장보기</p>
                                <p className="font-black text-indigo-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                    {dailyActivities.shopping?.length || 0}회
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailySummaryDetailModal;
