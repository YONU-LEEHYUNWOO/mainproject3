import { useEffect } from 'react';
import { saveTasks, saveChatHistory, saveDailyActivities, saveGuardianStatus, saveGuardians, saveReportSettings, saveGuardianContactAuth, saveRestMode, saveLastActivityTime, saveLocationInfo, saveBedtimeSettings, saveInactivitySettings, saveMedicineAlarms, saveNotifications, saveAccessibilitySettings } from '../utils/storage';
import { applyAccessibilitySettings } from '../utils/accessibilityUtils';
import { addTodayToHistory } from '../utils/storage';

/**
 * 일정 자동 저장 훅
 */
export const useAutoSaveTasks = (confirmedTasks) => {
    useEffect(() => {
        if (confirmedTasks.length > 0) {
            saveTasks(confirmedTasks);
        }
    }, [confirmedTasks]);
};

/**
 * 채팅 히스토리 자동 저장 훅
 */
export const useAutoSaveChatHistory = (chatHistory) => {
    useEffect(() => {
        if (chatHistory.length > 0) {
            // 오늘 날짜 이후의 메시지만 저장 (과거 대화는 제외)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayTimestamp = today.getTime();

            const messagesToSave = chatHistory.filter(msg => {
                // timestamp가 없으면 기본적으로 저장 (기존 메시지 호환성)
                if (!msg.timestamp) {
                    return true;
                }
                try {
                    return msg.timestamp >= todayTimestamp;
                } catch (error) {
                    return true;
                }
            });

            if (messagesToSave.length > 0) {
                saveChatHistory(messagesToSave);
            }
        }
    }, [chatHistory]);
};

/**
 * 활동 기록 자동 저장 훅
 */
export const useAutoSaveDailyActivities = (dailyActivities) => {
    useEffect(() => {
        // 오늘 날짜로 활동 기록 저장
        if (dailyActivities && Object.keys(dailyActivities).length > 0) {
            saveDailyActivities(dailyActivities);
            // 날짜별 기록에도 추가
            addTodayToHistory(dailyActivities);
        }
    }, [dailyActivities]);
};

/**
 * 접근성 설정 자동 저장 및 적용 훅
 */
export const useAutoSaveAccessibilitySettings = (accessibilitySettings) => {
    useEffect(() => {
        if (accessibilitySettings) {
            saveAccessibilitySettings(accessibilitySettings);
            applyAccessibilitySettings(accessibilitySettings);
        }
    }, [accessibilitySettings]);
};

/**
 * 기타 설정 자동 저장 훅들 (단순 저장만)
 */
export const useAutoSaveRestMode = (restMode) => {
    useEffect(() => {
        saveRestMode(restMode);
    }, [restMode]);
};

export const useAutoSaveLastActivityTime = (lastActivityTime) => {
    useEffect(() => {
        saveLastActivityTime(lastActivityTime);
    }, [lastActivityTime]);
};

export const useAutoSaveLocationInfo = (locationInfo) => {
    useEffect(() => {
        saveLocationInfo(locationInfo);
    }, [locationInfo]);
};

export const useAutoSaveBedtimeSettings = (bedtimeSettings) => {
    useEffect(() => {
        saveBedtimeSettings(bedtimeSettings);
    }, [bedtimeSettings]);
};

export const useAutoSaveInactivitySettings = (inactivitySettings) => {
    useEffect(() => {
        saveInactivitySettings(inactivitySettings);
    }, [inactivitySettings]);
};

export const useAutoSaveMedicineAlarms = (medicineAlarms) => {
    useEffect(() => {
        saveMedicineAlarms(medicineAlarms);
    }, [medicineAlarms]);
};

export const useAutoSaveNotifications = (notifications) => {
    useEffect(() => {
        saveNotifications(notifications);
    }, [notifications]);
};

export const useAutoSaveGuardianStatus = (guardianContactStatus) => {
    useEffect(() => {
        saveGuardianStatus(guardianContactStatus);
    }, [guardianContactStatus]);
};

export const useAutoSaveGuardians = (guardians) => {
    useEffect(() => {
        saveGuardians(guardians);
    }, [guardians]);
};

export const useAutoSaveReportSettings = (reportSettings) => {
    useEffect(() => {
        saveReportSettings(reportSettings);
    }, [reportSettings]);
};

export const useAutoSaveGuardianContactAuth = (guardianContactAuth) => {
    useEffect(() => {
        saveGuardianContactAuth(guardianContactAuth);
    }, [guardianContactAuth]);
};
