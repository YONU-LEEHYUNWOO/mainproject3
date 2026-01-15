/**
 * 활동 반경 그래프 컴포넌트
 * 최근 1주/1달 이동 반경을 시각화
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * 활동 반경 차트 컴포넌트
 * @param {Array} activitiesHistory - 활동 기록 히스토리
 * @param {number} days - 표시할 기간 (7일 또는 30일)
 */
const MovementRadiusChart = ({ activitiesHistory = [], days = 7 }) => {
    // 활동 데이터로부터 이동 반경 계산
    const calculateMovementRadius = (history) => {
        const today = new Date();
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            const dayData = history.find(h => h.date === dateStr);
            const activities = dayData?.activities || {};
            
            // 방문 횟수와 이동 거리 추정
            const visits = (activities.visits || []).length;
            const meals = (activities.meals || []).length;
            const shopping = (activities.shopping || []).length;
            const treatments = (activities.treatments || []).length;
            
            // 총 활동 점수 계산 (방문당 평균 2km 추정)
            const totalActivity = visits + meals + shopping + treatments;
            const estimatedRadius = totalActivity * 2; // km 추정
            
            data.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                radius: Math.round(estimatedRadius * 10) / 10, // 소수점 1자리
                visits,
                totalActivity
            });
        }
        
        return data;
    };
    
    const chartData = calculateMovementRadius(activitiesHistory);
    const averageRadius = chartData.length > 0 
        ? Math.round((chartData.reduce((sum, d) => sum + d.radius, 0) / chartData.length) * 10) / 10
        : 0;
    const maxRadius = chartData.length > 0 
        ? Math.max(...chartData.map(d => d.radius))
        : 0;
    
    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-pastel-green/30 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-pastel-green" />
                <h3 className="text-lg font-black text-slate-800">활동 반경 ({days}일)</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-pastel-green/20 rounded-2xl p-4">
                    <p className="text-xs font-bold text-slate-600 mb-1">평균 반경</p>
                    <p className="text-2xl font-black text-slate-800">{averageRadius}km</p>
                </div>
                <div className="bg-pastel-blue/20 rounded-2xl p-4">
                    <p className="text-xs font-bold text-slate-600 mb-1">최대 반경</p>
                    <p className="text-2xl font-black text-slate-800">{maxRadius}km</p>
                </div>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="gradient-radius" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <YAxis 
                        stroke="#666"
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                        label={{ value: 'km', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '2px solid #4ECDC4',
                            borderRadius: '12px',
                            fontWeight: 'bold'
                        }}
                        formatter={(value) => [`${value}km`, '활동 반경']}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="radius" 
                        stroke="#4ECDC4" 
                        strokeWidth={3}
                        fill="url(#gradient-radius)"
                        name="활동 반경"
                    />
                </AreaChart>
            </ResponsiveContainer>
            
            <p className="text-xs text-slate-500 mt-2 font-bold">
                💡 활동 반경은 방문 횟수와 이동 거리를 기반으로 추정됩니다.
            </p>
        </div>
    );
};

export default MovementRadiusChart;
