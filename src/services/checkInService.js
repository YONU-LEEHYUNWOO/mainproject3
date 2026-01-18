// 체크인 서비스
export const performCheckIn = (seniorId, isOk, symptoms = []) => {
  const checkIns = JSON.parse(localStorage.getItem('carelink_checkins') || '[]')
  const today = new Date().toISOString().split('T')[0]
  
  const checkIn = {
    id: Date.now(),
    seniorId,
    date: today,
    status: 'responded',
    isOk,
    symptoms,
    respondedAt: new Date().toISOString(),
    escalationLevel: 0
  }
  
  checkIns.push(checkIn)
  localStorage.setItem('carelink_checkins', JSON.stringify(checkIns))
  
  return checkIn
}

export const getTodayCheckIn = (seniorId) => {
  const checkIns = JSON.parse(localStorage.getItem('carelink_checkins') || '[]')
  const today = new Date().toISOString().split('T')[0]
  return checkIns.find(ci => ci.seniorId === seniorId && ci.date === today) || null
}

export const checkAndEscalateCheckIn = (seniorId) => {
  // 단순 구현
  return null
}
