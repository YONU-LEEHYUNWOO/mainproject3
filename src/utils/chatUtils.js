/**
 * 선택된 날짜에 따라 채팅 히스토리 필터링
 * @param {Array} chatHistory - 전체 채팅 히스토리
 * @param {string|null} selectedDate - 선택된 날짜 (YYYY-MM-DD 형식 또는 null)
 * @returns {Array} 필터링된 채팅 히스토리
 */
export const getFilteredChatHistory = (chatHistory, selectedDate) => {
    // selectedDate가 null이면 모든 대화 표시 (필터링 없음)
    if (selectedDate === null) {
        // 모든 대화 표시 (timestamp가 없어도 표시)
        return chatHistory;
    } else {
        // 선택된 날짜의 대화만 표시
        const selectedDateStr = new Date(selectedDate).toDateString();
        return chatHistory.filter(msg => {
            // timestamp가 없으면 기본적으로 표시 (기존 메시지 호환성)
            if (!msg.timestamp) {
                return true;
            }
            try {
                const msgDate = new Date(msg.timestamp);
                return msgDate.toDateString() === selectedDateStr;
            } catch (error) {
                // 날짜 파싱 실패 시 표시
                return true;
            }
        });
    }
};
