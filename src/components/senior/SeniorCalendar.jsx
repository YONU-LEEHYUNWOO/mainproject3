import { useState, useEffect } from 'react'
import { getSchedules } from '../../services/scheduleService'
import { storage } from '../../utils/storage'
import ScheduleChat from './ScheduleChat'
import './SeniorCalendar.css'

function SeniorCalendar({ familyLink }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [showScheduleChat, setShowScheduleChat] = useState(false)
  const [selectedDateForSchedule, setSelectedDateForSchedule] = useState(null)

  useEffect(() => {
    loadSchedules()
  }, [familyLink, currentDate])

  const loadSchedules = () => {
    try {
      let currentSeniorId = null
      if (familyLink?.seniorId) {
        currentSeniorId = familyLink.seniorId
      } else {
        const userData = storage.getUserData()
        if (userData?.id && userData.type === 'senior') {
          currentSeniorId = userData.id
        }
      }

      if (currentSeniorId) {
        const allSchedules = getSchedules(currentSeniorId)
        setSchedules(allSchedules)
      }
    } catch (error) {
      console.error('일정 로드 오류:', error)
      setSchedules([])
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // 이전 달의 마지막 날들
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      })
    }

    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    // 다음 달의 첫 날들
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }

    return days
  }

  const getSchedulesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return schedules.filter(s => s.dateTime.startsWith(dateStr))
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
  }

  const handleAddSchedule = (date) => {
    setSelectedDateForSchedule(date)
    setShowScheduleChat(true)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="senior-calendar">
      <div className="calendar-header">
        <button className="calendar-nav-button" onClick={handlePrevMonth}>‹</button>
        <h2 className="calendar-month-title">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <button className="calendar-nav-button" onClick={handleNextMonth}>›</button>
      </div>

      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => {
          const daySchedules = getSchedulesForDate(day.date)
          const isToday = day.date.toDateString() === new Date().toDateString()
          const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString()

          return (
            <div
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
            >
              <div className="calendar-day-number">{day.date.getDate()}</div>
              {daySchedules.length > 0 && (
                <div className="calendar-day-schedules">
                  {daySchedules.slice(0, 2).map(schedule => (
                    <div key={schedule.id} className="calendar-schedule-dot" title={schedule.title}></div>
                  ))}
                  {daySchedules.length > 2 && (
                    <div className="calendar-schedule-more">+{daySchedules.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 선택된 날짜의 일정 목록 및 일정 추가 버튼 */}
      {selectedDate && (
        <div className="calendar-selected-date-schedules">
          <h3 className="selected-date-title">
            {selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
          </h3>
          <button 
            className="add-schedule-to-date-button"
            onClick={() => handleAddSchedule(selectedDate)}
          >
            + 이 날짜에 일정 추가
          </button>
          {getSchedulesForDate(selectedDate).length > 0 ? (
            <div className="selected-date-schedule-list">
              {getSchedulesForDate(selectedDate).map(schedule => (
                <div key={schedule.id} className="selected-date-schedule-item">
                  <span className="schedule-time">
                    {new Date(schedule.dateTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="schedule-title">{schedule.title}</span>
                  {schedule.place && <span className="schedule-place">📍 {schedule.place}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-schedules-text">이 날짜에는 일정이 없습니다.</p>
          )}
        </div>
      )}

      {/* 일정 추가 채팅 */}
      {showScheduleChat && (
        <ScheduleChat
          familyLink={familyLink}
          onClose={() => {
            setShowScheduleChat(false)
            setSelectedDateForSchedule(null)
          }}
          onScheduleAdded={(schedule) => {
            loadSchedules()
            setSelectedDate(new Date(schedule.dateTime))
          }}
          defaultDate={selectedDateForSchedule}
        />
      )}
    </div>
  )
}

export default SeniorCalendar
