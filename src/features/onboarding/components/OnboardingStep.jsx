import React from 'react';

/**
 * 온보딩 개별 단계 컴포넌트
 * 현재 단계의 제목, 설명, 아이콘, 콘텐츠를 표시
 */
const OnboardingStep = ({ stepData }) => {
    const { title, description, icon, content } = stepData;

    return (
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-xl min-h-[400px] flex flex-col">
            {/* 단계 헤더 */}
            <div className="flex flex-col items-center mb-6">
                <div className="mb-4">{icon}</div>
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2" style={{ fontSize: 'var(--font-size-3xl)' }}>
                    {title}
                </h2>
                <p className="text-lg text-slate-600 text-center" style={{ fontSize: 'var(--font-size-lg)' }}>
                    {description}
                </p>
            </div>

            {/* 단계 콘텐츠 */}
            <div className="flex-1 flex items-center justify-center">
                {content}
            </div>
        </div>
    );
};

export default OnboardingStep;