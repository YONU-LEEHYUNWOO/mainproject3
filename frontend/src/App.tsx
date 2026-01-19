import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Chat from './pages/Chat'
import Guardians from './pages/Guardians'
import Medicine from './pages/Medicine'
import Settings from './pages/Settings'
import ModeSelector from './pages/ModeSelector'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
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
          <Route index element={<Tasks />} />
          <Route path="dashboard" element={<Tasks />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="chat" element={<Chat />} />
          <Route path="medicine" element={<Medicine />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 자식 모드 라우트들 */}
        <Route path="/child/*" element={
          <ProtectedRoute>
            <Layout mode="child" />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="chat" element={<Chat />} />
          <Route path="guardians" element={<Guardians />} />
          <Route path="medicine" element={<Medicine />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 기본 경로 - 로그인으로 리다이렉트 */}
        <Route path="/" element={<Login />} />
      </Routes>
    </AuthProvider>
  )
}

export default App