/**
 * 브라우저 알림 표시
 * @param {string} title - 알림 제목
 * @param {string} body - 알림 내용
 */
export const showNotification = (title, body) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
        new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body });
            }
        });
    }
};
