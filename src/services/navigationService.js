// 네비게이션 서비스
export const getTodayDepartureSchedules = (seniorId) => {
  const schedules = JSON.parse(localStorage.getItem('carelink_schedules') || '[]')
  const today = new Date().toISOString().split('T')[0]
  const todaySchedules = schedules.filter(s => s.seniorId === seniorId && s.dateTime.startsWith(today))
  
  return todaySchedules.map(schedule => ({
    schedule,
    message: {
      message: '곧 출발 시간입니다.',
      urgency: 'normal'
    }
  }))
}

export const getScheduleNavigationInfo = (scheduleId) => {
  return {
    navInfo: {
      estimatedTravelTime: 30
    },
    message: {
      message: '출발 시간이 곧 다가옵니다.',
      urgency: 'normal'
    }
  }
}
