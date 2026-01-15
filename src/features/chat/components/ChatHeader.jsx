import React from 'react';
import { Globe, Lock } from 'lucide-react';
import { handleLanguageChange } from '../../../handlers/voiceHandlers';

/**
 * 채팅 상단 헤더 컴포넌트 (시간, 언어 선택, 로고)
 */
const ChatHeader = ({
    currentTime,
    guardianContactStatus,
    showLanguageMenu,
    setShowLanguageMenu,
    language,
    setLanguageState,
    setChatHistory,
    isViewTransitioning
}) => {
    return (
        <>
            {/* 뷰 전환 오버레이 */}
            {isViewTransitioning && (
                <div className="fixed inset-0 bg-white/98 backdrop-blur-lg z-[9999] flex items-center justify-center animate-fade-in">
                    <div className="flex flex-col items-center gap-10">
                        <img
                            src="/logo.png"
                            alt="함께잇다 로고"
                            className="w-[512px] h-[512px] rounded-3xl object-contain bg-gradient-to-br from-pastel-purple/20 to-pastel-pink/20 backdrop-blur-sm p-8 shadow-2xl animate-scale-in"
                            style={{ imageRendering: 'high-quality' }}
                        />
                        <p className="text-4xl font-black text-slate-800 animate-fade-in-delay">자식용 앱으로 전환 중...</p>
                    </div>
                </div>
            )}

            {/* 서비스 제한 레이어 */}
            {guardianContactStatus === 'locked' && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 animate-fade-in">
                    <Lock size={64} className="text-emergencyRed mb-6 animate-pulse" />
                    <h3 className="text-3xl font-black text-slate-900 mb-4 text-center">가족의 안부를 확인하고 있어요</h3>
                    <p className="text-xl text-slate-700 text-center leading-relaxed">가족이 연락을 확인해주시면<br />서비스를 다시 이용하실 수 있습니다.</p>
                </div>
            )}

            {/* 상단 바 */}
            <div className="h-16 bg-gradient-to-r from-trustBlue to-blue-600 text-white flex items-center justify-between px-6 shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-black" style={{ fontSize: 'var(--font-size-2xl)' }}>
                        {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {guardianContactStatus === 'connected' && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>가족 연결됨</span>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                        style={{ minWidth: 'var(--button-size-min)', minHeight: 'var(--button-size-min)' }}
                    >
                        <Globe size={20} className="text-white" />
                    </button>
                    {showLanguageMenu && (
                        <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-xl border-2 border-trustBlue/30 overflow-hidden animate-scale-in z-50">
                            {['ko', 'en', 'ja'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang, setLanguageState, setShowLanguageMenu, setChatHistory)}
                                    className={`w-full px-6 py-4 text-left font-black hover:bg-trustBlue/10 transition-colors ${language === lang ? 'bg-trustBlue/20 text-trustBlue' : 'text-slate-700'}`}
                                    style={{ fontSize: 'var(--font-size-lg)', minHeight: 'var(--button-size-medium)' }}
                                >
                                    {lang === 'ko' ? '한국어' : lang === 'en' ? 'English' : '日本語'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 헤더 */}
            <header className="h-24 bg-gradient-to-r from-trustBlue via-blue-500 to-trustBlue text-white flex items-center justify-between px-8 shrink-0 shadow-lg relative overflow-hidden">
                <div className="flex items-center gap-4 z-10">
                    <img
                        src="/logo.png"
                        alt="함께잇다 로고"
                        className="w-14 h-14 rounded-xl object-contain bg-white/10 backdrop-blur-sm p-1.5 flex-shrink-0 shadow-lg"
                        style={{ imageRendering: 'high-quality' }}
                    />
                    <div>
                        <h1 className="text-2xl font-black" style={{ fontSize: 'var(--font-size-2xl)' }}>함께잇다</h1>
                        <p className="text-sm opacity-90" style={{ fontSize: 'var(--font-size-base)' }}>가족과 함께하는 하루</p>
                    </div>
                </div>
                {guardianContactStatus === 'waiting' && (
                    <div className="px-4 py-2 bg-warmOrange rounded-full flex items-center gap-2 animate-blink z-10">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-sm font-black">가족 확인 대기</span>
                    </div>
                )}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                </div>
            </header>
        </>
    );
};

export default ChatHeader;
