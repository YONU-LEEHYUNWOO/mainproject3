/**
 * 날씨 API 유틸리티
 * 한국 공공데이터 포털 기상청 단기예보 API 사용
 * 기상청_단기예보 ((구)_동네예보) 조회서비스
 */

// 날씨 데이터 캐시 (5분 TTL)
// 위치 이름 기반 캐시
const weatherCacheByName = new Map();
// 좌표 기반 캐시
const weatherCacheByCoords = new Map();
const WEATHER_CACHE_TTL = 5 * 60 * 1000; // 5분 (밀리초)

/**
 * 캐시된 날씨 데이터 확인 (위치 이름 기반)
 * @param {string} location - 위치 이름
 * @returns {Object|null} 캐시된 데이터 또는 null
 */
const getCachedWeatherDataByName = (location) => {
    const cached = weatherCacheByName.get(location);
    if (!cached) return null;
    
    // TTL 확인 (5분)
    if (Date.now() - cached.timestamp > WEATHER_CACHE_TTL) {
        weatherCacheByName.delete(location);
        return null;
    }
    
    console.log('✅ 날씨 캐시 히트 (위치 이름):', location);
    return cached.data;
};

/**
 * 캐시된 날씨 데이터 확인 (좌표 기반)
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {Object|null} 캐시된 데이터 또는 null
 */
const getCachedWeatherDataByCoords = (lat, lng) => {
    // 좌표를 반올림하여 근사치로 캐싱 (약 1km 단위)
    const roundCoord = (coord) => Math.round(coord * 100) / 100;
    const key = `${roundCoord(lat)},${roundCoord(lng)}`;
    
    const cached = weatherCacheByCoords.get(key);
    if (!cached) return null;
    
    // TTL 확인 (5분)
    if (Date.now() - cached.timestamp > WEATHER_CACHE_TTL) {
        weatherCacheByCoords.delete(key);
        return null;
    }
    
    console.log('✅ 날씨 캐시 히트 (좌표):', key);
    return cached.data;
};

/**
 * 날씨 데이터를 캐시에 저장 (위치 이름 기반)
 * @param {string} location - 위치 이름
 * @param {Object} data - 날씨 데이터
 */
const setCachedWeatherDataByName = (location, data) => {
    weatherCacheByName.set(location, {
        data: data,
        timestamp: Date.now()
    });
    
    // 캐시 크기 제한 (최대 10개)
    if (weatherCacheByName.size > 10) {
        const firstKey = weatherCacheByName.keys().next().value;
        weatherCacheByName.delete(firstKey);
    }
};

/**
 * 날씨 데이터를 캐시에 저장 (좌표 기반)
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @param {Object} data - 날씨 데이터
 */
const setCachedWeatherDataByCoords = (lat, lng, data) => {
    const roundCoord = (coord) => Math.round(coord * 100) / 100;
    const key = `${roundCoord(lat)},${roundCoord(lng)}`;
    
    weatherCacheByCoords.set(key, {
        data: data,
        timestamp: Date.now()
    });
    
    // 캐시 크기 제한 (최대 20개)
    if (weatherCacheByCoords.size > 20) {
        const firstKey = weatherCacheByCoords.keys().next().value;
        weatherCacheByCoords.delete(firstKey);
    }
};

/**
 * 위경도를 기상청 격자 좌표로 변환
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {Object} 격자 좌표 { nx, ny }
 */
const convertCoordinatesToGrid = (lat, lng) => {
    // 기상청 격자 좌표 변환 공식
    const RE = 6371.00877; // 지구 반경(km)
    const GRID = 5.0; // 격자 간격(km)
    const SLAT1 = 30.0; // 투영 위도1(degree)
    const SLAT2 = 60.0; // 투영 위도2(degree)
    const OLON = 126.0; // 기준점 경도(degree)
    const OLAT = 38.0; // 기준점 위도(degree)
    const XO = 43; // 기준점 X좌표(GRID)
    const YO = 136; // 기준점 Y좌표(GRID)
    
    const DEGRAD = Math.PI / 180.0;
    const RADDEG = 180.0 / Math.PI;
    
    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;
    
    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    
    let ra = Math.tan(Math.PI * 0.25 + (lat) * DEGRAD * 0.5);
    ra = re * sf / Math.pow(ra, sn);
    let theta = lng * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    
    const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    
    return { nx, ny };
};

