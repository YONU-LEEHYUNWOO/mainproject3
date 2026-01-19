import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { tasksAPI, medicineAPI } from '../services/api'
import {
  Calendar,
  MessageSquare,
  Users,
  Pill,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

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
  const [stats, setStats] = useState<DashboardStats>({
    todayTasks: { total: 0, completed: 0, remaining: 0 },
    todayMedicines: [],
    dueMedicines: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [tasksResponse, medicinesResponse, dueResponse] = await Promise.all([
        tasksAPI.getTodayCount(),
        medicineAPI.getTodayAlarms(),
        medicineAPI.getDueAlarms()
      ])

      setStats({
        todayTasks: tasksResponse.data,
        todayMedicines: medicinesResponse.data.today_alarms || [],
        dueMedicines: dueResponse.data.due_alarms || []
      })
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
      {/* 환영 메시지 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            안녕하세요, {user?.full_name || user?.username}님!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            AI 케어비서가 당신의 건강과 일상을 도와드립니다.
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="오늘의 일정"
          value={stats.todayTasks.total}
          icon={Calendar}
          color="bg-blue-500"
          link="/tasks"
          subtitle={`${stats.todayTasks.completed}개 완료`}
        />

        <StatCard
          title="약 복용"
          value={stats.todayMedicines.length}
          icon={Pill}
          color="bg-green-500"
          link="/medicine"
          subtitle="오늘 복용할 약"
        />

        <StatCard
          title="AI 채팅"
          value="대화하기"
          icon={MessageSquare}
          color="bg-purple-500"
          link="/chat"
        />

        <StatCard
          title="보호자"
          value="관리하기"
          icon={Users}
          color="bg-indigo-500"
          link="/guardians"
        />
      </div>

      {/* 긴급 알림 */}
      {stats.dueMedicines.length > 0 && (
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
              <div className="mt-4">
                <Link
                  to="/medicine"
                  className="text-sm font-medium text-red-800 hover:text-red-600"
                >
                  약 관리 페이지로 이동 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 빠른 액션 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            빠른 액션
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/tasks"
              className="btn-primary flex items-center justify-center"
            >
              <Calendar className="mr-2 h-5 w-5" />
              새 일정 추가
            </Link>
            <Link
              to="/chat"
              className="btn-secondary flex items-center justify-center"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              AI와 대화
            </Link>
            <Link
              to="/medicine"
              className="btn-secondary flex items-center justify-center"
            >
              <Pill className="mr-2 h-5 w-5" />
              약 알림 설정
            </Link>
          </div>
        </div>
      </div>

      {/* 오늘 일정 미리보기 */}
      {stats.todayTasks.total > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              오늘 일정
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    완료: {stats.todayTasks.completed}개
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    남음: {stats.todayTasks.remaining}개
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: stats.todayTasks.total > 0
                      ? `${(stats.todayTasks.completed / stats.todayTasks.total) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
              <Link
                to="/tasks"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                자세히 보기 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard