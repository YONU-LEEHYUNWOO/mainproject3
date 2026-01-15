import React from 'react';
import { X, Zap, Mic } from 'lucide-react';
import { t } from '../../i18n';

/**
 * 접근성 설정 모달 컴포넌트
 * - 폰트 크기, 버튼 크기, 색상 대비, TTS 설정
 * 
 * @param {boolean} showAccessibilitySettings - 모달 표시 여부
 * @param {function} setShowAccessibilitySettings - 모달 표시 상태 변경 함수
 * @param {object} accessibilitySettings - 접근성 설정 값
 * @param {function} setAccessibilitySettings - 접근성 설정 변경 함수
 * @param {function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {string} language - 현재 언어 설정
 */
const AccessibilitySettingsModal = ({
    showAccessibilitySettings,
    setShowAccessibilitySettings,
    accessibilitySettings,
    setAccessibilitySettings,
    setChatHistory,
    language
}) => {
    // 모달이 표시되지 않으면 null 반환
    if (!showAccessibilitySettings) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowAccessibilitySettings(false)}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-slate-900" style={{ fontSize: 'var(--font-size-3xl)' }}>
                        {t('accessibilitySettings', language) || '접근성 설정'}
                    </h2>
                    <button
                        onClick={() => setShowAccessibilitySettings(false)}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        style={{ minWidth: 'var(--button-size-min)', minHeight: 'var(--button-size-min)' }}
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* 폰트 크기 설정 */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap size={32} className="text-blue-600" />
                            <h3 className="text-xl font-black text-blue-900" style={{ fontSize: 'var(--font-size-xl)' }}>
                                {t('fontSize', language) || '폰트 크기'}
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { value: 'normal', label: t('fontSizeNormal', language) || '기본', size: '18px' },
                                { value: 'large', label: t('fontSizeLarge', language) || '큰 글씨', size: '22px' },
                                { value: 'xlarge', label: t('fontSizeXLarge', language) || '매우 큰 글씨', size: '26px' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setAccessibilitySettings(prev => ({ ...prev, fontSize: option.value }))}
                                    className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-200 text-left ${accessibilitySettings.fontSize === option.value
                                        ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                                        : 'bg-white text-slate-700 border-slate-300 hover:border-blue-300'
                                        }`}
                                    style={{ minHeight: 'var(--button-size-medium)', fontSize: 'var(--font-size-lg)' }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-lg">{option.label}</span>
                                        <span className="text-sm opacity-80" style={{ fontSize: option.size }}>Aa</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 버튼 크기 설정 */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap size={32} className="text-green-600" />
                            <h3 className="text-xl font-black text-green-900" style={{ fontSize: 'var(--font-size-xl)' }}>
                                {t('buttonSize', language) || '버튼 크기'}
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { value: 'normal', label: t('buttonSizeNormal', language) || '기본', size: '44px' },
                                { value: 'large', label: t('buttonSizeLarge', language) || '큰 버튼', size: '56px' },
                                { value: 'xlarge', label: t('buttonSizeXLarge', language) || '매우 큰 버튼', size: '68px' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setAccessibilitySettings(prev => ({ ...prev, buttonSize: option.value }))}
                                    className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-200 text-left min-h-[var(--button-size-medium)] ${accessibilitySettings.buttonSize === option.value
                                        ? 'bg-green-500 text-white border-green-600 shadow-lg'
                                        : 'bg-white text-slate-700 border-slate-300 hover:border-green-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-lg">{option.label}</span>
                                        <div
                                            className={`rounded-xl bg-current opacity-30`}
                                            style={{ width: option.size, height: option.size }}
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 색상 대비 설정 */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border-2 border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap size={32} className="text-purple-600" />
                            <h3 className="text-xl font-black text-purple-900" style={{ fontSize: 'var(--font-size-xl)' }}>
                                {t('highContrast', language) || '색상 대비 개선'}
                            </h3>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-purple-300">
                            <div>
                                <p className="font-black text-slate-900 mb-1" style={{ fontSize: 'var(--font-size-lg)' }}>
                                    {t('highContrast', language) || '색상 대비 개선'}
                                </p>
                                <p className="text-slate-600" style={{ fontSize: 'var(--font-size-base)' }}>
                                    {t('highContrastDescription', language) || '텍스트와 배경의 대비를 높여 가독성을 개선합니다 (WCAG AA 기준)'}
                                </p>
                            </div>
                            <button
                                onClick={() => setAccessibilitySettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                                className={`relative w-16 h-8 rounded-full transition-colors duration-200 min-w-[64px] min-h-[32px] ${accessibilitySettings.highContrast ? 'bg-purple-500' : 'bg-slate-300'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${accessibilitySettings.highContrast ? 'translate-x-8' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                    </div>

                    {/* TTS (음성 재생) 설정 */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 border-2 border-orange-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Mic size={32} className="text-orange-600" />
                            <h3 className="text-xl font-black text-orange-900" style={{ fontSize: 'var(--font-size-xl)' }}>
                                음성 재생 기능
                            </h3>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-orange-300">
                            <div>
                                <p className="font-black text-slate-900 mb-1" style={{ fontSize: 'var(--font-size-lg)' }}>
                                    메시지 음성 재생
                                </p>
                                <p className="text-slate-600" style={{ fontSize: 'var(--font-size-base)' }}>
                                    AI 응답과 보호자 메시지를 음성으로 들을 수 있습니다
                                </p>
                            </div>
                            <button
                                onClick={() => setAccessibilitySettings(prev => ({ ...prev, ttsEnabled: prev.ttsEnabled === false }))}
                                className={`relative w-16 h-8 rounded-full transition-colors duration-200 min-w-[64px] min-h-[32px] ${(accessibilitySettings.ttsEnabled !== false) ? 'bg-orange-500' : 'bg-slate-300'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${(accessibilitySettings.ttsEnabled !== false) ? 'translate-x-8' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                    </div>

                    {/* 저장 버튼 */}
                    <button
                        onClick={() => {
                            setShowAccessibilitySettings(false);
                            setChatHistory(prev => [...prev, {
                                role: 'assistant',
                                content: '접근성 설정이 저장되었습니다. 변경사항이 적용되었어요.',
                                timestamp: Date.now()
                            }]);
                        }}
                        className="w-full px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-3xl font-black shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                        style={{ fontSize: 'var(--font-size-xl)', minHeight: 'var(--button-size-large)' }}
                    >
                        {t('save', language) || '저장'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessibilitySettingsModal;
