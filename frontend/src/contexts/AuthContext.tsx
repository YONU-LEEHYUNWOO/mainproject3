import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '../services/api'

interface User {
  id: number
  username: string
  email: string
  full_name?: string
  phone?: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

interface RegisterData {
  username: string
  email: string
  password: string
  full_name?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // validateToken 함수를 useCallback으로 메모이제이션
  const validateToken = React.useCallback(async (authToken: string) => {
    try {
      const response = await authAPI.getMe(authToken)
      setUser(response.data)
    } catch (error) {
      // 토큰이 유효하지 않으면 제거
      console.warn('Token validation failed:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 앱 시작 시 로컬 스토리지에서 토큰 복원
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      // 토큰 유효성 검증 및 사용자 정보 로드
      validateToken(storedToken).catch(() => {
        // 오류 발생 시에도 로딩 상태 해제
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [validateToken])

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password)
      const { access_token } = response.data

      // 토큰 저장
      localStorage.setItem('auth_token', access_token)
      setToken(access_token)

      // 사용자 정보 로드
      await validateToken(access_token)
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      await authAPI.register(userData)
      // 회원가입 후 자동 로그인
      await login(userData.username, userData.password)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}