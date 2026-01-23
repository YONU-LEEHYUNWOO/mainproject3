import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Chat from './pages/Chat'
import Guardians from './pages/Guardians'
import Medicine from './pages/Medicine'
import Location from './pages/Location'
import Monitoring from './pages/Monitoring'
import Health from './pages/Health'
import Settings from './pages/Settings'
import NotificationSettings from './pages/NotificationSettings'
import ModeSelector from './pages/ModeSelector'
import NotificationBanner from './components/NotificationBanner'
import ProtectedRoute from './components/ProtectedRoute'
import { inactivityAPI, guardiansAPI } from './services/api'
import { useState, useEffect } from 'react'

function App() {
  const [managedParentId, setManagedParentId] = useState<number | undefined>()

  // 활동 추적 (심장박동) 및 부모 ID 가져오기
  useEffect(() => {
    const userStr = localStorage.getItem('user_info')
    if (!userStr) return
    const user = JSON.parse(userStr)

    // 부모 모드일 때만 심장박동 전송
    if (localStorage.getItem('userMode') === 'parent') {
      const sendHeartbeat = () => {
        inactivityAPI.updateActivity('heartbeat').catch(console.error)
      }
      sendHeartbeat()
      const interval = setInterval(sendHeartbeat, 120000) // 2분마다
      return () => clearInterval(interval)
    }
    // 자녀 모드일 때 관리 중인 부모 ID 가져오기
    else if (localStorage.getItem('userMode') === 'child') {
      guardiansAPI.getManagedUsers().then(res => {
        const managedUsers = res.data.managed_users || []
        if (managedUsers.length > 0) {
          // 백엔드 수정 사항 반영: managedUsers[0].user_id 또는 .id 사용
          setManagedParentId(managedUsers[0].user_id || managedUsers[0].id)
        }
      }).catch(console.error)
    }
  }, [])

  return (
    <AuthProvider>
      <Routes>
        {/* 로그인 페이지 */}
        <Route path="/login" element={<Login />} />

        {/* 모드 선택 페이지 */}
        <Route path="/mode-select" element={
          <ProtectedRoute>
            <ModeSelector />
          </ProtectedRoute>
        } />

        {/* 부모 모드 라우트들 */}
        <Route path="/parent/*" element={
          <ProtectedRoute>
            <Layout mode="parent" />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={
            <>
              <NotificationBanner mode="parent" />
              <Dashboard />
            </>
          } />
          <Route path="tasks" element={<Tasks />} />
          <Route path="chat" element={<Chat />} />
          <Route path="medicine" element={<Medicine />} />
          <Route path="location" element={<Location />} />
          <Route path="health" element={<Health />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 자식 모드 라우트들 */}
        <Route path="/child/*" element={
          <ProtectedRoute>
            <Layout mode="child" />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={
            <>
              <NotificationBanner mode="child" parentId={managedParentId} />
              <Dashboard />
            </>
          } />
          <Route path="tasks" element={<Tasks />} />
          <Route path="chat" element={<Chat />} />
          <Route path="guardians" element={<Guardians />} />
          <Route path="medicine" element={<Medicine />} />
          <Route path="location" element={<Location />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 기본 경로 - 로그인으로 리다이렉트 */}
        <Route path="/" element={<Login />} />
      </Routes>
    </AuthProvider>
  )
}

export default App