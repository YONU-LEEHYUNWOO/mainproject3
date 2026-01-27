import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Thermometer, Droplets, Wind, RefreshCw } from 'lucide-react';
import { weatherAPI } from '../services/api';

interface WeatherData {
    temp: number;
    humidity: number;
    skyStatus: string;
    rainType: string;
    rainAmount: string;
    baseDate: string;
    baseTime: string;
}

// LCC 격자 좌표 변환 로직 (기상청 사용 공식)
const convertToGrid = (lat: number, lon: number) => {
    const RE = 6371.00877; // 지구 반지름(km)
    const GRID = 5.0; // 격자 간격(km)
    const SLAT1 = 30.0; // 투영 위도1(degree)
    const SLAT2 = 60.0; // 투영 위도2(degree)
    const OLON = 126.0; // 기준점 경도(degree)
    const OLAT = 38.0; // 기준점 위도(degree)
    const XO = 43; // 기준점 X좌표(GRID)
    const YO = 136; // 기준점 Y좌표(GRID)

    const DEGRAD = Math.PI / 180.0;

    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;

    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = (re * sf) / Math.pow(ro, sn);

    let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
    ra = (re * sf) / Math.pow(ra, sn);
    let theta = lon * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;

    const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

    return { x, y };
};

export const WeatherWidget: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. 위치 정보 가져오기
            if (!navigator.geolocation) {
                throw new Error('위치 정보를 지원하지 않는 브라우저입니다.');
            }

            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude, longitude } = position.coords;
            const { x, y } = convertToGrid(latitude, longitude);

            // 2. 백엔드 프록시를 통해 기상청 API 호출 및 저장
            const now = new Date();
            // 기상청 API는 정시 40분 이후에 데이터 업데이트됨
            if (now.getMinutes() < 40) {
                now.setHours(now.getHours() - 1);
            }

            const baseDate = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0');
            const baseTime = now.getHours().toString().padStart(2, '0') + '00';

            const response = await weatherAPI.fetchFromKma({
                nx: x,
                ny: y,
                base_date: baseDate,
                base_time: baseTime
            });

            const weatherData = response.data;

            setWeather({
                temp: weatherData.temp,
                humidity: weatherData.humidity,
                skyStatus: weatherData.sky_status || '정보없음',
                rainType: weatherData.rain_type || '0',
                rainAmount: weatherData.rain_amount || '0',
                baseDate: weatherData.base_date,
                baseTime: weatherData.base_time,
            });

        } catch (err: any) {
            console.error('Weather error:', err);
            setError(err.message || '날씨 정보를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeather();
    }, [fetchWeather]);

    const getWeatherIcon = () => {
        if (!weather) return <Cloud className="w-12 h-12 text-gray-400" />;

        if (weather.rainType !== '0') {
            if (weather.rainType === '3') return <CloudLightning className="w-12 h-12 text-blue-400" />;
            return <CloudRain className="w-12 h-12 text-blue-500" />;
        }

        // 임시로 낮 시간대면 Sun 무조건 표시 (하늘상태 데이터가 실황엔 없음)
        const hour = new Date().getHours();
        return hour > 6 && hour < 18
            ? <Sun className="w-12 h-12 text-orange-400" />
            : <Cloud className="w-12 h-12 text-indigo-400" />;
    };

    const getRainStatus = (type: string) => {
        switch (type) {
            case '1': return '비 오는 중';
            case '2': return '진눈깨비';
            case '3': return '눈 오는 중';
            case '4': return '소나기';
            default: return '강수 없음';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-50 h-full flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-50 h-full flex flex-col items-center justify-center">
                <div className="text-red-500 text-sm text-center mb-4">{error}</div>
                <button onClick={fetchWeather} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100">
                    <RefreshCw size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white h-full relative overflow-hidden group">
            {/* 장식용 원형 배경 */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full transition-transform group-hover:scale-110"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-blue-100 text-sm font-semibold mb-1">우리 동네 날씨</h4>
                        <div className="text-3xl font-bold flex items-center">
                            {weather?.temp}°C
                            <Thermometer size={20} className="ml-1 opacity-70" />
                        </div>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        {getWeatherIcon()}
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm font-medium">
                        <Droplets size={16} className="mr-2 opacity-80" />
                        <span>습도 {weather?.humidity}%</span>
                    </div>
                    <div className="flex items-center text-sm font-medium">
                        <Wind size={16} className="mr-2 opacity-80" />
                        <span>{getRainStatus(weather?.rainType || '0')}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/20">
                    <span className="text-xs text-blue-100">발표: {weather?.baseTime.slice(0, 2)}:00</span>
                    <button onClick={fetchWeather} className="text-xs font-bold hover:underline">업데이트</button>
                </div>
            </div>
        </div>
    );
};
