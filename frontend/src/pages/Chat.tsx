import { useLocation } from 'react-router-dom'

const Chat = () => {
  const location = useLocation()
  // 경로에서 모드 추출 (/parent/... 또는 /child/...)
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'

  return (
    <div className="space-y-6">
      {/* 모드별 제목 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'parent' ? 'AI 케어비서와 대화 👴' : '부모님 케어 AI 상담 👨'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'parent'
            ? 'AI가 일상 생활을 도와드립니다'
            : '부모님 케어에 대한 AI 상담을 받으세요'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg h-96">
        <div className="p-6">
          {mode === 'parent' ? (
            <div className="space-y-4">
              <p className="text-gray-700 font-medium">AI 케어비서와 대화하기</p>
              <p className="text-gray-500 text-sm">AI 채팅 기능이 곧 제공됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 font-medium">부모님 케어 AI 상담</p>
              <p className="text-gray-500 text-sm">AI 상담 기능이 곧 제공됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat