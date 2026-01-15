import React from 'react';

/**
 * 알림 시간 선택 컴포넌트
 */
const TimeSelector = ({ medicineAlarmForm, setMedicineAlarmForm }) => {
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">알림 시간 (직접 설정)</label>
            <input
                type="time"
                value={medicineAlarmForm.time}
                onChange={(e) => setMedicineAlarmForm({ ...medicineAlarmForm, time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg font-bold"
            />
        </div>
    );
};

export default TimeSelector;