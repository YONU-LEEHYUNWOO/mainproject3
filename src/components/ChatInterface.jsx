/**
 * ChatInterface 컴포넌트 (Refactored)
 * 채팅 인터페이스의 메인 조립 컴포넌트
 */
import React, { useEffect, useState } from 'react';
import ChatHeader from '../features/chat/components/ChatHeader';
import ChatQuickActions from '../features/chat/components/ChatQuickActions';
import ChatDateFilter from '../features/chat/components/ChatDateFilter';
import ChatHistory from '../features/chat/components/ChatHistory';
import ChatInput from '../features/chat/components/ChatInput';
import { getFilteredChatHistory } from '../utils/chatUtils';

const ChatInterface = (props) => {
    const {
        // 공통/헤더 관련
        currentTime: initialCurrentTime, // Props로 전달되지 않을 경우 내부 관리
        guardianContactStatus,
        isViewTransitioning,
        language,
        showLanguageMenu,
        setShowLanguageMenu,
        setLanguageState,
        setChatHistory,
        
        // 데이터/필터 관련
        chatHistory,
        selectedDate,
        setSelectedDate,
        
        // 빠른 실행/상태 관련
        setRestMode,
        setLastActivityTime,
        
        // 입력/음성 관련
        handleSend,
        input,
        setInput,
        isProcessing,
        speechRecognitionSupported,
        isVoiceRecording,
        setIsVoiceRecording,
        voiceRecordingMode,
        setVoiceRecordingMode,
        speechRecognitionRef,
        isRecordingRef,
        executeVoiceCommand
    } = props;

    const [currentTime, setCurrentTime] = useState(new Date());

    // 현재 시간 업데이트 (상단 바 표시용)
    useEffect(() => {
        const timeTimer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timeTimer);
    }, []);

    // 필터링된 채팅 히스토리 계산
    const filteredChatHistory = getFilteredChatHistory(chatHistory, selectedDate);

    return (
        <div className="flex-1 flex flex-col bg-lightBg border-r min-w-0 relative">
            
            {/* 1. 상단 헤더 (시간, 언어, 상태, 로고) */}
            <ChatHeader 
                currentTime={currentTime}
                guardianContactStatus={guardianContactStatus}
                showLanguageMenu={showLanguageMenu}
                setShowLanguageMenu={setShowLanguageMenu}
                language={language}
                setLanguageState={setLanguageState}
                setChatHistory={setChatHistory}
                isViewTransitioning={isViewTransitioning}
            />

            {/* 2. 빠른 실행 버튼 (장보기, 이동, 휴식) */}
            <ChatQuickActions 
                language={language}
                setChatHistory={setChatHistory}
                setRestMode={setRestMode}
                setLastActivityTime={setLastActivityTime}
            />

            {/* 3. 날짜 필터 UI */}
            <ChatDateFilter 
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                language={language}
            />

            {/* 4. 채팅 메시지 리스트 영역 */}
            <ChatHistory 
                filteredChatHistory={filteredChatHistory}
                chatHistory={chatHistory}
                selectedDate={selectedDate}
                language={language}
                isProcessing={isProcessing}
                // AssistantMessage에 필요한 나머지 모든 props 전달
                {...props} 
            />

            {/* 5. 하단 입력 영역 (텍스트 + 음성 인식) */}
            <ChatInput 
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                language={language}
                isProcessing={isProcessing}
                speechRecognitionSupported={speechRecognitionSupported}
                isVoiceRecording={isVoiceRecording}
                setIsVoiceRecording={setIsVoiceRecording}
                voiceRecordingMode={voiceRecordingMode}
                setVoiceRecordingMode={setVoiceRecordingMode}
                speechRecognitionRef={speechRecognitionRef}
                isRecordingRef={isRecordingRef}
                setChatHistory={setChatHistory}
                executeVoiceCommand={executeVoiceCommand}
            />
        </div>
    );
};

export default ChatInterface;
