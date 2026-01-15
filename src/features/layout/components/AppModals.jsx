import React from 'react';
import AccessibilitySettingsModalFeature from '../../accessibility/components/AccessibilitySettingsModalFeature';
import ConsentModals from '../../consent/components/ConsentModals';
import CustomerSupportModalFeature from '../../customerSupport/components/CustomerSupportModalFeature';
import DailySummaryDetailModalFeature from '../../summary/components/DailySummaryDetailModalFeature';
import LocationSettingsModalFeature from '../../location/modals/components/LocationSettingsModalFeature';
import MedicineAlarmModalFeature from '../../medicine/modals/components/MedicineAlarmModalFeature';
import MedicineSettingsModal from '../../medicine/components/MedicineSettingsModal';
import NotificationCenterModalFeature from '../../notifications/components/NotificationCenterModalFeature';
import OnboardingModal from '../../onboarding/components/OnboardingModal';
import PersonalSettingsModalFeature from '../../settings/components/PersonalSettingsModalFeature';
import ScheduleModals from '../../schedule/components/ScheduleModals';

// 앱에서 사용하는 모달 렌더링 묶음
const AppModals = ({
    scheduleProps,
    locationProps,
    accessibilityProps,
    onboardingProps,
    customerSupportProps,
    consentProps,
    personalSettingsProps,
    medicineSettingsProps,
    medicineAlarmProps,
    notificationCenterProps,
    dailySummaryProps
}) => {
    return (
        <>
            <ScheduleModals {...scheduleProps} />

            <LocationSettingsModalFeature {...locationProps} />

            <AccessibilitySettingsModalFeature {...accessibilityProps} />

            <OnboardingModal {...onboardingProps} />

            <CustomerSupportModalFeature {...customerSupportProps} />

            <ConsentModals {...consentProps} />

            <PersonalSettingsModalFeature {...personalSettingsProps} />

            <MedicineSettingsModal {...medicineSettingsProps} />

            <MedicineAlarmModalFeature {...medicineAlarmProps} />

            <NotificationCenterModalFeature {...notificationCenterProps} />

            <DailySummaryDetailModalFeature {...dailySummaryProps} />
        </>
    );
};

export default AppModals;
