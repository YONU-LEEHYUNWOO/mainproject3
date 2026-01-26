import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { favoritesAPI, tasksAPI, medicineAPI, guardiansAPI, inactivityAPI } from '../services/api'
import {
  Calendar,
  MessageSquare,
  Users,
  Pill,
  AlertTriangle,
  MapPin,
  Home,
  Heart,
  Moon,
  Utensils,
  ShoppingCart,
  Plus,
  TrendingUp,
  Mic,
  AlertCircle
} from 'lucide-react'
import { AICareCenter } from '../components/AICareCenter'
import { CareReport } from '../components/CareReport'
import { NotificationCenter } from '../components/NotificationCenter'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { VoiceInputButton } from '../components/VoiceInputButton'

interface FavoritePlace {
  id: number
  name: string
  category: string
  latitude: number
  longitude: number
  is_primary: boolean
}

interface DashboardStats {
  todayTasks: {
    total: number
    completed: number
    remaining: number
  }
  todayMedicines: any[]
  dueMedicines: any[]
}

const Dashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  // 경로에서 모드 추출 (/parent/... 또는 /child/...)
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'

  const [stats, setStats] = useState<DashboardStats>({
    todayTasks: { total: 0, completed: 0, remaining: 0 },
    todayMedicines: [],
    dueMedicines: []
  })
  const [favorites, setFavorites] = useState<FavoritePlace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [managedUserId, setManagedUserId] = useState<number | null>(null)
  const [inactivityStatus, setInactivityStatus] = useState<any>(null)

  // 음성 비서 상태
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition()

  useEffect(() => {
    loadDashboardData()
    // 30초마다 데이터 자동 갱신 (특히 자녀 모드 모니터링을 위해)
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [mode, user])

  // 실시간 무활동 상태 폴링 (1분마다)
  useEffect(() => {
    if (mode === 'child' && managedUserId) {
      const fetchStatus = async () => {
        try {
          const res = await inactivityAPI.getStatus(managedUserId)
          if (res.data?.data) setInactivityStatus(res.data.data)
        } catch (error) {
          console.error('실시간 상태 업데이트 오류:', error)
        }
      }

      const interval = setInterval(fetchStatus, 10000)
      return () => clearInterval(interval)
    }
  }, [mode, managedUserId])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // 1. 자식 모드일 경우 관리 대상 부모님 ID 찾기
      let targetId: number | undefined = undefined
      if (mode === 'child') {
        const managedRes = await guardiansAPI.getManagedUsers()
        const managedUsers = managedRes.data.data?.managed_users || []
        // 주보호자로 설정된 사용자를 우선 찾고, 없으면 첫 번째 사용자 선택
        const target = managedUsers.find((u: any) => u.is_primary) || managedUsers[0]

        if (target) {
          targetId = target.user_id
          setManagedUserId(targetId as number)
        }
      }

      const [
        tasksResponse,
        medicinesResponse,
        dueResponse,
        favoritesResponse,
        inactivityResponse
      ] = await Promise.all([
        tasksAPI.getTodayCount(targetId),
        medicineAPI.getTodayAlarms(targetId),
        medicineAPI.getDueAlarms(targetId),
        favoritesAPI.getFavorites(targetId),
        targetId ? inactivityAPI.getStatus(targetId) : Promise.resolve({ data: { data: null } })
      ])

      setStats({
        todayTasks: tasksResponse.data.data,
        todayMedicines: medicinesResponse.data.data.alarms || [],
        dueMedicines: dueResponse.data.data.due_alarms || []
      })
      setFavorites(favoritesResponse.data.data || [])

      if (inactivityResponse?.data?.data) {
        setInactivityStatus(inactivityResponse.data.data)
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 음성 인식 결과 처리: 인식된 텍스트가 있으면 채팅 페이지로 이동하며 전달
   */
  useEffect(() => {
    if (transcript && !isListening) {
      const text = transcript.trim()
      if (text) {
        // 채팅 페이지로 이동하며 입력 텍스트 전달
        navigate(mode === 'parent' ? '/parent/chat' : '/child/chat', {
          state: { initialMessage: text }
        })
        resetTranscript()
      }
    }
  }, [transcript, isListening, navigate, mode, resetTranscript])

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    link,
    subtitle
  }: {
    title: string
    value: string | number
    icon: any
    color: string
    link: string
    subtitle?: string
  }) => (
    <Link to={link} className="block">
      <div className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow ${color}`}>
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {title}
                </dt>
                <dd className="text-lg font-medium text-white">
                  {value}
                </dd>
                {subtitle && (
                  <dd className="text-xs text-white/80">
                    {subtitle}
                  </dd>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI 능동형 케어 센터 */}
      <AICareCenter mode={mode} />

      {/* 실시간 알림 센터 (공통 노출) */}
      <NotificationCenter targetUserId={mode === 'child' ? (managedUserId || undefined) : undefined} />

      {/* AI 보이스 비서 위젯 (부모 모드 전용) */}
      {
        mode === 'parent' && (
          <div className="bg-white rounded-2xl shadow-md p-5 border border-blue-100 flex items-center justify-between group hover:shadow-lg transition-all border-b-4 border-blue-500">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-inner">
                <Mic className={`h-6 w-6 ${isListening ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">AI 말로 관리하기</h3>
                <p className="text-sm text-gray-500">"내일 병원 일정 추가해줘"라고 말해보세요</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <VoiceInputButton
                isListening={isListening}
                isSupported={isSpeechSupported}
                onClick={() => isListening ? stopListening() : startListening()}
              />
              <Link
                to="/parent/chat"
                className="p-3 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-blue-500 transition-colors"
                title="채팅하기"
              >
                <MessageSquare className="h-6 w-6" />
              </Link>
            </div>

            {speechError && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-red-50 text-red-600 text-xs p-2 rounded-lg flex items-center shadow-sm z-10">
                <AlertCircle className="h-3 w-3 mr-1" />
                {speechError}
              </div>
            )}
          </div>
        )
      }

      {/* 환영 메시지 - 모드별로 다른 메시지 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'parent'
              ? `안녕하세요, ${user?.full_name || user?.username}님! 👴`
              : `부모님 관리 대시보드 👨`}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'parent'
              ? 'AI 케어비서가 당신의 건강과 일상을 도와드립니다.'
              : '부모님의 건강과 일상을 모니터링하고 관리하세요.'}
          </p>
        </div>
      </div>

      {/* 자녀 모드: 부모님 실시간 상태 배너 */}
      {
        mode === 'child' && inactivityStatus && (
          <div className={`shadow-sm rounded-xl border-l-8 p-5 mt-6 mb-6 flex items-center justify-between transition-all ${inactivityStatus.status === 'Active' ? 'bg-green-50 border-green-500' :
            inactivityStatus.status === 'Sleep' ? 'bg-indigo-50 border-indigo-500' :
              'bg-red-50 border-red-500'
            }`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-2xl mr-4 ${inactivityStatus.status === 'Active' ? 'bg-green-100 text-green-600' :
                inactivityStatus.status === 'Sleep' ? 'bg-indigo-100 text-indigo-600' :
                  'bg-red-100 text-red-600 shadow-sm'
                }`}>
                {inactivityStatus.status === 'Active' ? <Heart className="h-8 w-8" /> :
                  inactivityStatus.status === 'Sleep' ? <Moon className="h-8 w-8" /> :
                    <AlertTriangle className="h-8 w-8 animate-pulse" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  부모님은 지금 {
                    inactivityStatus.status === 'Active' ? <span className="text-green-600">정상 활동 중</span> :
                      inactivityStatus.status === 'Sleep' ? <span className="text-indigo-600">취침 중</span> :
                        <span className="text-red-600">무활동 감지됨</span>
                  }
                </h3>
                <p className="text-sm text-gray-600 mt-1 font-medium">{inactivityStatus.message}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400">
                마지막 체크: {new Date().toLocaleTimeString()}
              </p>
              <Link to="/child/monitoring" className="text-xs font-bold text-blue-600 mt-2 inline-block hover:underline">
                상세 보기 →
              </Link>
            </div>
          </div>
        )
      }

      {/* 빠른 길안내 - 부모 모드에서만 핵심 기능으로 상단 배치 */}
      {
        mode === 'parent' && (
          <div className="bg-white shadow rounded-lg overflow-hidden border-2 border-blue-500">
            <div className="px-4 py-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl leading-6 font-bold text-gray-900 flex items-center">
                  <MapPin className="mr-3 h-6 w-6 text-blue-500" />
                  어디로 모실까요? 길안내 🚗
                </h3>
                <Link
                  to="/parent/settings"
                  className="text-sm text-gray-400 hover:text-gray-500 font-medium"
                >
                  관리 →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'hospital', name: '병원', icon: Heart, color: 'bg-red-50 text-red-600 border-red-200' },
                  { id: 'pharmacy', name: '약국', icon: Pill, color: 'bg-green-50 text-green-600 border-green-200' },
                  { id: 'restaurant', name: '식당', icon: Utensils, color: 'bg-orange-50 text-orange-600 border-orange-200' },
                  { id: 'mart', name: '마트', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600 border-blue-200' },
                  { id: 'home', name: '집', icon: Home, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
                  { id: 'other', name: '기타', icon: MapPin, color: 'bg-gray-50 text-gray-600 border-gray-200' },
                ].map((cat) => {
                  return (
                    <div key={cat.id} className="relative">
                      <button
                        onClick={() => {
                          const categoryPlaces = favorites.filter((f) => f.category === cat.id);
                          if (categoryPlaces.length > 1) {
                            setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                          } else if (categoryPlaces.length === 1) {
                            const place = categoryPlaces[0];
                            window.open(`https://map.kakao.com/link/to/${place.name},${place.latitude},${place.longitude}`, '_blank');
                          } else {
                            navigate(mode === 'parent' ? '/parent/settings' : '/child/settings');
                          }
                        }}
                        className={`w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${cat.color} ${favorites.filter((f) => f.category === cat.id).length === 0 ? 'opacity-60 border-dashed' : 'shadow-md border-solid'}`}
                      >
                        <cat.icon className="h-12 w-12 mb-3" />
                        <span className="font-extrabold text-xl">{cat.name}</span>
                        <span className="text-sm mt-2 font-medium truncate w-full text-center">
                          {favorites.filter((f) => f.category === cat.id).length > 0
                            ? (favorites.find((f) => f.category === cat.id && f.is_primary)?.name || favorites.find((f) => f.category === cat.id)?.name)
                            : '장소 등록 필요'}
                          {favorites.filter((f) => f.category === cat.id).length > 1 && ` (외 ${favorites.filter((f) => f.category === cat.id).length - 1}곳)`}
                        </span>
                      </button>

                      {/* 장소 선택 팝업 - 크게 표시 */}
                      {selectedCategory === cat.id && (
                        <div className="absolute z-30 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden left-1/2 -translate-x-1/2">
                          <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-600">{cat.name} 선택</span>
                            <button onClick={() => setSelectedCategory(null)} className="p-1"><Plus className="h-5 w-5 rotate-45 text-gray-400" /></button>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {favorites.filter((f) => f.category === cat.id).map((place) => (
                              <button
                                key={place.id}
                                onClick={() => {
                                  window.open(`https://map.kakao.com/link/to/${place.name},${place.latitude},${place.longitude}`, '_blank');
                                  setSelectedCategory(null);
                                }}
                                className="w-full text-left px-5 py-4 text-base font-semibold hover:bg-blue-50 border-b last:border-b-0 flex items-center justify-between active:bg-blue-100"
                              >
                                <span className="truncate flex-1">{place.name}</span>
                                {place.is_primary && <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      }

      {/* 자녀 모드: 부모님 생활 리포트 */}
      {
        mode === 'child' && (
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-indigo-500" />
                부모님 생활 리포트 📊
              </h3>
              <CareReport parentId={managedUserId} />
            </div>
          </div>
        )
      }

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={mode === 'parent' ? "오늘의 할 일" : "부모님 일정"}
          value={stats.todayTasks.total}
          icon={Calendar}
          color="bg-blue-500"
          link={mode === 'parent' ? '/parent/tasks' : '/child/tasks'}
          subtitle={`${stats.todayTasks.completed}개 완료 / ${stats.todayTasks.remaining}개 남음`}
        />

        <StatCard
          title="약 챙겨드시기"
          value={stats.todayMedicines.length}
          icon={Pill}
          color="bg-green-500"
          link={mode === 'parent' ? '/parent/medicine' : '/child/medicine'}
          subtitle="오늘 복용 일정"
        />

        <StatCard
          title="AI 케어비서와 대화"
          value="대화하기"
          icon={MessageSquare}
          color="bg-purple-500"
          link={mode === 'parent' ? '/parent/chat' : '/child/chat'}
          subtitle="무엇이든 물어보세요"
        />
      </div>

      {/* 긴급 알림 */}
      {
        stats.dueMedicines.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  약 복용 알림
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {stats.dueMedicines.slice(0, 3).map((medicine: any, index: number) => (
                      <li key={index}>
                        {medicine.medicine_name} - {medicine.scheduled_time} 예정
                        ({medicine.minutes_until}분 남음)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* 빠른 액션 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            추가 기능
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {mode === 'parent' ? (
              <>
                <Link
                  to="/parent/health"
                  className="btn-secondary py-4 text-lg font-bold flex items-center justify-center"
                >
                  <Heart className="mr-2 h-6 w-6 text-red-500" />
                  내 건강 정보 확인
                </Link>
                <Link
                  to="/parent/settings"
                  className="btn-secondary py-4 text-lg font-bold flex items-center justify-center"
                >
                  <Users className="mr-2 h-6 w-6 text-indigo-500" />
                  내 정보 및 설정
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/child/guardians"
                  className="btn-primary py-4 text-lg font-bold flex items-center justify-center"
                >
                  <Users className="mr-2 h-6 w-6" />
                  보호자 관리
                </Link>
                <Link
                  to="/child/monitoring"
                  className="btn-secondary py-4 text-lg font-bold flex items-center justify-center"
                >
                  <AlertTriangle className="mr-2 h-6 w-6 text-orange-500" />
                  부모님 실시간 모니터링
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div >
  )
}

export default Dashboard