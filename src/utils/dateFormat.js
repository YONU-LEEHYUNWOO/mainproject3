/**
 * 날짜/시간 포맷팅 유틸리티
 */

/**
 * 날짜를 읽기 쉬운 형식으로 변환
 * @param {string} dateStr - YYYY-MM-DD 형식의 날짜
 * @param {string} timeStr - HH:mm 형식의 시간 (optional)
 * @returns {string} 포맷된 날짜/시간 문자열
 */
export const formatDateTime = (dateStr, timeStr = '') => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr + (timeStr ? ' ' + timeStr : ''));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffDays = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));
    
    let datePart = '';
    if (diffDays === 0) {
        datePart = '오늘';
    } else if (diffDays === 1) {
        datePart = '내일';
    } else if (diffDays === -1) {
        datePart = '어제';
    } else if (diffDays > 1 && diffDays <= 7) {
        datePart = `${diffDays}일 후`;
    } else if (diffDays < -1 && diffDays >= -7) {
        datePart = `${Math.abs(diffDays)}일 전`;
    } else {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        datePart = `${year}년 ${month}월 ${day}일`;
    }
    
    if (timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? '오후' : '오전';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const timePart = `${ampm} ${displayHour}:${minutes}`;
        return `${datePart} ${timePart}`;
    }
    
    return datePart;
};

/**
 * 간단한 날짜 형식 (대시보드 목록용)
 * @param {string} dateStr - YYYY-MM-DD 형식의 날짜
 * @param {string} timeStr - HH:mm 형식의 시간 (optional)
 * @returns {string} 포맷된 날짜/시간 문자열
 */
export const formatDateTimeShort = (dateStr, timeStr = '') => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr + (timeStr ? ' ' + timeStr : ''));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffDays = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));
    
    let datePart = '';
    if (diffDays === 0) {
        datePart = '오늘';
    } else if (diffDays === 1) {
        datePart = '내일';
    } else if (diffDays === -1) {
        datePart = '어제';
    } else {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        datePart = `${month}/${day}`;
    }
    
    if (timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? '오후' : '오전';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${datePart} ${ampm} ${displayHour}:${minutes}`;
    }
    
    return datePart;
};

/**
 * 일정이 완료되었는지 확인 (실제 시간 비교)
 * @param {string} dateStr - YYYY-MM-DD 형식의 날짜
 * @param {string} timeStr - HH:mm 형식의 시간
 * @param {boolean} completed - 수동 완료 여부
 * @returns {boolean} 완료 여부
 */
export const isTaskCompleted = (dateStr, timeStr, completed = false) => {
    if (completed) return true; // 수동 완료 체크
    if (!dateStr) return false;
    
    const now = new Date();
    const taskDateTime = new Date(dateStr + ' ' + (timeStr || '23:59'));
    
    // 일정 시간이 현재 시간을 지났으면 완료
    return taskDateTime < now;
};

/**
 * 완료 시간 포맷팅
 * @param {string} completedAt - 완료 시간 (ISO 문자열 또는 Date 객체)
 * @returns {string} 포맷된 완료 시간
 */
export const formatCompletedTime = (completedAt) => {
    if (!completedAt) return '';
    
    const date = new Date(completedAt);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${month}/${day} ${ampm} ${displayHour}:${String(minutes).padStart(2, '0')}`;
};

/**
 * 예상 이동 시간 문자열을 분 단위로 변환
 * 예: "1시간 20분" -> 80, "30분" -> 30, "1시간" -> 60
 */
export const parseDurationToMinutes = (durationStr) => {
    if (!durationStr) return 0;
    
    let totalMinutes = 0;
    
    // 시간 추출
    const hourMatch = durationStr.match(/(\d+)시간/);
    if (hourMatch) {
        totalMinutes += parseInt(hourMatch[1]) * 60;
    }
    
    // 분 추출
    const minuteMatch = durationStr.match(/(\d+)분/);
    if (minuteMatch) {
        totalMinutes += parseInt(minuteMatch[1]);
    }
    
    return totalMinutes;
};

/**
 * 일정 시간에서 이동 시간을 빼서 출발 시간 계산
 * @param {string} taskDate - 일정 날짜 (YYYY-MM-DD)
 * @param {string} taskTime - 일정 시간 (HH:MM)
 * @param {string} durationStr - 예상 이동 시간 문자열 (예: "1시간 20분")
 * @param {number} bufferMinutes - 여유 시간 (분), 기본 10분
 * @returns {Date|null} 출발해야 할 시간
 */
export const calculateDepartureTime = (taskDate, taskTime, durationStr, bufferMinutes = 10) => {
    if (!taskDate || !taskTime) return null;
    
    try {
        const taskDateTime = new Date(`${taskDate}T${taskTime}`);
        const travelMinutes = parseDurationToMinutes(durationStr);
        const totalMinutes = travelMinutes + bufferMinutes;
        
        const departureTime = new Date(taskDateTime);
        departureTime.setMinutes(departureTime.getMinutes() - totalMinutes);
        
        return departureTime;
    } catch (error) {
        console.error('출발 시간 계산 오류:', error);
        return null;
    }
};

/**
 * 출발 시간을 읽기 쉬운 형식으로 포맷
 * @param {Date} departureTime - 출발 시간
 * @returns {string} 포맷된 시간 문자열
 */
export const formatDepartureTime = (departureTime) => {
    if (!departureTime) return '';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const departureDate = new Date(departureTime.getFullYear(), departureTime.getMonth(), departureTime.getDate());
    
    const hours = String(departureTime.getHours()).padStart(2, '0');
    const minutes = String(departureTime.getMinutes()).padStart(2, '0');
    
    if (departureDate.getTime() === today.getTime()) {
        return `오늘 ${hours}:${minutes}`;
    } else {
        const month = String(departureTime.getMonth() + 1).padStart(2, '0');
        const day = String(departureTime.getDate()).padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
    }
};

