import { useState } from 'react'
import { Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'

interface MedicineAlarmCardProps {
  alarm: {
    id: number
    medicine_name: string
    dosage: string
    time_1: string
    time_2?: string
    time_3?: string
    time_4?: string
    start_date: string
    end_date?: string
    is_active?: boolean
  }
  onEdit: (alarm: any) => void
  onDelete: (alarmId: number) => void
  onToggle: (alarmId: number) => void
}

/**
 * 약 알림 카드 컴포넌트 (자식 모드용)
 */
export const MedicineAlarmCard: React.FC<MedicineAlarmCardProps> = ({
  alarm,
  onEdit,
  onDelete,
  onToggle
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

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
   * 삭제 확인 핸들러
   */
  const handleDelete = () => {
    if (window.confirm(`"${alarm.medicine_name}" 약 알림을 삭제하시겠습니까?`)) {
      setIsDeleting(true)
      onDelete(alarm.id)
    }
  }

  const times = getTimes()

  return (
    <div className={`p-4 border rounded-lg transition-colors ${
      alarm.is_active === false ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 약 이름 */}
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{alarm.medicine_name}</h3>
            {alarm.is_active === false && (
              <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">비활성화</span>
            )}
          </div>

          {/* 복용량 */}
          <p className="text-sm text-gray-600 mb-2">
            복용량: {alarm.dosage}
          </p>

          {/* 복용 시간 목록 */}
          <div className="space-y-1 mb-2">
            {times.map((time, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>{time}</span>
              </div>
            ))}
          </div>

          {/* 복용 기간 */}
          <div className="text-xs text-gray-500">
            {alarm.start_date} ~ {alarm.end_date || '무기한'}
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onToggle(alarm.id)}
            className={`p-2 rounded-lg transition-colors ${
              alarm.is_active === false
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={alarm.is_active === false ? '활성화' : '비활성화'}
          >
            {alarm.is_active === false ? (
              <XCircle className="h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => onEdit(alarm)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            title="수정"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
            title="삭제"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
