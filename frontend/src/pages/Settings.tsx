import { useLocation } from 'react-router-dom'

const Settings = () => {
  const location = useLocation()
  // 경로에서 모드 추출 (/parent/... 또는 /child/...)
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'

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

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          {mode === 'parent' ? (
            <div className="space-y-4">
              <p className="text-gray-700 font-medium">내 계정 설정</p>
              <p className="text-gray-500 text-sm">설정 기능이 곧 제공됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 font-medium">부모님 관리 설정</p>
              <p className="text-gray-500 text-sm">설정 기능이 곧 제공됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings