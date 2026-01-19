interface MedicineStatsProps {
  total: number
  completed: number
  remaining: number
}

/**
 * 약 복용 통계 컴포넌트
 */
export const MedicineStats: React.FC<MedicineStatsProps> = ({ total, completed, remaining }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 복용 현황</h3>
      
      {/* 통계 카드들 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-600 mt-1">전체</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completed}</div>
          <div className="text-sm text-gray-600 mt-1">완료</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{remaining}</div>
          <div className="text-sm text-gray-600 mt-1">남음</div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>복용 진행률</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