/**
 * 현재 시간 기준 기상청 발표 시간 계산
 * 초단기실황 API는 매시간 30분에 발표 (예: 0030, 0130, 0230, ...)
 * @returns {Object} { baseDate, baseTime }
 */
const getBaseDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    let hour = now.getHours();
    const minute = now.getMinutes();
    
    // 초단기실황은 매시간 30분에 발표되므로, 현재 시간보다 이전의 가장 최근 발표 시간 사용
    // 현재 시간이 14:35라면 14:30 발표분 사용
    // 현재 시간이 14:25라면 13:30 발표분 사용
    if (minute < 30) {
        hour = hour - 1;
        if (hour < 0) {
            hour = 23;
            // 전날로 넘어가는 경우
            const prevDay = new Date(now);
            prevDay.setDate(prevDay.getDate() - 1);
            const prevYear = prevDay.getFullYear();
            const prevMonth = String(prevDay.getMonth() + 1).padStart(2, '0');
            const prevDate = String(prevDay.getDate()).padStart(2, '0');
            return {
                baseDate: `${prevYear}${prevMonth}${prevDate}`,
                baseTime: `${String(hour).padStart(2, '0')}30`
            };
        }
    }
    
    return {
        baseDate: `${year}${month}${date}`,
        baseTime: `${String(hour).padStart(2, '0')}30`
    };
};

/**
 * 기상청 단기예보 API를 통해 현재 날씨 정보 조회
 * @param {number} lat - 위도 (기본값: 평택시)
 * @param {number} lng - 경도 (기본값: 평택시)
 * @returns {Promise<Object>} 날씨 정보 객체
 */
