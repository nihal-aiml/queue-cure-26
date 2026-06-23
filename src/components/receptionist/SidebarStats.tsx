import React from 'react';
import { useQueueStore } from '../../store/useQueueStore';
import { Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const SidebarStats: React.FC = () => {
  const { patients } = useQueueStore();

  // Get patients checked in today (local date check)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartTime = todayStart.getTime();

  const todayPatients = patients.filter((p) => {
    const checkInTime = new Date(p.checked_in_at).getTime();
    return checkInTime >= todayStartTime;
  });

  const totalToday = todayPatients.length;
  
  // Waiting count (all active waiting, including carryover)
  const waitingCount = patients.filter((p) => p.status === 'waiting').length;

  // Done count (today only)
  const doneCount = todayPatients.filter((p) => p.status === 'done').length;

  // Avg wait today for done patients (called_at - checked_in_at)
  const doneWithTimes = todayPatients.filter(
    (p) => p.status === 'done' && p.called_at && p.checked_in_at
  );

  const avgWait =
    doneWithTimes.length > 0
      ? Math.round(
          doneWithTimes.reduce((sum, p) => {
            const waitMs = new Date(p.called_at!).getTime() - new Date(p.checked_in_at).getTime();
            return sum + Math.max(0, waitMs);
          }, 0) / (doneWithTimes.length * 60000)
        )
      : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Today's Stats
      </h3>
      
      <div className="grid grid-cols-1 gap-3">
        {/* Total Today */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Today</p>
            <p className="text-lg font-semibold text-white">{totalToday}</p>
          </div>
        </div>

        {/* Waiting */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Waiting Room</p>
            <p className="text-lg font-semibold text-white">{waitingCount}</p>
          </div>
        </div>

        {/* Done */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-center space-x-3">
          <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Done Today</p>
            <p className="text-lg font-semibold text-white">{doneCount}</p>
          </div>
        </div>

        {/* Avg Wait */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Avg Actual Wait</p>
            <p className="text-lg font-semibold text-white">
              {avgWait} <span className="text-xs font-normal text-gray-400">min</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
