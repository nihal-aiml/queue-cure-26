import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useQueueStore } from '../../store/useQueueStore';

export const HourlyFlowChart: React.FC = () => {
  const { patients } = useQueueStore();

  const hoursRange = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // 8 AM to 8 PM

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartTime = todayStart.getTime();

  // Aggregate patients checked in today by hour
  const chartData = hoursRange.map((hr) => {
    const registrations = patients.filter((p) => {
      const checkInTime = new Date(p.checked_in_at).getTime();
      const isToday = checkInTime >= todayStartTime;
      const checkInHour = new Date(p.checked_in_at).getHours();
      return isToday && checkInHour === hr;
    }).length;

    // Format hour label
    const formatHour = (h: number) => {
      if (h === 12) return '12 PM';
      return h > 12 ? `${h - 12} PM` : `${h} AM`;
    };

    return {
      hourLabel: formatHour(hr),
      Patients: registrations,
    };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-64 flex flex-col justify-between select-none">
      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">Hourly Patient Flow</h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
            Distribution of patient check-ins by hour today
          </p>
        </div>
      </div>

      <div className="flex-grow w-full h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="hourLabel"
              stroke="#94a3b8"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '11px',
              }}
              cursor={{ fill: '#f1f5f9' }}
              formatter={(value: any) => [`${value} patient(s)`, 'Registered']}
            />
            <Bar
              dataKey="Patients"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