export const fetchWeatherData = async (lat = 36.9923, lng = 127.1119) => {
    // 좌표 기반 캐시 확인
    const cachedData = getCachedWeatherDataByCoords(lat, lng);
    if (cachedData) {
        return cachedData;
    }
    
    const apiKey = import.meta.env.VITE_KOREA_WEATHER_API_KEY || '';
    
    // API 키가 없으면 시뮬레이션 데이터 반환
    if (!apiKey || apiKey === '') {
        console.warn('⚠️ 한국 날씨 API 키가 설정되지 않았습니다. 시뮬레이션 데이터를 사용합니다.');
        console.warn('💡 .env 파일에 VITE_KOREA_WEATHER_API_KEY를 설정하세요.');
        return getSimulatedWeatherData();
    }
    
    // API 키 형식 확인 (공공데이터 포털 키는 보통 길이가 있음)
    if (apiKey.length < 10) {
        console.warn('⚠️ API 키가 너무 짧습니다. 올바른 키인지 확인하세요.');
    }
    console.log(`🔑 API 키 확인: ${apiKey.substring(0, 10)}... (길이: ${apiKey.length})`);

    try {
        // 격자 좌표 변환
        const grid = convertCoordinatesToGrid(lat, lng);
        console.log(`📍 좌표 변환: 위도 ${lat}, 경도 ${lng} → 격자 (${grid.nx}, ${grid.ny})`);
        
        // 기상청 발표 시간 계산
        const { baseDate, baseTime } = getBaseDateTime();
        console.log(`⏰ 발표 시간: ${baseDate} ${baseTime}`);
        
        // API URL 생성 (프록시 사용 또는 직접 호출)
        // 개발 환경에서는 프록시 사용, 프로덕션에서는 직접 호출 시도
        const isDev = import.meta.env.DEV;
        const apiUrl = isDev 
            ? `/api/weather?serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${grid.nx}&ny=${grid.ny}`
            : `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${grid.nx}&ny=${grid.ny}`;
        
        console.log(`🌐 API 호출 시작 (${isDev ? '프록시' : '직접'})`);
        console.log(`📍 API URL: ${apiUrl.substring(0, 150)}...`);
        
        // 기상청 초단기실황 API 호출 (getUltraSrtNcst)
        const response = await fetch(apiUrl);

        // 응답 본문을 먼저 읽기 (한 번만 읽을 수 있으므로)
        const responseText = await response.text();
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            console.error(`❌ HTTP 오류: ${response.status} ${response.statusText}`);
            console.error(`응답 내용: ${responseText.substring(0, 1000)}`);
            
            // 500 오류 시 상세 안내
            if (response.status === 500) {
                console.error('❌ 서버 내부 오류 (500) 발생!');
                console.error('💡 가능한 원인:');
                console.error('   1. 프록시 서버 설정 문제');
                console.error('   2. 원격 API 서버 일시적 오류');
                console.error('   3. API 키 형식 오류 또는 잘못된 파라미터');
                console.error('   4. 네트워크 연결 문제');
                console.error('💡 해결 방법:');
                console.error('   1. 개발 서버를 재시작해보세요 (npm run dev)');
                console.error('   2. .env 파일의 API 키가 올바른지 확인하세요');
                console.error('   3. 잠시 후 다시 시도해보세요');
                console.error('   4. 브라우저 콘솔에서 상세 에러 메시지를 확인하세요');
                
                // 시뮬레이션 데이터로 폴백
                throw new Error('WEATHER_API_500_ERROR');
            }
            
            // 401 오류 시 상세 안내
            if (response.status === 401) {
                console.error('❌ API 키 인증 실패!');
                console.error('💡 확인사항:');
                console.error('   1. .env 파일에 VITE_KOREA_WEATHER_API_KEY가 올바르게 설정되었는지 확인');
                console.error('   2. 공공데이터 포털에서 API 키가 활성화되었는지 확인');
                console.error('   3. API 키 형식이 올바른지 확인 (일반적으로 문자열)');
                console.error('   4. 서비스 신청이 완료되었는지 확인 (활용신청 관리에서)');
                console.error('   5. 사용량 한도를 초과하지 않았는지 확인');
                
                // XML 응답인 경우 오류 메시지 추출
                if (responseText.trim().startsWith('<?xml')) {
                    const errorMatch = responseText.match(/<resultMsg>(.*?)<\/resultMsg>/i);
                    const errorCodeMatch = responseText.match(/<resultCode>(.*?)<\/resultCode>/i);
                    if (errorMatch || errorCodeMatch) {
                        console.error(`❌ API 오류 메시지: ${errorMatch?.[1] || '알 수 없음'}`);
                        console.error(`❌ 오류 코드: ${errorCodeMatch?.[1] || 'N/A'}`);
                    }
                }
                
                throw new Error(`API 키 인증 실패 (401). 공공데이터 포털에서 API 키를 확인하세요.`);
            }
            
            throw new Error(`날씨 API HTTP 오류: ${response.status} ${response.statusText}`);
        }
        
        // XML 응답인 경우 (공공데이터 포털은 오류 시 XML을 반환할 수 있음)
        if (contentType && contentType.includes('application/xml') || responseText.trim().startsWith('<?xml')) {
            console.error(`❌ XML 응답 받음 (오류 가능성)`);
            console.error(`응답 내용: ${responseText.substring(0, 1000)}`);
            // XML 파싱 시도 (간단한 오류 메시지 추출)
            const errorMatch = responseText.match(/<resultMsg>(.*?)<\/resultMsg>/i);
            const errorCodeMatch = responseText.match(/<resultCode>(.*?)<\/resultCode>/i);
            if (errorMatch || errorCodeMatch) {
                throw new Error(`날씨 API 오류: ${errorMatch?.[1] || '알 수 없는 오류'} (코드: ${errorCodeMatch?.[1] || 'N/A'})`);
            }
            throw new Error(`날씨 API가 XML 형식으로 오류를 반환했습니다. 응답을 확인하세요.`);
        }
        
        if (!contentType || !contentType.includes('application/json')) {
            console.error(`❌ JSON이 아닌 응답: ${contentType}`);
            console.error(`응답 내용: ${responseText.substring(0, 500)}`);
            throw new Error(`날씨 API 응답 형식 오류: JSON이 아닙니다. (${contentType})`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error(`❌ JSON 파싱 오류:`, parseError);
            console.error(`응답 내용: ${responseText.substring(0, 500)}`);
            throw new Error(`날씨 API 응답 파싱 오류: ${parseError.message}`);
        }
        console.log('📦 API 응답 받음:', data);
        
        // API 응답 파싱
        if (data.response?.header?.resultCode !== '00') {
            const errorMsg = data.response?.header?.resultMsg || '알 수 없는 오류';
            console.error(`❌ API 오류 코드: ${data.response?.header?.resultCode}`);
            console.error(`❌ 오류 메시지: ${errorMsg}`);
            throw new Error(`날씨 API 오류: ${errorMsg} (코드: ${data.response?.header?.resultCode})`);
        }
        
        const items = data.response?.body?.items?.item || [];
        console.log(`📊 받은 데이터 항목 수: ${items.length}개`);
        
        if (!items || items.length === 0) {
            console.error('❌ 날씨 데이터가 없습니다.');
            throw new Error('날씨 데이터가 없습니다.');
        }
        
        // 받은 데이터 항목 확인
        console.log('📋 받은 항목들:', items.map(item => `${item.category}: ${item.obsrValue}`).join(', '));
        
        // 현재 날씨 정보 추출
        let temperature = null;
        let humidity = null;
        let sky = null;
        let pty = null; // 강수형태
        
        items.forEach(item => {
            if (item.category === 'T1H') { // 기온
                temperature = parseFloat(item.obsrValue);
                console.log(`🌡️ 기온: ${temperature}°C`);
            } else if (item.category === 'REH') { // 습도
                humidity = parseFloat(item.obsrValue);
                console.log(`💧 습도: ${humidity}%`);
            } else if (item.category === 'SKY') { // 하늘상태
                sky = parseInt(item.obsrValue); // 1: 맑음, 3: 구름많음, 4: 흐림
                console.log(`☁️ 하늘상태: ${sky} (1:맑음, 3:구름많음, 4:흐림)`);
            } else if (item.category === 'PTY') { // 강수형태
                pty = parseInt(item.obsrValue); // 0: 없음, 1: 비, 2: 비/눈, 3: 눈, 4: 소나기
                console.log(`🌧️ 강수형태: ${pty} (0:없음, 1:비, 2:비/눈, 3:눈, 4:소나기)`);
            }
        });
        
        // 필수 데이터 확인
        if (temperature === null) {
            console.warn('⚠️ 기온 데이터가 없습니다. 시뮬레이션 데이터 사용');
            return getSimulatedWeatherData();
        }
        
        // 날씨 조건 판단
        const condition = getWeatherCondition(sky, pty);
        console.log(`✅ 날씨 조건: ${condition}`);
        
        // 날씨 정보 반환
        const result = {
            condition: condition,
            temperature: `${Math.round(temperature)}°C`,
            feelsLike: `${Math.round(temperature - 1)}°C`,
            humidity: humidity !== null ? `${Math.round(humidity)}%` : 'N/A',
            windSpeed: 'N/A',
            icon: getWeatherIcon(sky, pty),
            tip: getWeatherTip(temperature, condition, humidity || 60, 0),
            timestamp: Date.now(),
            isRealData: true // 실제 API 데이터임을 표시
        };
        
        console.log('✅ 날씨 정보 반환 (실제 API 데이터):', result);
        
        // 좌표 기반 캐시에 저장
        setCachedWeatherDataByCoords(lat, lng, result);
        
        return result;
    } catch (error) {
        console.error('❌ 날씨 API 오류:', error);
        console.error('❌ 오류 상세:', error.message);
        console.error('❌ 스택:', error.stack);
        // 오류 발생 시 시뮬레이션 데이터 반환
        console.warn('⚠️ 시뮬레이션 데이터로 대체합니다.');
        return getSimulatedWeatherData();
    }
};

