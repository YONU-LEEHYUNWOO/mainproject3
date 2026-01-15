import React from 'react';
import { X, Bell, Trash2 } from 'lucide-react';

/**
 * 알림 센터 모달 컴포넌트
 * - 알림 목록 표시, 읽음 처리, 삭제 기능
 * 
 * @param {boolean} showNotificationCenter - 모달 표시 여부
 * @param {function} setShowNotificationCenter - 모달 표시 상태 변경 함수
 * @param {array} notifications - 알림 목록
 * @param {function} setNotifications - 알림 목록 상태 변경 함수
 * @param {function} markAllNotificationsAsRead - 모든 알림 읽음 처리 함수
 * @param {function} loadNotifications - 알림 목록 로드 함수
 * @param {function} markNotificationAsRead - 개별 알림 읽음 처리 함수
 * @param {function} removeNotification - 알림 삭제 함수
 */
const NotificationCenterModal = ({
    showNotificationCenter,
    setShowNotificationCenter,
    notifications,
    setNotifications,
    markAllNotificationsAsRead,
    loadNotifications,
    markNotificationAsRead,
    removeNotification
}) => {
    // 모달이 표시되지 않으면 null 반환
    if (!showNotificationCenter) return null;

    // 알림 타입별 색상 및 아이콘 설정
    const typeConfig = {
        schedule: { icon: '📅', bgColor: 'from-blue-50 to-blue-100', borderColor: 'border-blue-200', textColor: 'text-blue-900', iconColor: 'text-blue-600' },
        medicine: { icon: '💊', bgColor: 'from-purple-50 to-purple-100', borderColor: 'border-purple-200', textColor: 'text-purple-900', iconColor: 'text-purple-600' },
        guardian: { icon: '👨', bgColor: 'from-orange-50 to-orange-100', borderColor: 'border-orange-200', textColor: 'text-orange-900', iconColor: 'text-orange-600' },
        safety: { icon: '⚠️', bgColor: 'from-red-50 to-red-100', borderColor: 'border-red-200', textColor: 'text-red-900', iconColor: 'text-red-600' },
        other: { icon: '🔔', bgColor: 'from-slate-50 to-slate-100', borderColor: 'border-slate-200', textColor: 'text-slate-900', iconColor: 'text-slate-600' }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowNotificationCenter(false)}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-3xl)' }}>
                        🔔 알림 센터
                    </h2>
                    <div className="flex items-center gap-3">
                        {notifications.filter(n => !n.read).length > 0 && (
                            <button
                                onClick={() => {
                                    markAllNotificationsAsRead();
                                    setNotifications(loadNotifications());
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-xl font-black hover:bg-blue-600 transition-colors"
                                style={{ fontSize: 'var(--font-size-base)', minHeight: 'var(--button-size-medium)' }}
                            >
                                모두 읽음
                            </button>
                        )}
                        <button
                            onClick={() => setShowNotificationCenter(false)}
                            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                            style={{ minWidth: 'var(--button-size-min)', minHeight: 'var(--button-size-min)' }}
                        >
                            <X size={24} className="text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* 알림 목록 */}
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell size={64} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                                알림이 없습니다.
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const config = typeConfig[notification.type] || typeConfig.other;

                            // 우선순위별 스타일
                            const priorityStyle = {
                                high: 'border-2',
                                medium: 'border',
                                low: 'border border-dashed'
                            }[notification.priority] || 'border';

                            return (
                                <div
                                    key={notification.id}
                                    className={`bg-gradient-to-br ${config.bgColor} rounded-2xl p-4 ${priorityStyle} ${config.borderColor} ${!notification.read ? 'opacity-100' : 'opacity-60'} transition-all duration-200 hover:shadow-lg`}
                                    onClick={() => {
                                        if (!notification.read) {
                                            markNotificationAsRead(notification.id);
                                            setNotifications(loadNotifications());
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`text-2xl ${config.iconColor}`}>
                                            {config.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={`font-black ${config.textColor}`} style={{ fontSize: 'var(--font-size-lg)' }}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <p className={`font-bold ${config.textColor} mb-2`} style={{ fontSize: 'var(--font-size-base)' }}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 text-xs font-bold">
                                                    {new Date(notification.timestamp).toLocaleString('ko-KR')}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeNotification(notification.id);
                                                        setNotifications(loadNotifications());
                                                    }}
                                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenterModal;
