import React, { useMemo } from 'react';

/**
 * 간단한 경로 지도 시각화 컴포넌트 (SDK 없이 SVG 사용)
 * vertexes 좌표 배열을 이용해서 경로를 그립니다
 */
const SimpleRouteMap = ({ routePath, bounds, origin, destination, width = 900, height = 384 }) => {
    // 좌표를 SVG 좌표계로 변환
    const { pathPoints, originPoint, destinationPoint, viewBox } = useMemo(() => {
        if (!bounds || !routePath || routePath.length === 0) {
            return { pathPoints: [], originPoint: null, destinationPoint: null, viewBox: `0 0 ${width} ${height}` };
        }

        // 경계 값
        const minLng = bounds.min_x;
        const minLat = bounds.min_y;
        const maxLng = bounds.max_x;
        const maxLat = bounds.max_y;

        // 경계 범위
        const lngRange = maxLng - minLng;
        const latRange = maxLat - minLat;

        // 패딩 (경계에서 약간의 여백) - 최소값이 0이 되지 않도록 처리
        const padding = Math.max(lngRange, latRange) * 0.15;

        // 좌표 변환 함수 (위도/경도를 SVG 좌표로)
        const transformCoordinate = (lng, lat) => {
            const totalLngRange = lngRange + padding * 2;
            const totalLatRange = latRange + padding * 2;
            const normalizedLng = (lng - minLng + padding) / totalLngRange;
            const normalizedLat = 1 - (lat - minLat + padding) / totalLatRange; // Y축 뒤집기 (SVG는 위에서 아래)
            return {
                x: normalizedLng * width,
                y: normalizedLat * height
            };
        };

        // 경로 좌표 변환
        const points = routePath.map(point => transformCoordinate(point.lng, point.lat));
        
        // 출발지와 목적지 좌표
        let originPt = null;
        let destPt = null;
        
        if (origin && origin.x && origin.y) {
            originPt = transformCoordinate(origin.x, origin.y);
        } else if (points.length > 0) {
            originPt = points[0];
        }
        
        if (destination && destination.x && destination.y) {
            destPt = transformCoordinate(destination.x, destination.y);
        } else if (points.length > 0) {
            destPt = points[points.length - 1];
        }

        // SVG path 문자열 생성
        const pathString = points.length > 0 
            ? `M ${points[0].x} ${points[0].y} L ${points.slice(1).map(p => `${p.x} ${p.y}`).join(' L ')}`
            : '';

        return {
            pathPoints: points,
            pathString,
            originPoint: originPt,
            destinationPoint: destPt,
            viewBox: `0 0 ${width} ${height}`
        };
    }, [routePath, bounds, origin, destination, width, height]);

    if (!bounds || !routePath || routePath.length === 0) {
        return null;
    }

    return (
        <svg 
            width="100%" 
            height="100%" 
            viewBox={viewBox} 
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0"
        >
            {/* 배경 */}
            <rect width="100%" height="100%" fill="#f1f5f9" />
            
            {/* 경로 라인 */}
            {pathPoints.length > 1 && (
                <path
                    d={pathPoints.reduce((acc, point, index) => {
                        if (index === 0) {
                            return `M ${point.x} ${point.y}`;
                        }
                        return `${acc} L ${point.x} ${point.y}`;
                    }, '')}
                    stroke="#3B82F6"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )}
            
            {/* 출발지 마커 (빨간색 원) */}
            {originPoint && (
                <g>
                    <circle
                        cx={originPoint.x}
                        cy={originPoint.y}
                        r="8"
                        fill="#EF4444"
                        stroke="white"
                        strokeWidth="2"
                    />
                    <circle
                        cx={originPoint.x}
                        cy={originPoint.y}
                        r="4"
                        fill="white"
                    />
                </g>
            )}
            
            {/* 목적지 마커 (파란색 원) */}
            {destinationPoint && (
                <g>
                    <circle
                        cx={destinationPoint.x}
                        cy={destinationPoint.y}
                        r="10"
                        fill="#3B82F6"
                        stroke="white"
                        strokeWidth="2"
                    />
                    <circle
                        cx={destinationPoint.x}
                        cy={destinationPoint.y}
                        r="5"
                        fill="white"
                    />
                </g>
            )}
        </svg>
    );
};

export default SimpleRouteMap;