/**
 * 하늘상태와 강수형태로 날씨 조건 판단
 * @param {number} sky - 하늘상태 (1: 맑음, 3: 구름많음, 4: 흐림)
 * @param {number} pty - 강수형태 (0: 없음, 1: 비, 2: 비/눈, 3: 눈, 4: 소나기)
 * @returns {string} 한국어 날씨 조건
 */
const getWeatherCondition = (sky, pty) => {
    if (pty === 1) return '비';
    if (pty === 2) return '비/눈';
    if (pty === 3) return '눈';
    if (pty === 4) return '소나기';
    if (sky === 1) return '맑음';
    if (sky === 3) return '구름많음';
    if (sky === 4) return '흐림';
    return '맑음';
};

/**
 * 날씨 아이콘 반환
 * @param {number} sky - 하늘상태
 * @param {number} pty - 강수형태
 * @returns {string} 아이콘 코드
 */
const getWeatherIcon = (sky, pty) => {
    if (pty === 1 || pty === 4) return '10d'; // 비
    if (pty === 2) return '13d'; // 비/눈
    if (pty === 3) return '13d'; // 눈
    if (sky === 1) return '01d'; // 맑음
    if (sky === 3) return '02d'; // 구름많음
    if (sky === 4) return '03d'; // 흐림
    return '01d';
};

