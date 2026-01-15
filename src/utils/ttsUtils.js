/**
 * 텍스트를 음성으로 읽어주는 함수 (TTS)
 * @param {string} text - 읽을 텍스트
 * @param {string} lang - 언어 코드 ('ko', 'en', 'ja')
 * @param {boolean} ttsEnabled - TTS 활성화 여부
 * @param {Object} speechSynthesisRef - SpeechSynthesis 인스턴스 참조 (ref 객체)
 */
export const speakText = (text, lang = 'ko', ttsEnabled = true, speechSynthesisRef = null) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;

    // 이전 음성 중지
    if (speechSynthesisRef?.current) {
        window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = lang === 'ko' ? 'ko-KR' : lang === 'en' ? 'en-US' : 'ja-JP';
    utterance.lang = langCode;
    utterance.rate = 0.9; // 속도 조절 (0.9 = 약간 느리게)
    utterance.pitch = 1.0; // 음높이
    utterance.volume = 1.0; // 볼륨

    if (speechSynthesisRef) {
        speechSynthesisRef.current = utterance;
    }
    window.speechSynthesis.speak(utterance);
};
