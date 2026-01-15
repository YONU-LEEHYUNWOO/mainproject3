import React, { useState, useRef, useEffect } from 'react';
import { Navigation2, MapPin, Volume2, VolumeX, ExternalLink, Smartphone } from 'lucide-react';

/**
 * 경로 단계별 안내 카드 컴포넌트
 * guides 배열을 기반으로 단계별 이동 안내를 텍스트로 표시
 * 외부 지도 앱 딥링크 및 음성 안내 기능 포함
 */
const RouteGuidanceCard = ({ 
    guides = [], 
    origin, 
    destination, 
    duration, 
    distance,
    currentGPSLocation,
    destinationCoords 
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const synthRef = useRef(null);

    // Web Speech API 초기화
    useEffect(() => {
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }
        return () => {
            // 컴포넌트 언마운트 시 음성 중지
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    /**
     * 음성 안내 재생
     */
    const playVoiceGuidance = () => {
        if (!synthRef.current || guides.length === 0) return;

        // 기존 음성 중지
        synthRef.current.cancel();
        setIsPlaying(true);
        setCurrentStep(0);

        // 각 단계별로 음성 재생
        const speakStep = (index) => {
            if (index >= guides.length) {
                setIsPlaying(false);
                return;
            }

            const guide = guides[index];
            const utterance = new SpeechSynthesisUtterance(
                `${index + 1}단계. ${guide.name ? guide.name + '에서 ' : ''}${guide.guidance}`
            );
            utterance.lang = 'ko-KR';
            utterance.rate = 0.9; // 읽기 속도
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterance.onend = () => {
                setCurrentStep(index + 1);
                // 다음 단계로 이동 (약간의 딜레이)
                setTimeout(() => speakStep(index + 1), 500);
            };

            utterance.onerror = () => {
                setIsPlaying(false);
            };

            synthRef.current.speak(utterance);
        };

        speakStep(0);
    };

    /**
     * 음성 안내 중지
     */
    const stopVoiceGuidance = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsPlaying(false);
            setCurrentStep(0);
        }
    };

    /**
     * 카카오맵 앱 딥링크 생성
     * API 키 없이도 딥링크는 작동합니다 (단순 URL 스킴)
     */
    const getKakaoMapDeepLink = () => {
        if (!currentGPSLocation || !destinationCoords) {
            console.warn('⚠️ 카카오맵 딥링크 생성 실패: 위치 정보 없음', { currentGPSLocation, destinationCoords });
            return null;
        }
        
        // 좌표 추출 (다양한 형식 지원)
        // 카카오맵 API는 x(경도), y(위도) 형식을 사용
        const originLat = currentGPSLocation.lat;
        const originLng = currentGPSLocation.lng;
        
        // destinationCoords 구조 확인 및 좌표 추출
        // 카카오맵 API: {x: 경도, y: 위도}
        // 일반 형식: {lat: 위도, lng: 경도} 또는 {x: 경도, y: 위도}
        let destLat, destLng;
        if (destinationCoords.y !== undefined && destinationCoords.x !== undefined) {
            // 카카오맵 API 형식: {x: 경도, y: 위도}
            destLat = destinationCoords.y; // 위도
            destLng = destinationCoords.x; // 경도
        } else if (destinationCoords.lat !== undefined && destinationCoords.lng !== undefined) {
            // 일반 형식: {lat: 위도, lng: 경도}
            destLat = destinationCoords.lat;
            destLng = destinationCoords.lng;
        } else {
            console.warn('⚠️ 카카오맵 딥링크 생성 실패: 좌표 형식을 알 수 없음', destinationCoords);
            return null;
        }

        if (!originLat || !originLng || !destLat || !destLng) {
            console.warn('⚠️ 카카오맵 딥링크 생성 실패: 좌표 정보 불완전', { 
                originLat, 
                originLng, 
                destLat, 
                destLng,
                destinationCoords 
            });
            return null;
        }

        // 카카오맵 앱 딥링크 형식: sp=위도,경도&ep=위도,경도&by=CAR
        const deepLink = `kakaomap://route?sp=${originLat},${originLng}&ep=${destLat},${destLng}&by=CAR`;
        console.log('📍 카카오맵 딥링크:', deepLink, { originLat, originLng, destLat, destLng, destinationCoords });
        return deepLink;
    };

    /**
     * 네이버지도 앱 딥링크 생성
     * API 키 없이도 딥링크는 작동합니다 (단순 URL 스킴)
     */
    const getNaverMapDeepLink = () => {
        if (!currentGPSLocation || !destinationCoords) {
            console.warn('⚠️ 네이버지도 딥링크 생성 실패: 위치 정보 없음', { currentGPSLocation, destinationCoords });
            return null;
        }
        
        // 좌표 추출 (다양한 형식 지원)
        // 네이버지도는 lat(위도), lng(경도) 형식 사용
        const originLat = currentGPSLocation.lat;
        const originLng = currentGPSLocation.lng;
        
        // destinationCoords 구조 확인 및 좌표 추출
        // 카카오맵 API: {x: 경도, y: 위도}
        // 일반 형식: {lat: 위도, lng: 경도} 또는 {x: 경도, y: 위도}
        let destLat, destLng;
        if (destinationCoords.y !== undefined && destinationCoords.x !== undefined) {
            // 카카오맵 API 형식: {x: 경도, y: 위도}
            destLat = destinationCoords.y; // 위도
            destLng = destinationCoords.x; // 경도
        } else if (destinationCoords.lat !== undefined && destinationCoords.lng !== undefined) {
            // 일반 형식: {lat: 위도, lng: 경도}
            destLat = destinationCoords.lat;
            destLng = destinationCoords.lng;
        } else {
            console.warn('⚠️ 네이버지도 딥링크 생성 실패: 좌표 형식을 알 수 없음', destinationCoords);
            return null;
        }

        if (!originLat || !originLng || !destLat || !destLng) {
            console.warn('⚠️ 네이버지도 딥링크 생성 실패: 좌표 정보 불완전', { 
                originLat, 
                originLng, 
                destLat, 
                destLng,
                destinationCoords 
            });
            return null;
        }

        // 네이버지도 앱 딥링크 형식: slat=위도&slng=경도&dlat=위도&dlng=경도
        // 출발지/도착지 이름을 URL 인코딩하여 전달
        const originName = encodeURIComponent('현재위치');
        const destName = encodeURIComponent(destination || '목적지');
        const deepLink = `nmap://route/car?slat=${originLat}&slng=${originLng}&sname=${originName}&dlat=${destLat}&dlng=${destLng}&dname=${destName}`;
        console.log('📍 네이버지도 딥링크:', deepLink, { originLat, originLng, destLat, destLng, destinationCoords });
        return deepLink;
    };

    /**
     * 모바일 환경인지 확인
     */
    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    /**
     * 외부 지도 앱 열기
     */
    const openExternalMap = (type) => {
        let deepLink = null;
        let webUrl = null;

        if (type === 'kakao') {
            deepLink = getKakaoMapDeepLink();
            // 웹 폴백: 카카오맵 웹 버전
            if (currentGPSLocation && destinationCoords) {
                const originLat = currentGPSLocation.lat;
                const originLng = currentGPSLocation.lng;
                // 좌표 추출 (카카오맵 API 형식: {x: 경도, y: 위도})
                let destLat, destLng;
                if (destinationCoords.y !== undefined && destinationCoords.x !== undefined) {
                    destLat = destinationCoords.y; // 위도
                    destLng = destinationCoords.x; // 경도
                } else if (destinationCoords.lat !== undefined && destinationCoords.lng !== undefined) {
                    destLat = destinationCoords.lat;
                    destLng = destinationCoords.lng;
                }
                if (originLat && originLng && destLat && destLng) {
                    webUrl = `https://map.kakao.com/link/route/${originLat},${originLng}/${destLat},${destLng}`;
                }
            }
        } else if (type === 'naver') {
            deepLink = getNaverMapDeepLink();
            // 웹 폴백: 네이버지도 웹 버전
            if (currentGPSLocation && destinationCoords) {
                const originLat = currentGPSLocation.lat;
                const originLng = currentGPSLocation.lng;
                // 좌표 추출 (카카오맵 API 형식: {x: 경도, y: 위도})
                let destLat, destLng;
                if (destinationCoords.y !== undefined && destinationCoords.x !== undefined) {
                    destLat = destinationCoords.y; // 위도
                    destLng = destinationCoords.x; // 경도
                } else if (destinationCoords.lat !== undefined && destinationCoords.lng !== undefined) {
                    destLat = destinationCoords.lat;
                    destLng = destinationCoords.lng;
                }
                if (originLat && originLng && destLat && destLng) {
                    const destName = encodeURIComponent(destination || '목적지');
                    webUrl = `https://map.naver.com/v5/directions/${originLat},${originLng},,출발지/${destLat},${destLng},,${destName}`;
                }
            }
        }

        // 모바일 환경이면 딥링크 시도, 데스크톱이면 웹 링크 직접 열기
        if (isMobile() && deepLink) {
            // 모바일: iframe을 사용하여 딥링크 시도 (더 안정적)
            try {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = deepLink;
                document.body.appendChild(iframe);
                
                // 일정 시간 후 iframe 제거
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 1000);
                
                // 앱이 설치되지 않은 경우를 대비해 웹 링크도 제공 (약간의 딜레이 후)
                // 하지만 사용자가 원하지 않을 수 있으므로 주석 처리
                // if (webUrl) {
                //     setTimeout(() => {
                //         window.open(webUrl, '_blank');
                //     }, 1500);
                // }
            } catch (error) {
                console.error('딥링크 열기 오류:', error);
                // 오류 발생 시 웹 링크로 폴백
                if (webUrl) {
                    window.open(webUrl, '_blank');
                }
            }
        } else if (webUrl) {
            // 데스크톱: 웹 링크 직접 열기 (앱이 없을 수 있으므로)
            window.open(webUrl, '_blank');
        } else if (deepLink) {
            // 웹 링크가 없으면 딥링크라도 시도 (모바일이 아닌 경우)
            console.warn('⚠️ 웹 링크를 생성할 수 없어 딥링크만 사용:', deepLink);
            window.location.href = deepLink;
        }
    };

    // guides가 없거나 비어있으면 null 반환
    if (!guides || guides.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* 기본 경로 정보 */}
            <div className="bg-white/90 rounded-xl p-4 border-2 border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <MapPin size={20} className="text-blue-600" />
                        <span className="text-slate-700 font-black text-base">경로 정보</span>
                    </div>
                    {duration && (
                        <span className="text-blue-600 font-black text-sm">{duration}</span>
                    )}
                </div>
                {distance && (
                    <p className="text-slate-600 font-bold text-sm">총 거리: {distance}</p>
                )}
            </div>

            {/* 단계별 경로 안내 카드 */}
            <div className="bg-white/90 rounded-xl p-4 border-2 border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Navigation2 size={20} className="text-green-600" />
                        <span className="text-slate-700 font-black text-base">단계별 안내</span>
                    </div>
                    {/* 음성 안내 버튼 */}
                    {'speechSynthesis' in window && (
                        <button
                            onClick={isPlaying ? stopVoiceGuidance : playVoiceGuidance}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                            title={isPlaying ? '음성 안내 중지' : '음성 안내 재생'}
                        >
                            {isPlaying ? (
                                <>
                                    <VolumeX size={16} className="text-blue-600" />
                                    <span className="text-blue-600 font-bold text-xs">중지</span>
                                </>
                            ) : (
                                <>
                                    <Volume2 size={16} className="text-blue-600" />
                                    <span className="text-blue-600 font-bold text-xs">음성</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {guides.map((guide, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                                isPlaying && currentStep === index + 1
                                    ? 'bg-blue-50 border-blue-400 shadow-md'
                                    : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            {/* 단계 번호 */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                                isPlaying && currentStep === index + 1
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-300 text-slate-700'
                            }`}>
                                {index + 1}
                            </div>

                            {/* 안내 내용 */}
                            <div className="flex-1 min-w-0">
                                {guide.name && (
                                    <p className="text-slate-700 font-black text-sm mb-1">
                                        {guide.name}
                                    </p>
                                )}
                                <p className="text-slate-600 font-bold text-sm leading-relaxed">
                                    {guide.guidance}
                                </p>
                                {guide.distance > 0 && (
                                    <p className="text-slate-400 font-bold text-xs mt-1">
                                        약 {Math.round(guide.distance)}m 후
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 외부 지도 앱 열기 버튼 */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => openExternalMap('kakao')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-100 hover:bg-yellow-200 rounded-xl border-2 border-yellow-300 transition-all"
                >
                    <Smartphone size={20} className="text-yellow-700" />
                    <span className="text-yellow-700 font-black text-sm">카카오맵</span>
                    <ExternalLink size={16} className="text-yellow-700" />
                </button>
                <button
                    onClick={() => openExternalMap('naver')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 hover:bg-green-200 rounded-xl border-2 border-green-300 transition-all"
                >
                    <Smartphone size={20} className="text-green-700" />
                    <span className="text-green-700 font-black text-sm">네이버지도</span>
                    <ExternalLink size={16} className="text-green-700" />
                </button>
            </div>
        </div>
    );
};

export default RouteGuidanceCard;
