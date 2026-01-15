// App(최상위)에서 사용하는 state 훅 재-export
// - App.jsx는 기능별 features 경로로 import하도록 정리하기 위함
// - 실제 로직/동작은 기존 `src/hooks/*`를 그대로 사용한다 (UI/로직 변경 금지)

export { useChatState } from '../../../hooks/useChatState';
export { useScheduleState } from '../../../hooks/useScheduleState';
export { useLocationState } from '../../../hooks/useLocationState';
export { useSettingsState } from '../../../hooks/useSettingsState';
export { useModalState } from '../../../hooks/useModalState';

