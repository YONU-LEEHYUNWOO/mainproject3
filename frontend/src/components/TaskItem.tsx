import { useState } from 'react'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'
import { tasksAPI } from '../services/api'

interface TaskItemProps {
  task: {
    id: number
    title: string
    description?: string
    date: string
    time?: string
    location?: string
    completed: boolean
    priority: number
    category: string
  }
  onToggleComplete?: (taskId: number, newCompleted: boolean) => void
}

/**
 * 일정 아이템 컴포넌트
 * 완료 토글 기능 포함
 */
export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete }) => {
  const [isToggling, setIsToggling] = useState(false)
  const [localCompleted, setLocalCompleted] = useState(task.completed)
  const [error, setError] = useState<string | null>(null)

  /**
   * 완료 상태 토글 핸들러
   * 낙관적 업데이트 적용
   */
  const handleToggleComplete = async () => {
    // 이미 처리 중이면 무시
    if (isToggling) return

    const newCompleted = !localCompleted
    setError(null)
    setIsToggling(true)

    // 낙관적 업데이트: 즉시 UI 업데이트
    setLocalCompleted(newCompleted)

    try {
      // API 호출
      await tasksAPI.toggleComplete(task.id)
      
      // 성공 시 부모 컴포넌트에 알림
      if (onToggleComplete) {
        onToggleComplete(task.id, newCompleted)
      }
    } catch (error: any) {
      // 실패 시 이전 상태로 롤백
      setLocalCompleted(!newCompleted)
      
      // 에러 메시지 설정
      const errorMessage = error.response?.data?.message || error.message || '일정 완료 상태 변경에 실패했습니다.'
      setError(errorMessage)
      
      // 3초 후 에러 메시지 자동 제거
      setTimeout(() => setError(null), 3000)
      
      console.error('일정 완료 토글 오류:', error)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
        localCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
      } ${error ? 'border-red-300 bg-red-50' : ''}`}
    >
      <div className="flex items-center space-x-3 flex-1">
        {/* 완료 토글 버튼 */}
        <button
          onClick={handleToggleComplete}
          disabled={isToggling}
          className={`flex-shrink-0 transition-colors ${
            isToggling
              ? 'text-gray-400 cursor-wait'
              : localCompleted
              ? 'text-green-500 hover:text-green-600'
              : 'text-gray-400 hover:text-blue-600'
          }`}
          title={localCompleted ? '완료 해제' : '완료 처리'}
        >
          {isToggling ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : localCompleted ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* 일정 정보 */}
        <div className={`flex-1 ${localCompleted ? 'line-through text-gray-500' : ''}`}>
          <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-500">
            {task.date} {task.time && `• ${task.time}`}
            {task.location && `• ${task.location}`}
          </p>
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>

      {/* 우선순위 배지 */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            task.priority === 1
              ? 'bg-green-100 text-green-800'
              : task.priority === 2
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {task.priority === 1 ? '낮음' : task.priority === 2 ? '보통' : '높음'}
        </span>
      </div>
    </div>
  )
}
