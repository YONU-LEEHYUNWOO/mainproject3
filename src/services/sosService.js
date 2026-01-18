// SOS 서비스
export const triggerSOS = (seniorId, location) => {
  const sosAlerts = JSON.parse(localStorage.getItem('carelink_sos_alerts') || '[]')
  const alert = {
    id: Date.now(),
    seniorId,
    location,
    createdAt: new Date().toISOString()
  }
  sosAlerts.push(alert)
  localStorage.setItem('carelink_sos_alerts', JSON.stringify(sosAlerts))
  return alert
}

export const getSOSAlertsForGuardian = (guardianId) => {
  const sosAlerts = JSON.parse(localStorage.getItem('carelink_sos_alerts') || '[]')
  return sosAlerts.map(alert => ({
    ...alert,
    message: '긴급 SOS 알림',
    guardianId
  }))
}

export const getSOSPhoneNumbers = (seniorId) => {
  return [
    { name: '보호자', phone: '010-1234-5678' },
    { name: '지정 이웃', phone: '010-9876-5432' }
  ]
}
