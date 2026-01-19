import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { medicineAPI } from '../services/api'
import { MedicineItem } from '../components/MedicineItem'
import { MedicineStats } from '../components/MedicineStats'
import { MedicineAlarmForm } from '../components/MedicineAlarmForm'
import { MedicineAlarmCard } from '../components/MedicineAlarmCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { EmptyState } from '../components/EmptyState'
import { Pill, Plus, Loader2 } from 'lucide-react'

interface MedicineAlarm {
  id: number
  medicine_name: string
  dosage: string
  time_1: string
  time_2?: string
  time_3?: string
  time_4?: string
  start_date: string
  end_date?: string
  reminder_minutes?: number
  last_taken?: string
  next_reminder?: string
  is_taken?: boolean
  is_active?: boolean
}

/**
 * Medicine 페이지
 * 부모 모드: 오늘의 약 목록, 복용 완료 버튼
 * 자식 모드: 약 등록/수정/삭제 (추후 구현)
 */
const Medicine = () => {
  const location = useLocation()
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'
  
  const [alarms, setAlarms] = useState<MedicineAlarm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAlarm, setEditingAlarm] = useState<MedicineAlarm | null>(null)

  /**
   * 오늘의 약 알림 목록 로드 (부모 모드)
   */
  const loadTodayAlarms = async () => {
    if (mode !== 'parent') return

    setIsLoading(true)
    setError(null)

    try {
      const response = await medicineAPI.getTodayAlarms()
      
      // API 응답 형식에 따라 데이터 추출
      // 새로운 응답 형식: {status, message, data: {alarms, total}}
      let alarmsData: MedicineAlarm[] = []
      
      if (response.data) {
        // 새로운 통일된 응답 형식: {status, message, data: {alarms: [...]}}
        if (response.data.data?.alarms && Array.isArray(response.data.data.alarms)) {
          alarmsData = response.data.data.alarms
        }
        // 기존 형식 호환성: { data: { alarms: [...] } }
        else if (response.data.alarms && Array.isArray(response.data.alarms)) {
          alarmsData = response.data.alarms
        }
        // 기존 형식 호환성: { data: [...] }
        else if (Array.isArray(response.data)) {
          alarmsData = response.data
        }
        // 기존 형식 호환성: { data: { data: [...] } }
        else if (response.data.data && Array.isArray(response.data.data)) {
          alarmsData = response.data.data
        }
      }
      
      // 배열이 아닌 경우 빈 배열로 설정
      if (!Array.isArray(alarmsData)) {
        console.warn('API 응답이 배열 형식이 아닙니다:', response.data)
        alarmsData = []
      }
      
      setAlarms(alarmsData)
    } catch (error: any) {
      // 새로운 응답 형식: {status, message, data} 또는 {detail}
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          '약 목록을 불러오는데 실패했습니다.'
      setError(errorMessage)
      console.error('약 목록 로드 오류:', error)
      // 에러 발생 시 빈 배열로 설정
      setAlarms([])
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 약 알림 목록 로드 (자식 모드)
   */
  const loadAlarms = async () => {
    if (mode !== 'child') return

    setIsLoading(true)
    setError(null)

    try {
      const response = await medicineAPI.getAlarms()
      
      // API 응답 형식에 따라 데이터 추출
      // 새로운 응답 형식: {status, message, data: {alarms, total}}
      let alarmsData: MedicineAlarm[] = []
      
      if (response.data) {
        // 새로운 통일된 응답 형식: {status, message, data: {alarms: [...]}}
        if (response.data.data?.alarms && Array.isArray(response.data.data.alarms)) {
          alarmsData = response.data.data.alarms
        }
        // 기존 형식 호환성: { data: { alarms: [...] } }
        else if (response.data.alarms && Array.isArray(response.data.alarms)) {
          alarmsData = response.data.alarms
        }
        // 기존 형식 호환성: { data: [...] }
        else if (Array.isArray(response.data)) {
          alarmsData = response.data
        }
        // 기존 형식 호환성: { data: { data: [...] } }
        else if (response.data.data && Array.isArray(response.data.data)) {
          alarmsData = response.data.data
        }
      }
      
      // 배열이 아닌 경우 빈 배열로 설정
      if (!Array.isArray(alarmsData)) {
        console.warn('API 응답이 배열 형식이 아닙니다:', response.data)
        alarmsData = []
      }
      
      setAlarms(alarmsData)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '약 알림 목록을 불러오는데 실패했습니다.'
      setError(errorMessage)
      console.error('약 알림 목록 로드 오류:', error)
      // 에러 발생 시 빈 배열로 설정
      setAlarms([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (mode === 'parent') {
      loadTodayAlarms()
    } else if (mode === 'child') {
      loadAlarms()
    }
  }, [mode])

  /**
   * 복용 완료 처리 후 목록 새로고침
   */
  const handleMarkTaken = async (alarmId: number) => {
    // 로컬 상태 업데이트
    setAlarms(prev =>
      prev.map(alarm =>
        alarm.id === alarmId ? { ...alarm, is_taken: true, last_taken: new Date().toISOString() } : alarm
      )
    )
    
    // 백그라운드에서 목록 새로고침
    try {
      await loadTodayAlarms()
    } catch (error) {
      console.error('약 목록 새로고침 오류:', error)
    }
  }

  /**
   * 약 알림 생성/수정 핸들러
   */
  const handleSubmitAlarm = async (formData: any) => {
    try {
      if (editingAlarm) {
        // 수정
        await medicineAPI.updateAlarm(editingAlarm.id, formData)
      } else {
        // 생성
        await medicineAPI.createAlarm(formData)
      }
      await loadAlarms()
      setIsFormOpen(false)
      setEditingAlarm(null)
    } catch (error: any) {
      throw error
    }
  }

  /**
   * 약 알림 삭제 핸들러
   */
  const handleDeleteAlarm = async (alarmId: number) => {
    try {
      await medicineAPI.deleteAlarm(alarmId)
      await loadAlarms()
    } catch (error: any) {
      // 새로운 응답 형식: {status, message, data} 또는 {detail}
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          '약 알림 삭제에 실패했습니다.'
      alert(errorMessage)
      console.error('약 알림 삭제 오류:', error)
    }
  }

  /**
   * 약 알림 활성화/비활성화 토글
   */
  const handleToggleAlarm = async (alarmId: number) => {
    try {
      await medicineAPI.toggleAlarm(alarmId)
      await loadAlarms()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '약 알림 상태 변경에 실패했습니다.'
      alert(errorMessage)
      console.error('약 알림 토글 오류:', error)
    }
  }

  /**
   * 약 알림 수정 시작
   */
  const handleEditAlarm = (alarm: MedicineAlarm) => {
    setEditingAlarm(alarm)
    setIsFormOpen(true)
  }

  /**
   * 폼 닫기
   */
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingAlarm(null)
  }

  // 통계 계산 (부모 모드용)
  // alarms가 배열인지 확인 후 통계 계산
  const stats = {
    total: Array.isArray(alarms) ? alarms.length : 0,
    completed: Array.isArray(alarms) ? alarms.filter(a => a.is_taken).length : 0,
    remaining: Array.isArray(alarms) ? alarms.filter(a => !a.is_taken).length : 0
  }

  return (
    <div className="space-y-6">
      {/* 모드별 제목 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'parent' ? '내 약 복용 관리 👴' : '부모님 약 알림 관리 👨'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'parent'
            ? '오늘 복용해야 할 약을 확인하고 기록하세요'
            : '부모님의 약 복용 알림을 설정하고 관리하세요'}
        </p>
      </div>

      {/* 부모 모드: 오늘의 약 목록 */}
      {mode === 'parent' && (
        <>
          {/* 통계 */}
          {!isLoading && alarms.length > 0 && (
            <MedicineStats
              total={stats.total}
              completed={stats.completed}
              remaining={stats.remaining}
            />
          )}

          {/* 약 목록 */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-3 text-gray-600">약 목록을 불러오는 중...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={loadTodayAlarms}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    다시 시도
                  </button>
                </div>
              ) : !Array.isArray(alarms) || alarms.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">오늘 복용할 약이 없습니다</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    등록된 약 알림이 없거나 오늘 복용할 약이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 약 복용 일정</h3>
                  {Array.isArray(alarms) && alarms.map((alarm) => (
                    <MedicineItem
                      key={alarm.id}
                      alarm={alarm}
                      onMarkTaken={handleMarkTaken}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 자식 모드: 약 알림 설정 */}
      {mode === 'child' && (
        <>
          {/* 약 등록 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              약 알림 등록
            </button>
          </div>

          {/* 약 알림 목록 */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner size="lg" text="약 알림 목록을 불러오는 중..." />
              ) : error ? (
                <ErrorMessage
                  message={error}
                  onRetry={loadAlarms}
                />
              ) : !Array.isArray(alarms) || alarms.length === 0 ? (
                <EmptyState
                  icon={Pill}
                  title="등록된 약 알림이 없습니다"
                  description="부모님의 약 복용 알림을 등록해주세요."
                  action={{
                    label: '약 알림 등록',
                    onClick: () => setIsFormOpen(true)
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">등록된 약 알림</h3>
                  {Array.isArray(alarms) && alarms.map((alarm) => (
                    <MedicineAlarmCard
                      key={alarm.id}
                      alarm={alarm}
                      onEdit={handleEditAlarm}
                      onDelete={handleDeleteAlarm}
                      onToggle={handleToggleAlarm}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 약 알림 등록/수정 폼 */}
          <MedicineAlarmForm
            isOpen={isFormOpen}
            onClose={handleCloseForm}
            onSubmit={handleSubmitAlarm}
            initialData={editingAlarm ? {
              medicine_name: editingAlarm.medicine_name,
              dosage: editingAlarm.dosage,
              time_1: editingAlarm.time_1,
              time_2: editingAlarm.time_2,
              time_3: editingAlarm.time_3,
              time_4: editingAlarm.time_4,
              start_date: editingAlarm.start_date,
              end_date: editingAlarm.end_date,
              reminder_minutes: editingAlarm.reminder_minutes || 15
            } : null}
          />
        </>
      )}
    </div>
  )
}

export default Medicine