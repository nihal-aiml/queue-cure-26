import React from 'react';
import type { Patient } from '../../lib/types';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface UpNextProps {
  waitingPatients: Patient[];
}

export const UpNext: React.FC<UpNextProps> = ({ waitingPatients }) => {
  // Take next 3 patients in queue order (already sorted in parent)
  const nextThree = waitingPatients.slice(0, 3);

  const getPriorityPillStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 border-red-500/30 text-red-500';
      case 'elderly':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold text-[10px] uppercase shrink-0 py-0.5 px-2">
            Urgent
          </Badge>
        );
      case 'elderly':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[10px] uppercase shrink-0 py-0.5 px-2">
            Elderly
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[25vh] bg-slate-900 border-b border-slate-800 flex flex-col justify-center px-8 lg:px-16 py-4 select-none">
      <div className="flex items-center space-x-3 mb-3">
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">
          Up Next (Incoming Patients)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {nextThree.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 text-base font-semibold py-4">
              No patients waiting in queue
            </div>
          ) : (
            nextThree.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                className={`flex items-center justify-between p-4 rounded-xl border ${getPriorityPillStyle(
                  patient.priority
                )}`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="font-mono text-2xl font-black shrink-0">
                    #{patient.token_number}
                  </span>
                  <span className="text-lg font-bold text-white truncate max-w-[150px] md:max-w-[120px] lg:max-w-[180px]">
                    {patient.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  {getPriorityBadge(patient.priority)}
                  <Badge className="bg-slate-800 text-gray-300 hover:bg-slate-800 border-none text-[10px] font-semibold py-0.5 px-2">
                    {index === 0 ? 'Wait 1st' : index === 1 ? 'Wait 2nd' : 'Wait 3rd'}
                  </Badge>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
