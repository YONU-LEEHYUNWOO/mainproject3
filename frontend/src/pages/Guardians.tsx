import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Users,
  UserPlus,
  Search,
  Phone,
  User as UserIcon,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react'
import api from '../services/api'

interface Guardian {
  id: number
  name: str
  phone: string
  relationship: string
  is_primary: boolean
  guardian_user_id: number | null
}

interface SearchResult {
  id: number
  username: string
  full_name: string
  phone: string
  user_type: string
}

const Guardians = () => {
  const location = useLocation()
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'

  const [guardians, setGuardians] = useState<Guardian[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [relationship, setRelationship] = useState('child')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchGuardians()
  }, [])

  const fetchGuardians = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/guardians/')
      // 백엔드 응답 구조에 맞춰 파싱 (res.data.guardians)
      setGuardians(res.data.guardians || [])
    } catch (error) {
      console.error('보호자 목록 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchPhone) return

    try {
      setSearchLoading(true)
      setSearchError('')
      setSearchResult(null)

      const res = await api.get(`/api/users/search?phone=${searchPhone}`)
      setSearchResult(res.data)
    } catch (error: any) {
      setSearchError(error.response?.data?.detail || '사용자를 찾을 수 없습니다.')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleAddGuardian = async () => {
    if (!searchResult) return

    try {
      setIsAdding(true)
      const payload = {
        name: searchResult.full_name || searchResult.username,
        phone: searchResult.phone,
        relationship: relationship,
        guardian_user_id: searchResult.id,
        is_primary: guardians.length === 0,
        access_level: 'view'
      }

      await api.post('/api/guardians/', payload)
      await fetchGuardians()
      setIsModalOpen(false)
      resetSearch()
    } catch (error) {
      console.error('보호자 추가 실패:', error)
      alert('보호자 등록에 실패했습니다.')
    } finally {
      setIsAdding(false)
    }
  }

  const resetSearch = () => {
    setSearchPhone('')
    setSearchResult(null)
    setSearchError('')
    setRelationship(mode === 'parent' ? 'child' : 'parent')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'parent' ? '보호 대상(자녀) 관리 👨‍👩‍👧‍👦' : '보호자 관리 🛡️'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'parent'
              ? '나의 상태를 확인할 수 있는 자녀나 보호자를 관리합니다.'
              : '부모님을 관리하는 보호자들을 추가하고 관리하세요.'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          <span>{mode === 'parent' ? '자녀 연결' : '보호자 추가'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : guardians.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-600 font-medium">등록된 정보가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-1">
            전화번호 검색을 통해 계정을 연결해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {guardians.map((g) => (
            <div key={g.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-50 p-3 rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{g.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-0.5">
                      <Phone size={12} className="mr-1" />
                      {g.phone}
                    </p>
                  </div>
                </div>
                {g.guardian_user_id && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center font-medium">
                    <CheckCircle2 size={12} className="mr-1" />
                    연결됨
                  </span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  {g.relationship === 'child' ? '자녀' :
                    g.relationship === 'parent' ? '부모' :
                      g.relationship === 'spouse' ? '배우자' : g.relationship}
                </span>
                {g.is_primary && (
                  <span className="text-xs text-indigo-600 font-bold flex items-center">
                    <Shield size={12} className="mr-1" />
                    주보호자
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'parent' ? '보호 대상 자녀 연결' : '보호자 계정 연결'}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); resetSearch(); }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">전화번호 검색</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="010-0000-0000"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 flex items-center space-x-1"
                  >
                    {searchLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    <span>검색</span>
                  </button>
                </div>
              </div>

              {searchError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start space-x-2 text-sm border border-red-100">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {searchResult && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-full">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-indigo-900">{searchResult.full_name || searchResult.username}</p>
                      <p className="text-xs text-indigo-600 font-medium">
                        {searchResult.user_type === 'parent' ? '부모 계정' : '자식 계정'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-indigo-200/50">
                    <label className="text-xs font-bold text-indigo-900">관계 설정</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="child">자녀</option>
                      <option value="parent">부모</option>
                      <option value="spouse">배우자</option>
                      <option value="relative">친척</option>
                      <option value="friend">친구</option>
                      <option value="caregiver">요양보호사</option>
                      <option value="other">기타</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAddGuardian}
                    disabled={isAdding}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:bg-indigo-400 transition-all flex items-center justify-center space-x-2"
                  >
                    {isAdding ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
                    <span>계정 연결하기</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Guardians