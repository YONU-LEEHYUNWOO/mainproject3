import React from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import OnboardingProgress from './OnboardingProgress';
import OnboardingStep from './OnboardingStep';
import OnboardingNavigation from './OnboardingNavigation';

/**
 * 온보딩 가이드 메인 컴포넌트
 * 모든 하위 컴포넌트들을 조립하여 온보딩 UI를 구성
 */
const OnboardingFeature = ({ language, onComplete }) => {
    const {
        currentStep,
        currentStepData,
        totalSteps,
        nextStep,
        prevStep,
        isFirstStep,
        isLastStep
    } = useOnboarding(language, onComplete);

    return (
        <div className="space-y-6">
            {/* 진행 표시 */}
            <OnboardingProgress
                currentStep={currentStep}
                totalSteps={totalSteps}
            />

            {/* 현재 단계 내용 */}
            <OnboardingStep stepData={currentStepData} />

            {/* 네비게이션 버튼 */}
            <OnboardingNavigation
                language={language}
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={nextStep}
                onPrev={prevStep}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
            />
        </div>
    );
};

export default OnboardingFeature;