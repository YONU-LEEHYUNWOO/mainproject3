import React from 'react';

/**
 * 복용 기간 설정 컴포넌트
 */
const DurationSettings = ({ medicineAlarmForm, setMedicineAlarmForm }) => {
    return (
        <div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl mb-4">
                <input
                    type="checkbox"
                    checked={medicineAlarmForm.duration != null && medicineAlarmForm.duration > 0}
                    onChange={(e) => {
                        if (e.target.checked) {
                            // 복용 기간 설정 활성화
                            const duration = medicineAlarmForm.duration || 7;
                            const durationType = medicineAlarmForm.durationType || 'days';
                            const startDate = new Date(medicineAlarmForm.startDate || new Date());
                            const endDate = new Date(startDate);

                            if (durationType === 'days') {
                                endDate.setDate(startDate.getDate() + duration - 1);
                            } else if (durationType === 'weeks') {
                                endDate.setDate(startDate.getDate() + (duration * 7) - 1);
                            } else if (durationType === 'months') {
                                endDate.setMonth(startDate.getMonth() + duration);
                                endDate.setDate(endDate.getDate() - 1);
                            }

                            setMedicineAlarmForm({
                                ...medicineAlarmForm,
                                duration: duration,
                                endDate: endDate.toISOString().split('T')[0]
                            });
                        } else {
                            // 복용 기간 설정 비활성화 (무한 반복)
                            setMedicineAlarmForm({
                                ...medicineAlarmForm,
                                duration: null,
                                endDate: null
                            });
                        }
                    }}
                    className="w-5 h-5"
                />
                <label className="text-sm font-bold text-slate-700">복용 기간 설정 (체크 해제 시 무한 반복)</label>
            </div>
            {medicineAlarmForm.duration != null && medicineAlarmForm.duration > 0 && (
                <>
                    <label className="block text-sm font-bold text-slate-700 mb-2">복용 기간</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <input
                                type="number"
                                min="1"
                                value={medicineAlarmForm.duration || 7}
                                onChange={(e) => {
                                    const duration = parseInt(e.target.value) || 7;
                                    const durationType = medicineAlarmForm.durationType || 'days';
                                    const startDate = new Date(medicineAlarmForm.startDate || new Date());
                                    const endDate = new Date(startDate);

                                    if (durationType === 'days') {
                                        endDate.setDate(startDate.getDate() + duration - 1);
                                    } else if (durationType === 'weeks') {
                                        endDate.setDate(startDate.getDate() + (duration * 7) - 1);
                                    } else if (durationType === 'months') {
                                        endDate.setMonth(startDate.getMonth() + duration);
                                        endDate.setDate(endDate.getDate() - 1);
                                    }

                                    setMedicineAlarmForm({
                                        ...medicineAlarmForm,
                                        duration: duration,
                                        endDate: endDate.toISOString().split('T')[0]
                                    });
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg font-bold"
                                placeholder="기간"
                            />
                        </div>
                        <div>
                            <select
                                value={medicineAlarmForm.durationType || 'days'}
                                onChange={(e) => {
                                    const durationType = e.target.value;
                                    const duration = medicineAlarmForm.duration || 7;
                                    const startDate = new Date(medicineAlarmForm.startDate || new Date());
                                    const endDate = new Date(startDate);

                                    if (durationType === 'days') {
                                        endDate.setDate(startDate.getDate() + duration - 1);
                                    } else if (durationType === 'weeks') {
                                        endDate.setDate(startDate.getDate() + (duration * 7) - 1);
                                    } else if (durationType === 'months') {
                                        endDate.setMonth(startDate.getMonth() + duration);
                                        endDate.setDate(endDate.getDate() - 1);
                                    }

                                    setMedicineAlarmForm({
                                        ...medicineAlarmForm,
                                        durationType: durationType,
                                        endDate: endDate.toISOString().split('T')[0]
                                    });
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg font-bold"
                            >
                                <option value="days">일</option>
                                <option value="weeks">주</option>
                                <option value="months">개월</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 font-bold">
                        복용 기간: {medicineAlarmForm.duration || 7} {medicineAlarmForm.durationType === 'days' ? '일' : medicineAlarmForm.durationType === 'weeks' ? '주' : '개월'}
                    </p>
                </>
            )}
            <p className="text-xs text-blue-600 mb-3 font-bold">
                📅 기간: {medicineAlarmForm.startDate || new Date().toISOString().split('T')[0]} ~ {medicineAlarmForm.endDate || (() => {
                    const date = new Date(medicineAlarmForm.startDate || new Date());
                    const duration = medicineAlarmForm.duration || 7;
                    const durationType = medicineAlarmForm.durationType || 'days';
                    if (durationType === 'days') {
                        date.setDate(date.getDate() + duration - 1);
                    } else if (durationType === 'weeks') {
                        date.setDate(date.getDate() + (duration * 7) - 1);
                    } else if (durationType === 'months') {
                        date.setMonth(date.getMonth() + duration);
                        date.setDate(date.getDate() - 1);
                    }
                    return date.toISOString().split('T')[0];
                })()}
            </p>
            <label className="block text-sm font-bold text-slate-700 mb-2">복용 시작일</label>
            <input
                type="date"
                value={medicineAlarmForm.startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                    const startDate = e.target.value;
                    const duration = medicineAlarmForm.duration || 7;
                    const durationType = medicineAlarmForm.durationType || 'days';
                    const endDateObj = new Date(startDate);

                    if (durationType === 'days') {
                        endDateObj.setDate(endDateObj.getDate() + duration - 1);
                    } else if (durationType === 'weeks') {
                        endDateObj.setDate(endDateObj.getDate() + (duration * 7) - 1);
                    } else if (durationType === 'months') {
                        endDateObj.setMonth(endDateObj.getMonth() + duration);
                        endDateObj.setDate(endDateObj.getDate() - 1);
                    }

                    setMedicineAlarmForm({
                        ...medicineAlarmForm,
                        startDate: startDate,
                        endDate: endDateObj.toISOString().split('T')[0]
                    });
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg font-bold"
            />
            <label className="block text-sm font-bold text-slate-700 mb-2 mt-4">복용 종료일</label>
            <input
                type="date"
                value={medicineAlarmForm.endDate || (() => {
                    const date = new Date(medicineAlarmForm.startDate || new Date());
                    const duration = medicineAlarmForm.duration || 7;
                    const durationType = medicineAlarmForm.durationType || 'days';
                    if (durationType === 'days') {
                        date.setDate(date.getDate() + duration - 1);
                    } else if (durationType === 'weeks') {
                        date.setDate(date.getDate() + (duration * 7) - 1);
                    } else if (durationType === 'months') {
                        date.setMonth(date.getMonth() + duration);
                        date.setDate(date.getDate() - 1);
                    }
                    return date.toISOString().split('T')[0];
                })()}
                onChange={(e) => setMedicineAlarmForm({ ...medicineAlarmForm, endDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg font-bold"
            />
            <p className="text-xs text-slate-500 mt-2 font-bold">
                시작일: {medicineAlarmForm.startDate || new Date().toISOString().split('T')[0]} → 종료일: {medicineAlarmForm.endDate || (() => {
                    const date = new Date(medicineAlarmForm.startDate || new Date());
                    const duration = medicineAlarmForm.duration || 7;
                    const durationType = medicineAlarmForm.durationType || 'days';
                    if (durationType === 'days') {
                        date.setDate(date.getDate() + duration - 1);
                    } else if (durationType === 'weeks') {
                        date.setDate(date.getDate() + (duration * 7) - 1);
                    } else if (durationType === 'months') {
                        date.setMonth(date.getMonth() + duration);
                        date.setDate(date.getDate() - 1);
                    }
                    return date.toISOString().split('T')[0];
                })()}
            </p>
        </div>
    );
};

export default DurationSettings;