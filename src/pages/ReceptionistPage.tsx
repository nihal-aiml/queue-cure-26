import React, { useEffect, useState } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { SidebarStats } from '../components/receptionist/SidebarStats';
import { AddPatientForm } from '../components/receptionist/AddPatientForm';
import { QueueList } from '../components/receptionist/QueueList';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Minus, Monitor, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ReceptionistPage: React.FC = () => {
  const { settings, updateSettings, fetchInitialData, subscribe, error, isLoading } = useQueueStore();
  
  const [clinicName, setClinicName] = useState('');
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [pauseReason, setPauseReason] = useState('Lunch break');
  const [customReason, setCustomReason] = useState('');

  // Initial fetch and subscription
  useEffect(() => {
    fetchInitialData();
    const unsubscribe = subscribe();
    return () => {
      unsubscribe();
    };
  }, [fetchInitialData, subscribe]);

  // Keep clinicName state updated with settings data
  useEffect(() => {
    if (settings) {
      setClinicName(settings.clinic_name);
    }
  }, [settings]);

  // Handle clinic name save on blur
  const handleClinicNameBlur = async () => {
    if (!clinicName.trim()) {
      setClinicName(settings?.clinic_name || 'City Clinic');
      return;
    }
    if (clinicName !== settings?.clinic_name) {
      await updateSettings({ clinic_name: clinicName });
      toast.success('Clinic name updated');
    }
  };

  // Stepper handlers
  const handleStepMinutes = async (amount: number) => {
    if (!settings) return;
    const nextVal = Math.max(1, settings.avg_consult_minutes + amount);
    await updateSettings({ avg_consult_minutes: nextVal });
  };

  const handleMinutesInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      await updateSettings({ avg_consult_minutes: value });
    }
  };

  // Pause toggle handler
  const handlePauseToggle = (checked: boolean) => {
    if (checked) {
      setShowPauseDialog(true);
    } else {
      updateSettings({ is_paused: false, pause_reason: null });
      toast.success('Queue is now active');
    }
  };

  const handleConfirmPause = async () => {
    const finalReason = pauseReason === 'Other' ? customReason.trim() || 'Other' : pauseReason;
    await updateSettings({ is_paused: true, pause_reason: finalReason });
    setShowPauseDialog(false);
    toast.success('Queue paused');
  };

  const handleCancelPause = () => {
    setShowPauseDialog(false);
  };

  if (isLoading && !settings) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-sm font-semibold tracking-wider">Loading Receptionist Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop view (optimized for >=1024px) */}
      <div className="hidden lg:flex min-h-screen bg-gray-50">
        {/* Connection Error Banner */}
        {error && (
          <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-semibold z-50 flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{error}</span>
          </div>
        )}

        {/* Sidebar */}
        <div className="w-[260px] bg-gray-900 text-gray-200 flex flex-col justify-between p-6 shrink-0 shadow-lg select-none">
          <div className="space-y-6">
            {/* Clinic Name Header */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-1">
                Clinic Name
              </label>
              <Input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                onBlur={handleClinicNameBlur}
                className="bg-gray-800 text-white border-gray-700 focus:border-blue-500 text-base font-bold h-10 w-full"
              />
            </div>

            {/* Stepper for Average Consult Minutes */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                Avg Consult Time
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleStepMinutes(-1)}
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white h-9 w-9 shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="relative flex-grow">
                  <Input
                    type="number"
                    value={settings?.avg_consult_minutes || 7}
                    onChange={handleMinutesInputChange}
                    className="bg-gray-800 border-gray-700 text-center text-white h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-8 font-bold"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-gray-400">min</span>
                </div>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleStepMinutes(1)}
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white h-9 w-9 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pause Queue Toggle */}
            <div className="flex items-center justify-between bg-gray-800/40 border border-gray-850 p-3 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Queue Management</span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {settings?.is_paused ? 'Paused' : 'Active'}
                </span>
              </div>
              <Switch
                checked={settings?.is_paused || false}
                onCheckedChange={handlePauseToggle}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </div>

          {/* Stats Section at Bottom */}
          <div className="border-t border-gray-800 pt-6 mt-6">
            <SidebarStats />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                Receptionist Control Desk
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor clinic check-ins, register patients, and transition tokens.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700">
              <Monitor className="h-4 w-4" />
              <span>Current Token: #{settings?.current_token || 0}</span>
            </div>
          </div>

          {/* Top Section: Add Patient Form */}
          <AddPatientForm />

          {/* Bottom Section: Live Queue List */}
          <QueueList />
        </div>
      </div>

      {/* Mobile view warning (min-width 1024px required) */}
      <div className="lg:hidden flex flex-col justify-center items-center h-screen bg-gray-900 text-gray-300 p-6 text-center select-none">
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 max-w-sm shadow-xl space-y-4">
          <div className="h-12 w-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto">
            <Monitor className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Desktop Version Required</h2>
          <p className="text-sm text-gray-400">
            The Receptionist Control Desk is designed for clinic reception displays and is optimized for desktop viewports (min-width 1024px).
          </p>
          <p className="text-xs text-gray-500 pt-2 border-t border-gray-750">
            Please resize your window or open this path on a tablet or desktop browser.
          </p>
        </div>
      </div>

      {/* Pause Reason Selection Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={(open) => { if (!open) handleCancelPause(); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-gray-800 font-bold text-lg">Pause Active Queue</DialogTitle>
            <DialogDescription className="text-gray-500 text-xs mt-1">
              Select a reason for pausing the clinic queue. This reason will be displayed immediately to patients in the waiting room.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="pause-reason" className="text-xs font-semibold text-gray-600 uppercase">Reason</label>
              <Select value={pauseReason} onValueChange={setPauseReason}>
                <SelectTrigger id="pause-reason">
                  <SelectValue placeholder="Select pause reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lunch break">Lunch break</SelectItem>
                  <SelectItem value="Doctor unavailable">Doctor unavailable</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Other">Other (Type custom reason)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pauseReason === 'Other' && (
              <div className="flex flex-col space-y-2">
                <label htmlFor="custom-reason" className="text-xs font-semibold text-gray-600 uppercase">Custom Reason</label>
                <Input
                  id="custom-reason"
                  type="text"
                  placeholder="e.g. Weekly clinic meeting"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="h-10"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelPause}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPause} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
              Pause Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
