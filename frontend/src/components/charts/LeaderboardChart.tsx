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
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <XAxis
            dataKey="name"
            stroke="#8B95A5"
            fontSize={11}
            tickLine={false}
            angle={-25}
            textAnchor="end"
            fontFamily="JetBrains Mono"
          />
          <YAxis
            stroke="#8B95A5"
            fontSize={10}
            tickLine={false}
            fontFamily="JetBrains Mono"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A2029',
              borderColor: '#26303D',
              borderRadius: '6px',
              color: '#E7EAEE',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
            }}
          />
          <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#E8A33D' : '#4FB6A8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LeaderboardChart
