import { useState } from 'react';
import { loadTasks } from '../utils/storage';

/**
 * 일정 관련 상태 관리 훅
 * @returns {Object} 일정 관련 상태와 setter 함수들
 */
export const useScheduleState = () => {
    // 저장된 일정 로드 (없으면 기본 샘플 일정)
    const savedTasks = loadTasks();
    const [confirmedTasks, setConfirmedTasks] = useState(
        savedTasks.length > 0 ? savedTasks : [
            {
                id: 1,
                title: '병원 예약',
                date: '2026-01-06',
                time: '14:00',
                location: '강남역 인근 병원',
                category: 'personal',
                reminderActive: true,
                analysis: {
                    work: "병원 방문 전 건강 상태를 체크하고 필요한 서류를 준비하세요.",
                    life: "병원 방문 후 충분한 휴식이 필요합니다. 무리하지 마세요.",
                    requirements: ['건강보험증', '처방전'],
                    traffic: {
                        departure: "평택시 (현재 위치)",
                        duration: "1시간 20분",
                        tip: "지하철 1호선 탑승 후 강남역까지 광역버스로 환승하는 것이 가장 빠릅니다."
                    }
                }
            }
        ]
    );

    // 일정 선택 및 편집
    const [selectedTaskId, setSelectedTaskId] = useState(1);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [tempTask, setTempTask] = useState(null);

    // 일정 추가 모달
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        repeat: false
    });

    // 일정 추가 모달용 장소 검색
    const [schedulePlaceSearchKeyword, setSchedulePlaceSearchKeyword] = useState('');
    const [schedulePlaceSearchResults, setSchedulePlaceSearchResults] = useState([]);
    const [schedulePlaceSearchLoading, setSchedulePlaceSearchLoading] = useState(false);

    // 일정 수정용 장소 검색
    const [taskEditPlaceSearchKeyword, setTaskEditPlaceSearchKeyword] = useState('');
    const [taskEditPlaceSearchResults, setTaskEditPlaceSearchResults] = useState([]);
    const [taskEditPlaceSearchLoading, setTaskEditPlaceSearchLoading] = useState(false);

    return {
        // 일정 목록
        confirmedTasks,
        setConfirmedTasks,
        // 일정 선택 및 편집
        selectedTaskId,
        setSelectedTaskId,
        editingTaskId,
        setEditingTaskId,
        tempTask,
        setTempTask,
        // 일정 추가 폼
        newSchedule,
        setNewSchedule,
        // 일정 추가 모달용 장소 검색
        schedulePlaceSearchKeyword,
        setSchedulePlaceSearchKeyword,
        schedulePlaceSearchResults,
        setSchedulePlaceSearchResults,
        schedulePlaceSearchLoading,
        setSchedulePlaceSearchLoading,
        // 일정 수정용 장소 검색
        taskEditPlaceSearchKeyword,
        setTaskEditPlaceSearchKeyword,
        taskEditPlaceSearchResults,
        setTaskEditPlaceSearchResults,
        taskEditPlaceSearchLoading,
        setTaskEditPlaceSearchLoading
    };
};
