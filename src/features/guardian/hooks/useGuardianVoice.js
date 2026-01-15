import { useState, useRef, useEffect } from 'react';
import { startSpeechRecognition, stopSpeechRecognition } from '../../../utils/speechRecognition';

/**
 * 보호자용 음성 녹음 및 인식을 담당하는 훅
 */
export const useGuardianVoice = ({ language, setChatbotInput }) => {
    // 음성 메시지 녹음 관련
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [voiceMessageUrl, setVoiceMessageUrl] = useState(null);
    const audioChunksRef = useRef([]);

    // 음성 인식(STT) 관련
    const [isVoiceRecording, setIsVoiceRecording] = useState(false);
    const speechRecognitionRef = useRef(null);

    // 음성 메시지 녹음 시작
    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);
                setVoiceMessageUrl(url);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecordingVoice(true);
        } catch (err) {
            console.error('녹음 시작 실패:', err);
            alert('마이크를 사용할 수 없습니다.');
        }
    };

    // 음성 메시지 녹음 중지
    const stopVoiceRecording = () => {
        if (mediaRecorder && isRecordingVoice) {
            mediaRecorder.stop();
            setIsRecordingVoice(false);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    };

    // 음성 인식 시작 (STT)
    const startSTT = () => {
        if (!speechRecognitionRef.current) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
                return;
            }
            speechRecognitionRef.current = new SpeechRecognition();
            speechRecognitionRef.current.continuous = false;
            speechRecognitionRef.current.interimResults = false;
        }

        speechRecognitionRef.current.lang = language === 'ko' ? 'ko-KR' : 'en-US';
        speechRecognitionRef.current.onresult = (e) => {
            const text = e.results[0][0].transcript;
            if (setChatbotInput) setChatbotInput(text);
            setIsVoiceRecording(false);
        };
        speechRecognitionRef.current.onerror = () => setIsVoiceRecording(false);
        speechRecognitionRef.current.onend = () => setIsVoiceRecording(false);

        speechRecognitionRef.current.start();
        setIsVoiceRecording(true);
    };

    return {
        isRecordingVoice,
        startVoiceRecording,
        stopVoiceRecording,
        voiceMessageUrl,
        setVoiceMessageUrl,
        isVoiceRecording,
        startSTT
    };
};
