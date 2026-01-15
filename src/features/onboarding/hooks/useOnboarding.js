import { useState } from 'react';
import { getOnboardingSteps } from '../utils/onboardingData';

/**
 * 온보딩 가이드 상태 및 로직 관리 훅
 */
export const useOnboarding = (language, onComplete) => {
    const [currentStep, setCurrentStep] = useState(0);

    // 언어에 따른 단계 데이터 가져오기
    const currentSteps = getOnboardingSteps()[language] || getOnboardingSteps().ko;
    const currentStepData = currentSteps[currentStep];
    const totalSteps = currentSteps.length;

    /**
     * 다음 단계로 이동
     */
    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // 마지막 단계에서 완료 처리
            if (onComplete) {
                onComplete();
            }
        }
    };

    /**
     * 이전 단계로 이동
     */
    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return {
        currentStep,
        currentStepData,
        totalSteps,
        nextStep,
        prevStep,
        isFirstStep: currentStep === 0,
        isLastStep: currentStep === totalSteps - 1
    };
};