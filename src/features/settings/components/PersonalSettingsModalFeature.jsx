import React from 'react';
import PersonalSettingsModal from '../../../components/modals/PersonalSettingsModal';

// 개인설정 모달 진입 컴포넌트
const PersonalSettingsModalFeature = ({
    showPersonalSettings,
    setShowPersonalSettings,
    inactivitySettings,
    setInactivitySettings,
    saveInactivitySettings,
    medicineAlarms,
    setMedicineAlarms,
    setMedicineAlarmForm,
    setEditingMedicineAlarm,
    setShowMedicineAlarmModal,
    setChatHistory,
    setConfirmedTasks,
    apiKey
}) => {
    return (
        <PersonalSettingsModal
            showPersonalSettings={showPersonalSettings}
            setShowPersonalSettings={setShowPersonalSettings}
            inactivitySettings={inactivitySettings}
            setInactivitySettings={setInactivitySettings}
            saveInactivitySettings={saveInactivitySettings}
            medicineAlarms={medicineAlarms}
            setMedicineAlarms={setMedicineAlarms}
            setMedicineAlarmForm={setMedicineAlarmForm}
            setEditingMedicineAlarm={setEditingMedicineAlarm}
            setShowMedicineAlarmModal={setShowMedicineAlarmModal}
            setChatHistory={setChatHistory}
            setConfirmedTasks={setConfirmedTasks}
            apiKey={apiKey}
        />
    );
};

export default PersonalSettingsModalFeature;
