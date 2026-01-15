/**
 * 음성 인식 유틸리티
 * Web Speech API를 사용하여 음성 인식 기능 제공
 */

/**
 * 음성 인식 지원 여부 확인
 * @returns {boolean} 음성 인식 지원 여부
 */
export const isSpeechRecognitionSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

/**
 * 음성 인식 인스턴스 생성
 * @param {Object} options - 음성 인식 옵션
 * @returns {SpeechRecognition|webkitSpeechRecognition|null} 음성 인식 객체
 */
export const createSpeechRecognition = (options = {}) => {
    if (!isSpeechRecognitionSupported()) {
        console.warn('⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다.');
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // 기본 옵션 설정
    recognition.continuous = options.continuous || false; // 연속 인식 여부
    recognition.interimResults = options.interimResults || false; // 중간 결과 표시 여부
    recognition.lang = options.lang || 'ko-KR'; // 언어 설정 (한국어)
    recognition.maxAlternatives = options.maxAlternatives || 1; // 대안 결과 개수

    return recognition;
};

/**
 * 음성 인식 시작
 * @param {Object} recognition - SpeechRecognition 인스턴스
 * @param {Object} callbacks - 콜백 함수들
 * @param {Function} callbacks.onResult - 인식 결과 콜백 (text: string)
 * @param {Function} callbacks.onError - 오류 콜백 (error: Error)
 * @param {Function} callbacks.onStart - 시작 콜백
 * @param {Function} callbacks.onEnd - 종료 콜백
 * @returns {void}
 */
export const startSpeechRecognition = (recognition, callbacks = {}) => {
    if (!recognition) {
        if (callbacks.onError) {
            callbacks.onError(new Error('음성 인식을 지원하지 않습니다.'));
        }
        return;
    }

    // 이미 시작된 경우 중복 시작 방지
    // SpeechRecognition의 상태를 확인할 수 있는 방법이 제한적이므로
    // abort 후 새로 시작하는 방식으로 처리
    try {
        // 이미 실행 중이면 먼저 중지
        if (recognition.abort) {
            recognition.abort();
        }
    } catch (e) {
        // abort 중 오류가 발생해도 무시 (이미 종료된 상태일 수 있음)
        console.log('음성 인식 상태 초기화:', e);
    }

    // 결과 이벤트
    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        console.log('🎤 음성 인식 결과:', transcript, `(신뢰도: ${confidence})`);

        if (callbacks.onResult) {
            callbacks.onResult(transcript, confidence);
        }
    };

    // 오류 이벤트
    recognition.onerror = (event) => {
        let errorMessage = '음성 인식 중 오류가 발생했습니다.';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
                break;
            case 'audio-capture':
                errorMessage = '마이크에 접근할 수 없습니다. 마이크 권한을 확인해주세요.';
                break;
            case 'not-allowed':
                errorMessage = '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
                break;
            case 'network':
                errorMessage = '네트워크 오류가 발생했습니다.';
                break;
            case 'aborted':
                errorMessage = '음성 인식이 중단되었습니다.';
                break;
            default:
                errorMessage = `음성 인식 오류: ${event.error}`;
        }

        console.error('❌ 음성 인식 오류:', event.error, errorMessage);

        if (callbacks.onError) {
            callbacks.onError(new Error(errorMessage));
        }
    };

    // 시작 이벤트
    recognition.onstart = () => {
        console.log('🎤 음성 인식 시작');
        if (callbacks.onStart) {
            callbacks.onStart();
        }
    };

    // 종료 이벤트
    recognition.onend = () => {
        console.log('🎤 음성 인식 종료');
        if (callbacks.onEnd) {
            callbacks.onEnd();
        }
    };

    // 음성 인식 시작
    try {
        // 약간의 지연을 두어 이전 인식이 완전히 종료되도록 함
        setTimeout(() => {
            try {
                recognition.start();
            } catch (startError) {
                // 이미 시작된 경우 오류 무시하고 계속 진행
                if (startError.message && startError.message.includes('already started')) {
                    console.log('⚠️ 음성 인식이 이미 시작되었습니다. 계속 진행합니다.');
                    return;
                }
                console.error('❌ 음성 인식 시작 실패:', startError);
                if (callbacks.onError) {
                    callbacks.onError(startError);
                }
            }
        }, 100);
    } catch (error) {
        console.error('❌ 음성 인식 시작 실패:', error);
        if (callbacks.onError) {
            callbacks.onError(error);
        }
    }
};

/**
 * 음성 인식 중지
 * @param {Object} recognition - SpeechRecognition 인스턴스
 * @returns {void}
 */
export const stopSpeechRecognition = (recognition) => {
    if (!recognition) {
        return;
    }

    try {
        recognition.stop();
        console.log('🎤 음성 인식 중지');
    } catch (error) {
        console.error('❌ 음성 인식 중지 실패:', error);
    }
};

/**
 * 음성 인식 취소
 * @param {Object} recognition - SpeechRecognition 인스턴스
 * @returns {void}
 */
export const abortSpeechRecognition = (recognition) => {
    if (!recognition) {
        return;
    }

    try {
        recognition.abort();
        console.log('🎤 음성 인식 취소');
    } catch (error) {
        console.error('❌ 음성 인식 취소 실패:', error);
    }
};

/**
 * 마이크 권한 요청
 * @returns {Promise<boolean>} 권한 허용 여부
 */
export const requestMicrophonePermission = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // 스트림을 즉시 종료 (권한 확인만)
        stream.getTracks().forEach(track => track.stop());
        console.log('✅ 마이크 권한 허용됨');
        return true;
    } catch (error) {
        console.error('❌ 마이크 권한 거부됨:', error);
        return false;
    }
};
