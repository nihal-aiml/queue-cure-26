import React from 'react';
import { useQueueStore } from '../../store/useQueueStore';
import { Sparkles, Hourglass, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const TodaySummary: React.FC = () => {
  const { patients } = useQueueStore();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartTime = todayStart.getTime();

  // Filter today's done patients
  const todayDonePatients = patients.filter((p) => {
    const checkInTime = new Date(p.checked_in_at).getTime();
    return checkInTime >= todayStartTime && p.status === 'done';
  });

  const totalSeen = todayDonePatients.length;

  // Wait times in minutes (called_at - checked_in_at)
  const waitTimes = todayDonePatients
    .filter((p) => p.called_at && p.checked_in_at)
    .map((p) => {
      const waitMs = new Date(p.called_at!).getTime() - new Date(p.checked_in_at).getTime();
      return Math.max(0, Math.round(waitMs / 60000));
    });

  const avgWait =
    waitTimes.length > 0 ? Math.round(waitTimes.reduce((s, w) => s + w, 0) / waitTimes.length) : 0;
  const longestWait = waitTimes.length > 0 ? Math.max(...waitTimes) : 0;
  const shortestWait = waitTimes.length > 0 ? Math.min(...waitTimes) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-64 flex flex-col justify-between select-none">
      <div className="border-b border-gray-100 pb-2 mb-3">
        <h3 className="font-bold text-gray-800 text-sm">Today's Summary</h3>
        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
          Key performance wait-time indicators for today
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-grow pb-1">
        {/* Total Seen */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Seen</span>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{totalSeen}</span>
            <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Patients</span>
          </div>
        </div>

        {/* Avg Wait */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Wait</span>
            <Hourglass className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{avgWait}</span>
            <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Minutes</span>
          </div>
        </div>

        {/* Longest Wait */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Max Wait</span>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{longestWait}</span>
            <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Minutes</span>
          </div>
        </div>

        {/* Shortest Wait */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Min Wait</span>
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{shortestWait}</span>
            <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
