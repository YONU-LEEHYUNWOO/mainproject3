src/utils/naturalLanguageProcessor.js
/**
 * 자연어 처리 유틸리티
 * 보호자 앱에서 자연어 명령을 파싱하여 일정, 위치, 행동 패턴 추출
 */

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

/**
 * 자연어 명령을 구조화된 데이터로 변환
 * @param {string} userInput - 사용자 자연어 입력
 * @returns {Promise<Object>} 파싱된 명령 데이터
 */
export const parseNaturalLanguageCommand = async (userInput) => {
    if (!userInput || !userInput.trim()) {
        return { type: 'error', message: '명령을 입력해주세요.' };
    }

    if (!apiKey) {
        // API 키가 없으면 간단한 키워드 기반 파싱
        return parseWithKeywords(userInput);
    }

    try {
        // 현재 날짜 정보 생성
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        const dayAfterTomorrowStr = `${dayAfterTomorrow.getFullYear()}-${String(dayAfterTomorrow.getMonth() + 1).padStart(2, '0')}-${String(dayAfterTomorrow.getDate()).padStart(2, '0')}`;
        
        const prompt = `다음은 노인 케어 서비스의 보호자가 작성한 자연어 명령입니다. 시간, 날짜, 장소 정보를 모두 추출하여 일정으로 변환해주세요.

**현재 날짜 정보 (중요! 반드시 이 날짜를 사용하세요):**
- 오늘: ${todayStr}
- 내일: ${tomorrowStr}
- 모레: ${dayAfterTomorrowStr}

사용자 입력: "${userInput}"

**중요**: 다음 표현들은 모두 일정으로 인식해야 합니다:
- "약속", "저녁약속", "점심약속", "만나기", "만날 약속"
- "가야 해", "가야겠어", "가볼까", "가야 해요"
- "예약", "일정", "스케줄"
- 시간과 장소가 함께 언급된 경우

**날짜 추출 규칙**:
- "오늘" → 오늘 날짜
- "내일" → 내일 날짜
- "모레" → 모레 날짜
- "다음주", "다음 주" → 다음 주
- 요일 언급 (월요일, 화요일 등) → 해당 요일
- 날짜가 없으면 오늘로 설정

**시간 추출 규칙**:
- "오후 6시", "6시", "18시" → 18:00
- "오전 10시" → 10:00
- "점심", "저녁", "아침" → 적절한 시간으로 변환
- 시간이 없으면 12:00으로 설정

**장소 추출 규칙**:
- 모든 장소명, 지점명, 주소를 추출
- "롯데리아", "송탄출장소" 등 모든 장소명 포함

다음 정보를 추출해주세요:
1. 일정 정보 (스케줄): 제목, 장소, 날짜, 시간, 반복 여부
2. 행동 패턴 (행동순서): 병원 방문 후 약국, 마트, 집 등 방문 순서
3. 위치 정보: 장소 주소, 위치 등
4. 알림/메시지: 부모에게 전달할 메시지나 알림

응답 형식 (JSON):
{
  "type": "schedule" | "behavior" | "location" | "message" | "mixed",
  "schedules": [
    {
      "title": "일정 제목 (예: 저녁약속, 병원 방문 등)",
      "location": "장소명 (전체 주소 포함)",
      "dayOfWeek": 0-6 (0=일요일, null이면 날짜로 계산),
      "time": "HH:MM",
      "date": "YYYY-MM-DD 형식으로 반드시 ${todayStr}, ${tomorrowStr}, ${dayAfterTomorrowStr} 중 하나 또는 계산된 날짜를 사용 (문자열 '오늘', '내일', '모레' 사용 금지!)",
      "repeat": true/false,
      "repeatType": "weekly" | "monthly" | "daily"
    }
  ],
  "behaviorPattern": {
    "sequence": ["병원", "약국", "집"],
    "notes": "추가 설명"
  },
  "locations": [
    {
      "name": "장소명",
      "type": "hospital" | "pharmacy" | "mart" | "home" | "restaurant" | "other",
      "address": "주소 (선택)"
    }
  ],
  "message": "부모에게 전달할 메시지",
  "summary": "추출된 정보 요약 (예: 오늘 18:00 저녁약속 - 송탄출장소 롯데리아)"
}

**반드시 시간과 장소가 있으면 일정으로 인식하고 schedules 배열에 추가해주세요.**

JSON만 응답하고 다른 설명은 없이:`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('API 응답 형식 오류');
        }

        const responseText = data.candidates[0].content.parts[0].text;
        
        // JSON 추출 (코드 블록 제거, 더 강력한 추출)
        let jsonText = responseText.trim();
        
        // 마크다운 코드 블록 제거
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // JSON 객체 찾기
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn('JSON을 찾을 수 없습니다. 키워드 기반 파싱으로 폴백:', responseText);
            return parseWithKeywords(userInput);
        }

        let parsed;
        try {
            // JSON 파싱 시도
            let jsonString = jsonMatch[0];
            
            // 불완전한 JSON 복구 시도
            // 닫는 괄호/브래킷이 없으면 추가
            let openBraces = (jsonString.match(/\{/g) || []).length;
            let closeBraces = (jsonString.match(/\}/g) || []).length;
            let openBrackets = (jsonString.match(/\[/g) || []).length;
            let closeBrackets = (jsonString.match(/\]/g) || []).length;
            
            // 닫는 괄호 추가
            while (closeBraces < openBraces) {
                jsonString += '}';
                closeBraces++;
            }
            while (closeBrackets < openBrackets) {
                jsonString += ']';
                closeBrackets++;
            }
            
            // null 값 처리 (null 문자열을 실제 null로 변환)
            jsonString = jsonString.replace(/:\s*null\s*([,}])/g, ': null$1');
            
            parsed = JSON.parse(jsonString);
        } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            console.error('파싱 시도한 JSON:', jsonMatch[0]);
            // JSON 파싱 실패 시 키워드 기반 파싱으로 폴백
            return parseWithKeywords(userInput);
        }
        
        return {
            ...parsed,
            originalInput: userInput
        };
    } catch (error) {
        console.error('자연어 처리 오류:', error);
        // API 오류 시 키워드 기반 파싱으로 폴백
        return parseWithKeywords(userInput);
    }
};

