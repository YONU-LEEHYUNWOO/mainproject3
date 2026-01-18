// 동행 모드 서비스
export const startCompanionMode = (seniorId, guardianId, reason, type) => {
  const modes = JSON.parse(localStorage.getItem('carelink_companion_modes') || '[]')
  const mode = {
    id: Date.now(),
    seniorId,
    guardianId,
    reason,
    type,
    startedAt: new Date().toISOString(),
    active: true
  }
  modes.push(mode)
  localStorage.setItem('carelink_companion_modes', JSON.stringify(modes))
  return mode
}
