import React from 'react';

// 119 긴급 버튼 컴포넌트
const EmergencyCallButton = () => {
    return (
        <button
            onClick={() => {
                if (window.confirm('119에 전화를 걸까요?')) {
                    window.location.href = 'tel:119';
                }
            }}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-emergencyRed text-white flex items-center justify-center shadow-2xl z-40 animate-pulse-red font-black text-lg"
        >
            119
        </button>
    );
};

export default EmergencyCallButton;
