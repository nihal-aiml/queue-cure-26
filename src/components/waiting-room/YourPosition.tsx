import React, { useState, useEffect } from 'react';
import type { Patient, ClinicSettings } from '../../lib/types';
import { useQueueStore } from '../../store/useQueueStore';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { AlertTriangle, Clock, Search, CheckCircle2 } from 'lucide-react';

interface YourPositionProps {
  waitingPatients: Patient[];
  settings: ClinicSettings | null;
}

export const YourPosition: React.FC<YourPositionProps> = ({ waitingPatients, settings }) => {
  const { patients, complexCaseActive } = useQueueStore();
  const [searchToken, setSearchToken] = useState('');
  const [searchResult, setSearchResult] = useState<{
    aheadCount: number;
    estWait: number;
    patientName: string;
    priority: string;
  } | null>(null);

  const avgConsult = settings?.avg_consult_minutes || 7;
  const isPaused = settings?.is_paused || false;
  const pauseReason = settings?.pause_reason || '';

  // Get current consulting patient for overrun calculation
  const consultingPatient = patients.find((p) => p.status === 'consulting');
  const [overrunMinutes, setOverrunMinutes] = useState(0);

  // Compute overrun in real time
  useEffect(() => {
    const checkOverrun = () => {
      if (consultingPatient && consultingPatient.called_at) {
        const elapsedMs = new Date().getTime() - new Date(consultingPatient.called_at).getTime();
        const elapsedMins = elapsedMs / 60000;
        const overrun = Math.max(0, elapsedMins - avgConsult);
        setOverrunMinutes(overrun);
      } else {
        setOverrunMinutes(0);
      }
    };

    checkOverrun();
    const interval = setInterval(checkOverrun, 5000); // check overrun every 5 seconds
    return () => clearInterval(interval);
  }, [consultingPatient, avgConsult]);

  // Calculate wait time for a given index of patients ahead
  const calculateWaitTime = (aheadCount: number) => {
    if (aheadCount === 0) return 0;
    // Base wait = aheadCount * avgConsult
    // Subtract overrun of current consulting patient
    // Add +5 mins if complex case override is active
    const rawWait = (aheadCount * avgConsult) - overrunMinutes + (complexCaseActive ? 5 : 0);
    return Math.max(0, Math.round(rawWait));
  };

  // Default queue summary (if no token search is active)
  const totalWaiting = waitingPatients.length;
  const totalEstWait = calculateWaitTime(totalWaiting);

  // Handle Token Search
  const handleSearch = (val: string) => {
    setSearchToken(val);
    if (!val.trim()) {
      setSearchResult(null);
      return;
    }

    const tokenNum = parseInt(val);
    if (isNaN(tokenNum)) {
      setSearchResult(null);
      return;
    }

    // Find patient in waiting queue
    const pIndex = waitingPatients.findIndex((p) => p.token_number === tokenNum);
    if (pIndex !== -1) {
      const patient = waitingPatients[pIndex];
      // Patients ahead = index in the sorted list
      const aheadCount = pIndex;
      const estWait = calculateWaitTime(aheadCount);
      setSearchResult({
        aheadCount,
        estWait,
        patientName: patient.name,
        priority: patient.priority,
      });
    } else {
      // Check if patient is already consulting or done
      const activePatient = patients.find((p) => p.token_number === tokenNum);
      if (activePatient) {
        if (activePatient.status === 'consulting') {
          setSearchResult({
            aheadCount: -1, // Special flag for now serving
            estWait: 0,
            patientName: activePatient.name,
            priority: activePatient.priority,
          });
        } else if (activePatient.status === 'done') {
          setSearchResult({
            aheadCount: -2, // Special flag for already seen
            estWait: 0,
            patientName: activePatient.name,
            priority: activePatient.priority,
          });
        }
      } else {
        setSearchResult(null); // Not found
      }
    }
  };

  return (
    <div className="h-[30vh] bg-slate-950 flex flex-col justify-between p-6 select-none relative text-white border-b border-slate-900">
      
      {/* Pause banner */}
      {isPaused && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-slate-950 text-center py-2 px-4 text-sm font-bold flex items-center justify-center space-x-2 animate-pulse-slow">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Queue temporarily paused by receptionist: "{pauseReason || 'Brief break'}"</span>
        </div>
      )}

      {/* Main Stats and Search Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center ${isPaused ? 'pt-8' : ''}`}>
        
        {/* Left: General Stats */}
        <div className="space-y-2">
          {searchResult === null ? (
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Overall Queue Depth
              </p>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-4xl font-extrabold text-white">{totalWaiting}</span>
                <span className="text-gray-400 text-lg">Patients waiting</span>
              </div>
              <p className="text-sm text-blue-400 font-semibold mt-1 flex items-center space-x-1.5">
                <Clock className="h-4 w-4" />
                <span>Next estimated consult wait: <strong>~{calculateWaitTime(1)} min</strong></span>
              </p>
            </div>
          ) : (
            // Personal Search Result
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                  Search Result
                </span>
                <Badge className="bg-slate-800 text-slate-300 hover:bg-slate-800 border-none font-semibold text-[10px]">
                  {searchResult.priority}
                </Badge>
              </div>
              <h3 className="font-extrabold text-white text-lg truncate">
                {searchResult.patientName}
              </h3>
              
              {searchResult.aheadCount === -1 ? (
                <p className="text-green-400 font-bold text-sm flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>You are being seen right now!</span>
                </p>
              ) : searchResult.aheadCount === -2 ? (
                <p className="text-blue-400 font-bold text-sm flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Your consultation has completed.</span>
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-slate-300">
                    Patients ahead of you: <strong className="text-white text-base">{searchResult.aheadCount}</strong>
                  </p>
                  <p className="text-sm text-blue-400 font-bold flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Estimated wait: ~{searchResult.estWait} min</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Interactive Search Input & Total Estimate */}
        <div className="flex flex-col justify-center space-y-3">
          {searchResult === null && (
            <div className="text-right hidden md:block">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Total Queue Time
              </p>
              <p className="text-4xl font-extrabold text-blue-400 mt-1">
                ~{totalEstWait} <span className="text-lg font-semibold text-gray-400">min</span>
              </p>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Enter your Token Slip # to track position..."
              value={searchToken}
              onChange={(e) => handleSearch(e.target.value.replace(/\D/g, ''))}
              className="bg-slate-900 text-white border-slate-800 focus:border-blue-500 pl-10 h-11 text-sm font-semibold rounded-lg w-full"
            />
            {searchToken && (
              <button
                onClick={() => {
                  setSearchToken('');
                  setSearchResult(null);
                }}
                className="absolute right-3.5 top-3 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
