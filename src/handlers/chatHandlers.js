import { t } from '../i18n';
import { addNotification } from '../utils/storage';

/**
 * 예/아니오 응답 핸들러
 * @param {string} response - 응답 ('yes' 또는 'no')
 * @param {Object|null} pendingQuestion - 대기 중인 질문
 * @param {Function} setPendingQuestion - 대기 중인 질문 업데이트 함수
 * @param {Function} setCurrentHospitalTask - 현재 병원 일정 업데이트 함수
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {string} language - 현재 언어
 */
export const handleYesNoResponse = (
    response,
    pendingQuestion,
    setPendingQuestion,
    setCurrentHospitalTask,
    setChatHistory,
    language
) => {
    if (!pendingQuestion) return;

    if (pendingQuestion.type === 'visit') {
        if (response === 'yes') {
            const task = pendingQuestion.task;
            setCurrentHospitalTask(task);
            setChatHistory(prev => [...prev,
            { role: 'user', content: t('yes', language) },
            {
                role: 'assistant',
                type: 'hospitalTransport',
                content: `${task.time}까지 ${task.location}에 도착하시려면 이동 준비가 필요합니다.`,
                task: task
            }
            ]);
        } else {
            setChatHistory(prev => [...prev,
            { role: 'user', content: t('no', language) },
            {
                role: 'assistant',
                type: 'alternatives',
                content: '그럼 오늘은 어떻게 보내시겠어요?',
                alternatives: [
                    { text: t('shoppingToday', language), action: 'shopping' },
                    { text: t('restToday', language), action: 'rest' }
                ]
            }
            ]);
        }
    }
    setPendingQuestion(null);
};

/**
 * 보호자 메시지 수신 핸들러
 * @param {Object} message - 수신된 메시지
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {Function} setNotifications - 알림 목록 업데이트 함수
 */
export const handleMessageReceive = (message, setChatHistory, setNotifications) => {
    // 음성 메시지 처리
    if (message.type === 'voice' && message.audio) {
        setChatHistory(prev => [...prev, {
            role: 'assistant',
            type: 'voiceMessage',
            content: message.text || '음성 메시지',
            audio: message.audio,
            timestamp: Date.now()
        }]);
        return;
    }

    // 행동 패턴 지시 처리
    if (message.type === 'instruction' && message.action === 'behaviorPattern' && message.behaviorPattern) {
        const pattern = message.behaviorPattern;
        const sequenceText = pattern.sequence?.join(' → ') || '';

        setChatHistory(prev => [...prev, {
            role: 'assistant',
            type: 'behaviorPattern',
            content: message.text || `오늘은 ${sequenceText} 순서로 방문하시면 좋을 것 같아요.`,
            behaviorPattern: pattern,
            timestamp: Date.now()
        }]);
        return;
    }

    // 텍스트 메시지 처리
    const guardianMessage = {
        role: 'assistant',
        type: 'guardianMessage',
        content: message.text || message.content || '보호자로부터 메시지가 도착했습니다.',
        message: message,
        timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, guardianMessage]);

    // 알림 센터에 추가
    const notification = addNotification({
        type: 'guardian',
        title: '👨‍👩‍👧 보호자 메시지',
        message: message.text || message.content || '보호자로부터 메시지가 도착했습니다.',
        priority: 'high',
        timestamp: Date.now()
    });
    setNotifications(prev => [notification, ...prev]);
};