/**
 * 키워드 기반 간단한 파싱 (API 키 없을 때 또는 폴백)
 */
const parseWithKeywords = (userInput) => {
    const text = userInput.toLowerCase();
    
    // 요일 매핑
    const dayMap = {
        '일요일': 0, '일': 0,
        '월요일': 1, '월': 1,
        '화요일': 2, '화': 2,
        '수요일': 3, '수': 3,
        '목요일': 4, '목': 4,
        '금요일': 5, '금': 5,
        '토요일': 6, '토': 6
    };
    
    // 시간 추출 (예: "오후 2시", "14시", "2시 반" 등)
    const timeMatch = text.match(/(\d{1,2})\s*[시:]\s*(\d{0,2})?/);
    let extractedTime = '12:00';
    if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        
        // 오후/오전 처리
        if (text.includes('오후') && hour < 12) {
            hour += 12;
        } else if (text.includes('오전') && hour === 12) {
            hour = 0;
        }
        
        extractedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
    
    // 요일 추출
    let dayOfWeek = null;
    for (const [key, value] of Object.entries(dayMap)) {
        if (text.includes(key)) {
            dayOfWeek = value;
            break;
        }
    }
    
    // 반복 키워드 확인
    const hasRepeat = text.includes('매주') || text.includes('매일') || text.includes('매달') || text.includes('주마다') || text.includes('반복');
    const repeatType = text.includes('매일') ? 'daily' : text.includes('매달') ? 'monthly' : 'weekly';
    
    // 일정 관련 키워드 (확장)
    const scheduleKeywords = ['약속', '저녁약속', '점심약속', '만나기', '만날', '예약', '일정', '스케줄', '가야', '가볼', '가야겠어'];
    const hasScheduleIntent = scheduleKeywords.some(keyword => text.includes(keyword));
    
    // 날짜 추출 (오늘, 내일, 모레 등)
    const today = new Date();
    let targetDate = null;
    let dateLabel = '';
    
    if (text.includes('오늘')) {
        targetDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        dateLabel = '오늘';
    } else if (text.includes('내일')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        targetDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        dateLabel = '내일';
    } else if (text.includes('모레')) {
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        targetDate = `${dayAfterTomorrow.getFullYear()}-${String(dayAfterTomorrow.getMonth() + 1).padStart(2, '0')}-${String(dayAfterTomorrow.getDate()).padStart(2, '0')}`;
        dateLabel = '모레';
    } else if (dayOfWeek !== null) {
        // 요일이 있으면 다음 해당 요일 찾기
        const currentDay = today.getDay();
        let daysUntilTarget = dayOfWeek - currentDay;
        if (daysUntilTarget <= 0) {
            daysUntilTarget += 7; // 다음 주
        }
        const target = new Date(today);
        target.setDate(today.getDate() + daysUntilTarget);
        targetDate = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    } else {
        // 날짜가 없으면 오늘로 설정
        targetDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
    
    // 장소 추출 (더 정확하게)
    const locations = [];
    const behaviorSequence = [];
    
    // 장소명 패턴 매칭 (병원, 약국, 마트, 식당 등)
    const placePatterns = [
        { pattern: /([가-힣\s]+병원)/, type: 'hospital', defaultName: '병원' },
        { pattern: /([가-힣\s]+약국)/, type: 'pharmacy', defaultName: '약국' },
        { pattern: /([가-힣\s]+마트)/, type: 'mart', defaultName: '마트' },
        { pattern: /(롯데리아|맥도날드|버거킹|KFC|스타벅스|이디야|할리스|카페|식당|레스토랑)/, type: 'restaurant', defaultName: '식당' },
        { pattern: /([가-힣\s]+출장소|[가-힣\s]+지점|[가-힣\s]+점)/, type: 'other', defaultName: '장소' }
    ];
    
    placePatterns.forEach(({ pattern, type, defaultName }) => {
        const match = userInput.match(pattern);
        if (match) {
            const placeName = match[1] || match[0] || defaultName;
            locations.push({
                name: placeName,
                type: type,
                address: ''
            });
            if (type !== 'other') {
                behaviorSequence.push(placeName);
            }
        }
    });
    
    // 일반 장소명 추출 (롯데리아, 송탄출장소 등) - 개선
    if (locations.length === 0) {
        // "장소는 XXX" 패턴 (전체 장소명 추출)
        const locationMatch = userInput.match(/장소는\s*([가-힣\s\w]+(?:\s+[가-힣\s\w]+)?)/);
        if (locationMatch) {
            const fullLocation = locationMatch[1].trim();
            locations.push({
                name: fullLocation,
                type: 'other',
                address: ''
            });
        } else {
            // "XXX에", "XXX에서" 패턴
            const locationMatch2 = userInput.match(/([가-힣\s\w]+(?:출장소|지점|점|롯데리아|맥도날드|스타벅스|카페|식당|레스토랑))/);
            if (locationMatch2) {
                locations.push({
                    name: locationMatch2[1].trim(),
                    type: 'other',
                    address: ''
                });
            }
        }
    } else {
        // 이미 장소가 추출된 경우, "장소는 XXX" 패턴으로 전체 장소명 업데이트
        const fullLocationMatch = userInput.match(/장소는\s*([가-힣\s\w]+(?:\s+[가-힣\s\w]+)?)/);
        if (fullLocationMatch) {
            locations[0].name = fullLocationMatch[1].trim();
        }
    }
    
    // 일정 추출 (시간이나 장소가 있으면 일정으로 인식)
    const schedules = [];
    const hasTime = timeMatch !== null;
    const hasLocation = locations.length > 0;
    const hasDate = targetDate !== null;
    
    // 시간, 날짜, 장소 중 하나라도 있으면 일정으로 인식
    if (hasScheduleIntent || (hasTime && hasLocation) || (hasDate && hasLocation) || (hasTime && hasDate)) {
        // 일정 제목 추출
        let scheduleTitle = '일정';
        if (text.includes('저녁약속') || text.includes('저녁')) {
            scheduleTitle = '저녁약속';
        } else if (text.includes('점심약속') || text.includes('점심')) {
            scheduleTitle = '점심약속';
        } else if (text.includes('아침')) {
            scheduleTitle = '아침약속';
        } else if (locations.length > 0) {
            scheduleTitle = locations[0].name + (text.includes('약속') ? ' 약속' : ' 방문');
        } else if (text.includes('약속')) {
            scheduleTitle = '약속';
        } else if (text.includes('만나기') || text.includes('만날')) {
            scheduleTitle = '만나기';
        } else {
            // 장소명이나 병원명 추출
            const hospitalMatch = userInput.match(/([가-힣\s]+병원)/);
            if (hospitalMatch) {
                scheduleTitle = `${hospitalMatch[1]} 방문`;
            } else if (locations.length > 0) {
                scheduleTitle = `${locations[0].name} 방문`;
            }
        }
        
        schedules.push({
            title: scheduleTitle,
            location: locations.length > 0 ? locations[0].name : '',
            dayOfWeek: dayOfWeek,
            date: targetDate,
            time: extractedTime,
            repeat: hasRepeat,
            repeatType: hasRepeat ? repeatType : 'weekly'
        });
    }
    
    // 행동 순서가 있으면
    const hasBehaviorPattern = behaviorSequence.length > 0 && (
        text.includes('갔다가') || text.includes('다음에') || text.includes('그 다음') || 
        text.includes('후에') || text.includes('그리고')
    );
    
    return {
        type: schedules.length > 0 && hasBehaviorPattern ? 'mixed' : 
              schedules.length > 0 ? 'schedule' : 
              hasBehaviorPattern ? 'behavior' : 'message',
        schedules: schedules.length > 0 ? schedules : undefined,
        behaviorPattern: hasBehaviorPattern ? {
            sequence: behaviorSequence,
            notes: userInput
        } : undefined,
        locations: locations.length > 0 ? locations : undefined,
        message: userInput,
        summary: `일정: ${schedules.length > 0 ? '추출됨' : '없음'}, 행동순서: ${hasBehaviorPattern ? behaviorSequence.join(' → ') : '없음'}`,
        originalInput: userInput
    };
};

/**
 * 파싱된 명령을 실제 일정 데이터로 변환
 * @param {Object} parsedCommand - 파싱된 명령
 * @returns {Array} 일정 목록
 */
export const convertToSchedules = (parsedCommand) => {
    if (!parsedCommand.schedules || parsedCommand.schedules.length === 0) {
        return [];
    }
    
    const schedules = [];
    const today = new Date();
    
    parsedCommand.schedules.forEach((schedule, idx) => {
        let targetDate = null;
        
        // date 필드가 있으면 우선 사용
        if (schedule.date) {
            const dateStr = schedule.date;
            // "오늘", "내일", "모레" 같은 상대적 날짜 처리
            if (dateStr === '오늘' || dateStr.toLowerCase().includes('오늘')) {
                targetDate = new Date(today);
            } else if (dateStr === '내일' || dateStr.toLowerCase().includes('내일')) {
                targetDate = new Date(today);
                targetDate.setDate(targetDate.getDate() + 1);
            } else if (dateStr === '모레' || dateStr.toLowerCase().includes('모레')) {
                targetDate = new Date(today);
                targetDate.setDate(targetDate.getDate() + 2);
            } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // YYYY-MM-DD 형식이면 파싱
                const parsedDate = new Date(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                    // 과거 날짜인지 확인 (현재 날짜보다 1일 이상 이전이면 오늘로 변경)
                    const todayStart = new Date(today);
                    todayStart.setHours(0, 0, 0, 0);
                    const parsedDateStart = new Date(parsedDate);
                    parsedDateStart.setHours(0, 0, 0, 0);
                    
                    if (parsedDateStart < todayStart) {
                        // 과거 날짜면 오늘로 변경
                        console.warn(`⚠️ 과거 날짜 감지: ${dateStr} → 오늘로 변경`);
                        targetDate = new Date(today);
                    } else {
                        targetDate = parsedDate;
                    }
                } else {
                    // 파싱 실패 시 오늘로 설정
                    targetDate = new Date(today);
                }
            } else {
                // 날짜 파싱 시도
                const parsedDate = new Date(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                    // 과거 날짜인지 확인
                    const todayStart = new Date(today);
                    todayStart.setHours(0, 0, 0, 0);
                    const parsedDateStart = new Date(parsedDate);
                    parsedDateStart.setHours(0, 0, 0, 0);
                    
                    if (parsedDateStart < todayStart) {
                        console.warn(`⚠️ 과거 날짜 감지: ${dateStr} → 오늘로 변경`);
                        targetDate = new Date(today);
                    } else {
                        targetDate = parsedDate;
                    }
                } else {
                    // 파싱 실패 시 오늘로 설정
                    targetDate = new Date(today);
                }
            }
        } else if (schedule.dayOfWeek !== null && schedule.dayOfWeek !== undefined) {
            // 요일이 있으면 다음 해당 요일 찾기
            targetDate = new Date(today);
            const currentDay = today.getDay();
            let daysUntilTarget = schedule.dayOfWeek - currentDay;
            if (daysUntilTarget <= 0) {
                daysUntilTarget += 7; // 다음 주
            }
            targetDate.setDate(today.getDate() + daysUntilTarget);
        } else {
            // 날짜 정보가 없으면 오늘로 설정
            targetDate = new Date(today);
        }
        
        // 유효한 날짜인지 확인
        if (isNaN(targetDate.getTime())) {
            targetDate = new Date(today);
        }
        
        const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
        
        // 시간 검증 및 정규화
        let timeStr = schedule.time || '12:00';
        
        // 원본 입력에서 시간 정보 재확인 (오후/오전 처리)
        const originalInput = parsedCommand.originalInput || '';
        const originalLower = originalInput.toLowerCase();
        
        // HH:MM 형식 확인
        if (!timeStr.match(/^\d{2}:\d{2}$/)) {
            // 형식이 맞지 않으면 기본값 사용
            timeStr = '12:00';
        } else {
            // 시간이 06:00이고 원본에 "오후 6시"가 있으면 18:00으로 수정
            if (timeStr === '06:00' && (originalLower.includes('오후 6') || originalLower.includes('오후6') || originalLower.includes('저녁'))) {
                timeStr = '18:00';
                console.log('⏰ 시간 수정: 06:00 → 18:00 (오후 6시 감지)');
            }
            // 시간이 06:00이고 원본에 "오전 6시"가 있으면 그대로 유지
            // 시간이 18:00인데 원본에 "오전 6시"가 있으면 06:00으로 수정
            else if (timeStr === '18:00' && (originalLower.includes('오전 6') || originalLower.includes('오전6'))) {
                timeStr = '06:00';
                console.log('⏰ 시간 수정: 18:00 → 06:00 (오전 6시 감지)');
            }
            // 시간이 12:00 이하이고 원본에 "오후"가 있으면 12시간 추가
            else if (parseInt(timeStr.split(':')[0]) < 12 && originalLower.includes('오후')) {
                const hour = parseInt(timeStr.split(':')[0]);
                const minute = parseInt(timeStr.split(':')[1]) || 0;
                const newHour = hour + 12;
                timeStr = `${String(newHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                console.log(`⏰ 시간 수정: ${hour}:${String(minute).padStart(2, '0')} → ${timeStr} (오후 감지)`);
            }
        }
        
        schedules.push({
            title: schedule.title || '일정',
            date: dateStr,
            time: timeStr,
            location: schedule.location || '',
            category: schedule.type === 'hospital' ? 'hospital' : 'personal',
            repeat: schedule.repeat || false,
            repeatType: schedule.repeatType || 'weekly'
        });
    });
    
    return schedules;
};

/**
 * 행동 패턴을 저장 형식으로 변환
 * @param {Object} parsedCommand - 파싱된 명령
 * @returns {Object} 행동 패턴 데이터
 */
export const convertToBehaviorPattern = (parsedCommand) => {
    if (!parsedCommand.behaviorPattern || !parsedCommand.behaviorPattern.sequence) {
        return null;
    }
    
    return {
        sequence: parsedCommand.behaviorPattern.sequence,
        notes: parsedCommand.behaviorPattern.notes,
        createdAt: new Date().toISOString()
    };
};
