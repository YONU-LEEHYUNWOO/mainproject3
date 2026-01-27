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
import { Pill, Plus, Loader2, ChevronDown, ChevronUp, Package, Edit2, Trash2 } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

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
  morning?: boolean
  lunch?: boolean
  evening?: boolean
  current_stock?: number
  reorder_threshold?: number
  prescription_info?: string
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
  const [expandedMedicines, setExpandedMedicines] = useState<Set<string>>(new Set())

  // 알림 시스템 사용
  const { scheduleMedicineNotification } = useNotifications()

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

      // 부모 모드에서 오늘 알림 스케줄링
      if (Array.isArray(alarmsData)) {
        alarmsData.filter(a => !a.is_taken).forEach(a => scheduleMedicineNotification(a))
      }
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
      // 모드에 따라 적절한 목록 로드 함수 호출
      if (mode === 'parent') {
        await loadTodayAlarms()
      } else {
        await loadAlarms()
      }
      setIsFormOpen(false)
      setEditingAlarm(null)
    } catch (error: any) {
      throw error
    }
  }

  /**
   * 모드에 따라 알람 목록 새로고침
   */
  const refreshAlarms = async () => {
    if (mode === 'parent') {
      await loadTodayAlarms()
    } else {
      await loadAlarms()
    }
  }

  /**
   * 약 알림 삭제 핸들러
   */
  const handleDeleteAlarm = async (alarmId: number) => {
    try {
      await medicineAPI.deleteAlarm(alarmId)
      await refreshAlarms()
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
      await refreshAlarms()
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

  // 재고가 0이 아닌 약만 필터링 (재고가 0이면 자동으로 숨김)
  const activeAlarms = alarms.filter(alarm => {
    // current_stock이 undefined이거나 0보다 크면 표시
    // undefined는 재고 관리 안하는 약으로 간주하여 표시
    return alarm.current_stock === undefined || alarm.current_stock > 0
  })

  /**
   * 통계 계산 (부모/자식 모드 공통)
   * 실제 복용한 시간 개수를 기준으로 계산
   * 재고가 있는 약만 계산
   */
  const getStats = () => {
    if (!Array.isArray(activeAlarms)) return { total: 0, completed: 0, remaining: 0 }

    let totalDoses = 0
    let completedDoses = 0

    activeAlarms.forEach(alarm => {
      // 설정된 시간 개수 파악
      const times = [alarm.time_1, alarm.time_2, alarm.time_3, alarm.time_4].filter(Boolean)
      totalDoses += times.length

      // daily_taken_times를 파싱하여 실제 복용한 시간 개수 계산
      if (alarm.daily_taken_times && alarm.daily_taken_times.trim()) {
        const takenTimes = alarm.daily_taken_times.split(',').filter(t => t.trim())
        // 실제 설정된 시간 중에서 복용한 것만 카운트
        const validTakenCount = takenTimes.filter(takenTime => 
          times.some(time => time === takenTime.trim())
        ).length
        completedDoses += validTakenCount
      }
    })

    return {
      total: totalDoses,
      completed: completedDoses,
      remaining: totalDoses - completedDoses
    }
  }

  const stats = getStats()

  // 약 종류별로 그룹화
  const groupedAlarms = activeAlarms.reduce((acc, alarm) => {
    const medicineName = alarm.medicine_name
    if (!acc[medicineName]) {
      acc[medicineName] = []
    }
    acc[medicineName].push(alarm)
    return acc
  }, {} as Record<string, MedicineAlarm[]>)

  // 아코디언 토글
  const toggleMedicine = (medicineName: string) => {
    setExpandedMedicines(prev => {
      const newSet = new Set(prev)
      if (newSet.has(medicineName)) {
        newSet.delete(medicineName)
      } else {
        newSet.add(medicineName)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-6">
      {/* ... (생략된 기존 상단 UI) */}
      {/* (내용은 view_file로 확인한 구조 유지) */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className={mode === 'parent' ? 'text-4xl font-bold text-gray-900' : 'text-2xl font-bold text-gray-900'}>
            {mode === 'parent' ? '💊 내 약 복용 관리' : '부모님 약 알림 관리 👨'}
          </h1>
          <p className={mode === 'parent' ? 'text-xl text-gray-600 mt-2 font-medium' : 'text-sm text-gray-500 mt-1'}>
            {mode === 'parent'
              ? '오늘 복용해야 할 약을 확인하고 기록하세요'
              : '부모님의 약 복용 알림을 설정하고 관리하세요'}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className={mode === 'parent' 
            ? 'px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center text-lg font-bold shadow-lg transition-all transform hover:scale-105'
            : 'btn-primary flex items-center'
          }
        >
          <Plus className={mode === 'parent' ? 'mr-2 h-6 w-6' : 'mr-2 h-5 w-5'} />
          {mode === 'parent' ? '약 등록하기' : '약 등록'}
        </button>
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
              ) : !Array.isArray(activeAlarms) || activeAlarms.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">오늘 복용할 약이 없습니다</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {alarms.length > 0 
                      ? '등록된 약의 재고가 모두 소진되었습니다. 약을 구매해주세요.'
                      : '등록된 약 알림이 없거나 오늘 복용할 약이 없습니다.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 약 복용 일정</h3>
                  {Object.entries(groupedAlarms).map(([medicineName, medicineAlarms]) => {
                    const isExpanded = expandedMedicines.has(medicineName)
                    const firstAlarm = medicineAlarms[0]
                    
                    return (
                      <div key={medicineName} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* 아코디언 헤더 */}
                        <button
                          onClick={() => toggleMedicine(medicineName)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <Pill className="h-5 w-5 text-blue-600" />
                            <div className="text-left">
                              <h4 className="font-bold text-gray-900">{medicineName}</h4>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-600">복용량: {firstAlarm.dosage}</p>
                                {firstAlarm.current_stock !== undefined && (
                                  <span className={`flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    firstAlarm.current_stock <= (firstAlarm.reorder_threshold || 5)
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    <Package className="h-3 w-3" />
                                    <span>{firstAlarm.current_stock}개</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {isExpanded ? '접기' : '펼치기'}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </button>

                        {/* 아코디언 내용 */}
                        {isExpanded && (
                          <div className="p-4 bg-white space-y-4">
                            {medicineAlarms.map((alarm) => (
                              <div key={alarm.id} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 relative">
                                {/* 수정/삭제 버튼 - 우측 상단 */}
                                <div className="absolute top-3 right-3 flex gap-2 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditAlarm(alarm)
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                                    title="수정"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                    <span>수정</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteAlarm(alarm.id)
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                                    title="삭제"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>삭제</span>
                                  </button>
                                </div>
                                
                                {/* 약 복용 아이템 */}
                                <MedicineItem
                                  alarm={alarm}
                                  onMarkTaken={handleMarkTaken}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 자식 모드: 약 알림 설정 */}
      {mode === 'child' && (
        <>
          {/* 통계 (자식 모드에서도 부모님 복용 현황 확인) */}
          {!isLoading && activeAlarms.length > 0 && (
            <MedicineStats
              total={stats.total}
              completed={stats.completed}
              remaining={stats.remaining}
            />
          )}

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
              ) : !Array.isArray(activeAlarms) || activeAlarms.length === 0 ? (
                <EmptyState
                  icon={Pill}
                  title={alarms.length > 0 ? "재고가 소진되었습니다" : "등록된 약 알림이 없습니다"}
                  description={alarms.length > 0 ? "부모님의 약 재고가 모두 소진되었습니다. 약을 구매해주세요." : "부모님의 약 복용 알림을 등록해주세요."}
                  action={{
                    label: alarms.length > 0 ? '약 알림 관리' : '약 알림 등록',
                    onClick: () => setIsFormOpen(true)
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">등록된 약 알림</h3>
                  {Array.isArray(activeAlarms) && activeAlarms.map((alarm) => (
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
        </>
      )}

      {/* 약 알림 등록/수정 폼 - 부모/자식 공통 사용을 위해 밖으로 이동 */}
      <MedicineAlarmForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitAlarm}
        initialData={editingAlarm ? {
          medicine_name: editingAlarm.medicine_name,
          dosage: editingAlarm.dosage || '',
          time_1: editingAlarm.time_1 || '',
          time_2: editingAlarm.time_2 || '',
          time_3: editingAlarm.time_3 || '',
          time_4: editingAlarm.time_4 || '',
          start_date: editingAlarm.start_date,
          end_date: editingAlarm.end_date || '',
          reminder_minutes: editingAlarm.reminder_minutes || 15,
          morning: editingAlarm.morning || false,
          lunch: editingAlarm.lunch || false,
          evening: editingAlarm.evening || false,
          current_stock: editingAlarm.current_stock || 0,
          reorder_threshold: editingAlarm.reorder_threshold || 5
        } : null}
      />
    </div>
  )
}

export default Medicine
