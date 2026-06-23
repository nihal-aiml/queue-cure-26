import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { useQueueStore } from '../../store/useQueueStore';

export const QueueHealthGauge: React.FC = () => {
  const { patients } = useQueueStore();

  const waitingCount = patients.filter((p) => p.status === 'waiting').length;
  // Calculate percentage: (waiting / 20) * 100
  const maxCapacity = 20;
  const loadPercentage = Math.min(100, Math.round((waitingCount / maxCapacity) * 100));

  const getLoadColor = (pct: number) => {
    if (pct < 40) return '#10b981'; // Green
    if (pct <= 70) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const loadColor = getLoadColor(loadPercentage);

  const data = [
    {
      name: 'Queue Load',
      value: loadPercentage,
      fill: loadColor,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-64 flex flex-col justify-between select-none">
      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
        <h3 className="font-bold text-gray-800 text-sm">Queue Health Gauge</h3>
        <span className="text-xs text-gray-500 font-medium">Cap: {maxCapacity} patients</span>
      </div>

      <div className="relative flex-grow flex items-center justify-center">
        <ResponsiveContainer width="100%" height={150}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={220}
            endAngle={-40}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#e2e8f0' }}
              dataKey="value"
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Text Indicator */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight" style={{ color: loadColor }}>
            {loadPercentage}%
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
            Queue Load
          </span>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
        <span>Status: </span>
        <span
          className="font-bold uppercase tracking-wider"
          style={{ color: loadColor }}
        >
          {loadPercentage < 40 ? 'Optimal' : loadPercentage <= 70 ? 'Moderate' : 'Congested'}
        </span>
      </div>
    </div>
  );
};
