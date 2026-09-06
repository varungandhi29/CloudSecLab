import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { LeaderboardEntry } from '../../types'

interface LeaderboardChartProps {
  data: LeaderboardEntry[]
}

export const LeaderboardChart: React.FC<LeaderboardChartProps> = ({ data }) => {
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.username,
    xp: item.total_xp,
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} angle={-30} textAnchor="end" />
          <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#F9FAFB' }}
          />
          <Bar dataKey="xp" radius={[6, 6, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#F59E0B' : '#06B6D4'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
