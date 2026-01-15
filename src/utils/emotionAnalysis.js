/**
 * 정서 분석 유틸리티
 * 대화 기반 정서 분석, 정서 변화 추적, 정서 패턴 요약
 */

/**
 * 대화 메시지에서 정서 분석
 * @param {string} content - 대화 내용
 * @returns {string} 정서 ('positive', 'neutral', 'negative', 'anxious')
 */
export const analyzeEmotion = (content) => {
    if (!content || typeof content !== 'string') {
        return 'neutral';
    }
    
    const text = content.toLowerCase();
    
    // 긍정적 키워드
    const positiveKeywords = ['좋아', '고마워', '행복', '기쁘', '만족', '편안', '괜찮', '좋다', '감사', '도움', '잘', '완벽'];
    // 부정적 키워드
    const negativeKeywords = ['안좋', '나쁘', '슬프', '힘들', '아프', '불편', '걱정', '무서', '두려', '불안', '우울', '외로'];
    // 불안 키워드
    const anxiousKeywords = ['걱정', '불안', '무서', '두려', '어떻게', '어떡', '모르', '힘들', '어려', '어렵'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    let anxiousCount = 0;
    
    positiveKeywords.forEach(keyword => {
        if (text.includes(keyword)) positiveCount++;
    });
    
    negativeKeywords.forEach(keyword => {
        if (text.includes(keyword)) negativeCount++;
    });
    
    anxiousKeywords.forEach(keyword => {
        if (text.includes(keyword)) anxiousCount++;
    });
    
    // 정서 판단
    if (anxiousCount > 0 && anxiousCount >= negativeCount) {
        return 'anxious';
    } else if (negativeCount > positiveCount) {
        return 'negative';
    } else if (positiveCount > negativeCount) {
        return 'positive';
    } else {
        return 'neutral';
    }
};

/**
 * 정서를 한글로 변환
 * @param {string} emotion - 정서 코드
 * @returns {string} 한글 정서명
 */
export const getEmotionLabel = (emotion) => {
    const labels = {
        'positive': '긍정적',
        'neutral': '중립적',
        'negative': '부정적',
        'anxious': '불안'
    };
    return labels[emotion] || '중립적';
};

/**
 * 채팅 히스토리에서 정서 패턴 분석
 * @param {Array} chatHistory - 채팅 히스토리
 * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns {Object} 정서 패턴 분석 결과
 */
export const analyzeEmotionPattern = (chatHistory, startDate, endDate) => {
    if (!chatHistory || chatHistory.length === 0) {
        return {
            totalMessages: 0,
            emotionDistribution: {},
            dominantEmotion: 'neutral',
            emotionTrend: 'stable',
            analysis: '분석할 대화 데이터가 없습니다.'
        };
    }
    
    // 기간 필터링 (타임스탬프 기반)
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime() + 24 * 60 * 60 * 1000; // 하루 끝까지
    
    const periodMessages = chatHistory.filter(msg => {
        if (!msg.timestamp) return false;
        const msgTime = typeof msg.timestamp === 'string' 
            ? new Date(msg.timestamp).getTime() 
            : msg.timestamp;
        return msgTime >= startTimestamp && msgTime < endTimestamp;
    });
    
    // 사용자 메시지만 분석
    const userMessages = periodMessages.filter(msg => msg.role === 'user');
    
    if (userMessages.length === 0) {
        return {
            totalMessages: 0,
            emotionDistribution: {},
            dominantEmotion: 'neutral',
            emotionTrend: 'stable',
            analysis: '분석할 사용자 대화가 없습니다.'
        };
    }
    
    // 정서 분포 계산
    const emotionCounts = {
        positive: 0,
        neutral: 0,
        negative: 0,
        anxious: 0
    };
    
    userMessages.forEach(msg => {
        const emotion = analyzeEmotion(msg.content);
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    // 정서 분포 비율
    const total = userMessages.length;
    const emotionDistribution = {
        positive: Math.round((emotionCounts.positive / total) * 100),
        neutral: Math.round((emotionCounts.neutral / total) * 100),
        negative: Math.round((emotionCounts.negative / total) * 100),
        anxious: Math.round((emotionCounts.anxious / total) * 100)
    };
    
    // 주요 정서 찾기
    const dominantEmotion = Object.keys(emotionDistribution).reduce((a, b) => 
        emotionDistribution[a] > emotionDistribution[b] ? a : b
    );
    
    // 정서 추세 분석 (전반기 vs 후반기)
    const midPoint = Math.floor(userMessages.length / 2);
    const firstHalf = userMessages.slice(0, midPoint);
    const secondHalf = userMessages.slice(midPoint);
    
    const firstHalfEmotions = firstHalf.map(msg => analyzeEmotion(msg.content));
    const secondHalfEmotions = secondHalf.map(msg => analyzeEmotion(msg.content));
    
    const firstHalfPositive = firstHalfEmotions.filter(e => e === 'positive').length;
    const secondHalfPositive = secondHalfEmotions.filter(e => e === 'positive').length;
    const firstHalfNegative = firstHalfEmotions.filter(e => e === 'negative' || e === 'anxious').length;
    const secondHalfNegative = secondHalfEmotions.filter(e => e === 'negative' || e === 'anxious').length;
    
    let emotionTrend = 'stable';
    let trendAnalysis = '';
    
    if (secondHalfPositive > firstHalfPositive + 2) {
        emotionTrend = 'improving';
        trendAnalysis = '정서 상태가 개선되고 있습니다.';
    } else if (secondHalfNegative > firstHalfNegative + 2) {
        emotionTrend = 'declining';
        trendAnalysis = '정서 상태가 악화되고 있습니다. 주의가 필요합니다.';
    } else {
        emotionTrend = 'stable';
        trendAnalysis = '정서 상태가 안정적입니다.';
    }
    
    // 분석 요약 생성
    const analysis = `${getEmotionLabel(dominantEmotion)} 정서가 ${emotionDistribution[dominantEmotion]}%로 가장 많았습니다. ${trendAnalysis}`;
    
    return {
        totalMessages: userMessages.length,
        emotionDistribution,
        dominantEmotion,
        emotionTrend,
        analysis,
        emotionCounts
    };
};
