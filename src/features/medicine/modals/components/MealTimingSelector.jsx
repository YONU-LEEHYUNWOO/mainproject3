import React from 'react';

/**
 * 복용 시기 선택 컴포넌트 (아침/점심/저녁)
 */
const MealTimingSelector = ({ medicineAlarmForm, setMedicineAlarmForm }) => {
    const mealOptions = [
        { value: 'breakfast', label: '🌅 아침 식사후', time: '08:00' },
        { value: 'lunch', label: '☀️ 점심 식사후', time: '13:00' },
        { value: 'dinner', label: '🌙 저녁 식사후', time: '19:00' }
    ];

    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">복용 시기 (중복 선택 가능)</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
                {mealOptions.map((meal) => {
                    const afterMeals = medicineAlarmForm.afterMeals || [];
                    const isSelected = afterMeals.includes(meal.value);
                    return (
                        <button
                            key={meal.value}
                            type="button"
                            onClick={() => {
                                const currentMeals = medicineAlarmForm.afterMeals || [];
                                const updatedMeals = isSelected
                                    ? currentMeals.filter(m => m !== meal.value)
                                    : [...currentMeals, meal.value].sort();

                                // 선택된 식사 시간이 있으면 첫 번째 선택된 시간을 기본 알림 시간으로 설정
                                const defaultTime = updatedMeals.length > 0
                                    ? (updatedMeals.includes('breakfast') ? '08:00' :
                                        updatedMeals.includes('lunch') ? '13:00' :
                                            '19:00')
                                    : medicineAlarmForm.time;

                                setMedicineAlarmForm({
                                    ...medicineAlarmForm,
                                    afterMeals: updatedMeals,
                                    time: defaultTime
                                });
                            }}
                            className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 ${isSelected
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {meal.label}
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-slate-500 mb-2 font-bold">
                선택된 식사: {(() => {
                    const meals = medicineAlarmForm.afterMeals || [];
                    if (meals.length === 0) return '없음';
                    return meals.map(m =>
                        m === 'breakfast' ? '아침' :
                            m === 'lunch' ? '점심' : '저녁'
                    ).join(', ');
                })()}
            </p>
        </div>
    );
};

export default MealTimingSelector;