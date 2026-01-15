import React from 'react';
import NotificationCenterModal from '../../../components/modals/NotificationCenterModal';

// 알림 센터 모달 진입 컴포넌트
const NotificationCenterModalFeature = ({
    showNotificationCenter,
    setShowNotificationCenter,
    notifications,
    setNotifications,
    markAllNotificationsAsRead,
    loadNotifications,
    markNotificationAsRead,
    removeNotification
}) => {
    return (
        <NotificationCenterModal
            showNotificationCenter={showNotificationCenter}
            setShowNotificationCenter={setShowNotificationCenter}
            notifications={notifications}
            setNotifications={setNotifications}
            markAllNotificationsAsRead={markAllNotificationsAsRead}
            loadNotifications={loadNotifications}
            markNotificationAsRead={markNotificationAsRead}
            removeNotification={removeNotification}
        />
    );
};

export default NotificationCenterModalFeature;