/**
 * 날씨에 따른 옷차림/활동 팁 생성
 * @param {number} temp - 온도 (°C)
 * @param {string} condition - 날씨 조건
 * @param {number} humidity - 습도 (%)
 * @param {number} windSpeed - 풍속 (m/s)
 * @returns {string} 날씨 팁
 */
const getWeatherTip = (temp, condition, humidity, windSpeed) => {
    let tips = [];
    
    // 온도 기반 팁
    if (temp >= 30) {
        tips.push('날씨가 매우 더워요. 시원한 옷을 입고 물을 자주 드세요.');
    } else if (temp >= 25) {
        tips.push('날씨가 따뜻해요. 가벼운 옷을 입으시면 좋아요.');
    } else if (temp >= 20) {
        tips.push('날씨가 쾌적해요. 가벼운 겉옷만 준비하시면 돼요.');
    } else if (temp >= 15) {
        tips.push('날씨가 서늘해요. 가벼운 겉옷을 준비하세요.');
    } else if (temp >= 10) {
        tips.push('날씨가 선선해요. 따뜻한 겉옷이 필요해요.');
    } else if (temp >= 5) {
        tips.push('날씨가 쌀쌀해요. 두꺼운 겉옷을 입으세요.');
    } else if (temp >= 0) {
        tips.push('날씨가 춥네요. 코트나 패딩을 준비하세요.');
    } else {
        tips.push('날씨가 매우 춥네요. 두꺼운 외투와 모자, 장갑을 준비하세요.');
    }
    
    // 날씨 조건 기반 팁
    if (condition === '비' || condition === '소나기') {
        tips.push('비가 오고 있어요. 우산을 꼭 준비하세요.');
    } else if (condition === '비/눈') {
        tips.push('비와 눈이 섞여 내리고 있어요. 우산과 미끄럼 주의하세요.');
    } else if (condition === '눈') {
        tips.push('눈이 내리고 있어요. 미끄럼 주의하시고 따뜻하게 입으세요.');
    } else if (condition === '흐림') {
        tips.push('하늘이 흐려요. 외출 시 준비물을 확인하세요.');
    }
    
    // 강풍 팁
    if (windSpeed > 10) {
        tips.push('바람이 강하게 불고 있어요. 외출 시 주의하세요.');
    }
    
    return tips.length > 0 ? tips.join(' ') : '외출하기 좋은 날씨예요.';
};

