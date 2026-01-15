import React from 'react';
import { Camera, Plus, X } from 'lucide-react';

// 약 복용 관리 모달 (처방전 분석 + 알림 관리)
const MedicineSettingsModal = ({
    showMedicineSettings,
    setShowMedicineSettings,
    apiKey,
    medicineAlarms,
    setMedicineAlarms,
    addMedicineAlarm,
    setMedicineAlarmForm,
    setEditingMedicineAlarm,
    setShowMedicineAlarmModal,
    setConfirmedTasks,
    setChatHistory
}) => {
    if (!showMedicineSettings) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowMedicineSettings(false)}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-slate-900">💊 약 복용 관리</h2>
                    <button
                        onClick={() => setShowMedicineSettings(false)}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* 처방전 사진 업로드 섹션 */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Camera size={32} className="text-blue-600" />
                            <h3 className="text-xl font-black text-blue-900">처방전 사진 분석</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 font-bold">
                            병원에서 받은 처방전 사진을 업로드하면 약 정보를 자동으로 분석하여 알림을 설정합니다.
                        </p>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    // 이미지 미리보기
                                    const reader = new FileReader();
                                    reader.onload = async (event) => {
                                        const imageData = event.target?.result;

                                        // OCR 분석 (Google Gemini API 사용)
                                        try {
                                            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    contents: [{
                                                        parts: [
                                                            {
                                                                text: `이 처방전 이미지를 분석해서 다음 정보를 JSON 형식으로 추출해주세요:
{
  "medicines": [
    {
      "name": "약 이름",
      "dosage": "1회 복용량 (예: 1정, 2캡슐)",
      "frequency": "복용 횟수 (예: 하루 3회, 하루 2회)",
      "duration": "복용 기간 (예: 7일, 14일)",
      "timing": "복용 시기 (예: 식전, 식후, 식사와 함께)"
    }
  ],
  "totalDays": "총 복용 일수"
}

한국어 처방전이므로 약 이름, 복용량, 횟수, 기간을 정확히 추출해주세요.`
                                                            },
                                                            {
                                                                inlineData: {
                                                                    mimeType: file.type,
                                                                    data: imageData.toString().split(',')[1]
                                                                }
                                                            }
                                                        ]
                                                    }]
                                                })
                                            });

                                            const data = await response.json();
                                            const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

                                            // JSON 파싱
                                            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
                                            if (jsonMatch) {
                                                const medicineData = JSON.parse(jsonMatch[0]);

                                                // 약 정보를 자동으로 알림에 등록 (위와 동일한 로직)
                                                if (medicineData.medicines && medicineData.medicines.length > 0) {
                                                    const mealTimes = { breakfast: '08:00', lunch: '13:00', dinner: '19:00' };
                                                    const baseTimestamp = Date.now();
                                                    const newAlarms = [];
                                                    const newTasks = [];
                                                    const today = new Date();

                                                    medicineData.medicines.forEach((medicine, medIdx) => {
                                                        const frequency = medicine.frequency || '하루 1회';
                                                        const isThreeTimes = frequency.includes('3') || frequency.includes('세번') || frequency.includes('세 번');
                                                        const isTwoTimes = frequency.includes('2') || frequency.includes('두번') || frequency.includes('두 번');

                                                        let mealsToAdd = [];
                                                        if (isThreeTimes) {
                                                            mealsToAdd = ['breakfast', 'lunch', 'dinner'];
                                                        } else if (isTwoTimes) {
                                                            mealsToAdd = ['breakfast', 'dinner'];
                                                        } else {
                                                            mealsToAdd = ['breakfast'];
                                                        }

                                                        const timing = medicine.timing || '';
                                                        if (timing.includes('식전') || timing.includes('식사전')) {
                                                            mealsToAdd = mealsToAdd.map(meal => ({
                                                                meal,
                                                                time: meal === 'breakfast' ? '07:30' : meal === 'lunch' ? '12:30' : '18:30'
                                                            }));
                                                        } else {
                                                            mealsToAdd = mealsToAdd.map(meal => ({
                                                                meal,
                                                                time: mealTimes[meal]
                                                            }));
                                                        }

                                                        mealsToAdd.forEach((mealData, mealIdx) => {
                                                            const meal = typeof mealData === 'string' ? mealData : mealData.meal;
                                                            const time = typeof mealData === 'string' ? mealTimes[meal] : mealData.time;
                                                            const alarmId = `medicine_${baseTimestamp}_${medIdx}_${mealIdx}_${meal}`;

                                                            // 복용 기간 파싱 (예: "7일", "2주", "1개월")
                                                            let duration = 7;
                                                            let durationType = 'days';
                                                            if (medicine.duration) {
                                                                const durationStr = String(medicine.duration);
                                                                if (durationStr.includes('주') || durationStr.includes('week')) {
                                                                    duration = parseInt(durationStr) || 1;
                                                                    durationType = 'weeks';
                                                                } else if (durationStr.includes('개월') || durationStr.includes('월') || durationStr.includes('month')) {
                                                                    duration = parseInt(durationStr) || 1;
                                                                    durationType = 'months';
                                                                } else {
                                                                    duration = parseInt(durationStr) || 7;
                                                                    durationType = 'days';
                                                                }
                                                            }

                                                            const alarmData = {
                                                                id: alarmId,
                                                                name: `${medicine.name || '약'} ${meal === 'breakfast' ? '(아침)' : meal === 'lunch' ? '(점심)' : '(저녁)'}`,
                                                                time: time,
                                                                days: [0, 1, 2, 3, 4, 5, 6],
                                                                enabled: true,
                                                                afterMeals: [meal],
                                                                dosage: medicine.dosage,
                                                                duration: duration,
                                                                durationType: durationType,
                                                                startDate: new Date().toISOString().split('T')[0]
                                                            };
                                                            const newAlarm = addMedicineAlarm(alarmData);
                                                            newAlarms.push(newAlarm);

                                                            // 복용 기간 내의 모든 요일에 맞는 일정 생성
                                                            const selectedDays = alarmData.days || [0, 1, 2, 3, 4, 5, 6];
                                                            const startDate = new Date(alarmData.startDate || today.toISOString().split('T')[0]);
                                                            startDate.setHours(0, 0, 0, 0);

                                                            // 복용 종료일
                                                            const endDate = new Date(alarmData.endDate || (() => {
                                                                const date = new Date(startDate);
                                                                date.setDate(date.getDate() + 6);
                                                                return date.toISOString().split('T')[0];
                                                            })());
                                                            endDate.setHours(23, 59, 59, 999);

                                                            let currentDate = new Date(startDate);
                                                            let taskCount = 0;
                                                            const maxTasks = 200;

                                                            while (currentDate <= endDate && taskCount < maxTasks) {
                                                                const dayOfWeek = currentDate.getDay();

                                                                if (selectedDays.includes(dayOfWeek)) {
                                                                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                                                                    const taskId = `task_${baseTimestamp}_${medIdx}_${mealIdx}_${meal}_${dateStr}`;
                                                                    newTasks.push({
                                                                        id: taskId,
                                                                        title: alarmData.name,
                                                                        date: dateStr,
                                                                        time: time,
                                                                        location: '',
                                                                        category: 'work',
                                                                        completed: false,
                                                                        reminderActive: true,
                                                                        repeat: false,
                                                                        repeatType: 'weekly',
                                                                        repeatDays: selectedDays,
                                                                        isMedicineAlarm: true,
                                                                        medicineAlarmId: alarmId,
                                                                        medicineStartDate: alarmData.startDate,
                                                                        medicineEndDate: alarmData.endDate
                                                                    });
                                                                    taskCount++;
                                                                }

                                                                currentDate.setDate(currentDate.getDate() + 1);
                                                            }
                                                        });
                                                    });

                                                    setMedicineAlarms(prev => [...prev, ...newAlarms]);
                                                    setConfirmedTasks(prev => {
                                                        // 기존 일정의 고유 키 생성 (medicineAlarmId_date_time)
                                                        const existingTaskKeys = new Set(
                                                            prev
                                                                .filter(t => t.isMedicineAlarm && t.medicineAlarmId)
                                                                .map(t => `${t.medicineAlarmId}_${t.date}_${t.time}`)
                                                        );

                                                        // 중복되지 않는 일정만 추가
                                                        const tasksToAdd = newTasks.filter(task => {
                                                            const taskKey = `${task.medicineAlarmId}_${task.date}_${task.time}`;
                                                            return !existingTaskKeys.has(taskKey);
                                                        });

                                                        console.log('💊 처방전 분석 일정 추가:', {
                                                            전체일정수: newTasks.length,
                                                            추가될일정수: tasksToAdd.length
                                                        });
                                                        return [...prev, ...tasksToAdd];
                                                    });

                                                    setChatHistory(prev => [...prev, {
                                                        role: 'assistant',
                                                        type: 'medicineAnalysis',
                                                        content: `✅ 처방전을 분석하여 약 복용 알림을 자동으로 설정했습니다!\n\n${medicineData.medicines.map((m, idx) =>
                                                            `💊 ${m.name || '약'} ${idx + 1}\n   - 복용량: ${m.dosage || '미지정'}\n   - 횟수: ${m.frequency || '미지정'}\n   - 기간: ${m.duration || '미지정'}\n   - 시기: ${m.timing || '미지정'}`
                                                        ).join('\n\n')}\n\n일정에도 자동으로 추가되었습니다.`,
                                                        medicineData: medicineData,
                                                        timestamp: Date.now()
                                                    }]);
                                                } else {
                                                    setChatHistory(prev => [...prev, {
                                                        role: 'assistant',
                                                        type: 'medicineAnalysis',
                                                        content: `처방전을 분석했습니다. 약 복용 알림을 설정하시겠습니까?`,
                                                        medicineData: medicineData,
                                                        timestamp: Date.now()
                                                    }]);
                                                }
                                            }
                                        } catch (error) {
                                            console.error('처방전 분석 실패:', error);
                                            alert('처방전 분석에 실패했습니다. 수동으로 입력해주세요.');
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                }}
                                className="hidden"
                                id="prescription-upload"
                            />
                            <label
                                htmlFor="prescription-upload"
                                className="block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 text-center cursor-pointer"
                            >
                                📷 처방전 사진 업로드
                            </label>
                        </div>
                    </div>

                    {/* 약 복용 알림 설정 */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-black text-green-900">약 복용 알림 설정</h3>
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                    setMedicineAlarmForm({
                                        name: '약 복용',
                                        time: defaultTime,
                                        days: [0, 1, 2, 3, 4, 5, 6],
                                        enabled: true,
                                        afterMeals: ['breakfast'],
                                        duration: 7,
                                        durationType: 'days',
                                        startDate: new Date().toISOString().split('T')[0]
                                    });
                                    setEditingMedicineAlarm(null);
                                    setShowMedicineAlarmModal(true);
                                }}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-sm hover:bg-green-200 transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} />
                                알림 추가
                            </button>
                        </div>
                        <div className="space-y-3">
                            {medicineAlarms.length === 0 ? (
                                <p className="text-sm text-slate-400 p-4 bg-slate-50 rounded-xl">설정된 약 복용 알림이 없습니다.</p>
                            ) : (
                                medicineAlarms.map((alarm, alarmIdx) => (
                                    <div key={`medicine_alarm_${alarm.id}_${alarmIdx}`} className="bg-white rounded-xl p-4 border border-slate-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800">{alarm.name}</p>
                                                <p className="text-sm text-slate-600">{alarm.time} {alarm.afterMeal ? `(${alarm.afterMeal === 'breakfast' ? '아침 식사후' : alarm.afterMeal === 'lunch' ? '점심 식사후' : '저녁 식사후'})` : ''}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {alarm.days?.length === 7 ? '매일' :
                                                        alarm.days?.length === 5 && !alarm.days?.includes(0) && !alarm.days?.includes(6) ? '평일' :
                                                            `${alarm.days?.length || 0}일/주`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setMedicineAlarmForm(alarm);
                                                        setEditingMedicineAlarm(alarm.id);
                                                        setShowMedicineAlarmModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-xs hover:bg-green-200"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const updated = medicineAlarms.map(a =>
                                                            a.id === alarm.id ? { ...a, enabled: !a.enabled } : a
                                                        );
                                                        setMedicineAlarms(updated);
                                                    }}
                                                    className={`px-3 py-1 rounded-lg font-bold text-xs ${alarm.enabled
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-slate-200 text-slate-500'
                                                        }`}
                                                >
                                                    {alarm.enabled ? '활성' : '비활성'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('이 알림을 삭제하시겠습니까?')) {
                                                            const updated = medicineAlarms.filter(a => a.id !== alarm.id);
                                                            setMedicineAlarms(updated);
                                                        }
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicineSettingsModal;
