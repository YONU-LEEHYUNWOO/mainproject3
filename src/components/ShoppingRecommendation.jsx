import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, Check, MapPin, Loader2 } from 'lucide-react';
import { t } from '../i18n';
import { searchNearbyPlaces, CATEGORY_CODES, formatDistance } from '../utils/kakaoLocalApi';
import { getVisitedPlaces, sortPlacesByVisitHistory } from '../utils/placeRecommendation';

/**
 * 장보기 추천 컴포넌트
 * 과거 구매 패턴 기반 추천 및 장바구니 관리
 * 주변 마트 검색 기능 포함
 * 과거 방문 장소 우선 표시 기능 포함
 */
const ShoppingRecommendation = ({ language, onComplete, onCartChange, currentGPSLocation, dailyActivities, activitiesHistory }) => {
    const [nearbyMarts, setNearbyMarts] = useState([]);
    const [loadingMarts, setLoadingMarts] = useState(false);
    // 시뮬레이션 과거 구매 패턴
    const recommendedItems = [
        { id: 1, name: '우유', category: '유제품', frequent: true },
        { id: 2, name: '계란', category: '식품', frequent: true },
        { id: 3, name: '사과', category: '과일', frequent: true },
        { id: 4, name: '쌀', category: '식품', frequent: false },
        { id: 5, name: '두부', category: '식품', frequent: true },
    ];

    const [cart, setCart] = useState([]);
    const [showMarts, setShowMarts] = useState(false);

    // 주변 마트 검색
    useEffect(() => {
        if (showMarts) {
            const loadMarts = async () => {
                setLoadingMarts(true);
                try {
                    const lat = currentGPSLocation?.lat;
                    const lng = currentGPSLocation?.lng;

                    if (lat && lng) {
                        console.log('📍 주변 마트 검색 시작:', { lat, lng });
                        const places = await searchNearbyPlaces({
                            lat,
                            lng,
                            category: CATEGORY_CODES.MART,
                            radius: 3000, // 3km 반경
                            size: 10
                        });
                        
                        // 과거 방문 장소 기반 정렬
                        const visitedPlaces = getVisitedPlaces(dailyActivities, activitiesHistory);
                        const sortedPlaces = sortPlacesByVisitHistory(places, visitedPlaces);
                        console.log('✅ 마트 방문 이력 기반 정렬 완료:', { visitedCount: visitedPlaces.length, sortedCount: sortedPlaces.length });
                        
                        setNearbyMarts(sortedPlaces);
                    } else {
                        const places = await searchNearbyPlaces({
                            lat: 37.5665,
                            lng: 126.9780,
                            category: CATEGORY_CODES.MART,
                            radius: 3000,
                            size: 10
                        });
                        
                        // 과거 방문 장소 기반 정렬
                        const visitedPlaces = getVisitedPlaces(dailyActivities, activitiesHistory);
                        const sortedPlaces = sortPlacesByVisitHistory(places, visitedPlaces);
                        
                        setNearbyMarts(sortedPlaces);
                    }
                } catch (err) {
                    console.error('❌ 마트 검색 실패:', err);
                } finally {
                    setLoadingMarts(false);
                }
            };

            loadMarts();
        }
    }, [showMarts, currentGPSLocation]);

    const addToCart = (item) => {
        if (!cart.find(i => i.id === item.id)) {
            const newCart = [...cart, item];
            setCart(newCart);
            // 장바구니 변경 시 부모 컴포넌트에 알림
            if (onCartChange) {
                onCartChange(newCart);
            }
        }
    };

    const removeFromCart = (itemId) => {
        const newCart = cart.filter(i => i.id !== itemId);
        setCart(newCart);
        // 장바구니 변경 시 부모 컴포넌트에 알림
        if (onCartChange) {
            onCartChange(newCart);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-pastel-pink/30 rounded-3xl p-6 border-2 border-pastel-pink/50">
                <div className="flex items-center gap-3 mb-5">
                    <ShoppingCart size={32} className="text-pink-600" />
                    <h3 className="font-black text-pink-900 text-2xl">{t('shoppingRecommendation', language)}</h3>
                </div>
                <p className="text-lg text-pink-700 mb-5 font-bold">과거 구매 패턴을 기반으로 추천드립니다.</p>

                {/* 추천 항목 */}
                <div className="space-y-3 mb-5">
                    {recommendedItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-pink-200">
                            <div className="flex items-center gap-3">
                                {item.frequent && <span className="text-sm font-black text-pink-600 bg-pink-100 px-3 py-2 rounded-xl">자주 구매</span>}
                                <span className="font-black text-slate-900 text-lg">{item.name}</span>
                                <span className="text-base text-slate-500">({item.category})</span>
                            </div>
                            <button
                                onClick={() => addToCart(item)}
                                className="p-3 bg-pastel-pink text-white rounded-xl hover:bg-pink-400 transition-colors min-w-[50px] min-h-[50px]"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 장바구니 */}
            {cart.length > 0 && (
                <div className="bg-pastel-blue/30 rounded-3xl p-6 border-2 border-pastel-blue/50">
                    <h4 className="font-black text-blue-900 text-xl mb-4 flex items-center gap-3">
                        <Check size={28} />
                        {t('shoppingList', language)} ({cart.length}개)
                    </h4>
                    <div className="space-y-3 mb-5">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl">
                                <span className="font-black text-slate-900 text-lg">{item.name}</span>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors min-w-[50px] min-h-[50px]"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 flex gap-4">
                        <button
                            onClick={onComplete}
                            className="flex-1 px-8 py-6 bg-gradient-to-r from-pastel-purple to-pastel-pink text-white rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[80px]"
                        >
                            장보기 완료
                        </button>
                        <button className="flex-1 px-8 py-6 bg-gradient-to-r from-pastel-blue to-pastel-purple text-white rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[80px]">
                            {t('onlineShopping', language)}
                        </button>
                    </div>
                </div>
            )}

            {/* 주변 마트 검색 섹션 */}
            <div className="bg-pastel-green/30 rounded-3xl p-6 border-2 border-pastel-green/50">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <MapPin size={32} className="text-green-600" />
                        <h3 className="font-black text-green-900 text-2xl">주변 마트</h3>
                        {currentGPSLocation && (
                            <span className="text-sm text-green-700 font-bold">(현재 위치 기준)</span>
                        )}
                    </div>
                    <button
                        onClick={() => setShowMarts(!showMarts)}
                        className="px-5 py-3 rounded-xl bg-green-500 text-white font-black hover:bg-green-600 transition-colors min-h-[50px]"
                    >
                        {showMarts ? '접기' : '주변 마트 보기'}
                    </button>
                </div>

                {showMarts && (
                    <div className="space-y-4">
                        {loadingMarts ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={32} className="text-green-600 animate-spin" />
                                <span className="ml-3 text-green-700 font-bold">주변 마트를 검색하고 있습니다...</span>
                            </div>
                        ) : nearbyMarts.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-600 font-bold">검색 결과가 없습니다.</p>
                            </div>
                        ) : (
                            nearbyMarts.map(mart => (
                                <div key={mart.id} className="p-5 bg-white rounded-2xl border-2 border-green-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-black text-slate-900 text-xl">{mart.name}</h4>
                                                {mart._isVisited && (
                                                    <span className="px-3 py-1 bg-pastel-green/20 text-pastel-green rounded-full text-xs font-black border border-pastel-green/30">
                                                        방문 이력 {mart._visitCount}회
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-base text-slate-600">
                                                <span className="font-bold">📍 {mart.distanceFormatted || formatDistance(mart.distance || 0)}</span>
                                            </div>
                                            {mart.address && (
                                                <p className="text-sm text-slate-500 mt-1">{mart.address}</p>
                                            )}
                                            {mart.phone && (
                                                <p className="text-sm text-slate-500 mt-1">📞 {mart.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        {mart.phone && (
                                            <button
                                                onClick={() => window.open(`tel:${mart.phone}`)}
                                                className="flex-1 px-6 py-5 bg-pastel-blue text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-400 transition-colors min-h-[70px]"
                                            >
                                                전화하기
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                // 길찾기 기능은 GeneralLocationGuidance로 연결
                                                // 부모 컴포넌트에서 처리하도록 이벤트 전달
                                                console.log('📍 마트 길찾기:', mart);
                                            }}
                                            className={`${mart.phone ? 'flex-1' : 'w-full'} px-6 py-5 bg-pastel-green text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-green-400 transition-colors min-h-[70px]`}
                                        >
                                            길찾기
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

export default ShoppingRecommendation;

