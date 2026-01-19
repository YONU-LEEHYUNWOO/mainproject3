import { useLocation } from 'react-router-dom'

const Medicine = () => {
  const location = useLocation()
  // 경로에서 모드 추출 (/parent/... 또는 /child/...)
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'

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

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          {mode === 'parent' ? (
            <div className="space-y-4">
              <p className="text-gray-700 font-medium">오늘의 약 복용 일정</p>
              <p className="text-gray-500 text-sm">약 복용 기능이 곧 제공됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 font-medium">부모님 약 알림 설정</p>
              <p className="text-gray-500 text-sm">약 알림 설정 기능이 곧 제공됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Medicine