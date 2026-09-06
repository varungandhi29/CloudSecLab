import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface ProgressChartProps {
  completed: number
  total: number
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ completed, total }) => {
  const remaining = Math.max(0, total - completed)
  const data = [
    { name: 'Completed', value: completed },
    { name: 'Remaining', value: remaining },
  ]

  const COLORS = ['#10B981', '#1F2937']

  return (
    <div className="h-48 w-full flex items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0A0E1A" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#F9FAFB' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="font-bold text-2xl text-emerald-400 font-mono">{completed}</span>
        <span className="text-[10px] text-gray-400 uppercase font-mono">/ {total} Levels</span>
      </div>
    </div>
  )
}
