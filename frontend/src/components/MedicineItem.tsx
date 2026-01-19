import { useState } from 'react'
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
  const [isMarking, setIsMarking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localTaken, setLocalTaken] = useState(alarm.is_taken || false)

  /**
   * 복용 시간 목록 가져오기
   */
  const getTimes = () => {
    const times: string[] = []
    if (alarm.time_1) times.push(alarm.time_1)
    if (alarm.time_2) times.push(alarm.time_2)
    if (alarm.time_3) times.push(alarm.time_3)
    if (alarm.time_4) times.push(alarm.time_4)
    return times
  }

  /**
   * 복용 완료 처리
   */
  const handleMarkTaken = async () => {
    if (isMarking || localTaken) return

    setIsMarking(true)
    setError(null)

    try {
      await medicineAPI.markTaken(alarm.id)
      setLocalTaken(true)
      
      if (onMarkTaken) {
        onMarkTaken(alarm.id)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '복용 기록에 실패했습니다.'
      setError(errorMessage)
      setTimeout(() => setError(null), 3000)
      console.error('복용 기록 오류:', error)
    } finally {
      setIsMarking(false)
    }
  }

  const times = getTimes()
  const currentTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`p-4 border rounded-lg transition-colors ${
      localTaken ? 'bg-green-50 border-green-200' : 'bg-white border-gray-300'
    } ${error ? 'border-red-300 bg-red-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 약 이름 */}
          <h3 className={`text-lg font-semibold ${localTaken ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {alarm.medicine_name}
          </h3>
          
          {/* 복용량 */}
          <p className="text-sm text-gray-600 mt-1">
            복용량: {alarm.dosage}
          </p>

          {/* 복용 시간 목록 */}
          <div className="mt-2 space-y-1">
            {times.map((time, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>{time}</span>
                {alarm.last_taken && time === alarm.time_1 && (
                  <span className="ml-2 text-xs text-green-600">(복용 완료)</span>
                )}
              </div>
            ))}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}
        </div>

        {/* 복용 완료 버튼 */}
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleMarkTaken}
            disabled={isMarking || localTaken}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              localTaken
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : isMarking
                ? 'bg-gray-100 text-gray-500 cursor-wait'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isMarking ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                처리 중...
              </div>
            ) : localTaken ? (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                복용 완료
              </div>
            ) : (
              '복용 완료'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
