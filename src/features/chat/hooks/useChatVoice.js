import { useRef } from 'react';
import { 
    startSpeechRecognition, 
    stopSpeechRecognition, 
    requestMicrophonePermission 
} from '../../../utils/speechRecognition';
import { detectVoiceCommand, VOICE_COMMAND_TYPES } from '../../../utils/voiceCommandProcessor';

/**
 * 음성 인식 및 명령 처리를 담당하는 훅
 */
export const useChatVoice = ({
    language,
    setIsVoiceRecording,
    setVoiceRecordingMode,
    isVoiceRecording,
    voiceRecordingMode,
    setInput,
    setChatHistory,
    executeVoiceCommand,
    speechRecognitionRef,
    isRecordingRef
}) => {
    
    // 마우스/터치 시작 핸들러 (음성 인식 시작)
    const handleVoiceStart = async (e) => {
        if (e) e.preventDefault();

        // 이미 녹음 중이면 무시
        if (isRecordingRef.current) {
            return;
        }

        // 마이크 권한 확인
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: '마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.',
                timestamp: Date.now()
            }]);
            return;
        }

        setIsVoiceRecording(true);
        setVoiceRecordingMode(null);
        isRecordingRef.current = true;

        // 음성 인식 시작
        if (speechRecognitionRef.current) {
            const lang = language === 'ko' ? 'ko-KR' : language === 'en' ? 'en-US' : 'ja-JP';
            speechRecognitionRef.current.lang = lang;

            startSpeechRecognition(speechRecognitionRef.current, {
                onResult: (text) => {
                    const trimmedText = text.trim();
                    setIsVoiceRecording(false);
                    setVoiceRecordingMode(null);
                    isRecordingRef.current = false;

                    // 음성 명령 감지
                    const command = detectVoiceCommand(trimmedText);

                    if (command.type !== VOICE_COMMAND_TYPES.UNKNOWN && command.confidence >= 0.3) {
                        const executed = executeVoiceCommand(command.type, trimmedText);
                        if (executed) return;
                    }

                    setInput(trimmedText);
                },
                onError: (error) => {
                    setIsVoiceRecording(false);
                    setVoiceRecordingMode(null);
                    isRecordingRef.current = false;
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        content: error.message || '음성 인식 중 오류가 발생했습니다.',
                        timestamp: Date.now()
                    }]);
                },
                onStart: () => console.log('🎤 음성 인식 시작'),
                onEnd: () => {
                    setIsVoiceRecording(false);
                    setVoiceRecordingMode(null);
                    isRecordingRef.current = false;
                }
            });
        }
    };

    // 마우스/터치 종료 핸들러 (음성 인식 중지)
    const handleVoiceEnd = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        if (speechRecognitionRef.current && isRecordingRef.current) {
            stopSpeechRecognition(speechRecognitionRef.current);
            setIsVoiceRecording(false);
            isRecordingRef.current = false;
        }
    };

    return {
        handleVoiceStart,
        handleVoiceEnd
    };
};
