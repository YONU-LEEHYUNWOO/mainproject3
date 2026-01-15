import React from 'react';

/**
 * 온보딩 진행 표시 바 컴포넌트
 * 현재 단계까지의 진행 상태를 점으로 표시
 */
const OnboardingProgress = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex items-center justify-between mb-6">
            {/* 진행 점들 */}
            <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }, (_, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            index <= currentStep ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                    />
                ))}
            </div>

            {/* 단계 수 표시 */}
            <span className="text-sm font-black text-slate-500" style={{ fontSize: 'var(--font-size-base)' }}>
                {currentStep + 1} / {totalSteps}
            </span>
        </div>
    );
};

export default OnboardingProgress;