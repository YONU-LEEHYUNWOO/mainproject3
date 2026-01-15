/**
 * 약 복용 알림 모달 상태 및 로직 관리 훅
 */
export const useMedicineAlarmModal = ({
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

    /**
     * 알림 저장 핸들러 (추가/수정)
     */
    const handleSave = () => {
        if (!medicineAlarmForm.name || !medicineAlarmForm.time || !medicineAlarmForm.days || medicineAlarmForm.days.length === 0) {
            alert('알림 이름, 시간, 요일을 모두 입력해주세요.');
            return;
        }

        if (!medicineAlarmForm.afterMeals || medicineAlarmForm.afterMeals.length === 0) {
            alert('복용 시기를 최소 1개 이상 선택해주세요.');
            return;
        }

        // afterMeals 배열을 기반으로 여러 알림 생성 (아침/점심/저녁 각각)
        const mealTimes = {
            breakfast: '08:00',
            lunch: '13:00',
            dinner: '19:00'
        };

        if (editingMedicineAlarm) {
            // 기존 알림 수정 - 선택된 식사 시간별로 알림 생성/수정
            const selectedMeals = medicineAlarmForm.afterMeals || [];
            const existingAlarm = medicineAlarms.find(a => a.id === editingMedicineAlarm);

            if (existingAlarm) {
                // 기존 알림 삭제
                const updatedAlarms = medicineAlarms.filter(a => a.id !== editingMedicineAlarm);

                // 기존 알림과 연결된 일정 삭제
                setConfirmedTasks(prev => prev.filter(task =>
                    !(task.isMedicineAlarm && task.medicineAlarmId === editingMedicineAlarm)
                ));

                // 새로운 알림 생성
                const baseTimestamp = Date.now();
                const newAlarms = selectedMeals.map((meal, idx) => {
                    const alarmData = {
                        ...medicineAlarmForm,
                        id: `medicine_${baseTimestamp}_${idx}_${meal}`,
                        afterMeals: [meal],
                        time: mealTimes[meal] || medicineAlarmForm.time,
                        name: `${medicineAlarmForm.name} ${meal === 'breakfast' ? '(아침)' : meal === 'lunch' ? '(점심)' : '(저녁)'}`
                    };
                    return addMedicineAlarm(alarmData);
                });

                setMedicineAlarms([...updatedAlarms, ...newAlarms]);

                // 새로운 일정 생성 (요일 설정 및 복용 기간 반영)
                createMedicineTasks(newAlarms, selectedMeals, mealTimes, baseTimestamp);

                // 채팅 히스토리에 수정 메시지 추가
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: `💊 약 복용 알림이 수정되었습니다.\n${selectedMeals.map(m =>
                        `- ${m === 'breakfast' ? '아침' : m === 'lunch' ? '점심' : '저녁'} 식사후: ${mealTimes[m] || medicineAlarmForm.time}`
                    ).join('\n')}\n일정도 함께 업데이트되었습니다.`,
                    timestamp: Date.now()
                }]);
            }
        } else {
            // 새 알림 추가 - 선택된 식사 시간별로 여러 알림 생성
            const selectedMeals = medicineAlarmForm.afterMeals || [];
            const baseTimestamp = Date.now();
            const newAlarms = selectedMeals.map((meal, idx) => {
                const alarmData = {
                    ...medicineAlarmForm,
                    id: `medicine_${baseTimestamp}_${idx}_${meal}`, // 고유한 ID 생성 (타임스탬프 + 인덱스 + 식사 시간)
                    afterMeals: [meal], // 각 알림은 하나의 식사 시간만 가짐
                    time: mealTimes[meal] || medicineAlarmForm.time,
                    name: `${medicineAlarmForm.name} ${meal === 'breakfast' ? '(아침)' : meal === 'lunch' ? '(점심)' : '(저녁)'}`
                };
                return addMedicineAlarm(alarmData);
            });

            setMedicineAlarms(prev => [...prev, ...newAlarms]);

            // 약 복용 알림을 일정에도 자동 추가 (채팅/달력 연동, 요일 설정 반영)
            createMedicineTasks(newAlarms, selectedMeals, mealTimes, baseTimestamp);

            // 채팅 히스토리에 알림 추가 메시지 표시
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: `💊 약 복용 알림이 설정되었습니다.\n${selectedMeals.map(m =>
                    `- ${m === 'breakfast' ? '아침' : m === 'lunch' ? '점심' : '저녁'} 식사후: ${mealTimes[m] || medicineAlarmForm.time}`
                ).join('\n')}\n일정에도 자동으로 추가되었습니다.`,
                timestamp: Date.now()
            }]);
        }

        setShowMedicineAlarmModal(false);
        setEditingMedicineAlarm(null);
        alert('약 복용 알림이 저장되었습니다.');
    };

    /**
     * 약 복용 일정 생성 헬퍼 함수
     */
    const createMedicineTasks = (newAlarms, selectedMeals, mealTimes, taskBaseTimestamp) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDays = medicineAlarmForm.days || [0, 1, 2, 3, 4, 5, 6];
        const newTasks = [];

        // 복용 기간이 있으면 기간 내 일정 생성, 없으면 반복 일정으로 생성
        const hasDuration = medicineAlarmForm.duration != null && medicineAlarmForm.duration > 0 && medicineAlarmForm.endDate;

        // 각 식사 시간별로 일정 생성 (아침/점심/저녁 모두 처리)
        selectedMeals.forEach((meal, mealIdx) => {
            const currentAlarmId = newAlarms[mealIdx]?.id;

            if (!currentAlarmId) {
                console.warn(`⚠️ 알림 ID를 찾을 수 없습니다: mealIdx=${mealIdx}, meal=${meal}`);
                return;
            }

            if (hasDuration) {
                // 복용 기간이 있으면: 기간 내의 모든 요일에 맞는 일정 생성
                const startDate = new Date(medicineAlarmForm.startDate || today);
                startDate.setHours(0, 0, 0, 0);

                let endDate;
                if (medicineAlarmForm.endDate) {
                    endDate = new Date(medicineAlarmForm.endDate);
                } else {
                    const duration = medicineAlarmForm.duration || 7;
                    const durationType = medicineAlarmForm.durationType || 'days';
                    endDate = new Date(startDate);

                    if (durationType === 'days') {
                        endDate.setDate(startDate.getDate() + duration - 1);
                    } else if (durationType === 'weeks') {
                        endDate.setDate(startDate.getDate() + (duration * 7) - 1);
                    } else if (durationType === 'months') {
                        endDate.setMonth(startDate.getMonth() + duration);
                        endDate.setDate(endDate.getDate() - 1);
                    }
                }
                endDate.setHours(23, 59, 59, 999);

                let currentDate = new Date(startDate);
                let taskCount = 0;
                const maxTasks = 200;

                while (currentDate <= endDate && taskCount < maxTasks) {
                    const dayOfWeek = currentDate.getDay();

                    if (selectedDays.includes(dayOfWeek)) {
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

                        newTasks.push({
                            id: `task_${taskBaseTimestamp}_${mealIdx}_${dateStr}_${meal}`,
                            title: `${medicineAlarmForm.name} ${meal === 'breakfast' ? '(아침)' : meal === 'lunch' ? '(점심)' : '(저녁)'}`,
                            date: dateStr,
                            time: mealTimes[meal] || medicineAlarmForm.time,
                            location: '',
                            category: 'work',
                            completed: false,
                            reminderActive: true,
                            repeat: false,
                            repeatType: 'weekly',
                            repeatDays: selectedDays,
                            isMedicineAlarm: true,
                            medicineAlarmId: currentAlarmId
                        });
                        taskCount++;
                    }

                    currentDate.setDate(currentDate.getDate() + 1);
                }
            } else {
                // 복용 기간이 없으면: 반복 일정으로 생성 (다음 4주치만 미리 생성)
                const seenDates = new Set();

                for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
                    selectedDays.forEach(dayOfWeek => {
                        const taskDate = new Date(today);
                        const currentDayOfWeek = taskDate.getDay();

                        let daysUntilTargetDay;
                        if (currentDayOfWeek === dayOfWeek && weekOffset === 0) {
                            daysUntilTargetDay = 0;
                        } else {
                            daysUntilTargetDay = (dayOfWeek - currentDayOfWeek + 7) % 7;
                            if (daysUntilTargetDay === 0 && weekOffset > 0) {
                                daysUntilTargetDay = 7;
                            }
                        }

                        taskDate.setDate(taskDate.getDate() + daysUntilTargetDay + (weekOffset * 7));
                        taskDate.setHours(0, 0, 0, 0);

                        const dateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;

                        const uniqueKey = `${dateStr}_${meal}`;
                        if (!seenDates.has(uniqueKey) && taskDate >= today) {
                            seenDates.add(uniqueKey);

                            newTasks.push({
                                id: `task_${taskBaseTimestamp}_${mealIdx}_${dayOfWeek}_${weekOffset}_${meal}`,
                                title: `${medicineAlarmForm.name} ${meal === 'breakfast' ? '(아침)' : meal === 'lunch' ? '(점심)' : '(저녁)'}`,
                                date: dateStr,
                                time: mealTimes[meal] || medicineAlarmForm.time,
                                location: '',
                                category: 'work',
                                completed: false,
                                reminderActive: true,
                                repeat: true,
                                repeatType: 'weekly',
                                repeatDays: selectedDays,
                                isMedicineAlarm: true,
                                medicineAlarmId: currentAlarmId
                            });
                        }
                    });
                }
            }
        });

        // 모든 일정 추가 (중복 체크)
        setConfirmedTasks(prev => {
            const existingTaskKeys = new Set(
                prev
                    .filter(t => t.isMedicineAlarm && t.medicineAlarmId)
                    .map(t => `${t.medicineAlarmId}_${t.date}_${t.time}`)
            );

            const tasksToAdd = newTasks.filter(task => {
                const taskKey = `${task.medicineAlarmId}_${task.date}_${task.time}`;
                return !existingTaskKeys.has(taskKey);
            });

            return [...prev, ...tasksToAdd];
        });
    };

    /**
     * 모달 닫기 핸들러
     */
    const handleClose = () => {
        setShowMedicineAlarmModal(false);
        setEditingMedicineAlarm(null);
    };

    return {
        handleSave,
        handleClose
    };
};