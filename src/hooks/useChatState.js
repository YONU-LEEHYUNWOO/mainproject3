import { useState } from 'react';
import { t } from '../i18n';
import {
    loadLastSuggestionHour,
    loadDailySummaryShown,
    loadMorningCareShown,
    loadLastMorningCareDate
} from '../utils/storage';

/**
 * 채팅 관련 상태 관리 훅
 * @returns {Object} 채팅 관련 상태와 setter 함수들
 */
export const useChatState = () => {
    // 채팅 입력 및 히스토리
    const [input, setInput] = useState('');
    const [chatHistory, setChatHistory] = useState([
        {
            role: 'assistant',
            content: t('greeting'),
            timestamp: Date.now()
        }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);

    // 날짜 선택
    const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜 (null = 오늘)

    // 대화 관련 상태
    const [pendingQuestion, setPendingQuestion] = useState(null);
    const [lastSuggestionHour, setLastSuggestionHour] = useState(loadLastSuggestionHour()); // 능동 제안 시간 추적
    const [dailySummaryShown, setDailySummaryShown] = useState(loadDailySummaryShown()); // 하루 요약 표시 여부

    // 저장된 상태 로드 (하루에 한 번만 표시하기 위해 날짜 확인)
    const lastMorningCareDate = loadLastMorningCareDate();
    const todayDateStr = new Date().toDateString();
    const [morningCareShown, setMorningCareShown] = useState(
        lastMorningCareDate === todayDateStr || loadMorningCareShown()
    );

    // 병원 관련 상태
    const [currentHospitalTask, setCurrentHospitalTask] = useState(null); // 현재 병원 일정
    const [hospitalArrivalState, setHospitalArrivalState] = useState(null); // 병원 도착 상태

    // 음성 인식 관련 상태
    const [isVoiceRecording, setIsVoiceRecording] = useState(false); // 음성 녹음 상태
    const [voiceRecordingMode, setVoiceRecordingMode] = useState(null); // 음성 인식 모드: 'schedule', 'taxi', 'navigation', null (일반)
    const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false); // 음성 인식 지원 여부

    return {
        // 채팅 입력 및 히스토리
        input,
        setInput,
        chatHistory,
        setChatHistory,
        isProcessing,
        setIsProcessing,
        // 날짜 선택
        selectedDate,
        setSelectedDate,
        // 대화 관련
        pendingQuestion,
        setPendingQuestion,
        lastSuggestionHour,
        setLastSuggestionHour,
        dailySummaryShown,
        setDailySummaryShown,
        morningCareShown,
        setMorningCareShown,
        // 병원 관련
        currentHospitalTask,
        setCurrentHospitalTask,
        hospitalArrivalState,
        setHospitalArrivalState,
        // 음성 인식 관련
        isVoiceRecording,
        setIsVoiceRecording,
        voiceRecordingMode,
        setVoiceRecordingMode,
        speechRecognitionSupported,
        setSpeechRecognitionSupported
    };
};
