import React from 'react';
import MedicineAlarmModalFeature from '../../features/medicine/components/MedicineAlarmModalFeature';

/**
 * 약 복용 알림 설정 모달 컴포넌트
 * - 약 복용 알림 추가/수정
 * - 복용 시기, 시간, 요일 설정
 * - 복용 기간 설정 (무한 반복 또는 기간 지정)
 * - 일정 자동 생성
 */
const MedicineAlarmModal = (props) => {
    return <MedicineAlarmModalFeature {...props} />;
};

export default MedicineAlarmModal;