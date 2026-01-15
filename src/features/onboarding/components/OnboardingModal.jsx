import React from 'react';
import { X } from 'lucide-react';
import OnboardingGuide from '../../../components/OnboardingGuide';

// 온보딩 가이드 모달 컴포넌트
const OnboardingModal = ({
    showOnboarding,
    setShowOnboarding,
    saveOnboardingCompleted,
    language,
    t
}) => {
    if (!showOnboarding) {
        return null;
    }

    // 모달 닫힘 처리
    const handleClose = () => {
        setShowOnboarding(false);
        saveOnboardingCompleted(true);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-slate-900" style={{ fontSize: 'var(--font-size-3xl)' }}>
                        {t('onboardingGuide', language) || '초기 사용 가이드'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        style={{ minWidth: 'var(--button-size-min)', minHeight: 'var(--button-size-min)' }}
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>
                <OnboardingGuide
                    language={language}
                    onComplete={handleClose}
                />
            </div>
        </div>
    );
};

export default OnboardingModal;
