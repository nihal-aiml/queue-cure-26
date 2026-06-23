import React, { useEffect, useState, useRef } from 'react';
import type { Patient } from '../../lib/types';
import { useQueueStore } from '../../store/useQueueStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, MoreVertical, Check, AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QueueCardProps {
  patient: Patient;
}

export const QueueCard: React.FC<QueueCardProps> = ({ patient }) => {
  const { markAsDone, markAsUrgent, removeFromQueue, settings } = useQueueStore();
  const [timeAgo, setTimeAgo] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toastShownRef = useRef(false);

  // Live timer update
  useEffect(() => {
    const calculateTime = () => {
      const start = patient.status === 'consulting' && patient.called_at 
        ? new Date(patient.called_at).getTime()
        : new Date(patient.checked_in_at).getTime();
      
      const diffMs = new Date().getTime() - start;
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);

      if (diffMins === 0) {
        setTimeAgo(`${diffSecs}s ago`);
      } else {
        setTimeAgo(`${diffMins}m ${diffSecs % 60}s ago`);
      }

      // USP 3: No-show flow
      // If a patient is called (consulting) for more than 3 * avg_consult_minutes
      if (
        patient.status === 'consulting' &&
        patient.called_at &&
        settings?.avg_consult_minutes
      ) {
        const elapsedMins = diffMs / 60000;
        const noShowThreshold = 3 * settings.avg_consult_minutes;

        if (elapsedMins > noShowThreshold && !toastShownRef.current) {
          toastShownRef.current = true;
          
          toast(
            (t) => (
              <div className="flex flex-col space-y-2 py-1">
                <div className="flex items-center space-x-2 text-amber-600 font-semibold text-sm">
                  <ShieldAlert className="h-4 w-4" />
                  <span>No-Show Alert</span>
                </div>
                <p className="text-xs text-gray-600">
                  Token #{patient.token_number} ({patient.name}) has been in consultation for {Math.floor(elapsedMins)} min (Limit: {noShowThreshold} min).
                </p>
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                    }}
                    className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Keep waiting
                  </button>
                  <button
                    onClick={async () => {
                      toast.dismiss(t.id);
                      await markAsDone(patient.id, 'No-show skip');
                      toast.success(`Token #${patient.token_number} skipped as no-show.`);
                    }}
                    className="px-2 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded"
                  >
                    Skip patient
                  </button>
                </div>
              </div>
            ),
            {
              id: `noshow-${patient.id}`,
              duration: Infinity, // Toast stays until action is taken
              position: 'top-right',
            }
          );
        }
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => {
      clearInterval(interval);
      // Dismiss any open no-show toast when unmounted (e.g. status changes from consulting)
      if (toastShownRef.current) {
        toast.dismiss(`noshow-${patient.id}`);
      }
    };
  }, [patient.checked_in_at, patient.status, patient.called_at, settings?.avg_consult_minutes, patient.id, patient.name, patient.token_number, markAsDone]);

  // Click outside menu handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Color by priority
  const getTokenColorClass = (priority: 'normal' | 'urgent' | 'elderly') => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'elderly':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadge = (priority: 'normal' | 'urgent' | 'elderly') => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold uppercase">Urgent</Badge>;
      case 'elderly':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold uppercase">Elderly</Badge>;
      default:
        return <Badge className="bg-blue-400 hover:bg-blue-500 text-white font-semibold uppercase">Normal</Badge>;
    }
  };

  return (
    <div className="relative flex items-center justify-between p-4 bg-white border border-gray-150 rounded-lg shadow-sm hover:border-gray-300 transition">
      <div className="flex items-center space-x-4">
        {/* Token number block */}
        <div
          className={`flex items-center justify-center h-14 w-14 rounded-lg border-2 font-mono text-2xl font-bold ${getTokenColorClass(
            patient.priority
          )}`}
        >
          {patient.token_number}
        </div>

        {/* Patient Info */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-800 text-base">{patient.name}</span>
            {getPriorityBadge(patient.priority)}
            <Badge variant="outline" className="text-gray-500 border-gray-300">
              {patient.chief_complaint}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>
              {patient.status === 'consulting' ? 'Consulting for: ' : 'Waiting: '}
              <strong className="text-gray-700">{timeAgo}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Consulting Pulsing Pill */}
        {patient.status === 'consulting' && (
          <div className="flex items-center space-x-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">In consultation</span>
          </div>
        )}

        {/* Action / Context Menu */}
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-30">
              {/* Mark as Done */}
              {patient.status !== 'done' && (
                <button
                  onClick={async () => {
                    setShowMenu(false);
                    await markAsDone(patient.id);
                    toast.success(`Token #${patient.token_number} marked done.`);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Mark as done
                </button>
              )}

              {/* Mark as Urgent */}
              {patient.priority !== 'urgent' && (
                <button
                  onClick={async () => {
                    setShowMenu(false);
                    await markAsUrgent(patient.id);
                    toast.success(`Token #${patient.token_number} updated to Urgent.`);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                  Mark as urgent
                </button>
              )}

              {/* Remove from queue */}
              <button
                onClick={async () => {
                  setShowMenu(false);
                  if (confirm(`Remove ${patient.name} from queue?`)) {
                    await removeFromQueue(patient.id);
                    toast.success(`Token #${patient.token_number} removed.`);
                  }
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left font-medium"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove from queue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
