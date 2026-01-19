import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ConnectionStatus } from './ConnectionStatus'
import {
  Calendar,
  MessageSquare,
  Users,
  Pill,
  Settings,
  LogOut,
  Home,
  BarChart3,
  MapPin,
  Activity,
  Heart
} from 'lucide-react'

interface LayoutProps {
  mode: 'parent' | 'child'
}

const Layout = ({ mode }: LayoutProps) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // 모드별 네비게이션 메뉴
  const navigation = mode === 'parent' ? [
    { name: '홈', href: '/parent/dashboard', icon: Home },
    { name: '일정관리', href: '/parent/tasks', icon: Calendar },
    { name: 'AI 채팅', href: '/parent/chat', icon: MessageSquare },
    { name: '약 관리', href: '/parent/medicine', icon: Pill },
    { name: '위치', href: '/parent/location', icon: MapPin },
    { name: '건강', href: '/parent/health', icon: Heart },
    { name: '설정', href: '/parent/settings', icon: Settings },
  ] : [
    { name: '대시보드', href: '/child/dashboard', icon: BarChart3 },
    { name: '일정관리', href: '/child/tasks', icon: Calendar },
    { name: 'AI 채팅', href: '/child/chat', icon: MessageSquare },
    { name: '보호자', href: '/child/guardians', icon: Users },
    { name: '약 관리', href: '/child/medicine', icon: Pill },
    { name: '위치', href: '/child/location', icon: MapPin },
    { name: '모니터링', href: '/child/monitoring', icon: Activity },
    { name: '설정', href: '/child/settings', icon: Settings },
  ]

  const handleLogout = () => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      logout()
    }
  }

  const handleModeChange = () => {
    if (window.confirm('모드를 변경하시겠습니까? 현재 설정이 초기화됩니다.')) {
      localStorage.removeItem('userMode')
      navigate('/mode-select')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* 로고 및 모드 정보 */}
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">AI 케어비서</h1>
              <p className="text-sm text-blue-100">
                {mode === 'parent' ? '👴 부모 모드' : '👨 자식 모드'}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* 사용자 정보 */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              {/* WebSocket 연결 상태 (향후 구현) */}
              {/* <div className="mt-2">
                <ConnectionStatus isConnected={false} />
              </div> */}
            </div>

            {/* 네비게이션 메뉴 */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
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