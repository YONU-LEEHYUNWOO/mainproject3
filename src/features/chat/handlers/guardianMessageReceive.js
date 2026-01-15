// 보호자 메시지 수신/자동 처리 핸들러
// App.jsx에 있던 handleMessageReceive 로직을 그대로 이동

export const handleGuardianMessageReceive = (message, deps) => {
    const {
        setChatHistory,
        addNotification,
        setNotifications,
        ttsEnabled,
        language,
        speakText,
        speechSynthesisRef,
        currentGPSLocation,
        locationInfo,
        dailyActivities,
        loadActivitiesHistory
    } = deps;

    // 음성 메시지 처리
    if (message.type === 'voice' && message.audio) {
        setChatHistory(prev => [...prev, {
            role: 'assistant',
            type: 'voiceMessage',
            content: message.text || '음성 메시지',
            audio: message.audio, // base64 인코딩된 오디오
            timestamp: Date.now()
        }]);
        return;
    }

    // 행동 패턴 지시 처리
    if (message.type === 'instruction' && message.action === 'behaviorPattern' && message.behaviorPattern) {
        const pattern = message.behaviorPattern;
        const sequenceText = pattern.sequence?.join(' → ') || '';

        setChatHistory(prev => [...prev, {
            role: 'assistant',
            type: 'behaviorPattern',
            content: message.text || `오늘은 ${sequenceText} 순서로 방문하시면 좋을 것 같아요.`,
            behaviorPattern: pattern,
            timestamp: Date.now()
        }]);
        return;
    }

    // 텍스트 메시지 처리
    // 부모 앱 채팅에 큰 글씨로 표시
    const guardianMessage = {
        role: 'assistant',
        type: 'guardianMessage',
        content: message.text || message.content || '보호자로부터 메시지가 도착했습니다.',
        message: message,
        timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, guardianMessage]);

    // 알림 센터에 추가
    const notification = addNotification({
        type: 'guardian',
        title: '👨 보호자 메시지',
        message: message.text || message.content || '보호자로부터 메시지가 도착했습니다.',
        priority: message.priority || 'high' // 메시지 우선순위
    });
    setNotifications(prev => [notification, ...prev]);

    // TTS로 메시지 읽어주기 (활성화된 경우)
    if (ttsEnabled && (message.text || message.content)) {
        const textToSpeak = message.text || message.content || '보호자로부터 메시지가 도착했습니다.';
        speakText(textToSpeak, language, ttsEnabled, speechSynthesisRef);
    }

    // 행동 지시 자동 인식 및 처리
    const messageText = (message.text || message.content || '').toLowerCase();

    // "주변" 검색은 가장 먼저 체크 (다른 조건들보다 우선)
    if (messageText.includes('주변')) {
        // "주변 XX" 패턴 감지 - Gemini API를 사용하여 검색 키워드 추출
        setTimeout(async () => {
            try {
                // Gemini API를 사용하여 검색 키워드 추출
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (!apiKey || apiKey === '') {
                    throw new Error('API 키가 설정되지 않았습니다.');
                }

                // 정규식으로 키워드 직접 추출 (더 빠르고 안정적)
                const originalMessage = message.text || message.content || '';
                let keyword = null;

                // "주변 XX" 패턴 추출
                const keywordMatch = originalMessage.match(/주변\s+([^\s을를이가에으로로까지에서의도만은는이요요입니다이다다할까할래있어없어알려찾아보여줘줄래주세요주시겠어주시겠어요할수있나있어요없어요있나요없나요?!.,\n]+)/);
                if (keywordMatch && keywordMatch[1]) {
                    keyword = keywordMatch[1].trim();
                } else {
                    // 더 단순한 패턴 시도: "주변" 뒤의 모든 단어
                    const simpleMatch = originalMessage.match(/주변\s+(\S+)/);
                    if (simpleMatch && simpleMatch[1]) {
                        keyword = simpleMatch[1].trim();
                    }
                }

                if (!keyword) {
                    console.error('검색 키워드를 추출할 수 없습니다:', originalMessage);
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        content: '어떤 장소를 찾고 계신가요? 예: "주변 식당", "주변 편의점" 등',
                        timestamp: Date.now()
                    }]);
                    return;
                }

                console.log('🔍 주변 검색 키워드 추출:', keyword, '원본 메시지:', originalMessage);

                // GPS 위치 또는 집 주소를 기준으로 검색
                const lat = currentGPSLocation?.lat || locationInfo?.home?.lat || 37.5665;
                const lng = currentGPSLocation?.lng || locationInfo?.home?.lng || 126.9780;

                // 키워드를 카테고리로 매핑
                const { searchNearbyPlaces, searchPlacesByKeyword, CATEGORY_CODES } = await import('../../../utils/kakaoLocalApi');
                const keywordLower = keyword.toLowerCase();
                let categoryCode = null;
                let searchKeyword = keyword;

                // 카테고리 매핑
                if (keywordLower.includes('편의점') || keywordLower.includes('편의')) {
                    categoryCode = CATEGORY_CODES.CONVENIENCE;
                    searchKeyword = '편의점';
                } else if (keywordLower.includes('카페') || keywordLower.includes('커피')) {
                    categoryCode = CATEGORY_CODES.CAFE;
                    searchKeyword = '카페';
                } else if (keywordLower.includes('음식점') || keywordLower.includes('식당') || keywordLower.includes('밥') || keywordLower.includes('식사')) {
                    categoryCode = CATEGORY_CODES.RESTAURANT;
                    searchKeyword = '음식점';
                } else if (keywordLower.includes('마트') || keywordLower.includes('슈퍼')) {
                    categoryCode = CATEGORY_CODES.MART;
                    searchKeyword = '마트';
                } else if (keywordLower.includes('약국')) {
                    categoryCode = CATEGORY_CODES.PHARMACY;
                    searchKeyword = '약국';
                } else if (keywordLower.includes('병원')) {
                    categoryCode = CATEGORY_CODES.HOSPITAL;
                    searchKeyword = '병원';
                }

                let results = [];

                // 카테고리 매핑이 성공하면 카테고리 검색 사용 (더 정확함)
                if (categoryCode) {
                    console.log('📍 카테고리 검색 사용:', categoryCode);
                    results = await searchNearbyPlaces({
                        lat,
                        lng,
                        category: categoryCode,
                        radius: categoryCode === CATEGORY_CODES.CONVENIENCE ? 2000 : 5000,
                        size: 15
                    });
                } else {
                    // 카테고리 매핑 실패 시 키워드 검색 사용
                    console.log('📍 키워드 검색 사용:', searchKeyword);
                    results = await searchPlacesByKeyword({
                        lat,
                        lng,
                        keyword: searchKeyword,
                        radius: 5000,
                        size: 15
                    });
                }

                console.log('📋 주변 검색 결과:', results);

                if (Array.isArray(results) && results.length > 0) {
                    // 과거 방문 장소 기반 정렬 적용
                    const { getVisitedPlaces, sortPlacesByVisitHistory } = await import('../../../utils/placeRecommendation');
                    const visitedPlaces = getVisitedPlaces(dailyActivities, loadActivitiesHistory());
                    const sortedResults = sortPlacesByVisitHistory(results, visitedPlaces);

                    // 검색 결과가 있으면 리스트 표시
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        type: 'placeSearchResults',
                        content: `"${searchKeyword}" 주변 검색 결과입니다. 원하시는 장소를 선택해주세요.`,
                        keyword: searchKeyword,
                        places: sortedResults,
                        timestamp: Date.now()
                    }]);
                } else {
                    // 검색 결과가 없을 때
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        content: `주변에 "${searchKeyword}"을(를) 찾을 수 없습니다.`,
                        timestamp: Date.now()
                    }]);
                }
            } catch (error) {
                console.error('❌ 주변 검색 실패:', error);
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: '주변 장소 검색 중 오류가 발생했습니다. 다시 시도해주세요.',
                    timestamp: Date.now()
                }]);
            }
        }, 1000);
    } else if (messageText.includes('편의점')) {
        // 편의점 요청 자동 처리 - 바로 주변 편의점 검색
        setTimeout(async () => {
            try {
                // GPS 위치 또는 집 주소를 기준으로 검색
                const lat = currentGPSLocation?.lat || locationInfo?.home?.lat || 37.5665;
                const lng = currentGPSLocation?.lng || locationInfo?.home?.lng || 126.9780;

                console.log('🔍 편의점 자동 검색 시작:', { lat, lng });

                // 카카오 로컬 API 카테고리 검색 사용 (편의점 카테고리: CS2)
                const { searchNearbyPlaces, CATEGORY_CODES } = await import('../../../utils/kakaoLocalApi');
                const results = await searchNearbyPlaces({
                    lat,
                    lng,
                    category: CATEGORY_CODES.CONVENIENCE, // 편의점 카테고리
                    radius: 2000, // 2km 반경
                    size: 10
                });

                console.log('📋 편의점 검색 결과:', results);

                if (Array.isArray(results) && results.length > 0) {
                    // 검색 결과가 있으면 리스트 표시
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        type: 'placeSearchResults',
                        content: '주변 편의점 검색 결과입니다. 원하시는 편의점을 선택해주세요.',
                        keyword: '편의점',
                        places: results,
                        timestamp: Date.now()
                    }]);
                } else {
                    // 검색 결과가 없을 때
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        content: '주변에 편의점을 찾을 수 없습니다.',
                        timestamp: Date.now()
                    }]);
                }
            } catch (error) {
                console.error('❌ 편의점 검색 실패:', error);
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: '편의점 검색 중 오류가 발생했습니다. 다시 시도해주세요.',
                    timestamp: Date.now()
                }]);
            }
        }, 1000);
    }
};

// App.jsx에는 "import + 조립 + 호출"만 남기기 위한 래퍼 팩토리
// - 기존 App.jsx의 `const handleMessageReceive = (message) => handleGuardianMessageReceive(message, deps)` 패턴을 그대로 유지
export const createHandleMessageReceive = (deps) => {
    return (message) => handleGuardianMessageReceive(message, deps);
};

