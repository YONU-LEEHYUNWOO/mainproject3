import { useEffect } from 'react';

// 채팅 스크롤을 최신 메시지로 이동
const useChatAutoScroll = (chatEndRef, chatHistory, selectedDate) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
    }, [chatEndRef, chatHistory, selectedDate]);
};

export default useChatAutoScroll;
