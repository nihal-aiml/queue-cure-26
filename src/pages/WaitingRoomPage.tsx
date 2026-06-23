import React, { useEffect } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { NowServing } from '../components/waiting-room/NowServing';
import { UpNext } from '../components/waiting-room/UpNext';
import { YourPosition } from '../components/waiting-room/YourPosition';
import { Ticker } from '../components/waiting-room/Ticker';
import { Loader2, RefreshCw } from 'lucide-react';

export const WaitingRoomPage: React.FC = () => {
  const { patients, settings, fetchInitialData, subscribe, error, isLoading } = useQueueStore();

  // Initial fetch and subscription
  useEffect(() => {
    fetchInitialData();
    const unsubscribe = subscribe();
    return () => {
      unsubscribe();
    };
  }, [fetchInitialData, subscribe]);

  // Find the currently consulting patient (if any)
  const currentConsulting = patients.find((p) => p.status === 'consulting') || null;

  // Filter and sort the waiting room patients by priority, then token number
  const waitingPatients = patients
    .filter((p) => p.status === 'waiting')
    .sort((a, b) => {
      const priorityWeights = { urgent: 3, elderly: 2, normal: 1 };
      const weightA = priorityWeights[a.priority] || 1;
      const weightB = priorityWeights[b.priority] || 1;

      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return a.token_number - b.token_number;
    });

  if (isLoading && !settings) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white select-none">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-base font-semibold tracking-wider">Configuring Waiting Room Screen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col justify-between bg-slate-950 text-white overflow-hidden select-none font-sans relative">
      {/* Offline Error Indicator */}
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-2.5 text-sm font-bold z-50 flex items-center justify-center space-x-2 animate-bounce">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>{error}</span>
        </div>
      )}

      {/* Section A: Now Serving (40vh) */}
      <NowServing currentPatient={currentConsulting} />

      {/* Section B: Up Next (25vh) */}
      <UpNext waitingPatients={waitingPatients} />

      {/* Section C: Your Position / Personalized Estimate (30vh) */}
      <YourPosition waitingPatients={waitingPatients} settings={settings} />

      {/* Footer: Marquee Ticker (5vh) */}
      <Ticker />
    </div>
  );
};
