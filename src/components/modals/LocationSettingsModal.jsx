import React from 'react';
import LocationSettingsModalFeature from '../../features/location/components/LocationSettingsModalFeature';

/**
 * 위치 설정 모달 컴포넌트
 * GPS 위치 권한 설정, 집 주소 설정, 병원/마트/약국 관리 기능 제공
 */
const LocationSettingsModal = (props) => {
    return <LocationSettingsModalFeature {...props} />;
};

export default LocationSettingsModal;
