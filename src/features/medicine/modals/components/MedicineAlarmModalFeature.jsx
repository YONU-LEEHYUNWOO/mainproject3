import React from 'react';
import { useMedicineAlarmModal } from '../hooks/useMedicineAlarmModal';
import MedicineNameInput from './MedicineNameInput';
import MealTimingSelector from './MealTimingSelector';
import TimeSelector from './TimeSelector';
import DaySelector from './DaySelector';
import DurationSettings from './DurationSettings';
import AlarmToggle from './AlarmToggle';

/**
 * 약 복용 알림 설정 모달 메인 컴포넌트
 * 모든 하위 컴포넌트들을 조립하여 모달 UI 구성
 */
const MedicineAlarmModalFeature = ({
    showMedicineAlarmModal,
    setShowMedicineAlarmModal,
    editingMedicineAlarm,
    setEditingMedicineAlarm,
    medicineAlarmForm,
    setMedicineAlarmForm,
    medicineAlarms,
    setMedicineAlarms,
    addMedicineAlarm,
    setConfirmedTasks,
    setChatHistory
}) => {
    // 모달 로직 훅 사용
    const { handleSave, handleClose } = useMedicineAlarmModal({
        showMedicineAlarmModal,
        setShowMedicineAlarmModal,
        editingMedicineAlarm,
        setEditingMedicineAlarm,
        medicineAlarmForm,
        setMedicineAlarmForm,
        medicineAlarms,
        setMedicineAlarms,
        addMedicineAlarm,
        setConfirmedTasks,
        setChatHistory
    });

    // 모달이 표시되지 않으면 null 반환
    if (!showMedicineAlarmModal) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={() => {
                setShowMedicineAlarmModal(false);
                setEditingMedicineAlarm(null);
            }}
        >
            <div
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-800">약 복용 알림 설정</h3>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* 약 이름 입력 */}
                    <MedicineNameInput
                        medicineAlarmForm={medicineAlarmForm}
                        setMedicineAlarmForm={setMedicineAlarmForm}
                    />

                    {/* 복용 시기 선택 */}
                    <MealTimingSelector
                        medicineAlarmForm={medicineAlarmForm}
                        setMedicineAlarmForm={setMedicineAlarmForm}
                    />

                    {/* 알림 시간 선택 */}
                    <TimeSelector
                        medicineAlarmForm={medicineAlarmForm}
                        setMedicineAlarmForm={setMedicineAlarmForm}
                    />

                    {/* 반복 요일 선택 */}
                    <DaySelector
                        medicineAlarmForm={medicineAlarmForm}
                        setMedicineAlarmForm={setMedicineAlarmForm}
                    />

                    {/* 복용 기간 설정 */}
                    <DurationSettings
                        medicineAlarmForm={medicineAlarmForm}
                        setMedicineAlarmForm={setMedicineAlarmForm}
                    />

                    {/* 알림 활성화 토글 */}
                    <AlarmToggle
                        medicineAlarmForm={medicineAlarmForm}
                        setMedicineAlarmForm={setMedicineAlarmForm}
                    />

                    {/* 저장 버튼 */}
                    <button
                        onClick={handleSave}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        {editingMedicineAlarm ? '수정' : '추가'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicineAlarmModalFeature;