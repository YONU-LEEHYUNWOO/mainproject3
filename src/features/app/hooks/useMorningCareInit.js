import { useEffect, useRef } from 'react';
import {
    loadChatHistory,
    loadLastMorningCareDate,
    saveLastMorningCareDate,
    saveMorningCareShown
} from '../../../utils/storage';
import { buildMorningCareQuestion, getTodayStrings, hasMorningCareMessage } from '../utils/morningCareUtils';

/**
 * 아침 케어: 앱 시작 시 오늘 일정 확인(하루 1회) 후 안내 메시지/질문을 채팅에 추가한다.
 * - 기존 App.jsx의 useEffect 로직을 그대로 이동(동작/UI 변경 금지).
 */
export function useMorningCareInit({
    morningCareShown,
    setMorningCareShown,
    confirmedTasks,
    chatHistory,
    setChatHistory,
    setPendingQuestion,
    language,
    t
}) {
    // App.jsx 책임 최소화를 위해 초기화 ref는 훅 내부에서 관리
    const morningCareInitialized = useRef(false); // 아침 케어 초기화 추적

    useEffect(() => {
        // useRef로 추적하여 컴포넌트 리렌더링과 무관하게 한 번만 실행
        if (morningCareInitialized.current) return;
        if (morningCareShown) {
            morningCareInitialized.current = true;
            return;
        }

        const { todayDateStr, todayStr } = getTodayStrings();

        // 이미 오늘 아침 케어를 표시했는지 확인
        const lastDate = loadLastMorningCareDate();
        if (lastDate === todayDateStr) {
            setMorningCareShown(true);
            morningCareInitialized.current = true;
            return; // 오늘 이미 표시함
        }

        // 저장된 채팅 히스토리에서 이미 morningCare 타입 메시지가 있는지 확인
        const savedHistory = loadChatHistory();
        if (hasMorningCareMessage(savedHistory)) {
            setMorningCareShown(true);
            saveLastMorningCareDate(todayDateStr);
            morningCareInitialized.current = true;
            return;
        }

        // 현재 채팅 히스토리에 이미 morningCare 타입 메시지가 있는지 확인
        if (hasMorningCareMessage(chatHistory)) {
            setMorningCareShown(true);
            saveLastMorningCareDate(todayDateStr);
            morningCareInitialized.current = true;
            return;
        }

        const todayTasks = confirmedTasks.filter(task => task.date === todayStr);

        if (todayTasks.length > 0) {
            // 즉시 초기화 플래그 설정하여 중복 실행 완전 차단
            morningCareInitialized.current = true;
            setMorningCareShown(true);
            saveMorningCareShown(true);
            saveLastMorningCareDate(todayDateStr);

            const firstTask = todayTasks[0];
            const question = buildMorningCareQuestion({ firstTask, language, t });

            setTimeout(() => {
                setChatHistory(prev => {
                    // 중복 체크: 이미 같은 task.id를 가진 morningCare 메시지가 있는지 확인
                    const alreadyExists = prev.some(
                        msg => msg.type === 'morningCare' && msg.task?.id === firstTask.id
                    );
                    if (alreadyExists) return prev;

                    return [
                        ...prev,
                        {
                            role: 'assistant',
                            type: 'morningCare',
                            content: question,
                            task: firstTask
                        }
                    ];
                });
                setPendingQuestion({ type: 'visit', task: firstTask });
            }, 1000);
        } else {
            setMorningCareShown(true);
            saveMorningCareShown(true);
            saveLastMorningCareDate(todayDateStr);
            morningCareInitialized.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 빈 배열로 마운트 시 한 번만 실행
}

