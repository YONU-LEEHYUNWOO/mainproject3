import React from 'react';
import { Send, Mic } from 'lucide-react';
import { t } from '../../../i18n';
import { useChatVoice } from '../hooks/useChatVoice';

/**
 * 하단 채팅 입력 영역 (텍스트 + 음성 인식)
 */
const ChatInput = ({
    input,
    setInput,
    handleSend,
    language,
    isProcessing,
    speechRecognitionSupported,
    isVoiceRecording,
    setIsVoiceRecording,
    voiceRecordingMode,
    setVoiceRecordingMode,
    speechRecognitionRef,
    isRecordingRef,
    setChatHistory,
    executeVoiceCommand
}) => {
    
    // 음성 인식 훅 사용
    const { handleVoiceStart, handleVoiceEnd } = useChatVoice({
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
    });

    return (
        <div className="p-6 lg:p-8 border-t-2 bg-white border-trustBlue/20 relative">
            <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={t('chatPlaceholder', language)}
                    className="flex-1 p-5 lg:p-6 bg-white rounded-3xl outline-none focus:ring-4 focus:ring-trustBlue shadow-lg border-2 border-trustBlue/30 font-bold"
                    style={{
                        fontSize: `var(--font-size-lg)`,
                        minHeight: `var(--button-size-medium)`
                    }}
                />
                
                {speechRecognitionSupported && (
                    <button
                        type="button"
                        onMouseDown={handleVoiceStart}
                        onMouseUp={handleVoiceEnd}
                        onTouchStart={handleVoiceStart}
                        onTouchEnd={handleVoiceEnd}
                        className={`p-5 lg:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200 ${
                            isVoiceRecording 
                                ? 'bg-emergencyRed text-white scale-110' 
                                : 'bg-trustBlue text-white hover:scale-105 active:scale-95'
                        }`}
                        style={{
                            minWidth: `var(--button-size-medium)`,
                            minHeight: `var(--button-size-medium)`
                        }}
                    >
                        <Mic size={28} className={isVoiceRecording ? 'animate-pulse' : ''} />
                    </button>
                )}

                <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    className="p-5 lg:p-6 bg-trustBlue text-white rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        minWidth: `var(--button-size-medium)`,
                        minHeight: `var(--button-size-medium)`
                    }}
                >
                    <Send size={28} />
                </button>
            </form>
        </div>
    );
};

export default ChatInput;
