import React, { useEffect } from 'react';
import { useQueueStore } from '../store/useQueueStore';
import { QueueHealthGauge } from '../components/doctor/QueueHealthGauge';
import { AlertFeed } from '../components/doctor/AlertFeed';
import { WaitTrendChart } from '../components/doctor/WaitTrendChart';
import { HourlyFlowChart } from '../components/doctor/HourlyFlowChart';
import { TodaySummary } from '../components/doctor/TodaySummary';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Sparkles, Monitor, Activity, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const DoctorPage: React.FC = () => {
  const {
    settings,
    complexCaseActive,
    setComplexCaseActive,
    fetchInitialData,
    subscribe,
    error,
    isLoading,
    patients,
  } = useQueueStore();

  // Initial fetch and subscription
  useEffect(() => {
    fetchInitialData();
    const unsubscribe = subscribe();
    return () => {
      unsubscribe();
    };
  }, [fetchInitialData, subscribe]);

  const handleToggleComplexCase = () => {
    const nextState = !complexCaseActive;
    setComplexCaseActive(nextState);
    if (nextState) {
      toast.success('Current case marked as Complex. +5m override applied.');
    } else {
      toast.error('Complex case override deactivated.');
    }
  };

  const consultingPatient = patients.find((p) => p.status === 'consulting') || null;

  if (isLoading && !settings) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white select-none">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-sm font-semibold tracking-wider">Loading Dr. Pulse Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop view only (min-width 1024px) */}
      <div className="hidden lg:flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
        {/* Error Connection Banner */}
        {error && (
          <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-semibold z-50 flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Navbar */}
        <header className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between border-b border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                {settings?.clinic_name || 'City Clinic'}
              </h1>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block -mt-0.5">
                Dr. Pulse Dashboard
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-xs font-semibold text-slate-300">
            <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse" />
            <span>Realtime Server Sync Active</span>
          </div>
        </header>

        {/* Main Content Dashboard Grid */}
        <main className="flex-grow p-8 max-w-[1440px] mx-auto w-full grid grid-cols-2 gap-8 overflow-y-auto">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Card 1: Queue Health */}
            <QueueHealthGauge />

            {/* Card 2: Alert Feed */}
            <AlertFeed />

            {/* Card 3: Average Wait Trend */}
            <WaitTrendChart />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Card 4: Hourly Flow Chart */}
            <HourlyFlowChart />

            {/* Card 5: Complex Case Flag */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span>Complex Case Flag</span>
                </CardTitle>
                {complexCaseActive && (
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">
                    Override Active
                  </span>
                )}
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  If the current patient's diagnosis is complex and requires extra attention, flag the case. This adds a <strong>+5 minutes override</strong> to the estimated wait calculation for the next patient.
                </p>

                {/* Patient Under Consultation */}
                <div className="bg-slate-50 border border-gray-150 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">
                      Currently Consulting
                    </span>
                    <span className="font-bold text-gray-800 text-sm mt-0.5 block">
                      {consultingPatient ? consultingPatient.name : 'No patient in session'}
                    </span>
                  </div>
                  {consultingPatient && (
                    <span className="font-mono text-sm bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                      Token #{consultingPatient.token_number}
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleToggleComplexCase}
                  disabled={!consultingPatient}
                  className={`w-full py-3 h-11 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm border transition flex items-center justify-center space-x-2 ${
                    complexCaseActive
                      ? 'bg-purple-600 hover:bg-purple-700 text-white border-none'
                      : 'bg-white hover:bg-purple-50 text-purple-600 border-purple-300 hover:border-purple-400'
                  } ${!consultingPatient ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {complexCaseActive ? 'Complex Case Flagged (+5m Active)' : 'Flag Current Case as Complex'}
                  </span>
                </Button>
              </CardContent>
            </Card>

            {/* Card 6: Today's Summary Stat Cards */}
            <TodaySummary />
          </div>
        </main>
      </div>

      {/* Mobile view warning (min-width 1024px required) */}
      <div className="lg:hidden flex flex-col justify-center items-center h-screen bg-slate-900 text-slate-300 p-6 text-center select-none">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-sm shadow-xl space-y-4">
          <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mx-auto">
            <Monitor className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Desktop Version Required</h2>
          <p className="text-sm text-slate-400">
            The Dr. Pulse Dashboard is designed for clinic analytics and is optimized for desktop viewports (min-width 1024px).
          </p>
          <p className="text-xs text-slate-500 pt-2 border-t border-slate-700">
            Please resize your window or open this path on a tablet or desktop browser.
          </p>
        </div>
      </div>
    </>
  );
};
