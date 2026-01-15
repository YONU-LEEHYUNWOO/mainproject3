import React from 'react';
import OnboardingFeature from '../features/onboarding/components/OnboardingFeature';

/**
 * 초기 사용자 온보딩 가이드 컴포넌트
 * 큰 글씨, 단계별 안내
 */
const OnboardingGuide = ({ language, onComplete }) => {
    return <OnboardingFeature language={language} onComplete={onComplete} />;
};

export default OnboardingGuide;
