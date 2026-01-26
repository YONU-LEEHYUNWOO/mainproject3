import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Clock, Loader2 } from 'lucide-react'
import { medicineAPI } from '../services/api'

interface MedicineItemProps {
  alarm: {
    id: number
    medicine_name: string
    dosage: string
    time_1: string
    time_2?: string
    time_3?: string
    time_4?: string
    last_taken?: string
    next_reminder?: string
    is_taken?: boolean
  }
  onMarkTaken?: (alarmId: number) => void
}

/**
 * 약 복용 아이템 컴포넌트 (부모 모드용)
 * 복용 완료 버튼 포함
 */
export const MedicineItem: React.FC<MedicineItemProps> = ({ alarm, onMarkTaken }) => {
  const [completedTimes, setCompletedTimes] = useState<Set<string>>(new Set())
  const [markingTime, setMarkingTime] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // alarm prop이 변경될 때 상태 동기화
  useEffect(() => {
    const dailyTaken = (alarm as any).daily_taken_times
    if (dailyTaken) {
      setCompletedTimes(new Set(dailyTaken.split(',')))
    } else {
      setCompletedTimes(new Set())
    }
  }, [alarm])

  const getTimes = () => {
    const times: string[] = []
    if (alarm.time_1) times.push(alarm.time_1)
    if (alarm.time_2) times.push(alarm.time_2)
    if (alarm.time_3) times.push(alarm.time_3)
    if (alarm.time_4) times.push(alarm.time_4)
    return times
  }

  const handleTimeClick = async (time: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (completedTimes.has(time) || markingTime) return

    setMarkingTime(time)
    setError(null)

    try {
      await medicineAPI.markTaken(alarm.id, time)
      setCompletedTimes(prev => new Set([...prev, time]))

      if (onMarkTaken) {
        onMarkTaken(alarm.id)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '복용 기록에 실패했습니다.'
      setError(errorMessage)
      setTimeout(() => setError(null), 3000)
      console.error('복용 기록 오류:', error)
    } finally {
      setMarkingTime(null)
    }
  }

  const times = getTimes()

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-3">{alarm.medicine_name}</h3>
      <p className="text-sm text-gray-600 mb-4">복용량: {alarm.dosage}</p>

      <div className="space-y-2">
        {times.map((time, index) => {
          const isCompleted = completedTimes.has(time)
          const isMarking = markingTime === time

          return (
            <div
              key={index}
              onClick={(e) => handleTimeClick(time, e)}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${isCompleted
                ? 'bg-green-50 border-green-300'
                : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
            >
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-blue-600" />
                <span className={`text-lg font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {time}
                </span>
              </div>

              <div>
                {isMarking ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                ) : isCompleted ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Circle className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-600 font-bold mt-2">{error}</p>}
    </div>
  )
}
