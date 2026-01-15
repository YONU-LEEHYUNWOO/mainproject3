import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Heart, Activity } from 'lucide-react';

/**
 * 건강 데이터 차트 컴포넌트
 * 심박수와 걸음수 데이터를 시각화
 */
const HealthChart = ({ data, type = 'heartRate', t }) => {
  // 시뮬레이션 데이터 생성 (실제로는 API에서 받아올 데이터)
  const generateData = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      days.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        value: type === 'heartRate' 
          ? Math.floor(Math.random() * 20) + 65 // 65-85 심박수
          : Math.floor(Math.random() * 2000) + 3000, // 3000-5000 걸음수
      });
    }
    return days;
  };

  const chartData = data || generateData();
  const isHeartRate = type === 'heartRate';
  const color = isHeartRate ? '#FF6B9D' : '#4ECDC4';
  const icon = isHeartRate ? <Heart size={16} /> : <Activity size={16} />;
  const unit = isHeartRate ? 'bpm' : 'steps';
  const label = isHeartRate ? t('heartRate') : t('steps');

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-pastel-pink/30 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-700">{label}</h4>
          <p className="text-xs text-slate-400">{t('weeklyReport')}</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            stroke="#e2e8f0"
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            stroke="#e2e8f0"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '12px'
            }}
            formatter={(value) => [`${value} ${unit}`, label]}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            fill={`url(#gradient-${type})`}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-400">평균</span>
        <span className="font-bold" style={{ color }}>
          {Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length)} {unit}
        </span>
      </div>
    </div>
  );
};

export default HealthChart;



