import React, { useEffect, useState } from 'react';
import { useQueueStore } from '../../store/useQueueStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Volume2,
  CheckCircle2,
  UserMinus,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  Clock,
  Info,
} from 'lucide-react';

export const AlertFeed: React.FC = () => {
  const { events } = useQueueStore();
  const [, setRefreshCount] = useState(0);

  // Re-render periodically to update the "time ago" stamps
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount((prev) => prev + 1);
    }, 10000); // refresh time-ago labels every 10s
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventMeta = (type: string, token: number | undefined | null, payload: any) => {
    const name = payload?.name || '';
    switch (type) {
      case 'registered':
        return {
          icon: <UserPlus className="h-4 w-4 text-blue-500" />,
          desc: `Token #${token} issued to "${name}"`,
          bgColor: 'bg-blue-50 border-blue-100',
        };
      case 'called':
        return {
          icon: <Volume2 className="h-4 w-4 text-green-500 animate-bounce" />,
          desc: `Token #${token} (${name}) called to clinic`,
          bgColor: 'bg-green-50 border-green-100',
        };
      case 'done':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
          desc: `Token #${token} completed ${payload?.note ? `[${payload.note}]` : ''}`,
          bgColor: 'bg-emerald-50 border-emerald-100',
        };
      case 'removed':
        return {
          icon: <UserMinus className="h-4 w-4 text-red-500" />,
          desc: `Token #${token} removed from queue`,
          bgColor: 'bg-red-50 border-red-100',
        };
      case 'queue_paused':
        return {
          icon: <PauseCircle className="h-4 w-4 text-amber-500" />,
          desc: `Queue paused: "${payload?.reason || 'Brief break'}"`,
          bgColor: 'bg-amber-50 border-amber-100',
        };
      case 'queue_active':
        return {
          icon: <PlayCircle className="h-4 w-4 text-blue-600" />,
          desc: `Queue resumed by receptionist`,
          bgColor: 'bg-blue-50 border-blue-100',
        };
      case 'marked_urgent':
        return {
          icon: <AlertCircle className="h-4 w-4 text-rose-500" />,
          desc: `Token #${token} upgraded to URGENT priority`,
          bgColor: 'bg-rose-50 border-rose-100',
        };
      default:
        return {
          icon: <Info className="h-4 w-4 text-gray-500" />,
          desc: `Queue action performed`,
          bgColor: 'bg-gray-50 border-gray-150',
        };
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-[400px] flex flex-col justify-between select-none">
      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
        <h3 className="font-bold text-gray-800 text-sm">Live Alert Feed</h3>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      </div>

      {/* Events List container */}
      <div className="flex-grow overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400 font-semibold">
              No audit logs captured today
            </div>
          ) : (
            events.map((event) => {
              const meta = getEventMeta(event.event_type, event.token_number, event.payload);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`flex items-start justify-between p-3 rounded-lg border text-xs leading-relaxed ${meta.bgColor}`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="shrink-0">{meta.icon}</div>
                    <span className="font-medium text-gray-700 truncate max-w-[210px] md:max-w-[170px] lg:max-w-[200px]">
                      {meta.desc}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-[10px] text-gray-400 font-bold shrink-0 ml-2">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(event.created_at)}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
