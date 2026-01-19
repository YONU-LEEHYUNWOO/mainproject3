import { useState, useEffect } from 'react'
import { tasksAPI } from '../services/api'
import { Calendar, Plus, CheckCircle, Circle, List, Bell, BellOff } from 'lucide-react'
import { CalendarView } from '../components/CalendarView'
import { TaskForm } from '../components/TaskForm'
import { useNotifications } from '../hooks/useNotifications'

interface Task {
  id: number
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  completed: boolean
  priority: number
  category: string
  created_at: string
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)

  // 알림 시스템
  const { permission, settings, requestPermission, scheduleTaskNotification, saveSettings } = useNotifications()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getTasks()
      const tasksData = response.data.tasks
      setTasks(tasksData)

      // 완료되지 않은 일정에 대해 알림 스케줄링
      tasksData
        .filter((task: Task) => !task.completed && task.date && (task.time || task.time === null))
        .forEach((task: Task) => {
          scheduleTaskNotification(task)
        })
    } catch (error) {
      console.error('일정 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleComplete = async (taskId: number) => {
    try {
      await tasksAPI.toggleComplete(taskId)
      await loadTasks() // 목록 새로고침
    } catch (error) {
      console.error('일정 완료 토글 오류:', error)
    }
  }

  // 날짜별 일정 개수 계산
  const getTaskCountsByDate = () => {
    const counts: { [key: string]: { total: number; completed: number } } = {}

    tasks.forEach(task => {
      // 백엔드에서 반환된 date를 로컬 날짜로 변환
      let dateKey: string
      if (task.date.includes('T')) {
        // ISO string인 경우 (2026-01-16T00:00:00)
        const dateObj = new Date(task.date)
        dateKey = formatLocalDate(dateObj)
      } else {
        // 이미 YYYY-MM-DD 형식인 경우
        dateKey = task.date
      }

      if (!counts[dateKey]) {
        counts[dateKey] = { total: 0, completed: 0 }
      }
      counts[dateKey].total++
      if (task.completed) {
        counts[dateKey].completed++
      }
    })

    return counts
  }

  // 로컬 날짜 문자열 생성 함수
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 선택된 날짜의 일정 필터링
  const getTasksForSelectedDate = () => {
    const selectedDateStr = formatLocalDate(selectedDate)
    return tasks.filter(task => task.date.startsWith(selectedDateStr))
  }

  // 날짜 선택 핸들러
  const handleDateSelect = (date: Date) => {
    console.log('날짜 선택됨:', date)
    console.log('날짜 toISOString:', date.toISOString())
    console.log('날짜 toLocaleDateString:', date.toLocaleDateString())
    setSelectedDate(date)
  }

  // 새 일정 추가 핸들러
  const handleNewTask = () => {
    setIsTaskFormOpen(true)
  }

  // 일정 생성 핸들러
  const handleCreateTask = async (taskData: any) => {
    try {
      console.log('보내는 일정 데이터:', taskData)
      const response = await tasksAPI.createTask(taskData)
      console.log('일정 생성 응답:', response)
      await loadTasks() // 목록 새로고침
      setIsTaskFormOpen(false) // 모달 닫기
    } catch (error: any) {
      console.error('일정 생성 오류:', error)
      console.error('오류 응답:', error.response?.data)
      console.error('상세 오류:', JSON.stringify(error.response?.data?.detail, null, 2))
      console.error('전체 오류 응답:', JSON.stringify(error.response?.data, null, 2))

      const detail = error.response?.data?.detail
      let errorMsg = error.message
      if (detail && Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join(', ')
      }

      alert(`일정 생성에 실패했습니다: ${errorMsg}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  const taskCounts = getTaskCountsByDate()
  const filteredTasks = viewMode === 'calendar' ? getTasksForSelectedDate() : tasks

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
        <div className="flex items-center space-x-4">
          {/* 뷰 모드 토글 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              달력
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              목록
            </button>
          </div>

          {/* 알림 설정 버튼 */}
          <button
            onClick={() => {
              if (permission !== 'granted') {
                requestPermission()
              } else {
                saveSettings({ enabled: !settings.enabled })
              }
            }}
            className={`p-2 rounded-lg transition-colors ${settings.enabled && permission === 'granted'
              ? 'bg-green-100 text-green-600 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            title={
              permission !== 'granted'
                ? '알림 권한을 허용하려면 클릭하세요'
                : settings.enabled
                  ? '알림 켜짐 - 클릭하여 끄기'
                  : '알림 꺼짐 - 클릭하여 켜기'
            }
          >
            {settings.enabled && permission === 'granted' ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </button>

          <button className="btn-primary flex items-center" onClick={handleNewTask}>
            <Plus className="mr-2 h-5 w-5" />
            새 일정
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 달력 뷰 */}
          <div className="lg:col-span-2">
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              taskCounts={taskCounts}
            />
          </div>

          {/* 선택된 날짜의 일정 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {viewMode === 'calendar'
                    ? `${selectedDate.toLocaleDateString('ko-KR')} 일정`
                    : '전체 일정'
                  }
                </h3>

                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-8 w-8 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">일정이 없습니다</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {viewMode === 'calendar'
                        ? '선택한 날짜에 일정이 없습니다.'
                        : '새로운 일정을 추가해보세요.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleComplete(task.id)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            {task.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                          <div className={task.completed ? 'line-through text-gray-500' : ''}>
                            <h3 className="text-sm font-medium text-gray-900">
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {task.date} {task.time && `• ${task.time}`}
                              {task.location && `• ${task.location}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 1 ? 'bg-green-100 text-green-800' :
                            task.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {task.priority === 1 ? '낮음' : task.priority === 2 ? '보통' : '높음'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 리스트 뷰 */
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">전체 일정</h3>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <List className="mx-auto h-8 w-8 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">일정이 없습니다</h4>
                <p className="mt-1 text-sm text-gray-500">새로운 일정을 추가해보세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        {task.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div className={task.completed ? 'line-through text-gray-500' : ''}>
                        <h3 className="text-sm font-medium text-gray-900">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {task.date} {task.time && `• ${task.time}`}
                          {task.location && `• ${task.location}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 1 ? 'bg-green-100 text-green-800' :
                        task.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {task.priority === 1 ? '낮음' : task.priority === 2 ? '보통' : '높음'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 일정 추가 폼 */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleCreateTask}
        selectedDate={selectedDate}
      />
    </div>
  )
}

export default Tasks