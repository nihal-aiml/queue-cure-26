import React from 'react';
import type { Patient } from '../../lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface NowServingProps {
  currentPatient: Patient | null;
}

export const NowServing: React.FC<NowServingProps> = ({ currentPatient }) => {
  const tokenDisplay = currentPatient ? currentPatient.token_number : '--';
  const firstName = currentPatient ? currentPatient.name.split(' ')[0] : 'No Active Consultation';

  return (
    <div className="h-[40vh] bg-gradient-to-b from-blue-950 to-slate-950 text-white flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden relative border-b border-blue-900/30">
      {/* Accent Background light glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
      
      <div className="relative z-10 space-y-2">
        <span className="text-blue-400 font-bold tracking-widest text-xs uppercase bg-blue-950/60 border border-blue-900 px-4 py-1.5 rounded-full">
          Now Serving
        </span>
        
        {/* Giant Odometer Token Number */}
        <div className="h-[150px] flex items-center justify-center font-mono">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={tokenDisplay}
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -120, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="text-[120px] font-black text-blue-300 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse-slow"
            >
              {tokenDisplay !== '--' ? `#${tokenDisplay}` : '--'}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-1">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Now Being Seen
          </p>
          <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {firstName}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.02);
            opacity: 0.95;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
