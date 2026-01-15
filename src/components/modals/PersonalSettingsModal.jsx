import React from 'react';
import { X, Clock, Heart, Plus } from 'lucide-react';

/**
 * 개인설정 모달 컴포넌트
 * - 무활동 기준시간 설정
 * - 약 복용 관리 (처방전 업로드, 알림 설정)
 * 
 * @param {boolean} showPersonalSettings - 모달 표시 여부
 * @param {function} setShowPersonalSettings - 모달 표시 상태 변경 함수
 * @param {object} inactivitySettings - 무활동 설정 값
 * @param {function} setInactivitySettings - 무활동 설정 변경 함수
 * @param {function} saveInactivitySettings - 무활동 설정 저장 함수
 * @param {array} medicineAlarms - 약 복용 알림 목록
 * @param {function} setMedicineAlarms - 약 복용 알림 목록 변경 함수
 * @param {function} setMedicineAlarmForm - 약 복용 알림 폼 설정 함수
 * @param {function} setEditingMedicineAlarm - 편집 중인 알림 설정 함수
 * @param {function} setShowMedicineAlarmModal - 약 복용 알림 모달 표시 함수
 * @param {function} setChatHistory - 채팅 히스토리 업데이트 함수
 * @param {function} setConfirmedTasks - 확정된 일정 업데이트 함수
 * @param {string} apiKey - API 키
 */
const PersonalSettingsModal = ({
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
    // 모달이 표시되지 않으면 null 반환
    if (!showPersonalSettings) return null;

    // 처방전 분석 핸들러
    const handlePrescriptionUpload = async (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageData = event.target?.result;

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

                const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const medicineData = JSON.parse(jsonMatch[0]);
                    setChatHistory(prev => [...prev, {
                        role: 'assistant',
                        type: 'medicineAnalysis',
                        content: `처방전을 분석했습니다. 약 복용 알림을 설정하시겠습니까?`,
                        medicineData: medicineData,
                        timestamp: Date.now()
                    }]);
                }
            } catch (error) {
                console.error('처방전 분석 실패:', error);
                alert('처방전 분석에 실패했습니다. 수동으로 입력해주세요.');
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowPersonalSettings(false)}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-slate-900">개인설정</h2>
                    <button
                        onClick={() => setShowPersonalSettings(false)}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* 무활동 기준시간 설정 */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 border-2 border-orange-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock size={32} className="text-orange-600" />
                            <h3 className="text-xl font-black text-orange-900">무활동 기준시간 설정</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-black text-orange-700 mb-2 block">경고 시간 (분)</label>
                                <input
                                    type="number"
                                    min="5"
                                    max="120"
                                    value={inactivitySettings.warningMinutes}
                                    onChange={(e) => setInactivitySettings(prev => ({
                                        ...prev,
                                        warningMinutes: parseInt(e.target.value) || 30
                                    }))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-lg font-black"
                                />
                                <p className="text-xs text-orange-600 font-bold mt-1">{inactivitySettings.warningMinutes}분 후 경고 알림</p>
                            </div>
                            <div>
                                <label className="text-sm font-black text-orange-700 mb-2 block">보호자 알림 시간 (분)</label>
                                <input
                                    type="number"
                                    min="10"
                                    max="180"
                                    value={inactivitySettings.alertMinutes}
                                    onChange={(e) => setInactivitySettings(prev => ({
                                        ...prev,
                                        alertMinutes: parseInt(e.target.value) || 60
                                    }))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-lg font-black"
                                />
                                <p className="text-xs text-orange-600 font-bold mt-1">{inactivitySettings.alertMinutes}분 후 보호자에게 알림</p>
                            </div>
                            <button
                                onClick={() => {
                                    saveInactivitySettings(inactivitySettings);
                                    alert('무활동 기준시간 설정이 저장되었어요.');
                                }}
                                className="w-full px-6 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                저장
                            </button>
                        </div>
                    </div>

                    {/* 약 복용 관리 섹션 */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Heart size={32} className="text-blue-600" />
                            <h3 className="text-xl font-black text-blue-900">💊 약 복용 관리</h3>
                        </div>

                        {/* 처방전 사진 업로드 섹션 */}
                        <div className="mb-6">
                            <p className="text-sm text-slate-600 mb-4 font-bold">
                                병원에서 받은 처방전 사진을 업로드하면 약 정보를 자동으로 분석하여 알림을 설정합니다.
                            </p>
                            <div className="space-y-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => handlePrescriptionUpload(e.target.files?.[0])}
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
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-4 border-2 border-green-200">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-black text-green-900">약 복용 알림 설정</h4>
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
                                            duration: null,
                                            durationType: 'days',
                                            startDate: new Date().toISOString().split('T')[0],
                                            endDate: null
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
                                                    <p className="text-sm text-slate-600">
                                                        {alarm.time} {alarm.afterMeals && alarm.afterMeals.length > 0 ? `(${alarm.afterMeals.map(m =>
                                                            m === 'breakfast' ? '아침' :
                                                                m === 'lunch' ? '점심' : '저녁'
                                                        ).join(', ')} 식사후)` : ''}
                                                    </p>
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
                                                            if (confirm('이 알림을 삭제하시겠습니까? 연결된 일정도 함께 삭제됩니다.')) {
                                                                const updated = medicineAlarms.filter(a => a.id !== alarm.id);
                                                                setMedicineAlarms(updated);

                                                                setConfirmedTasks(prev => prev.filter(task =>
                                                                    !(task.isMedicineAlarm && task.medicineAlarmId === alarm.id)
                                                                ));

                                                                setChatHistory(prev => [...prev, {
                                                                    role: 'assistant',
                                                                    content: `💊 "${alarm.name}" 약 복용 알림과 연결된 일정이 삭제되었습니다.`,
                                                                    timestamp: Date.now()
                                                                }]);
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
        </div>
    );
};

export default PersonalSettingsModal;
