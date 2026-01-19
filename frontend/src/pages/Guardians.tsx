import { useLocation } from 'react-router-dom'

const Guardians = () => {
  const location = useLocation()
  // 경로에서 모드 추출 (/parent/... 또는 /child/...)
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'

  // 부모 모드에서는 보호자 관리가 없으므로 안내 메시지 표시
  if (mode === 'parent') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">보호자 관리 👴</h1>
          <p className="text-sm text-gray-500 mt-1">이 기능은 자식 모드에서만 사용할 수 있습니다.</p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700 text-sm">
            보호자 관리 기능은 자식 모드에서만 사용할 수 있습니다. 모드를 변경하시려면 사이드바의 "모드 변경" 버튼을 사용하세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 자식 모드 전용 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">보호자 관리 👨</h1>
        <p className="text-sm text-gray-500 mt-1">부모님을 관리하는 보호자들을 추가하고 관리하세요</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <p className="text-gray-700 font-medium">보호자 목록</p>
          <p className="text-gray-500 text-sm mt-2">보호자 관리 기능이 곧 제공됩니다.</p>
        </div>
      </div>
    </div>
  )
}

export default Guardians