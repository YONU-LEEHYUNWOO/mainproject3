import React from 'react';
import {
    X,
    LifeBuoy,
    Home,
    Calendar,
    Navigation2,
    ShoppingBag,
    Utensils,
    ShieldCheck,
    MapPin,
    Heart
} from 'lucide-react';
import { t } from '../../i18n';
import FAQ from '../FAQ';
import ScreenGuide from '../ScreenGuide';

/**
 * 고객지원 모달 컴포넌트
 * - FAQ, 화면별 사용 가이드, 설정 대행 지원, 보안 설정 탭
 * 
 * @param {boolean} showCustomerSupport - 모달 표시 여부
 * @param {function} setShowCustomerSupport - 모달 표시 상태 변경 함수
 * @param {string} customerSupportTab - 현재 선택된 탭
 * @param {function} setCustomerSupportTab - 탭 변경 함수
 * @param {string} selectedScreenGuide - 선택된 화면 가이드
 * @param {function} setSelectedScreenGuide - 화면 가이드 선택 함수
 * @param {function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {function} setIsViewTransitioning - 뷰 전환 상태 변경 함수
 * @param {function} setCurrentView - 현재 뷰 변경 함수
 * @param {object} consentStatus - 동의 상태
 * @param {function} setShowLocationConsent - 위치 동의 모달 표시 함수
 * @param {function} setShowHealthConsent - 건강정보 동의 모달 표시 함수
 * @param {string} language - 현재 언어 설정
 */
