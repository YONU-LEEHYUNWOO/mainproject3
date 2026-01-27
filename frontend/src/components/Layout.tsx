import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { notificationLogsAPI as notiAPI, guardiansAPI } from '../services/api'
import NotificationBanner from './NotificationBanner'
import { useVoice } from '../hooks/useVoice'
import {
  Calendar, MessageSquare, Users, Pill, Settings, LogOut, Home,
  BarChart3, MapPin, Activity, Heart, Bell, ShoppingBag, HelpCircle, Volume2, VolumeX
} from 'lucide-react'

const Layout = ({ mode }: { mode: 'parent' | 'child' }) => {
  const { user, logout } = useAuth(), location = useLocation(), navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [managedParentId, setManagedParentId] = useState<number | undefined>()
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    // 부모 모드는 기본적으로 음성 안내 활성화
    const saved = localStorage.getItem('voiceEnabled')
    return mode === 'parent' ? (saved !== 'false') : false
  })
  
  const { announceNavigation, isSpeaking } = useVoice(voiceEnabled)

  useEffect(() => {
    if (mode === 'child') {
      const check = () => notiAPI.getLogs({ limit: 20 }).then(res => {
        const count = (res.data.data?.notification_logs || res.data.notification_logs || []).filter((l: any) => l.notification_type === 'parent_request' && !l.is_read).length
        setUnread(count)
      })
      check(); const t = setInterval(check, 30000);

      // 관리 대상 부모 ID 가져오기
      guardiansAPI.getManagedUsers().then(res => {
        const u = res.data.data?.managed_users?.[0]
        if (u) setManagedParentId(u.user_id || u.id)
      })

      return () => clearInterval(t)
    }
  }, [mode])

  // 페이지 변경 시 음성 안내 (부모 모드만)
  useEffect(() => {
    if (mode === 'parent' && voiceEnabled) {
      const pageName = parentNavigation.find(nav => nav.href === location.pathname)?.name
      if (pageName) {
        announceNavigation(pageName)
      }
    }
  }, [location.pathname, mode, voiceEnabled, announceNavigation])

  // 음성 토글
  const toggleVoice = () => {
    const newState = !voiceEnabled
    setVoiceEnabled(newState)
    localStorage.setItem('voiceEnabled', String(newState))
  }

  // 모드별 네비게이션 메뉴
  const parentNavigation = [
    { name: '홈', href: '/parent/dashboard', icon: Home, emoji: '🏠' },
    { name: '약 복용', href: '/parent/medicine', icon: Pill, emoji: '💊' },
    { name: '일정', href: '/parent/tasks', icon: Calendar, emoji: '📅' },
    { name: '건강', href: '/parent/health', icon: Heart, emoji: '❤️' },
    { name: '길찾기', href: '/parent/location', icon: MapPin, emoji: '🗺️' },
    { name: '요청하기', href: '/parent/request', icon: ShoppingBag, emoji: '🛒' },
    { name: '설정', href: '/parent/settings', icon: Settings, emoji: '⚙️' },
  ]

  const childNavigation = [
    { name: '대시보드', href: '/child/dashboard', icon: BarChart3 },
    { name: '일정관리', href: '/child/tasks', icon: Calendar },
    { name: 'AI 채팅', href: '/child/chat', icon: MessageSquare },
    { name: '보호자', href: '/child/guardians', icon: Users },
    { name: '약 관리', href: '/child/medicine', icon: Pill },
    { name: '위치', href: '/child/location', icon: MapPin },
    { name: '모니터링', href: '/child/monitoring', icon: Activity },
    { name: '이거부탁해!', href: '/child/request', icon: ShoppingBag },
    { name: '고객 지원', href: '/child/support', icon: HelpCircle },
    { name: '설정', href: '/child/settings', icon: Settings },
  ]

  const handleLogout = () => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      logout()
    }
  }

  const handleModeChange = () => {
    if (window.confirm('모드를 변경하시겠습니까?')) {
      // 위치 관련 데이터는 유지하고 userMode만 제거
      localStorage.removeItem('userMode')
      navigate('/mode-select')
    }
  }

  // 부모 모드 레이아웃
  if (mode === 'parent') {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* 상단 헤더 */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* 왼쪽: 서비스 로고 */}
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg">
                  <h1 className="text-3xl font-extrabold tracking-tight">함께잇다</h1>
                </div>
              </div>

              {/* 가운데: 사용자 이름 */}
              <div className="flex items-center space-x-3">
                <div className="h-10 w-px bg-gray-300"></div>
                <div className="text-gray-700">
                  <p className="text-xl font-bold">{user?.full_name || user?.username}님, 안녕하세요!</p>
                </div>
                <div className="h-10 w-px bg-gray-300"></div>
              </div>

              {/* 오른쪽: 음성 안내 + 모드 변경 + 로그아웃 */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleVoice}
                  className={`btn-press-effect flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    voiceEnabled
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={voiceEnabled ? '음성 안내 끄기' : '음성 안내 켜기'}
                >
                  {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  <span className="text-base font-semibold">{voiceEnabled ? '음성 ON' : '음성 OFF'}</span>
                  {isSpeaking && <span className="animate-pulse">🔊</span>}
                </button>
                <button
                  onClick={handleModeChange}
                  className="btn-press-effect flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-all"
                >
                  <Users className="h-5 w-5" />
                  <span className="text-base font-semibold">보호모드</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-press-effect flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-base font-semibold">나가기</span>
                </button>
              </div>
            </div>
          </div>

          {/* 큰 버튼 네비게이션 */}
          <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-center space-x-2 py-3">
                {parentNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`btn-press-effect flex flex-col items-center justify-center px-6 py-4 rounded-xl transition-all transform hover:scale-110 ${
                        isActive
                          ? 'bg-white text-blue-700 shadow-2xl animate-bounce-in'
                          : 'bg-blue-500 bg-opacity-30 text-white hover:bg-white hover:bg-opacity-20 hover:shadow-xl'
                      }`}
                      style={{ minWidth: '120px', minHeight: '100px' }}
                    >
                      <span className={`text-4xl mb-2 ${isActive ? 'animate-pulse-strong' : ''}`}>{item.emoji}</span>
                      <span className={`text-lg font-bold ${isActive ? 'text-blue-700' : 'text-white'}`}>
                        {item.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>

        {/* 플로팅 고객지원 버튼 */}
        <Link
          to="/parent/support"
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50 flex items-center space-x-3 group"
          title="고객지원"
        >
          <HelpCircle className="h-7 w-7 group-hover:animate-bounce" />
          <span className="font-bold text-lg hidden group-hover:inline-block">도움말</span>
        </Link>
      </div>
    )
  }

  // 자식 모드 레이아웃 (기존 사이드바 유지)
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* 로고 및 모드 정보 */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">함께잇다</h1>
              <p className="text-sm text-blue-100">👨 보호모드</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* 사용자 정보 */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            {/* 네비게이션 메뉴 */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {childNavigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                      {item.name}
                    </div>
                    {item.name === '이거부탁해!' && unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce">{unread}</span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* 모드 변경 및 로그아웃 버튼 */}
            <div className="p-2 border-t border-gray-200 space-y-1">
              <button
                onClick={handleModeChange}
                className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                모드 변경
              </button>
              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout