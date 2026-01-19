import { Bell, X } from 'lucide-react'

interface NotificationPermissionModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestPermission: () => Promise<boolean>
}

/**
 * 알림 권한 요청 모달 컴포넌트
 */
export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onRequestPermission
}) => {
  if (!isOpen) return null

  /**
   * 권한 요청 핸들러
   */
  const handleRequestPermission = async () => {
    const granted = await onRequestPermission()
    if (granted) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">알림 권한 요청</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 내용 */}
          <div className="space-y-4">
            <p className="text-gray-700">
              일정 및 약 복용 알림을 받으려면 브라우저 알림 권한이 필요합니다.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">알림 기능</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>일정 시작 시간 전 알림</li>
                <li>약 복용 시간 알림</li>
                <li>중요한 일정 알림</li>
              </ul>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              나중에
            </button>
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              권한 허용
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
