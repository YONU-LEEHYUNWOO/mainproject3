import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, BellOff, Clock } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationPermissionModal } from '../components/NotificationPermissionModal'

/**
 * Settings 페이지
 * 알림 설정 관리
 */
const Settings = () => {
  const location = useLocation()
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'
  
  const { permission, settings, requestPermission, saveSettings } = useNotifications()
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [advanceMinutes, setAdvanceMinutes] = useState(settings.advanceMinutes)

  // 초기 권한 확인 및 모달 표시
  useEffect(() => {
    if (permission === 'default' && !localStorage.getItem('notification_permission_asked')) {
      // 첫 방문 시에만 모달 표시 (선택적)
      // setShowPermissionModal(true)
      localStorage.setItem('notification_permission_asked', 'true')
    }
  }, [permission])

  /**
   * 알림 설정 토글
   */
  const handleToggleNotifications = () => {
    if (permission !== 'granted') {
      setShowPermissionModal(true)
    } else {
      saveSettings({ enabled: !settings.enabled })
    }
  }

  /**
   * 알림 시간 변경
   */
  const handleAdvanceMinutesChange = (minutes: number) => {
    setAdvanceMinutes(minutes)
    saveSettings({ advanceMinutes: minutes })
  }

  /**
   * 권한 요청 핸들러
   */
  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      saveSettings({ enabled: true })
    }
    return granted
  }

  return (
    <div className="space-y-6">
      {/* 모드별 제목 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'parent' ? '내 설정 👴' : '부모님 관리 설정 👨'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'parent'
            ? '계정 정보와 알림 설정을 관리하세요'
            : '부모님 계정 관리 및 알림 설정을 변경하세요'}
        </p>
      </div>

      {/* 알림 설정 섹션 */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">알림 설정</h2>

          <div className="space-y-6">
            {/* 알림 켜기/끄기 */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  {settings.enabled && permission === 'granted' ? (
                    <Bell className="h-5 w-5 text-green-500" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">알림 받기</h3>
                    <p className="text-sm text-gray-500">
                      {permission === 'granted'
                        ? '일정 및 약 복용 알림을 받습니다'
                        : permission === 'denied'
                        ? '알림 권한이 거부되었습니다. 브라우저 설정에서 변경하세요.'
                        : '알림 권한을 허용해주세요'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.enabled && permission === 'granted'
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.enabled && permission === 'granted'
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 알림 시간 설정 (권한이 있을 때만 표시) */}
            {permission === 'granted' && settings.enabled && (
              <div className="border-t pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">알림 시간 (일정 시작 몇 분 전)</h3>
                    <p className="text-sm text-gray-500">일정 시작 시간 몇 분 전에 알림을 받을지 설정하세요.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {[5, 10, 15, 30, 60].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => handleAdvanceMinutesChange(minutes)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        advanceMinutes === minutes
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {minutes}분
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 권한 상태 안내 */}
            {permission !== 'granted' && (
              <div className={`border-t pt-6 ${
                permission === 'denied' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
              } rounded-lg p-4`}>
                <p className={`text-sm ${
                  permission === 'denied' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {permission === 'denied'
                    ? '알림 권한이 거부되었습니다. 브라우저 설정에서 알림 권한을 허용해주세요.'
                    : '알림을 받으려면 권한을 허용해주세요.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 알림 권한 요청 모달 */}
      <NotificationPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onRequestPermission={handleRequestPermission}
      />
    </div>
  )
}

export default Settings