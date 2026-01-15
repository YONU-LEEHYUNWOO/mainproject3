import React, { useEffect, useRef, useState } from 'react';
import ChatInterface from '../../../components/ChatInterface';
import { t } from '../../../i18n';
import { executeVoiceCommand } from '../../../handlers/voiceHandlers';
import { handleYesNoResponse } from '../../../handlers/chatHandlers';
import { fetchMultiAgentAnalysis } from '../../../services/aiService';
import { handleScheduleQuery, analyzeAndNotifyNewTask } from '../../../services/scheduleService';
import { parseNaturalLanguageCommand, convertToSchedules } from '../../../utils/naturalLanguageProcessor';
import { isTaskCompleted } from '../../../utils/dateFormat';
import { createSpeechRecognition, abortSpeechRecognition, isSpeechRecognitionSupported } from '../../../utils/speechRecognition';
import { SYSTEM_PROMPT } from '../../../data/prompts';

// 채팅 기능 진입 컴포넌트 (App.jsx에서 호출)
const ChatFeature = (props) => {
    const {
        chatHistory,
        setChatHistory,
        confirmedTasks,
        setConfirmedTasks,
        setSelectedTaskId,
        locationInfo,
        currentGPSLocation,
        dailyActivities,
        loadActivitiesHistory,
        language,
        pendingQuestion,
        setPendingQuestion,
        setCurrentHospitalTask,
        setRestMode,
        setLastActivityTime
    } = props;

    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false); // 음성 인식 지원 여부
    const [isVoiceRecording, setIsVoiceRecording] = useState(false); // 음성 녹음 상태
    const [voiceRecordingMode, setVoiceRecordingMode] = useState(null); // 음성 인식 모드
    const speechRecognitionRef = useRef(null); // 음성 인식 인스턴스 참조
    const isRecordingRef = useRef(false); // 음성 인식 실행 중 여부 추적

    // 음성 인식 지원 여부 확인 및 초기화
    useEffect(() => {
        const supported = isSpeechRecognitionSupported();
        setSpeechRecognitionSupported(supported);

        if (supported) {
            // 음성 인식 인스턴스 생성 (언어는 현재 선택된 언어에 맞춤)
            const lang = language === 'ko' ? 'ko-KR' : language === 'en' ? 'en-US' : 'ja-JP';
            speechRecognitionRef.current = createSpeechRecognition({
                continuous: false,
                interimResults: false,
                lang: lang
            });
        }

        return () => {
            // 컴포넌트 언마운트 시 음성 인식 정리
            if (speechRecognitionRef.current) {
                abortSpeechRecognition(speechRecognitionRef.current);
            }
        };
    }, [language, setSpeechRecognitionSupported]);

    // 음성 명령 실행을 위한 의존성 바인딩
    const handleExecuteVoiceCommand = (commandType, originalText) => {
        return executeVoiceCommand(commandType, originalText, {
            locationInfo,
            confirmedTasks,
            currentGPSLocation,
            language,
            setChatHistory,
            setRestMode,
            setLastActivityTime,
            setCurrentHospitalTask
        });
    };

    // 예/아니오 응답 핸들러 의존성 바인딩
    const handleBoundYesNoResponse = (response) => {
        handleYesNoResponse(
            response,
            pendingQuestion,
            setPendingQuestion,
            setCurrentHospitalTask,
            setChatHistory,
            language
        );
    };

    // 간단한 일정 추출 함수 (API 호출 없이)
    const extractSimpleSchedule = (userQuery) => {
        // 날짜 패턴 매칭
        const datePatterns = [
            /(\d{1,2})[월\/\-\.](\d{1,2})[일\/\-\.]?/,
            /내일|모레|오늘|어제/,
            /(\d+)일 후|(\d+)일전/
        ];

        // 시간 패턴 매칭
        const timePatterns = [
            /(\d{1,2})시[ (\d{1,2})분]?/,
            /오전|오후|아침|점심|저녁|낮/,
            /(\d{1,2}):(\d{2})/
        ];

        let extractedDate = '';
        let extractedTime = '';

        // 날짜 추출 시도
        for (const pattern of datePatterns) {
            const match = userQuery.match(pattern);
            if (match) {
                if (match[0].includes('오늘')) {
                    const today = new Date();
                    extractedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                } else if (match[0].includes('내일')) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    extractedDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
                } else if (match[1] && match[2]) {
                    const year = new Date().getFullYear();
                    const month = parseInt(match[1]);
                    const day = parseInt(match[2]);
                    extractedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                }
                break;
            }
        }

        // 시간 추출 시도
        for (const pattern of timePatterns) {
            const match = userQuery.match(pattern);
            if (match) {
                if (match[0].includes(':')) {
                    extractedTime = match[0];
                } else if (match[1]) {
                    const hour = parseInt(match[1]);
                    extractedTime = `${String(hour).padStart(2, '0')}:00`;
                }
                break;
            }
        }

        // 날짜와 시간이 모두 추출되었으면 간단한 일정으로 처리
        if (extractedDate && extractedTime) {
            return {
                type: 'create',
                date: extractedDate,
                time: extractedTime,
                title: userQuery.replace(/[\d\/\-\.월일시분]/g, '').trim() || '일정',
                location: '',
                category: 'personal',
                analysis: {
                    traffic: null,
                    work: '',
                    life: '',
                    requirements: []
                }
            };
        }

        return null;
    };

    // 위치 요청 감지 함수 (노인분들을 위한 단순하고 명확한 키워드)
    const detectLocationRequest = (userQuery) => {
        const queryLower = userQuery.toLowerCase().trim();

        // 집 관련 키워드 (노인분들이 자주 사용하는 표현 추가)
        const homeKeywords = [
            '집', '집으로', '집에', '귀가', '집에 가', '집으로 가',
            '집에 가고 싶어', '집에 가려고', '집에 가야 해', '집에 가야겠어',
            '집에 가야 해요', '집에 가야겠네', '집에 가볼까', '집에 가야겠다',
            '집 가야 해', '집 가야겠어', '집 가', '집으로', '집으로 돌아가',
            '돌아가', '돌아가야 해', '돌아가야겠어', '집에 돌아가'
        ];
        const homeMatch = homeKeywords.some(keyword => queryLower.includes(keyword.toLowerCase()));

        if (homeMatch) {
            return {
                destination: '집',
                destinationType: 'home',
                detected: true
            };
        }

        // 마트 관련 키워드 (장보기 표현 다양화)
        const martKeywords = [
            '마트', '마트로', '마트에', '마트에 가', '마트에 가고 싶어',
            '마트에 가려고', '마트에 가야 해', '마트에 가야겠어',
            '마트 가', '마트 가야 해', '마트 가야겠어', '마트 가볼까',
            '장보러', '장보기', '장을 보러', '장을 보러 가', '장보러 가',
            '장보기 가', '장보기 하러', '장보기 해야 해', '장보기 해야겠어',
            '장을 봐야 해', '장을 봐야겠어', '장 볼려고', '장 볼까'
        ];
        const martMatch = martKeywords.some(keyword => queryLower.includes(keyword.toLowerCase()));

        if (martMatch) {
            return {
                destination: '마트',
                destinationType: 'mart',
                detected: true
            };
        }

        // 약국 관련 키워드 (약 사러 가는 표현 포함)
        const pharmacyKeywords = [
            '약국', '약국으로', '약국에', '약국에 가', '약국에 가고 싶어',
            '약국에 가려고', '약국에 가야 해', '약국에 가야겠어',
            '약국 가', '약국 가야 해', '약국 가야겠어', '약국 가볼까',
            '약국으로 가', '약국으로 가고 싶어', '약 사러', '약 사러 가',
            '약 받으러', '약 받으러 가', '약 받으러 가야 해'
        ];
        const pharmacyMatch = pharmacyKeywords.some(keyword => queryLower.includes(keyword.toLowerCase()));

        if (pharmacyMatch) {
            return {
                destination: '약국',
                destinationType: 'pharmacy',
                detected: true
            };
        }

        // 병원 관련 키워드 (진찰/진료 관련 표현 포함)
        const hospitalKeywords = [
            '병원', '병원으로', '병원에', '병원에 가', '병원에 가고 싶어',
            '병원에 가려고', '병원에 가야 해', '병원에 가야겠어',
            '병원 가', '병원 가야 해', '병원 가야겠어', '병원 가볼까',
            '병원으로 가', '병원으로 가고 싶어', '진찰 받으러', '진찰 받으러 가',
            '진료 받으러', '진료 받으러 가', '병원 가야 해', '병원 다녀와야 해'
        ];
        const hospitalMatch = hospitalKeywords.some(keyword => queryLower.includes(keyword.toLowerCase()));

        if (hospitalMatch) {
            // 오늘 병원 일정이 있는지 확인
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const hospitalTasks = confirmedTasks.filter(task =>
                (task.title.includes('병원') || task.location?.includes('병원')) &&
                task.date === todayStr &&
                !isTaskCompleted(task.date, task.time, task.completed)
            );

            if (hospitalTasks.length > 0) {
                // 병원 일정이 있으면 병원 이동 지원으로 연결
                return {
                    destination: hospitalTasks[0].location || '병원',
                    destinationType: 'hospital',
                    detected: true,
                    task: hospitalTasks[0]
                };
            } else {
                // 병원 일정이 없으면 일반 위치 안내
                return {
                    destination: '병원',
                    destinationType: 'hospital',
                    detected: true
                };
            }
        }

        // 편의점 관련 키워드
        const convenienceKeywords = [
            '편의점', '편의점으로', '편의점에', '편의점에 가', '편의점에 가고 싶어',
            '편의점에 가려고', '편의점에 가야 해', '편의점에 가야겠어',
            '편의점 가', '편의점 가야 해', '편의점 가야겠어', '편의점 가볼까',
            '편의점으로 가', '편의점으로 가자', '편의점 가자'
        ];
        const convenienceMatch = convenienceKeywords.some(keyword => queryLower.includes(keyword.toLowerCase()));

        if (convenienceMatch) {
            return {
                destination: '편의점',
                destinationType: 'convenience',
                detected: true
            };
        }

        // 일반 장소 키워드 감지 (카페, 영화관, 마트, 약국 등 다른 장소)
        // 이미 처리된 키워드(집, 마트, 약국, 병원, 편의점)가 아닌 경우 키워드 검색으로 처리
        const placePattern = /(?:.*?)(?:으로|로|에)\s*(?:가|가자|가고|가야|가볼까)/;
        const hasPlacePattern = placePattern.test(queryLower);

        if (hasPlacePattern && !homeMatch && !martMatch && !pharmacyMatch && !hospitalMatch && !convenienceMatch) {
            // 장소 키워드 추출
            const placeKeywords = ['카페', '영화관', '극장', '식당', '음식점', '서점', '도서관', '공원', '은행', '우체국', '미용실', '세탁소', '목욕탕', '찜질방'];
            const foundPlaceKeyword = placeKeywords.find(keyword => queryLower.includes(keyword));

            if (foundPlaceKeyword) {
                return {
                    destination: foundPlaceKeyword,
                    destinationType: 'custom',
                    detected: true,
                    shouldSearch: true // 키워드 검색 필요
                };
            }
        }

        return { detected: false };
    };

    // 일정 완료 감지 함수
    const detectTaskCompletion = (userQuery, tasks) => {
        // 노인분들이 자주 사용하는 완료 표현 (더 다양한 표현 추가)
        const completionKeywords = [
            '완료', '끝', '다 했', '다했', '다녀왔', '다녀왔다', '갔다 왔', '갔다왔',
            '마쳤', '끝났', '끝났어', '완료했', '완료됐', '완료했어', '완료됐어',
            '했어', '했어요', '했음', '했네', '했네요', '했습니다',
            '끝냈', '끝냈어', '끝냈어요', '마쳤어', '마쳤어요',
            '다 끝', '모두 끝', '모두 완료', '전부 완료', '다 끝났',
            '끝냈네', '끝났네', '다 왔어', '다 왔어요', '다녀왔어', '다녀왔어요',
            '갔다 왔어', '갔다 왔어요', '다 했어', '다 했어요', '다 했네', '다 했네요'
        ];

        const queryLower = userQuery.toLowerCase();
        const hasCompletionKeyword = completionKeywords.some(keyword =>
            queryLower.includes(keyword.toLowerCase())
        );

        if (!hasCompletionKeyword) return null;

        // 가장 최근 일정이나 오늘 일정 중에서 매칭
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // 오늘 일정 우선
        const todayTasks = tasks.filter(task =>
            task.date === todayStr &&
            !isTaskCompleted(task.date, task.time, task.completed)
        );

        if (todayTasks.length > 0) {
            // 사용자 입력에 일정명이 포함되어 있으면 해당 일정 우선
            const mentionedTask = todayTasks.find(task =>
                userQuery.includes(task.title) ||
                (task.location && userQuery.includes(task.location))
            );

            if (mentionedTask) return mentionedTask;

            // 명시적으로 언급되지 않았으면 가장 가까운 시간의 일정
            return todayTasks.sort((a, b) => {
                const timeA = a.time || '23:59';
                const timeB = b.time || '23:59';
                return timeA.localeCompare(timeB);
            })[0];
        }

        // 오늘 일정이 없으면 가장 최근 일정
        const upcomingTasks = tasks
            .filter(task => !isTaskCompleted(task.date, task.time, task.completed))
            .sort((a, b) => {
                const dateA = new Date(a.date + ' ' + (a.time || '23:59'));
                const dateB = new Date(b.date + ' ' + (b.time || '23:59'));
                return dateA - dateB;
            });

        if (upcomingTasks.length > 0) {
            const mentionedTask = upcomingTasks.find(task =>
                userQuery.includes(task.title) ||
                (task.location && userQuery.includes(task.location))
            );

            return mentionedTask || upcomingTasks[0];
        }

        return null;
    };

    // 메시지 전송 핸들러 (채팅 입력 전용)
    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const userMsg = input;
        setInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg, timestamp: Date.now() }]);
        setIsProcessing(true);

        try {
            const userMsgLower = userMsg.toLowerCase();

            // 택시 호출 감지 (주변 검색보다 우선)
            const taxiKeywords = ['택시', '택시로', '택시 타', '택시 타고', '택시 부르', '택시 호출', '택시 불러', '택시 잡'];
            const hasTaxiKeyword = taxiKeywords.some(keyword => userMsgLower.includes(keyword.toLowerCase()));

            if (hasTaxiKeyword) {
                // 택시 목적지 추출
                const destinationMatch = userMsgLower.match(/택시\s*(?:로|타고|부르|호출|불러|잡)?\s*(?:가|갈|가서)?\s*(.+?)(?:에|으로|로|까지|가|갈|가서|$)/);
                let destination = destinationMatch && destinationMatch[1] ? destinationMatch[1].trim() : null;

                // "주변 XX" 패턴 처리
                if (!destination && userMsgLower.includes('주변')) {
                    const nearbyMatch = userMsgLower.match(/주변\s+([^\s]+(?:\s+[^\s]+)*?)(?:\s+(?:으로|로|에|까지|가|갈|가서|택시|잡|부르|호출|불러|$))/);
                    if (nearbyMatch && nearbyMatch[1]) {
                        destination = nearbyMatch[1].trim();
                    }
                }

                if (!destination) {
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        content: '어디로 가실 건가요? 목적지를 말씀해주세요. (예: "택시로 병원 가", "택시 타고 마트 가")',
                        timestamp: Date.now()
                    }]);
                    setIsProcessing(false);
                    return;
                }

                // 택시 호출 메시지 표시
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: `🚕 ${destination}로 택시를 호출하시겠어요?`,
                    type: 'taxiRequest',
                    destination: destination,
                    timestamp: Date.now()
                }]);
                setIsProcessing(false);
                return;
            }

            // "주변" 키워드 검색 처리 (택시 호출이 아닌 경우만)
            if (userMsgLower.includes('주변')) {
                try {
                    // 정규식으로 키워드 직접 추출 (개선된 버전)
                    let keyword = null;

                    // 먼저 "주변" 뒤의 모든 단어들을 추출 (공백 포함 가능)
                    // 패턴: "주변 [키워드들] [검색/찾아 등의 동사]"
                    const keywordMatch = userMsg.match(/주변\s+([^\s]+(?:\s+[^\s]+)*?)(?:\s+(?:검색|찾아|알려|보여|줘|줄래|주세요|해줘|해주세요|해|해주|할래|할까|있어|없어|있나|없나|있어요|없어요|있나요|없나요|입니다|이다|다|요|이요|할수|있나요|없나요|\?|!|\.|,|\n|$))/);

                    if (keywordMatch && keywordMatch[1]) {
                        keyword = keywordMatch[1].trim();
                    } else {
                        // 더 단순한 패턴: "주변" 뒤의 첫 번째 단어
                        const simpleMatch = userMsg.match(/주변\s+([^\s]+)/);
                        if (simpleMatch && simpleMatch[1]) {
                            keyword = simpleMatch[1].trim();
                        }
                    }

                    // "편의점" 같은 복합어 처리: "편"만 추출된 경우 "편의점"으로 보정
                    if (keyword === '편' && userMsg.includes('편의점')) {
                        keyword = '편의점';
                    }

                    // "편의"만 추출된 경우도 "편의점"으로 보정
                    if (keyword === '편의' && userMsg.includes('편의점')) {
                        keyword = '편의점';
                    }

                    if (!keyword) {
                        setChatHistory(prev => [...prev, {
                            role: 'assistant',
                            content: '어떤 장소를 찾고 계신가요? 예: "주변 식당", "주변 편의점" 등',
                            timestamp: Date.now()
                        }]);
                        setIsProcessing(false);
                        return;
                    }

                    console.log('🔍 주변 검색 키워드 추출 (handleSend):', keyword, '원본 메시지:', userMsg);

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
                    setIsProcessing(false);
                    return;
                } catch (error) {
                    console.error('❌ 주변 검색 실패:', error);
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        content: '주변 장소 검색 중 오류가 발생했습니다. 다시 시도해주세요.',
                        timestamp: Date.now()
                    }]);
                    setIsProcessing(false);
                    return;
                }
            }

            // 기타 장소 질문에 대한 응답 처리 (장소명 입력 감지)
            const lastMessage = chatHistory[chatHistory.length - 1];
            if (lastMessage && lastMessage.role === 'assistant' &&
                (lastMessage.content?.includes('어떤 장소로 가시겠어요') ||
                    lastMessage.content?.includes('장소 이름을 말씀해주세요') ||
                    lastMessage.type === 'placeSearchPrompt')) {

                // 사용자 입력을 장소명으로 인식하고 키워드 분석 후 검색
                const keyword = userMsg.trim();
                if (keyword) {
                    try {
                        setIsProcessing(true);

                        // GPS 위치 또는 집 주소를 기준으로 검색
                        const lat = currentGPSLocation?.lat || locationInfo?.home?.lat || 37.5665;
                        const lng = currentGPSLocation?.lng || locationInfo?.home?.lng || 126.9780;

                        console.log('🔍 키워드 장소 검색 시작:', { keyword, lat, lng });

                        // 키워드를 카테고리로 매핑 (우선순위: 카테고리 검색 > 키워드 검색)
                        const { searchNearbyPlaces, searchPlacesByKeyword, CATEGORY_CODES } = await import('../../../utils/kakaoLocalApi');

                        // 키워드에서 장소 타입 추출
                        const keywordLower = keyword.toLowerCase();
                        let categoryCode = null;
                        let searchKeyword = keyword;

                        // 카테고리 매핑 (자연어 처리)
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

                        // 카테고리 매핑이 성공하면 카테고리 검색 사용
                        if (categoryCode) {
                            results = await searchNearbyPlaces({
                                lat,
                                lng,
                                category: categoryCode,
                                radius: categoryCode === CATEGORY_CODES.CONVENIENCE ? 2000 : 5000,
                                size: 15
                            });
                        } else {
                            // 카테고리 매핑 실패 시 키워드 검색 사용
                            results = await searchPlacesByKeyword({
                                lat,
                                lng,
                                keyword: searchKeyword,
                                radius: 5000,
                                size: 15
                            });
                        }

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
                        setIsProcessing(false);
                        return;
                    } catch (error) {
                        console.error('❌ 장소 검색 실패:', error);
                        setChatHistory(prev => [...prev, {
                            role: 'assistant',
                            content: '장소 검색 중 오류가 발생했습니다. 다시 시도해주세요.',
                            timestamp: Date.now()
                        }]);
                        setIsProcessing(false);
                        return;
                    }
                }
            }

            // 위치 요청 감지 (API 호출 없이 로컬에서 처리) - 일정 조회보다 먼저 체크
            const locationRequest = detectLocationRequest(userMsg);
            if (locationRequest.detected) {
                if (locationRequest.task) {
                    // 병원 일정이 있는 경우 병원 이동 지원 화면 표시
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        type: 'hospitalTransport',
                        content: `${locationRequest.task.time}까지 ${locationRequest.destination}에 도착하시려면 이동 준비가 필요합니다.`,
                        task: locationRequest.task,
                        timestamp: Date.now()
                    }]);
                    setIsProcessing(false);
                    return;
                } else if (locationRequest.shouldSearch) {
                    // 키워드 검색이 필요한 경우 (카페, 영화관 등)
                    try {
                        const keyword = locationRequest.destination;

                        // GPS 위치 또는 집 주소를 기준으로 검색
                        const lat = currentGPSLocation?.lat || locationInfo?.home?.lat || 37.5665;
                        const lng = currentGPSLocation?.lng || locationInfo?.home?.lng || 126.9780;

                        console.log('🔍 자연어 입력 키워드 검색 시작:', { keyword, lat, lng });

                        // 카카오 로컬 API 키워드 검색 사용
                        const { searchPlacesByKeyword } = await import('../../../utils/kakaoLocalApi');
                        const results = await searchPlacesByKeyword({
                            lat,
                            lng,
                            keyword,
                            radius: 5000, // 5km 반경
                            size: 15
                        });

                        console.log('📋 자연어 키워드 검색 결과:', results);

                        // 과거 방문 장소 기반 정렬 적용
                        if (Array.isArray(results) && results.length > 0) {
                            const { getVisitedPlaces, sortPlacesByVisitHistory } = await import('../../../utils/placeRecommendation');
                            const visitedPlaces = getVisitedPlaces(dailyActivities, loadActivitiesHistory());
                            const sortedResults = sortPlacesByVisitHistory(results, visitedPlaces);
                            console.log('✅ 자연어 검색 방문 이력 기반 정렬 완료:', { visitedCount: visitedPlaces.length, sortedCount: sortedResults.length });

                            // 검색 결과가 있으면 리스트 표시
                            setChatHistory(prev => [...prev, {
                                role: 'assistant',
                                type: 'placeSearchResults',
                                content: `"${keyword}" 검색 결과입니다. 원하시는 장소를 선택해주세요.`,
                                keyword: keyword,
                                places: sortedResults,
                                timestamp: Date.now()
                            }]);
                        } else {
                            // 검색 결과가 없을 때 기본 길 안내 시도
                            setChatHistory(prev => [...prev, {
                                role: 'assistant',
                                type: 'locationGuidance',
                                content: `${keyword}로 가는 길을 알려드릴게요.`,
                                destination: keyword,
                                destinationType: 'custom',
                                timestamp: Date.now()
                            }]);
                        }
                    } catch (error) {
                        console.error('❌ 자연어 키워드 장소 검색 실패:', error);
                        // 검색 실패 시 기본 길 안내 시도
                        setChatHistory(prev => [...prev, {
                            role: 'assistant',
                            type: 'locationGuidance',
                            content: `${locationRequest.destination}로 가는 길을 알려드릴게요.`,
                            destination: locationRequest.destination,
                            destinationType: locationRequest.destinationType,
                            timestamp: Date.now()
                        }]);
                    }
                    setIsProcessing(false);
                    return;
                } else {
                    // 일반 위치 안내 화면 표시 (노인분들을 위한 친근하고 단순한 표현)
                    let friendlyMessage = '';
                    if (locationRequest.destination === '집') {
                        friendlyMessage = '집으로 가는 길을 알려드릴게요.';
                    } else if (locationRequest.destination === '마트') {
                        friendlyMessage = '마트로 가는 길을 알려드릴게요.';
                    } else if (locationRequest.destination === '약국') {
                        friendlyMessage = '약국으로 가는 길을 알려드릴게요.';
                    } else if (locationRequest.destination === '병원') {
                        friendlyMessage = '병원으로 가는 길을 알려드릴게요.';
                    } else if (locationRequest.destination === '편의점') {
                        // 편의점은 카테고리 검색으로 처리 (식사 추천처럼)
                        try {
                            // GPS 위치 또는 집 주소를 기준으로 검색
                            const lat = currentGPSLocation?.lat || locationInfo?.home?.lat || 37.5665;
                            const lng = currentGPSLocation?.lng || locationInfo?.home?.lng || 126.9780;

                            console.log('🔍 편의점 카테고리 검색 시작:', { lat, lng });

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
                                // 검색 결과가 없을 때 기본 메시지
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
                        setIsProcessing(false);
                        return;
                    } else {
                        friendlyMessage = `${locationRequest.destination}로 가는 길을 알려드릴게요.`;
                    }

                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        type: 'locationGuidance',
                        content: friendlyMessage,
                        destination: locationRequest.destination,
                        destinationType: locationRequest.destinationType,
                        timestamp: Date.now()
                    }]);
                }
                setIsProcessing(false);
                return;
            }

            // 일정 조회 질문 처리 (API 호출 없이 로컬에서 처리)
            const scheduleQuery = handleScheduleQuery(userMsg);
            if (scheduleQuery) {
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: scheduleQuery.content,
                    timestamp: Date.now()
                }]);
                setIsProcessing(false);
                return;
            }

            // 자연어 일정 추가/수정 감지 (개선된 파싱)
            const scheduleKeywords = ['일정', '등록', '추가', '예약', '약속', '스케줄', '등록해', '추가해', '예약해', '일정 등록', '일정 추가'];
            const modifyKeywords = ['수정', '변경', '바꿔', '고쳐', '일정 수정', '일정 변경'];
            const hasScheduleKeyword = scheduleKeywords.some(keyword => userMsg.toLowerCase().includes(keyword));
            const hasModifyKeyword = modifyKeywords.some(keyword => userMsg.toLowerCase().includes(keyword));
            const hasTimeOrDate = /\d{1,2}[시일월]|\d{1,2}:\d{2}|오늘|내일|모레|다음주|매주|매일|화요일|수요일|목요일|금요일|토요일|일요일|월요일/.test(userMsg);

            // 일정 수정 요청 처리
            if (hasModifyKeyword && confirmedTasks.length > 0) {
                // 기존 일정 찾기
                const mentionedTask = confirmedTasks.find(task =>
                    userMsg.includes(task.title) ||
                    (task.location && userMsg.includes(task.location))
                );

                if (mentionedTask) {
                    try {
                        const parsed = await parseNaturalLanguageCommand(userMsg);
                        if (parsed.schedules && parsed.schedules.length > 0) {
                            const schedules = convertToSchedules(parsed);
                            if (schedules.length > 0) {
                                const schedule = schedules[0];
                                const updatedTask = {
                                    ...mentionedTask,
                                    title: schedule.title || mentionedTask.title,
                                    date: schedule.date || mentionedTask.date,
                                    time: schedule.time || mentionedTask.time,
                                    location: schedule.location || mentionedTask.location,
                                    repeat: schedule.repeat !== undefined ? schedule.repeat : mentionedTask.repeat,
                                    repeatType: schedule.repeatType || mentionedTask.repeatType
                                };

                                setChatHistory(prev => [...prev, {
                                    role: 'assistant',
                                    type: 'proposal',
                                    proposal: {
                                        type: 'update',
                                        question: `"${mentionedTask.title}" 일정을 수정하시겠습니까?`,
                                        data: updatedTask
                                    },
                                    timestamp: Date.now()
                                }]);

                                setIsProcessing(false);
                                return;
                            }
                        }
                    } catch (error) {
                        console.error('자연어 일정 수정 파싱 오류:', error);
                    }
                }
            }

            // 일정 추가 요청 처리
            if (hasScheduleKeyword || (hasTimeOrDate && (userMsg.includes('병원') || userMsg.includes('약국') || userMsg.includes('마트') || userMsg.includes('약속')))) {
                try {
                    // 자연어 파싱 시도
                    const parsed = await parseNaturalLanguageCommand(userMsg);

                    if (parsed.schedules && parsed.schedules.length > 0) {
                        const schedules = convertToSchedules(parsed);

                        if (schedules.length > 0) {
                            const schedule = schedules[0];
                            const newTask = {
                                id: Date.now(),
                                title: schedule.title,
                                date: schedule.date,
                                time: schedule.time,
                                location: schedule.location,
                                category: schedule.category || 'personal',
                                repeat: schedule.repeat || false,
                                repeatType: schedule.repeatType || 'weekly',
                                reminderActive: true,
                                analysis: {
                                    work: '',
                                    life: '일정을 잘 수행하시길 바랍니다.',
                                    requirements: [],
                                    traffic: null
                                }
                            };

                            setChatHistory(prev => [...prev, {
                                role: 'assistant',
                                type: 'proposal',
                                proposal: {
                                    type: 'add',
                                    question: `${schedule.date} ${schedule.time}에 "${schedule.title}" 일정을 등록할까요?`,
                                    data: newTask
                                },
                                timestamp: Date.now()
                            }]);

                            // 반복 일정인 경우 다음 일정들도 생성
                            if (schedule.repeat) {
                                const { generateUpcomingRecurringTasks } = await import('../../../utils/scheduleRecurrence');
                                const recurringTasks = generateUpcomingRecurringTasks(newTask, schedule.repeatType || 'weekly');
                                if (recurringTasks.length > 0) {
                                    setChatHistory(prev => [...prev, {
                                        role: 'assistant',
                                        content: `반복 일정으로 설정되어 앞으로 ${recurringTasks.length}개의 일정이 자동으로 추가됩니다.`,
                                        timestamp: Date.now()
                                    }]);
                                }
                            }

                            setIsProcessing(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('자연어 일정 파싱 오류:', error);
                    // 오류가 나도 기존 로직으로 진행
                }
            }

            // 일정 완료 감지 (API 호출 없이 로컬에서 처리)
            const completedTask = detectTaskCompletion(userMsg, confirmedTasks);

            if (completedTask) {
                // 일정 완료 처리
                setConfirmedTasks(prev => prev.map(t =>
                    t.id === completedTask.id
                        ? { ...t, completed: true, completedAt: new Date().toISOString() }
                        : t
                ));

                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: `"${completedTask.title}" 일정이 완료되었습니다. 수고하셨습니다!`,
                    timestamp: Date.now()
                }]);
                setIsProcessing(false);
                return;
            }

            // 간단한 일정 추출 시도 (API 호출 없이)
            const simpleSchedule = extractSimpleSchedule(userMsg);

            // 간단한 패턴 매칭이 가능하면 API 호출 생략
            if (simpleSchedule) {
                const newTask = {
                    id: Date.now(),
                    ...simpleSchedule,
                    reminderActive: true,
                    analysis: {
                        work: '',
                        life: '일정을 잘 수행하시길 바랍니다.',
                        requirements: [],
                        traffic: null
                    }
                };
                setConfirmedTasks(prev => [...prev, newTask]);
                setSelectedTaskId(newTask.id);
                // 일정 분석 및 안내 메시지 생성
                analyzeAndNotifyNewTask(newTask);
                setIsProcessing(false);
                return;
            }

            // 병원 방문 도움 요청 감지 ("도와줘", "도와", "도와주세요" 등)
            const helpKeywords = ['도와줘', '도와', '도와주세요', '도와줄래', '도와줄 수 있어', '도와줄까', '도와드릴까요'];
            const isHelpRequest = helpKeywords.some(keyword => userMsg.toLowerCase().includes(keyword));

            // 이전 메시지가 "병원 방문을 도와드릴까요?"인지 확인
            const lastAssistantMsg = chatHistory[chatHistory.length - 1];
            const isHospitalHelpRequest = isHelpRequest &&
                lastAssistantMsg?.content?.includes('병원 방문을 도와드릴까요');

            if (isHospitalHelpRequest) {
                // 병원 방문 도움 요청 처리 (여러 병원 선택 또는 기본 병원 안내)
                const hospitals = locationInfo?.hospitals || [];
                const defaultHospital = locationInfo?.frequentPlaces?.hospital;

                // 기본 병원이 있으면 hospitals 배열에 추가 (중복 제거)
                if (defaultHospital && defaultHospital.address && !hospitals.find(h => h.address === defaultHospital.address)) {
                    hospitals.push(defaultHospital);
                }

                if (hospitals.length > 1) {
                    // 여러 병원이 있으면 선택 화면 표시
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        type: 'hospitalSelection',
                        content: '어느 병원으로 가시겠어요?',
                        hospitals: hospitals,
                        timestamp: Date.now()
                    }]);
                    setIsProcessing(false);
                    return;
                } else if (defaultHospital && defaultHospital.address) {
                    // 기본 병원이 있으면 바로 안내 (GPS 위치 기반 출발지 사용)
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        type: 'locationGuidance',
                        content: `${defaultHospital.name || '병원'}으로 가는 길을 안내해드릴게요. ${currentGPSLocation ? '(현재 위치 기준)' : ''}`,
                        destination: defaultHospital.address || defaultHospital.name || '병원',
                        destinationType: 'hospital',
                        timestamp: Date.now()
                    }]);
                    setIsProcessing(false);
                    return;
                } else {
                    // 병원 정보가 없으면 안내
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        content: '저장된 병원 정보가 없습니다. 위치정보 설정에서 병원을 등록해주세요.',
                        timestamp: Date.now()
                    }]);
                    setIsProcessing(false);
                    return;
                }
            }

            // 복잡한 일정 처리 (AI 분석 필요 시에만 API 호출)
            const data = await fetchMultiAgentAnalysis(userMsg, 0, SYSTEM_PROMPT);

            let proposal;
            if (data.type === 'delete') {
                proposal = {
                    type: 'delete',
                    question: `"${data.title}" 관련 일정을 삭제하시겠습니까?`,
                    data
                };
            } else {
                proposal = {
                    type: data.type,
                    question: data.type === 'update'
                        ? `"${data.title}" 일정을 수정하시겠습니까?`
                        : `${data.date} ${data.time}에 "${data.title}" 일정을 등록할까요?`,
                    data: { ...data, reminderActive: true }
                };
            }

            setChatHistory(prev => [...prev, {
                role: 'assistant',
                type: 'proposal',
                proposal,
                timestamp: Date.now()
            }]);
        } catch (error) {
            console.error('AI 분석 오류:', error);
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: t('error', language),
                timestamp: Date.now()
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ChatInterface
            {...props}
            input={input}
            setInput={setInput}
            isProcessing={isProcessing}
            handleSend={handleSend}
            executeVoiceCommand={handleExecuteVoiceCommand}
            handleYesNoResponse={handleBoundYesNoResponse}
            speechRecognitionSupported={speechRecognitionSupported}
            isVoiceRecording={isVoiceRecording}
            setIsVoiceRecording={setIsVoiceRecording}
            voiceRecordingMode={voiceRecordingMode}
            setVoiceRecordingMode={setVoiceRecordingMode}
            speechRecognitionRef={speechRecognitionRef}
            isRecordingRef={isRecordingRef}
        />
    );
};

export default ChatFeature;
