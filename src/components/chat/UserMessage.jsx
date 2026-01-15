import React from 'react';

/**
 * 사용자 메시지 컴포넌트
 * 우측 정렬, 진한 블루 배경, 화이트 텍스트
 */
const UserMessage = ({ content }) => {
    return (
        <div className="max-w-[85%] bg-trustBlue text-white rounded-3xl rounded-tr-sm p-6 font-bold shadow-lg" style={{ fontSize: 'var(--font-size-lg)' }}>
            <span className="whitespace-pre-wrap leading-relaxed">{content}</span>
        </div>
    );
};

export default UserMessage;
