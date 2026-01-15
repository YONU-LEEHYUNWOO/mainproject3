import React from 'react';

/**
 * 약 이름 입력 컴포넌트
 */
const MedicineNameInput = ({ medicineAlarmForm, setMedicineAlarmForm }) => {
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">알림 이름</label>
            <input
                type="text"
                value={medicineAlarmForm.name}
                onChange={(e) => setMedicineAlarmForm({ ...medicineAlarmForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="예: 아침 약, 저녁 약"
            />
        </div>
    );
};

export default MedicineNameInput;