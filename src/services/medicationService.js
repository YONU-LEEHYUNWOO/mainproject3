// 약 복용 서비스
export const getMedicationPlans = (seniorId) => {
  return JSON.parse(localStorage.getItem(`carelink_medications_${seniorId}`) || '[]')
}

export const checkMedication = (medicationId, seniorId, date, time, taken) => {
  const medications = getMedicationPlans(seniorId)
  const medication = medications.find(m => m.id === medicationId)
  if (medication) {
    if (!medication.checked) medication.checked = {}
    if (!medication.checked[date]) medication.checked[date] = {}
    medication.checked[date][time] = { checked: true, taken, checkedAt: new Date().toISOString() }
    localStorage.setItem(`carelink_medications_${seniorId}`, JSON.stringify(medications))
  }
}

export const scheduleMedicationReminder = (medicationId, seniorId, date, time) => {
  // 10분 후 재알림
  setTimeout(() => {
    const notifications = JSON.parse(localStorage.getItem('carelink_notifications') || '[]')
    notifications.push({
      id: Date.now(),
      type: 'medication_reminder',
      title: '약 복용 알림',
      message: '약 복용을 확인해주세요.',
      read: false,
      createdAt: new Date().toISOString()
    })
    localStorage.setItem('carelink_notifications', JSON.stringify(notifications))
  }, 10 * 60 * 1000)
}
