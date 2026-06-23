import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useQueueStore } from '../../store/useQueueStore';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const WaitTrendChart: React.FC = () => {
  const { patients } = useQueueStore();

  // Get last 10 called/consulting/done patients (who have called_at set)
  // Sorted chronologically by called_at ascending so trend flows left-to-right
  const calledPatients = patients
    .filter((p) => p.called_at)
    .sort((a, b) => new Date(a.called_at!).getTime() - new Date(b.called_at!).getTime())
    .slice(-10);

  const chartData = calledPatients.map((p) => {
    const waitMs = new Date(p.called_at!).getTime() - new Date(p.checked_in_at).getTime();
    const waitMin = Math.max(0, Math.round(waitMs / 60000));
    return {
      token: `#${p.token_number}`,
      name: p.name.split(' ')[0],
      Wait: waitMin,
    };
  });

  // Calculate trend direction (simple comparison of first and last item in window)
  const isTrendingUp =
    chartData.length >= 2
      ? chartData[chartData.length - 1].Wait > chartData[0].Wait
      : false;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-64 flex flex-col justify-between select-none">
      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">Avg Wait Time Trend</h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
            Wait time in minutes for last {chartData.length} called patients
          </p>
        </div>
        
        {chartData.length >= 2 && (
          <div
            className={`flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isTrendingUp ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {isTrendingUp ? (
              <>
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Trending Up</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Trending Down</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-grow w-full h-[140px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400 font-semibold">
            No called patients today to plot trends
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="token"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
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
                formatter={(value: any, name: any, props: any) => [
                  `${value} min`,
                  `${props.payload.name} (${name})`,
                ]}
              />
              <Line
                type="monotone"
                dataKey="Wait"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ fill: '#2563eb', strokeWidth: 1, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
