import React, { useEffect, useRef } from 'react';
import { loadLeaflet, isLeafletLoaded } from '../utils/mapLoader';

/**
 * OpenStreetMap 기반 지도 컴포넌트
 * Leaflet을 사용하여 지도를 렌더링하고, 현재 위치 및 목적지 마커를 표시합니다.
 * 경로 데이터가 있으면 Polyline으로 경로를 시각화합니다.
 * 
 * @param {Object} props
 * @param {Object} props.currentLocation - 현재 위치 {lat: 위도, lng: 경도}
 * @param {Object} props.destination - 목적지 좌표 {x: 경도, y: 위도} 또는 {lat: 위도, lng: 경도}
 * @param {Array} props.routePath - 경로 좌표 배열 [{lng: 경도, lat: 위도}, ...]
 * @param {Object} props.bounds - 경계 정보 {min_x, min_y, max_x, max_y} (선택사항)
 * @param {string} props.destinationName - 목적지 이름 (선택사항)
 */
const OpenStreetMapView = ({ 
    currentLocation, 
    destination, 
    routePath = [], 
    bounds = null,
    destinationName = '목적지'
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const polylineRef = useRef(null);
    const lastLocationRef = useRef(null); // 마지막 위치 저장 (재초기화 방지)
    const isInitializedRef = useRef(false); // 지도 초기화 여부

    /**
     * 목적지 좌표를 표준 형식으로 변환
     * 카카오맵 API 형식: {x: 경도, y: 위도}
     * 일반 형식: {lat: 위도, lng: 경도}
     */
    const getDestinationCoords = () => {
        if (!destination) return null;
        
        if (destination.y !== undefined && destination.x !== undefined) {
            // 카카오맵 API 형식: {x: 경도, y: 위도}
            return { lat: destination.y, lng: destination.x };
        } else if (destination.lat !== undefined && destination.lng !== undefined) {
            // 일반 형식: {lat: 위도, lng: 경도}
            return { lat: destination.lat, lng: destination.lng };
        }
        return null;
    };

    /**
     * 마커만 업데이트하는 함수 (지도 재초기화 없이)
     */
    const updateMarkers = () => {
        if (!mapInstanceRef.current || !L) return;

        const destCoords = getDestinationCoords();

        // 기존 마커 제거
        markersRef.current.forEach(marker => {
            if (marker) marker.remove();
        });
        markersRef.current = [];

        // 현재 위치 마커 추가
        if (currentLocation && currentLocation.lat && currentLocation.lng) {
            const redIcon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            const currentMarker = L.marker([currentLocation.lat, currentLocation.lng], {
                icon: redIcon
            }).addTo(mapInstanceRef.current);
            currentMarker.bindPopup('현재 위치');
            markersRef.current.push(currentMarker);
        }

        // 목적지 마커 추가
        if (destCoords) {
            const blueIcon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            const destMarker = L.marker([destCoords.lat, destCoords.lng], {
                icon: blueIcon
            }).addTo(mapInstanceRef.current);
            destMarker.bindPopup(destinationName || '목적지');
            markersRef.current.push(destMarker);
        }
    };

    /**
     * 실제 지도 초기화 함수
     */
    const initializeMap = () => {
        if (!mapRef.current || !L) return;

        // 기존 지도 인스턴스가 있으면 제거
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        // 마커 정리
        markersRef.current.forEach(marker => {
            if (marker) marker.remove();
        });
        markersRef.current = [];

        // Polyline 정리
        if (polylineRef.current) {
            polylineRef.current.remove();
            polylineRef.current = null;
        }

        // 중심 좌표 계산
        let centerLat = 37.5665; // 기본값: 서울
        let centerLng = 126.9780;
        let zoom = 13;

        if (currentLocation && currentLocation.lat && currentLocation.lng) {
            centerLat = currentLocation.lat;
            centerLng = currentLocation.lng;
        } else {
            const destCoords = getDestinationCoords();
            if (destCoords) {
                centerLat = destCoords.lat;
                centerLng = destCoords.lng;
            }
        }

        // 두 위치가 모두 있으면 중간점 계산
        const destCoords = getDestinationCoords();
        if (currentLocation && currentLocation.lat && currentLocation.lng && destCoords) {
            centerLat = (currentLocation.lat + destCoords.lat) / 2;
            centerLng = (currentLocation.lng + destCoords.lng) / 2;
            zoom = 12; // 두 위치를 모두 보이도록 줌 레벨 조정
        }

        // 지도 생성
        try {
            // 컨테이너 크기 확인 (0이면 지도 생성 안 함)
            if (!mapRef.current || mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
                console.warn('⚠️ 지도 컨테이너 크기가 0입니다. 지도를 생성할 수 없습니다.');
                return;
            }

            const map = L.map(mapRef.current, {
                center: [centerLat, centerLng],
                zoom: zoom,
                zoomControl: true,
                attributionControl: true,
                scrollWheelZoom: true
            });

            // 지도 컨테이너의 z-index 설정 (부모의 z-index 확인하여 높게 설정)
            if (mapRef.current) {
                // 부모 요소의 z-index 확인
                let parentElement = mapRef.current.parentElement;
                let parentZIndex = null;
                let maxDepth = 5; // 최대 5단계까지 확인
                let depth = 0;
                
                while (parentElement && depth < maxDepth) {
                    const computedStyle = window.getComputedStyle(parentElement);
                    const zIndex = computedStyle.zIndex;
                    if (zIndex && zIndex !== 'auto') {
                        const zIndexValue = parseInt(zIndex);
                        if (zIndexValue > 50) {
                            parentZIndex = zIndexValue;
                            break;
                        }
                    }
                    parentElement = parentElement.parentElement;
                    depth++;
                }
                
                // 지도는 항상 낮은 z-index 사용 (모달 뒤로 가도록)
                // 자식앱에서 사용한 방법과 동일: zIndex: 1
                const leafletContainer = mapRef.current.querySelector('.leaflet-container');
                if (leafletContainer) {
                    leafletContainer.style.zIndex = '1';
                }
                
                // Leaflet의 모든 패널도 낮은 z-index 사용
                const leafletPanels = mapRef.current.querySelectorAll('.leaflet-control-container, .leaflet-top, .leaflet-bottom, .leaflet-pane');
                leafletPanels.forEach(panel => {
                    if (panel) {
                        panel.style.zIndex = '2';
                    }
                });
                
                // Leaflet의 모든 타일 레이어도 낮은 z-index 사용
                const leafletTiles = mapRef.current.querySelectorAll('.leaflet-tile-pane, .leaflet-overlay-pane, .leaflet-shadow-pane, .leaflet-marker-pane, .leaflet-tooltip-pane, .leaflet-popup-pane');
                leafletTiles.forEach(pane => {
                    if (pane) {
                        pane.style.zIndex = '1';
                    }
                });
            }

            // OpenStreetMap 타일 레이어 추가
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            mapInstanceRef.current = map;

            // 지도가 완전히 준비된 후 z-index 재설정 및 마커 추가
            map.whenReady(() => {
                // 지도 준비 후 z-index 재설정 (동적으로 생성된 요소들에 적용)
                // 여러 번 시도하여 지도가 완전히 로드될 때까지 z-index 유지
                // z-index 재설정 함수
                // 자식앱에서 사용한 방법과 동일: 항상 낮은 z-index 사용 (모달 뒤로 가도록)
                const applyZIndex = () => {
                    if (!mapRef.current) return;
                    
                    // 지도는 항상 낮은 z-index 사용 (모달 뒤로 가도록)
                    // 자식앱에서 사용한 방법과 동일: zIndex: 1
                    const allLeafletElements = mapRef.current.querySelectorAll('.leaflet-container, .leaflet-pane, .leaflet-control-container, .leaflet-top, .leaflet-bottom, .leaflet-tile-pane, .leaflet-overlay-pane, .leaflet-shadow-pane, .leaflet-marker-pane, .leaflet-tooltip-pane, .leaflet-popup-pane, .leaflet-tile, .leaflet-tile-container');
                    allLeafletElements.forEach(element => {
                        if (element) {
                            element.style.zIndex = '1';
                            if (element.style.position === '' || element.style.position === 'static') {
                                element.style.position = 'relative';
                            }
                        }
                    });
                };
                
                // 지도 준비 직후, 그리고 타일 로드 후에도 z-index 재설정
                setTimeout(applyZIndex, 100);
                setTimeout(applyZIndex, 500);
                setTimeout(applyZIndex, 1000);
                
                // 지도 타일 로드 이벤트 리스너 추가
                map.on('tileload', () => {
                    setTimeout(applyZIndex, 50);
                });
                // 지도 크기 재계산 (컨테이너 크기 변경 대응)
                setTimeout(() => {
                    if (mapInstanceRef.current) {
                        try {
                            mapInstanceRef.current.invalidateSize();
                        } catch (error) {
                            // 무시
                        }
                    }
                }, 100);
                // bounds가 있으면 지도 범위 조정
                if (bounds && bounds.min_x && bounds.min_y && bounds.max_x && bounds.max_y) {
                    const boundsObj = L.latLngBounds(
                        [bounds.min_y, bounds.min_x], // 남서쪽
                        [bounds.max_y, bounds.max_x]  // 북동쪽
                    );
                    map.fitBounds(boundsObj, { padding: [50, 50] });
                } else if (currentLocation && destCoords) {
                    // bounds가 없으면 두 위치를 포함하도록 범위 조정
                    const boundsObj = L.latLngBounds(
                        [[currentLocation.lat, currentLocation.lng], [destCoords.lat, destCoords.lng]]
                    );
                    map.fitBounds(boundsObj, { padding: [50, 50] });
                }

                // 현재 위치 마커 추가
                if (currentLocation && currentLocation.lat && currentLocation.lng) {
                    // 빨간색 원형 마커 (커스텀 아이콘)
                    const redIcon = L.divIcon({
                        className: 'custom-marker',
                        html: '<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });
                    const currentMarker = L.marker([currentLocation.lat, currentLocation.lng], {
                        icon: redIcon
                    }).addTo(map);
                    currentMarker.bindPopup('현재 위치');
                    markersRef.current.push(currentMarker);
                }

                // 목적지 마커 추가
                if (destCoords) {
                    // 파란색 원형 마커 (커스텀 아이콘)
                    const blueIcon = L.divIcon({
                        className: 'custom-marker',
                        html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });
                    const destMarker = L.marker([destCoords.lat, destCoords.lng], {
                        icon: blueIcon
                    }).addTo(map);
                    destMarker.bindPopup(destinationName || '목적지');
                    markersRef.current.push(destMarker);
                }

                // 경로 시각화 (routePath가 있는 경우)
                if (routePath && routePath.length > 0) {
                    try {
                        // routePath 형식: [{lng: 경도, lat: 위도}, ...]
                        const pathCoordinates = routePath.map(point => [point.lat, point.lng]);
                        
                        // Polyline 생성 (초록색)
                        const polyline = L.polyline(pathCoordinates, {
                            color: '#10B981',
                            weight: 5,
                            opacity: 0.7
                        }).addTo(map);
                        
                        polylineRef.current = polyline;
                        
                        // 경로를 포함하도록 지도 범위 조정
                        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
                    } catch (error) {
                        console.warn('⚠️ 경로 시각화 실패:', error);
                    }
                }
            });

        } catch (error) {
            console.error('❌ 지도 초기화 오류:', error);
        }
    };

    /**
     * 지도 초기화 (Leaflet 로드 후) - 한 번만 실행
     */
    useEffect(() => {
        if (!mapRef.current || isInitializedRef.current) return;

        // Leaflet 동적 로드 및 지도 초기화
        let isMounted = true;
        
        loadLeaflet().then((leaflet) => {
            if (!isMounted || !mapRef.current || isInitializedRef.current) return;
            
            L = leaflet;
            initializeMap();
            isInitializedRef.current = true;
        }).catch((error) => {
            console.error('❌ Leaflet 로드 실패:', error);
            if (mapRef.current && isMounted) {
                mapRef.current.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; padding: 20px; text-align: center;">
                        <p style="color: #64748b; font-weight: bold; margin-bottom: 8px;">지도를 불러올 수 없습니다</p>
                        <p style="color: #94a3b8; font-size: 12px;">Leaflet 라이브러리를 설치해주세요: npm install leaflet</p>
                    </div>
                `;
            }
        });
        
        return () => {
            isMounted = false;
            // cleanup - 지도 제거 전에 모든 이벤트 리스너 제거
            if (mapInstanceRef.current) {
                try {
                    // 지도 이벤트 정리
                    mapInstanceRef.current.off();
                    mapInstanceRef.current.remove();
                } catch (error) {
                    console.warn('⚠️ 지도 정리 중 오류:', error);
                }
                mapInstanceRef.current = null;
            }
            markersRef.current.forEach(marker => {
                if (marker) {
                    try {
                        marker.remove();
                    } catch (error) {
                        // 무시
                    }
                }
            });
            markersRef.current = [];
            if (polylineRef.current) {
                try {
                    polylineRef.current.remove();
                } catch (error) {
                    // 무시
                }
                polylineRef.current = null;
            }
            isInitializedRef.current = false;
            lastLocationRef.current = null;
        };
    }, []); // 빈 배열 - 한 번만 실행

    /**
     * 위치 변경 시 마커만 업데이트 (지도 재초기화 없이)
     */
    useEffect(() => {
        if (!isInitializedRef.current || !mapInstanceRef.current || !L) return;

        // 위치가 실제로 변경되었는지 확인 (0.001도 이상 차이)
        const hasLocationChanged = () => {
            if (!currentLocation || !currentLocation.lat || !currentLocation.lng) {
                return lastLocationRef.current !== null;
            }
            
            if (!lastLocationRef.current) {
                return true;
            }

            const latDiff = Math.abs(currentLocation.lat - lastLocationRef.current.lat);
            const lngDiff = Math.abs(currentLocation.lng - lastLocationRef.current.lng);
            
            // 0.001도 이상 변경되었을 때만 업데이트 (약 100m)
            return latDiff > 0.001 || lngDiff > 0.001;
        };

        if (hasLocationChanged()) {
            updateMarkers();
            lastLocationRef.current = currentLocation ? {
                lat: currentLocation.lat,
                lng: currentLocation.lng
            } : null;
        }
    }, [currentLocation]);

    /**
     * 지도가 준비된 후 z-index 재설정 (동적으로 생성된 요소들에 적용)
     * 지도가 완전히 로드된 후에도 주기적으로 z-index를 확인하고 재설정
     */
    useEffect(() => {
        if (!isInitializedRef.current || !mapInstanceRef.current || !mapRef.current) return;

        // z-index 재설정 함수
        // 자식앱에서 사용한 방법과 동일: 항상 낮은 z-index 사용 (모달 뒤로 가도록)
        const updateZIndex = () => {
            if (!mapRef.current) return;
            
            // 지도는 항상 낮은 z-index 사용 (모달 뒤로 가도록)
            // 자식앱에서 사용한 방법과 동일: zIndex: 1
            const allLeafletElements = mapRef.current.querySelectorAll('.leaflet-container, .leaflet-pane, .leaflet-control-container, .leaflet-top, .leaflet-bottom, .leaflet-tile-pane, .leaflet-overlay-pane, .leaflet-shadow-pane, .leaflet-marker-pane, .leaflet-tooltip-pane, .leaflet-popup-pane, .leaflet-tile, .leaflet-tile-container');
            allLeafletElements.forEach(element => {
                if (element) {
                    element.style.zIndex = '1';
                    if (element.style.position === '' || element.style.position === 'static') {
                        element.style.position = 'relative';
                    }
                }
            });
        };

        // 지도 준비 후 즉시 z-index 업데이트
        updateZIndex();
        
        // 지도 타일이 로드될 때마다 z-index 재설정 (주기적으로 확인)
        const intervalId = setInterval(() => {
            updateZIndex();
        }, 300); // 0.3초마다 확인
        
        // 지도 이벤트 리스너 추가 (타일 로드 완료 시 z-index 재설정)
        if (mapInstanceRef.current) {
            mapInstanceRef.current.on('tileload', () => {
                setTimeout(updateZIndex, 50);
            });
            mapInstanceRef.current.on('load', () => {
                setTimeout(updateZIndex, 100);
            });
        }

        return () => {
            clearInterval(intervalId);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.off('tileload');
                mapInstanceRef.current.off('load');
            }
        };
    }, [isInitializedRef.current, mapInstanceRef.current]);

    /**
     * 목적지나 경로 변경 시 업데이트
     */
    useEffect(() => {
        if (!isInitializedRef.current || !mapInstanceRef.current || !L) return;

        // 목적지나 경로가 변경되면 마커와 경로 업데이트
        updateMarkers();

        // 경로 시각화 업데이트
        const destCoords = getDestinationCoords();
        if (routePath && routePath.length > 0 && mapInstanceRef.current) {
            try {
                // 기존 Polyline 제거
                if (polylineRef.current) {
                    polylineRef.current.remove();
                    polylineRef.current = null;
                }

                // routePath 형식: [{lng: 경도, lat: 위도}, ...]
                const pathCoordinates = routePath.map(point => [point.lat, point.lng]);
                
                // Polyline 생성 (초록색)
                const polyline = L.polyline(pathCoordinates, {
                    color: '#10B981',
                    weight: 5,
                    opacity: 0.7
                }).addTo(mapInstanceRef.current);
                
                polylineRef.current = polyline;
                
                // 경로를 포함하도록 지도 범위 조정
                mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
            } catch (error) {
                console.warn('⚠️ 경로 시각화 실패:', error);
            }
        } else if (currentLocation && destCoords) {
            // 경로가 없으면 두 위치를 포함하도록 범위 조정
            const boundsObj = L.latLngBounds(
                [[currentLocation.lat, currentLocation.lng], [destCoords.lat, destCoords.lng]]
            );
            mapInstanceRef.current.fitBounds(boundsObj, { padding: [50, 50] });
        }
    }, [destination, routePath, bounds, destinationName]);

    return (
        <div 
            ref={mapRef}
            className="w-full h-full rounded-xl overflow-hidden"
            style={{ minHeight: '384px', position: 'relative', zIndex: 1 }}
        />
    );
};

export default OpenStreetMapView;
