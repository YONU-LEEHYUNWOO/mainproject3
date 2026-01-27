import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [selectedMode, setSelectedMode] = useState<'parent' | 'child'>('parent') // 로그인 시 선택할 모드
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    user_type: 'parent' // 회원가입 시 기본값은 부모 모드
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isLogin) {
        await login(formData.username, formData.password)
        // 선택한 모드로 이동
        localStorage.setItem('userMode', selectedMode)
        navigate(selectedMode === 'parent' ? '/parent/dashboard' : '/child/dashboard')
      } else {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name || undefined,
          phone: formData.phone || undefined
        })
        navigate('/mode-select')
      }
    } catch (error: any) {
      // Pydantic validation 에러 처리
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        const validationErrors = error.response.data.detail
        const errorMessages = validationErrors.map((err: any) => {
          if (err.loc && err.loc.includes('username')) {
            return '사용자명을 입력해주세요'
          } else if (err.loc && err.loc.includes('password')) {
            return '비밀번호를 입력해주세요'
          } else if (err.loc && err.loc.includes('email')) {
            return '올바른 이메일 형식을 입력해주세요'
          }
          return err.msg || '입력값을 확인해주세요'
        })
        setError(errorMessages[0])
      } else {
        setError(error.response?.data?.detail || '로그인에 실패했습니다')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-xl">
              <h2 className="text-4xl font-extrabold">함께잇다</h2>
            </div>
          </div>
          <p className="mt-4 text-center text-base text-gray-600 font-medium">
            {isLogin ? '계정에 로그인하세요' : '새 계정을 만드세요'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                사용자명
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="사용자명"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="email" className="sr-only">
                    이메일
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="이메일"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="full_name" className="sr-only">
                    이름
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="이름 (선택)"
                    value={formData.full_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="sr-only">
                    전화번호
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="전화번호 (선택)"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  isLogin ? 'rounded-b-md' : ''
                }`}
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* 로그인 시 모드 선택 */}
          {isLogin && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                사용 모드를 선택하세요
              </label>
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedMode('parent')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedMode === 'parent'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">👴</div>
                  <div className="text-sm font-medium">부모 모드</div>
                  <div className="text-xs text-gray-500 mt-1">일상 케어</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('child')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedMode === 'child'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">👨</div>
                  <div className="text-sm font-medium">자식 모드</div>
                  <div className="text-xs text-gray-500 mt-1">부모님 관리</div>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="spinner w-4 h-4"></div>
              ) : (
                isLogin ? '로그인' : '회원가입'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login