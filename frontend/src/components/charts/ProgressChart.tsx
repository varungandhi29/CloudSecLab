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

  const COLORS = ['#4FB6A8', '#26303D']

  return (
    <div className="h-44 w-full flex items-center justify-center relative select-none">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={68}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#12161C" strokeWidth={2} />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center pointer-events-none font-mono">
        <span className="font-bold text-xl text-accent-teal">{completed}</span>
        <span className="text-[10px] text-text-muted uppercase">/ {total} Labs</span>
      </div>
    </div>
  )
}

export default ProgressChart
