import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface MedicineAlarmFormData {
  medicine_name: string
  dosage: string
  time_1: string
  time_2?: string
  time_3?: string
  time_4?: string
  start_date: string
  end_date?: string
  reminder_minutes: number
}

interface MedicineAlarmFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MedicineAlarmFormData) => Promise<void>
  initialData?: MedicineAlarmFormData | null
}

/**
 * 약 알림 등록/수정 폼 컴포넌트
 */
export const MedicineAlarmForm: React.FC<MedicineAlarmFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState<MedicineAlarmFormData>({
    medicine_name: '',
    dosage: '',
    time_1: '',
    time_2: '',
    time_3: '',
    time_4: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reminder_minutes: 15
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        medicine_name: '',
        dosage: '',
        time_1: '',
        time_2: '',
        time_3: '',
        time_4: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        reminder_minutes: 15
      })
    }
    setError(null)
  }, [initialData, isOpen])

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 유효성 검사
    if (!formData.medicine_name.trim()) {
      setError('약 이름을 입력해주세요.')
      return
    }
    if (!formData.dosage.trim()) {
      setError('복용량을 입력해주세요.')
      return
    }
    if (!formData.time_1) {
      setError('최소 1개의 복용 시간을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '약 알림 저장에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? '약 알림 수정' : '약 알림 등록'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 약 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                약 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.medicine_name}
                onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 혈압약"
                required
              />
            </div>

            {/* 복용량 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                복용량 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 1정"
                required
              />
            </div>

            {/* 복용 시간 (최대 4개) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                복용 시간 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={formData.time_1}
                  onChange={(e) => setFormData({ ...formData, time_1: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  type="time"
                  value={formData.time_2 || ''}
                  onChange={(e) => setFormData({ ...formData, time_2: e.target.value || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="선택사항"
                />
                <input
                  type="time"
                  value={formData.time_3 || ''}
                  onChange={(e) => setFormData({ ...formData, time_3: e.target.value || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="선택사항"
                />
                <input
                  type="time"
                  value={formData.time_4 || ''}
                  onChange={(e) => setFormData({ ...formData, time_4: e.target.value || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="선택사항"
                />
              </div>
            </div>

            {/* 복용 기간 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일 (선택사항)
                </label>
                <input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 알림 시간 (몇 분 전) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                알림 시간 (몇 분 전)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.reminder_minutes}
                onChange={(e) => setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">복용 시간 몇 분 전에 알림을 받을지 설정하세요.</p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '저장 중...' : initialData ? '수정' : '등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
