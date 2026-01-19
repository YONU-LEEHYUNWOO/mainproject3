import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarViewProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  taskCounts: { [key: string]: { total: number; completed: number } }
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onDateSelect,
  taskCounts
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // 달력 계산 유틸리티
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  // 날짜 포맷팅
  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // 이전/다음 달 이동
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  // 날짜 선택 핸들러
  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onDateSelect(newDate)
  }

  /**
   * 오늘 날짜 확인
   */
  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day &&
           today.getMonth() === currentMonth.getMonth() &&
           today.getFullYear() === currentMonth.getFullYear()
  }

  /**
   * 선택된 날짜 확인
   */
  const isSelected = (day: number) => {
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === currentMonth.getMonth() &&
           selectedDate.getFullYear() === currentMonth.getFullYear()
  }

  /**
   * 오늘 날짜와 선택된 날짜가 같은지 확인
   */
  const isTodayAndSelected = (day: number) => {
    return isToday(day) && isSelected(day)
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  // 빈 칸 계산 (이전 달)
  const emptyCells = Array.from({ length: startingDayOfWeek }, (_, i) => i)

  // 날짜 셀들
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800">
          {year}년 {month + 1}월
        </h2>

        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 빈 칸들 */}
        {emptyCells.map(i => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}

        {/* 날짜 셀들 */}
        {dayCells.map(day => {
          const dateKey = formatDateKey(year, month, day)
          const counts = taskCounts[dateKey] || { total: 0, completed: 0 }
          const hasTasks = counts.total > 0

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`
                relative p-2 min-h-[60px] text-left hover:bg-gray-50 transition-colors rounded-md
                ${isTodayAndSelected(day)
                  ? 'bg-blue-100 border-2 border-blue-600 shadow-md'
                  : isToday(day)
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : isSelected(day)
                  ? 'bg-blue-100 border border-blue-300'
                  : 'border border-transparent'
                }
              `}
            >
              {/* 날짜 숫자 */}
              <span className={`
                text-sm font-medium
                ${isTodayAndSelected(day)
                  ? 'text-blue-700 font-bold'
                  : isToday(day)
                  ? 'text-blue-600 font-semibold'
                  : isSelected(day)
                  ? 'text-blue-700'
                  : 'text-gray-700'
                }
              `}>
                {day}
              </span>

              {/* 일정 표시 */}
              {hasTasks && (
                <div className="mt-1 space-y-1">
                  {/* 완료된 일정 */}
                  {counts.completed > 0 && (
                    <div className="flex items-center text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-green-600">{counts.completed}</span>
                    </div>
                  )}

                  {/* 미완료 일정 */}
                  {counts.total - counts.completed > 0 && (
                    <div className="flex items-center text-xs">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                      <span className="text-purple-600">{counts.total - counts.completed}</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}