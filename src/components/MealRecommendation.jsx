import React, { useState, useEffect } from 'react';
import { Utensils, Phone, Navigation, Filter, Loader2 } from 'lucide-react';
import { t } from '../i18n';
import { searchNearbyPlaces, CATEGORY_CODES, formatDistance } from '../utils/kakaoLocalApi';
import { getVisitedPlaces, sortPlacesByVisitHistory } from '../utils/placeRecommendation';

/**
 * 식사 추천 컴포넌트
 * 주변 식당 추천 및 필터링 기능 (카카오 로컬 API 연동)
 * 과거 방문 장소 우선 표시 기능 포함
 */
const MealRecommendation = ({ language, onSelect, currentGPSLocation, dailyActivities, activitiesHistory }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [priceFilter, setPriceFilter] = useState('all');
    const [distanceFilter, setDistanceFilter] = useState('all');
    const [accessibleFilter, setAccessibleFilter] = useState(false);

    // GPS 위치 기반 주변 식당 검색
    useEffect(() => {
        const loadRestaurants = async () => {
            setLoading(true);
            setError(null);

            try {
                // GPS 위치가 있으면 실제 API 호출, 없으면 시뮬레이션 데이터 사용
                const lat = currentGPSLocation?.lat;
                const lng = currentGPSLocation?.lng;

                if (lat && lng) {
                    console.log('📍 주변 식당 검색 시작:', { lat, lng });
                    const places = await searchNearbyPlaces({
                        lat,
                        lng,
                        category: CATEGORY_CODES.RESTAURANT,
                        radius: 2000, // 2km 반경
                        size: 15
                    });
                    
                    // 과거 방문 장소 기반 정렬
                    const visitedPlaces = getVisitedPlaces(dailyActivities, activitiesHistory);
                    const sortedPlaces = sortPlacesByVisitHistory(places, visitedPlaces);
                    console.log('✅ 방문 이력 기반 정렬 완료:', { visitedCount: visitedPlaces.length, sortedCount: sortedPlaces.length });
                    
                    setRestaurants(sortedPlaces);
                } else {
                    // GPS 위치가 없으면 시뮬레이션 데이터 사용
                    console.log('⚠️ GPS 위치가 없어 시뮬레이션 데이터를 사용합니다.');
                    const places = await searchNearbyPlaces({
                        lat: 37.5665,
                        lng: 126.9780,
                        category: CATEGORY_CODES.RESTAURANT,
                        radius: 2000,
                        size: 15
                    });
                    
                    // 과거 방문 장소 기반 정렬
                    const visitedPlaces = getVisitedPlaces(dailyActivities, activitiesHistory);
                    const sortedPlaces = sortPlacesByVisitHistory(places, visitedPlaces);
                    
                    setRestaurants(sortedPlaces);
                }
            } catch (err) {
                console.error('❌ 식당 검색 실패:', err);
                setError('식당 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadRestaurants();
    }, [currentGPSLocation]);

    const filteredRestaurants = restaurants.filter(r => {
        if (priceFilter !== 'all' && r.price !== priceFilter) return false;
        if (accessibleFilter && !r.accessible) return false;
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-pastel-orange/30 rounded-3xl p-6 border-2 border-pastel-orange/50">
                <div className="flex items-center gap-3 mb-5">
                    <Utensils size={32} className="text-orange-600" />
                    <h3 className="font-black text-orange-900 text-2xl">{t('mealRecommendation', language)}</h3>
                    {currentGPSLocation && (
                        <span className="text-sm text-orange-700 font-bold">(현재 위치 기준)</span>
                    )}
                </div>

                {/* 로딩 상태 */}
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={32} className="text-orange-600 animate-spin" />
                        <span className="ml-3 text-orange-700 font-bold">주변 식당을 검색하고 있습니다...</span>
                    </div>
                )}

                {/* 에러 상태 */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-5">
                        <p className="text-red-700 font-bold">{error}</p>
                    </div>
                )}

                {/* 필터 */}
                <div className="mb-5 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Filter size={24} className="text-slate-600" />
                        <button
                            onClick={() => setPriceFilter('all')}
                            className={`px-5 py-3 rounded-xl text-base font-black min-h-[50px] ${priceFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border-2 border-slate-300'}`}
                        >
                            전체
                        </button>
                        <button
                            onClick={() => setPriceFilter('저렴')}
                            className={`px-5 py-3 rounded-xl text-base font-black min-h-[50px] ${priceFilter === '저렴' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border-2 border-slate-300'}`}
                        >
                            저렴
                        </button>
                        <button
                            onClick={() => setPriceFilter('보통')}
                            className={`px-5 py-3 rounded-xl text-base font-black min-h-[50px] ${priceFilter === '보통' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border-2 border-slate-300'}`}
                        >
                            보통
                        </button>
                        <button
                            onClick={() => setAccessibleFilter(!accessibleFilter)}
                            className={`px-5 py-3 rounded-xl text-base font-black min-h-[50px] ${accessibleFilter ? 'bg-green-500 text-white' : 'bg-white text-slate-600 border-2 border-slate-300'}`}
                        >
                            접근성 우선
                        </button>
                    </div>
                </div>

                {/* 식당 리스트 */}
                {!loading && !error && (
                    <div className="space-y-4">
                        {filteredRestaurants.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-600 font-bold">검색 결과가 없습니다.</p>
                            </div>
                        ) : (
                            filteredRestaurants.map(restaurant => (
                                <div key={restaurant.id} className="p-5 bg-white rounded-2xl border-2 border-orange-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-black text-slate-900 text-xl">{restaurant.name}</h4>
                                                {restaurant._isVisited && (
                                                    <span className="px-3 py-1 bg-pastel-orange/20 text-pastel-orange rounded-full text-xs font-black border border-pastel-orange/30">
                                                        방문 이력 {restaurant._visitCount}회
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-base text-slate-600 flex-wrap">
                                                <span className="font-bold">📍 {restaurant.distanceFormatted || formatDistance(restaurant.distance || 0)}</span>
                                                {restaurant.price && <span className="font-bold">💰 {restaurant.price}</span>}
                                                {restaurant.accessible && <span className="text-green-600 font-black text-lg">♿ 접근 가능</span>}
                                            </div>
                                            {restaurant.address && (
                                                <p className="text-sm text-slate-500 mt-1">{restaurant.address}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        {restaurant.phone && (
                                            <button
                                                onClick={() => window.open(`tel:${restaurant.phone}`)}
                                                className="flex-1 px-6 py-5 bg-pastel-blue text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-400 transition-colors min-h-[70px]"
                                            >
                                                <Phone size={24} />
                                                {t('callRestaurant', language)}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onSelect && onSelect(restaurant)}
                                            className={`${restaurant.phone ? 'flex-1' : 'w-full'} px-6 py-5 bg-pastel-purple text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-purple-400 transition-colors min-h-[70px]`}
                                        >
                                            <Navigation size={24} />
                                            {t('findRoute', language)}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealRecommendation;

