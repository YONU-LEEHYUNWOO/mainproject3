import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Calendar,
  MessageSquare,
  Users,
  Pill,
  Settings,
  LogOut,
  Home
} from 'lucide-react'

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: '대시보드', href: '/', icon: Home },
    { name: '일정관리', href: '/tasks', icon: Calendar },
    { name: 'AI 채팅', href: '/chat', icon: MessageSquare },
    { name: '보호자', href: '/guardians', icon: Users },
    { name: '약 관리', href: '/medicine', icon: Pill },
    { name: '설정', href: '/settings', icon: Settings },
  ]

  const handleLogout = () => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      logout()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* 로고 및 사용자 정보 */}
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-bold text-white">AI 케어비서</h1>
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

            {/* 로그아웃 버튼 */}
            <div className="p-2 border-t border-gray-200">
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