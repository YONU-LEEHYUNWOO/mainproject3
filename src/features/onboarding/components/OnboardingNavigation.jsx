import React from 'react';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { t } from '../../../i18n';

/**
 * 온보딩 네비게이션 버튼 컴포넌트
 * 이전/다음 버튼을 렌더링
 */
const OnboardingNavigation = ({ language, currentStep, totalSteps, onNext, onPrev, isFirstStep, isLastStep }) => {
    return (
        <div className="flex items-center justify-between gap-4">
            {/* 이전 버튼 */}
            <button
                onClick={onPrev}
                disabled={isFirstStep}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black transition-all duration-200 ${
                    isFirstStep
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 transform hover:scale-105 active:scale-95'
                }`}
                style={{ fontSize: 'var(--font-size-lg)', minHeight: 'var(--button-size-large)' }}
            >
                <ArrowLeft size={20} />
                {t('previous', language) || '이전'}
            </button>

            {/* 다음/완료 버튼 */}
            <button
                onClick={onNext}
                className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                style={{ fontSize: 'var(--font-size-lg)', minHeight: 'var(--button-size-large)' }}
            >
                {isLastStep ? (
                    <>
                        {t('complete', language) || '완료'}
                        <CheckCircle size={20} />
                    </>
                ) : (
                    <>
                        {t('next', language) || '다음'}
                        <ArrowRight size={20} />
                    </>
                )}
            </button>
        </div>
    );
};

export default OnboardingNavigation;