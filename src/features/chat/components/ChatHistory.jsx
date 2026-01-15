import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import UserMessage from '../../../components/chat/UserMessage';
import AssistantMessage from './AssistantMessage';
import useChatAutoScroll from '../hooks/useChatAutoScroll';
import { t } from '../../../i18n';

/**
 * 채팅 메시지 히스토리 영역
 */
const ChatHistory = ({
    filteredChatHistory,
    chatHistory,
    selectedDate,
    language,
    isProcessing,
    // AssistantMessage를 위한 props 전달
    ...assistantProps
}) => {
    const chatEndRef = useRef(null);

    // 자동 스크롤 훅 사용
    useChatAutoScroll(chatEndRef, chatHistory, selectedDate);

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-lightBg" style={{ minHeight: 0 }}>
            {filteredChatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                    <Calendar size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-400 font-black" style={{ fontSize: 'var(--font-size-lg)' }}>
                        {t('noMessagesForDate', language)}
                    </p>
                </div>
            ) : (
                filteredChatHistory.map((msg, idx) => (
                    <div key={`chat-msg-${idx}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                        {msg.role === 'user' ? (
                            <UserMessage content={msg.content} />
                        ) : (
                            <AssistantMessage
                                msg={msg}
                                language={language}
                                {...assistantProps}
                            />
                        )}
                    </div>
                ))
            )}

            {/* 처리 중 표시 */}
            {isProcessing && (
                <div className="flex items-center gap-4 px-4 animate-fade-in">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 bg-pastel-purple rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-pastel-purple rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-3 h-3 bg-pastel-purple rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                    <span className="text-lg text-pastel-purple font-black">{t('processing', language)}</span>
                </div>
            )}
            <div ref={chatEndRef} />
        </div>
    );
};

export default ChatHistory;