const CustomerSupportModal = ({
    showCustomerSupport,
    setShowCustomerSupport,
    customerSupportTab,
    setCustomerSupportTab,
    selectedScreenGuide,
    setSelectedScreenGuide,
    setChatHistory,
    setIsViewTransitioning,
    setCurrentView,
    consentStatus,
    setShowLocationConsent,
    setShowHealthConsent,
    language
}) => {
    // 모달이 표시되지 않으면 null 반환
    if (!showCustomerSupport) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            style={{ zIndex: 30 }}
            onClick={() => setShowCustomerSupport(false)}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <LifeBuoy size={32} className="text-indigo-600" />
                        <h2 className="text-3xl font-black text-slate-900" style={{ fontSize: 'var(--font-size-3xl)' }}>
                            {t('customerSupport', language) || '고객지원'}
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowCustomerSupport(false)}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        style={{ minWidth: 'var(--button-size-min)', minHeight: 'var(--button-size-min)' }}
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                {/* 탭 메뉴 */}
                <div className="flex gap-3 mb-6 shrink-0 border-b-2 border-slate-200">
                    <button
                        onClick={() => setCustomerSupportTab('faq')}
                        className={`px-6 py-3 rounded-t-2xl font-black transition-all duration-200 ${customerSupportTab === 'faq'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        style={{ fontSize: 'var(--font-size-lg)', minHeight: 'var(--button-size-medium)' }}
                    >
                        {t('faq', language) || '자주 묻는 질문'}
                    </button>
                    <button
                        onClick={() => setCustomerSupportTab('screenGuide')}
                        className={`px-6 py-3 rounded-t-2xl font-black transition-all duration-200 ${customerSupportTab === 'screenGuide'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        style={{ fontSize: 'var(--font-size-lg)', minHeight: 'var(--button-size-medium)' }}
                    >
                        {t('screenGuide', language) || '화면별 사용 가이드'}
                    </button>
                    <button
                        onClick={() => setCustomerSupportTab('supportRequest')}
                        className={`px-6 py-3 rounded-t-2xl font-black transition-all duration-200 ${customerSupportTab === 'supportRequest'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        style={{ fontSize: 'var(--font-size-lg)', minHeight: 'var(--button-size-medium)' }}
                    >
                        {t('supportRequest', language) || '설정 대행 지원'}
                    </button>
                    <button
                        onClick={() => setCustomerSupportTab('security')}
                        className={`px-6 py-3 rounded-t-2xl font-black transition-all duration-200 ${customerSupportTab === 'security'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        style={{ fontSize: 'var(--font-size-lg)', minHeight: 'var(--button-size-medium)' }}
                    >
                        {t('securitySettings', language) || '보안 설정'}
                    </button>
                </div>

                {/* 탭 내용 */}
                <div className="flex-1 overflow-y-auto">
                    {/* FAQ 탭 */}
                    {customerSupportTab === 'faq' && (
                        <FAQ language={language} />
                    )}

                    {/* 화면별 사용 가이드 탭 */}
                    {customerSupportTab === 'screenGuide' && (
                        <div className="space-y-6">
                            <div className="mb-6">
                                <p className="text-lg text-slate-700 mb-4" style={{ fontSize: 'var(--font-size-lg)' }}>
                                    {t('screenGuide', language) || '화면별 사용 가이드'}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        { id: 'home', label: t('homeScreen', language) || '홈 화면', icon: <Home size={24} /> },
                                        { id: 'schedule', label: t('scheduleScreen', language) || '일정 관리', icon: <Calendar size={24} /> },
                                        { id: 'navigation', label: t('navigationScreen', language) || '길 안내', icon: <Navigation2 size={24} /> },
                                        { id: 'shopping', label: t('shoppingScreen', language) || '장보기', icon: <ShoppingBag size={24} /> },
                                        { id: 'meal', label: t('mealScreen', language) || '식사 추천', icon: <Utensils size={24} /> }
                                    ].map((screen) => (
                                        <button
                                            key={screen.id}
                                            onClick={() => setSelectedScreenGuide(screen.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all duration-200 ${selectedScreenGuide === screen.id
                                                ? 'bg-indigo-500 text-white border-indigo-600 shadow-lg'
                                                : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-300'
                                                }`}
                                            style={{ minHeight: 'var(--button-size-large)' }}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                {screen.icon}
                                                <span className="font-black" style={{ fontSize: 'var(--font-size-base)' }}>
                                                    {screen.label}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <ScreenGuide language={language} screenName={selectedScreenGuide} />
                        </div>
                    )}

                    {/* 설정 대행 지원 탭 */}
                    {customerSupportTab === 'supportRequest' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border-2 border-indigo-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <LifeBuoy size={48} className="text-indigo-600" />
                                    <h3 className="text-2xl font-black text-indigo-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                        설정 대행 지원
                                    </h3>
                                </div>
                                <p className="text-lg text-slate-700 mb-6 leading-relaxed" style={{ fontSize: 'var(--font-size-lg)' }}>
                                    앱 설정에 어려움을 느끼시나요? 가족이나 고객지원팀이 원격으로 도와드릴 수 있습니다.
                                </p>

                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200">
                                        <h4 className="font-black text-indigo-900 mb-3" style={{ fontSize: 'var(--font-size-xl)' }}>
                                            📞 가족에게 도움 요청
                                        </h4>
                                        <p className="text-slate-700 mb-4" style={{ fontSize: 'var(--font-size-base)' }}>
                                            사이드바의 "가족과 함께" 버튼을 눌러 가족에게 설정 도움을 요청할 수 있습니다.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setShowCustomerSupport(false);
                                                setIsViewTransitioning(true);
                                                setTimeout(() => {
                                                    setCurrentView('guardian');
                                                    setTimeout(() => setIsViewTransitioning(false), 300);
                                                }, 500);
                                            }}
                                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                                            style={{ fontSize: 'var(--font-size-lg)', minHeight: 'var(--button-size-large)' }}
                                        >
                                            가족 대시보드로 이동
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200">
                                        <h4 className="font-black text-indigo-900 mb-3" style={{ fontSize: 'var(--font-size-xl)' }}>
                                            💬 채팅으로 도움 요청
                                        </h4>
                                        <p className="text-slate-700 mb-4" style={{ fontSize: 'var(--font-size-base)' }}>
                                            채팅창에 "설정 도와줘" 또는 "설정 방법 알려줘"라고 말씀해주시면 AI가 단계별로 안내해드립니다.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setShowCustomerSupport(false);
                                                setChatHistory(prev => [...prev, {
                                                    role: 'user',
                                                    content: '설정 도와줘',
                                                    timestamp: Date.now()
                                                }]);
                                            }}
                                            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                                            style={{ fontSize: 'var(--font-size-lg)', minHeight: 'var(--button-size-large)' }}
                                        >
                                            채팅으로 도움 요청
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 보안 설정 탭 */}
                    {customerSupportTab === 'security' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border-2 border-red-200">
                                <div className="flex items-center gap-4 mb-6">
                                    <ShieldCheck size={48} className="text-red-600" />
                                    <h3 className="text-2xl font-black text-red-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                        {t('securitySettings', language) || '보안 설정'}
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {/* 동의 상태 표시 */}
                                    <div className="bg-white rounded-2xl p-6 border-2 border-red-200">
                                        <h4 className="font-black text-red-900 mb-4" style={{ fontSize: 'var(--font-size-xl)' }}>
                                            {t('consentStatus', language) || '동의 상태'}
                                        </h4>

                                        <div className="space-y-4">
                                            {/* 위치 정보 동의 */}
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <MapPin size={24} className="text-blue-600" />
                                                    <div>
                                                        <p className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                            {t('locationConsentStatus', language) || '위치 정보 동의'}
                                                        </p>
                                                        <p className="text-sm text-slate-600" style={{ fontSize: 'var(--font-size-base)' }}>
                                                            {consentStatus.location
                                                                ? (t('consented', language) || '동의함')
                                                                : (t('notConsented', language) || '동의하지 않음')
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setShowCustomerSupport(false);
                                                        setShowLocationConsent(true);
                                                    }}
                                                    className="px-6 py-3 bg-blue-500 text-white rounded-xl font-black hover:bg-blue-600 transition-colors"
                                                    style={{ fontSize: 'var(--font-size-base)', minHeight: 'var(--button-size-medium)' }}
                                                >
                                                    {consentStatus.location
                                                        ? (t('viewConsentDetails', language) || '동의 내용 보기')
                                                        : (t('locationConsent', language) || '동의하기')
                                                    }
                                                </button>
                                            </div>

                                            {/* 건강정보 동의 */}
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <Heart size={24} className="text-red-600" />
                                                    <div>
                                                        <p className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                            {t('healthConsentStatus', language) || '건강정보 동의'}
                                                        </p>
                                                        <p className="text-sm text-slate-600" style={{ fontSize: 'var(--font-size-base)' }}>
                                                            {consentStatus.health
                                                                ? (t('consented', language) || '동의함')
                                                                : (t('notConsented', language) || '동의하지 않음')
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setShowCustomerSupport(false);
                                                        setShowHealthConsent(true);
                                                    }}
                                                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-black hover:bg-red-600 transition-colors"
                                                    style={{ fontSize: 'var(--font-size-base)', minHeight: 'var(--button-size-medium)' }}
                                                >
                                                    {consentStatus.health
                                                        ? (t('viewConsentDetails', language) || '동의 내용 보기')
                                                        : (t('healthConsent', language) || '동의하기')
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 안내 메시지 */}
                                    <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                                        <p className="text-slate-700 leading-relaxed" style={{ fontSize: 'var(--font-size-base)' }}>
                                            💡 동의 내용을 다시 확인하거나 변경하려면 위 버튼을 클릭하세요. 동의하지 않아도 기본 서비스는 이용하실 수 있지만, 일부 기능(길 안내, 건강 관리 등)은 제한될 수 있습니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerSupportModal;
