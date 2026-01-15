import React from 'react';

/**
 * 반복 요일 선택 컴포넌트
 */
const DaySelector = ({ medicineAlarmForm, setMedicineAlarmForm }) => {
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">반복 요일</label>
            <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            const days = medicineAlarmForm.days || [];
                            const updatedDays = days.includes(idx)
                                ? days.filter(d => d !== idx)
                                : [...days, idx].sort();
                            setMedicineAlarmForm({ ...medicineAlarmForm, days: updatedDays });
                        }}
                        className={`py-2 rounded-xl font-bold text-sm transition-all duration-200 ${medicineAlarmForm.days?.includes(idx)
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DaySelector;