import { useEffect } from 'react';
import { saveLastActivityTime, saveLocationInfo, saveRestMode } from '../../../utils/storage';

/**
 * App.jsx에 남아있던 "단순 자동 저장" useEffect들을 묶어 분리한다.
 * - 기존 동작 유지: 값 변경 시마다 각각 저장 함수 호출.
 * - App.jsx는 import/조립 중심으로 유지.
 */
export function usePersistCoreAppState({ restMode, lastActivityTime, locationInfo }) {
    // 휴식 모드 저장
    useEffect(() => {
        saveRestMode(restMode);
    }, [restMode]);

    // 마지막 활동 시간 저장
    useEffect(() => {
        saveLastActivityTime(lastActivityTime);
    }, [lastActivityTime]);

    // 위치 정보 저장
    useEffect(() => {
        saveLocationInfo(locationInfo);
    }, [locationInfo]);
}

