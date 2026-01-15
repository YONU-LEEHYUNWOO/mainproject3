import React from 'react';

/**
 * 알림 활성화 토글 컴포넌트
 */
const AlarmToggle = ({ medicineAlarmForm, setMedicineAlarmForm }) => {
    return (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <input
                type="checkbox"
                checked={medicineAlarmForm.enabled}
                onChange={(e) => setMedicineAlarmForm({ ...medicineAlarmForm, enabled: e.target.checked })}
                className="w-5 h-5"
            />
            <label className="text-sm font-bold text-blue-700">알림 활성화</label>
        </div>
    );
};

export default AlarmToggle;