import React from 'react';
import { Train, Briefcase, Coffee, Plus, Bell, Zap, Settings, User, Users, HelpCircle, BookOpen } from 'lucide-react';
import { t } from '../i18n';

/**
 * 대시보드 사이드바 컴포넌트
 * 분석 엔진 목록, 일정 추가, 설정 메뉴 제공
 */
const DashboardSidebar = ({
    language,
    notifications,
    setShowScheduleModal,
    setShowNotificationCenter,
    setShowAccessibilitySettings,
    setShowLocationSettings,
    setShowPersonalSettings,
    setShowCustomerSupport,
    setShowOnboarding,
    setCurrentView,
    setIsViewTransitioning
}) => {
    return (
        <div className="w-20 lg:w-64 border-r-2 border-slate-200 bg-white/90 backdrop-blur-sm flex flex-col shrink-0 shadow-xl">
            <div className="p-6 border-b-2 border-white/30 flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                <img
                    src="/logo.png"
                    alt="함께잇다 로고"
                    className="w-10 h-10 rounded-xl object-contain bg-white/20 backdrop-blur-sm p-1 flex-shrink-0 border-2 border-white/30"
                    style={{ imageRendering: 'high-quality' }}
                />
                <h1 className="hidden lg:block font-black text-lg tracking-tight">{t('appName', language)}</h1>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <p className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">{t('analysisEngine', language)}</p>
                {[
                    { id: 'traffic', name: t('trafficAnalysis', language), icon: <Train size={16} />, color: 'text-blue-500' },
                    { id: 'work', name: t('workOptimization', language), icon: <Briefcase size={16} />, color: 'text-indigo-500' },
                    { id: 'life', name: t('lifeBalance', language), icon: <Coffee size={16} />, color: 'text-orange-500' }
                ].map((agent) => (
                    <div key={agent.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 cursor-pointer group">
                        <div className={`p-2.5 rounded-xl bg-white border-2 border-slate-300 shadow-md ${agent.color} group-hover:scale-110 transition-transform duration-200`}>{agent.icon}</div>
                        <span className="hidden lg:block text-sm font-black text-slate-800">{agent.name}</span>
                    </div>
                ))}

                {/* 일정 추가 버튼 */}
                <div className="pt-4 border-t-2 border-slate-200 mt-4">
                    <button
                        onClick={() => {
                            // 일정 추가 모달 표시를 위한 상태 추가 필요
                            setShowScheduleModal(true);
                        }}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 group mb-4 border-2 border-white/20"
                    >
                        <div className="p-2.5 rounded-xl bg-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-200">
                            <Plus size={20} />
                        </div>
                        <span className="hidden lg:block text-base font-black">{t('addSchedule', language)}</span>
                    </button>
                </div>

                {/* 설정 및 보호자 대시보드 버튼 */}
                <div className="pt-2 border-t-2 border-slate-200 space-y-2">
                    {/* 알림 센터 버튼 */}
                    <button
                        onClick={() => setShowNotificationCenter(true)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border-2 border-orange-300/30 hover:border-orange-400/50 transition-all duration-200 group relative"
                    >
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <Bell size={18} />
                        </div>
                        <span className="hidden lg:block text-sm font-black text-slate-800">알림 센터</span>
                        {notifications.filter(n => !n.read).length > 0 && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-black">
                                {notifications.filter(n => !n.read).length}
                            </div>
                        )}
                    </button>
                    <button
                        onClick={() => setShowAccessibilitySettings(true)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-2 border-green-300/30 hover:border-green-400/50 transition-all duration-200 group"
                    >
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <Zap size={18} />
                        </div>
                        <span className="hidden lg:block text-sm font-black text-slate-800">{t('accessibilitySettings', language) || '접근성 설정'}</span>
                    </button>
                    <button
                        onClick={() => setShowLocationSettings(true)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-2 border-purple-300/30 hover:border-purple-400/50 transition-all duration-200 group"
                    >
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <Settings size={18} />
                        </div>
                        <span className="hidden lg:block text-sm font-black text-slate-800">{t('locationSettings', language)}</span>
                    </button>
                    <button
                        onClick={() => setShowPersonalSettings(true)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border-2 border-indigo-300/30 hover:border-indigo-400/50 transition-all duration-200 group"
                    >
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <User size={18} />
                        </div>
                        <span className="hidden lg:block text-sm font-black text-slate-800">개인설정</span>
                    </button>
                    <button
                        onClick={() => {
                            setIsViewTransitioning(true);
                            setTimeout(() => {
                                setIsViewTransitioning(true);
                                setTimeout(() => {
                                    setCurrentView('guardian');
                                    setTimeout(() => setIsViewTransitioning(false), 300);
                                }, 500);
                                setTimeout(() => setIsViewTransitioning(false), 300);
                            }, 500);
                        }}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-2 border-blue-300/30 hover:border-blue-400/50 transition-all duration-200 group"
                    >
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <Users size={16} />
                        </div>
                        <span className="hidden lg:block text-sm font-black text-slate-800">{t('guardianDashboard', language)}</span>
                    </button>
                    {/* 고객지원 버튼 */}
                    <button
                        onClick={() => setShowCustomerSupport(true)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border-2 border-indigo-300/30 hover:border-indigo-400/50 transition-all duration-200 group"
                    >
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <HelpCircle size={18} />
                        </div>
                        <span className="hidden lg:block text-sm font-black text-slate-800">{t('customerSupport', language) || '고객지원'}</span>
                    </button>
                    {/* 온보딩 가이드 버튼 */}
                    <button
                        onClick={() => setShowOnboarding(true)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-2 border-blue-300/30 hover:border-blue-400/50 transition-all duration-200 group"
                    >
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <BookOpen size={18} />
                        </div>
                        <span className="hidden lg:block text-sm font-black text-slate-800">{t('onboardingGuide', language) || '초기 사용 가이드'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardSidebar;
