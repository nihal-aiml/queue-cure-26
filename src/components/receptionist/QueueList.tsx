import React from 'react';
import { useQueueStore } from '../../store/useQueueStore';
import { QueueCard } from './QueueCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QueueList: React.FC = () => {
  const { patients, settings, callNext, complexCaseActive } = useQueueStore();

  const isPaused = settings?.is_paused || false;
  const pauseReason = settings?.pause_reason || '';

  // Sort: Priority (Urgent > Elderly > Normal) then token number ascending
  const activePatients = patients
    .filter((p) => p.status === 'waiting' || p.status === 'consulting')
    .sort((a, b) => {
      const priorityWeights = { urgent: 3, elderly: 2, normal: 1 };
      const weightA = priorityWeights[a.priority] || 1;
      const weightB = priorityWeights[b.priority] || 1;

      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return a.token_number - b.token_number;
    });

  const waitingPatientsCount = patients.filter((p) => p.status === 'waiting').length;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all duration-500 ${
        isPaused
          ? 'border-amber-400 ring-4 ring-amber-400/20 animate-pulse-border'
          : 'border-gray-200'
      }`}
    >
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between p-6 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <span>Live Queue</span>
            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-none font-semibold">
              {activePatients.length} Active
            </Badge>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Patients are sorted by priority (Urgent → Elderly → Normal) then by registration order.
          </p>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center space-x-3">
          {complexCaseActive && (
            <div className="flex items-center space-x-1.5 bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold animate-bounce">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Complex Case Override (+5m)</span>
            </div>
          )}

          <Button
            onClick={() => callNext()}
            disabled={isPaused || waitingPatientsCount === 0}
            className={`h-11 px-5 text-sm font-semibold rounded-lg shadow-sm transition flex items-center space-x-2 ${
              isPaused || waitingPatientsCount === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <span>Call Next Patient</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content body */}
      <div className="p-6">
        {isPaused && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3 text-amber-800">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Queue Paused by Receptionist</p>
              <p className="text-xs mt-0.5 text-amber-700">
                Reason: {pauseReason || 'Not specified'}
              </p>
            </div>
          </div>
        )}

        {activePatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
              <Play className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-700 text-base">Queue is Empty</h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              Add a new patient above to generate their token and start managing the queue.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {activePatients.map((patient) => (
                <motion.div
                  key={patient.id}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0, marginTop: 0, marginBottom: 0, padding: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                >
                  <QueueCard patient={patient} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
          }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>
    </div>
  );
};