/**
 * 시뮬레이션 날씨 데이터 생성 (API 키가 없을 때 사용)
 * @returns {Object} 시뮬레이션 날씨 정보
 */
const getSimulatedWeatherData = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // 시간대별 시뮬레이션 온도
    let temperature = 15; // 기본 온도
    if (hour >= 6 && hour < 12) {
        temperature = 12 + Math.floor(Math.random() * 8); // 오전: 12-20°C
    } else if (hour >= 12 && hour < 18) {
        temperature = 18 + Math.floor(Math.random() * 10); // 오후: 18-28°C
    } else if (hour >= 18 && hour < 22) {
        temperature = 15 + Math.floor(Math.random() * 8); // 저녁: 15-23°C
    } else {
        temperature = 8 + Math.floor(Math.random() * 8); // 밤/새벽: 8-16°C
    }
    
    // 시뮬레이션 날씨 조건
    const conditions = ['맑음', '구름많음', '맑음', '맑음']; // 맑음 확률이 높도록
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
        condition: condition,
        temperature: `${temperature}°C`,
        feelsLike: `${temperature - 1}°C`,
        humidity: `${50 + Math.floor(Math.random() * 30)}%`,
        windSpeed: `${Math.floor(Math.random() * 5)} m/s`,
        icon: '01d',
        tip: getWeatherTip(temperature, condition === '구름많음' ? '구름많음' : '맑음', 60, 2),
        timestamp: Date.now(),
        simulated: true, // 시뮬레이션 데이터임을 표시
        isRealData: false // 실제 API 데이터가 아님을 표시
    };
};

/**
 * 위치 이름으로 날씨 정보 조회
 * @param {string} locationName - 위치 이름 (예: "평택시", "서울시")
 * @returns {Promise<Object>} 날씨 정보 객체
 */
export const fetchWeatherByLocation = async (locationName) => {
    // 캐시 확인
    // 캐시 확인 (위치 이름 기반)
    const cachedData = getCachedWeatherDataByName(locationName);
    if (cachedData) {
        console.log('📦 캐시된 날씨 데이터 사용:', locationName);
        return cachedData;
    }
    
    // 주요 도시의 좌표 (간단한 매핑)
    const cityCoordinates = {
        '평택시': { lat: 36.9923, lng: 127.1119 },
        '평택': { lat: 36.9923, lng: 127.1119 },
        '서울': { lat: 37.5665, lng: 126.9780 },
        '서울시': { lat: 37.5665, lng: 126.9780 },
        '부산': { lat: 35.1796, lng: 129.0756 },
        '부산시': { lat: 35.1796, lng: 129.0756 },
        '대구': { lat: 35.8714, lng: 128.6014 },
        '대구시': { lat: 35.8714, lng: 128.6014 },
        '인천': { lat: 37.4563, lng: 126.7052 },
        '인천시': { lat: 37.4563, lng: 126.7052 },
        '광주': { lat: 35.1595, lng: 126.8526 },
        '광주시': { lat: 35.1595, lng: 126.8526 },
        '대전': { lat: 36.3504, lng: 127.3845 },
        '대전시': { lat: 36.3504, lng: 127.3845 },
        '울산': { lat: 35.5384, lng: 129.3114 },
        '울산시': { lat: 35.5384, lng: 129.3114 }
    };
    
    // 위치명에서 시/도명 추출 시도
    let coords = cityCoordinates[locationName];
    if (!coords) {
        // 부분 일치로 찾기
        for (const [city, coord] of Object.entries(cityCoordinates)) {
            if (locationName.includes(city) || city.includes(locationName)) {
                coords = coord;
                break;
            }
        }
    }
    
    if (!coords) {
        // 기본값: 평택시
        coords = cityCoordinates['평택시'];
    }
    
    const weatherData = await fetchWeatherData(coords.lat, coords.lng);
    
    // 캐시에 저장
    // 캐시에 저장 (위치 이름 기반)
    setCachedWeatherDataByName(locationName, weatherData);
    
    return weatherData;
};
