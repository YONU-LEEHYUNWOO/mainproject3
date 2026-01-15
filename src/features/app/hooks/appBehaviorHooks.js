// App(최상위)에서 사용하는 공통 동작 훅 재-export
// - App.jsx는 기능별 features 경로로 import하도록 정리하기 위함
// - 실제 로직/동작은 기존 `src/hooks/*`를 그대로 사용한다 (UI/로직 변경 금지)

export { useRecurringTasks } from '../../../hooks/useRecurringTasks';
export { useMedicineAlarms } from '../../../hooks/useMedicineAlarms';
export { useGPSLocation } from '../../../hooks/useGPSLocation';
export { useBedtimeMode } from '../../../hooks/useBedtimeMode';
export { useInactivity } from '../../../hooks/useInactivity';
export { useActivityDetection } from '../../../hooks/useActivityDetection';
export { useScheduleAlerts } from '../../../hooks/useScheduleAlerts';
export { default as useApplyAccessibilitySettingsOnMount } from '../../../hooks/useApplyAccessibilitySettingsOnMount';

