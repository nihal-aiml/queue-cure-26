import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ReceptionistPage } from './pages/ReceptionistPage';
import { WaitingRoomPage } from './pages/WaitingRoomPage';
import { DoctorPage } from './pages/DoctorPage';
import { Toaster } from 'react-hot-toast';
import { ArrowRight, MonitorPlay, UserCheck, ShieldPlus, Activity } from 'lucide-react';

// Landing Page / Role Hub at the root `/` route
const DashboardHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white flex flex-col justify-center items-center p-6 select-none font-sans relative">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 items-center justify-center text-blue-400 mb-2 shadow-lg animate-pulse-slow">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Queue Cure <span className="text-blue-400">'26</span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-lg mx-auto font-medium">
            Smart clinic queue management system. Realtime synchronization, priority-aware sorting, and doctor analytics.
          </p>
        </div>

        {/* Roles Grid Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Receptionist Page */}
          <Link
            to="/receptionist"
            className="group bg-slate-900/60 border border-slate-800 hover:border-blue-500 hover:bg-slate-900 rounded-2xl p-6 text-left flex flex-col justify-between h-56 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <UserCheck className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Receptionist Control
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Register incoming patients, assign tokens, manage clinic parameters, and call next in line.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 mt-4 group-hover:translate-x-1.5 transition-transform duration-300">
              <span>Access Control Desk</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Patient Waiting Room */}
          <Link
            to="/waiting-room"
            className="group bg-slate-900/60 border border-slate-800 hover:border-emerald-500 hover:bg-slate-900 rounded-2xl p-6 text-left flex flex-col justify-between h-56 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <MonitorPlay className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Waiting Room TV
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Full-screen TV dashboard showing "Now Serving" token numbers, "Up Next" pills, and wait estimates.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mt-4 group-hover:translate-x-1.5 transition-transform duration-300">
              <span>Launch TV Display</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Doctor Pulse Dashboard */}
          <Link
            to="/doctor"
            className="group bg-slate-900/60 border border-slate-800 hover:border-purple-500 hover:bg-slate-900 rounded-2xl p-6 text-left flex flex-col justify-between h-56 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                <ShieldPlus className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                Dr. Pulse Analytics
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Monitor queue load gauge, view check-in trends and hourly flow charts, and flag complex cases.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 mt-4 group-hover:translate-x-1.5 transition-transform duration-300">
              <span>Launch Dr. Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-gray-500 uppercase tracking-widest pt-6 border-t border-slate-900">
          Queue Cure '26 Hackathon Edition · Powered by React, Supabase & Framer Motion
        </p>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.03); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Global Toaster for notifications */}
      <Toaster position="top-right" reverseOrder={false} />
      
      <Routes>
        <Route path="/" element={<DashboardHub />} />
        <Route path="/receptionist" element={<ReceptionistPage />} />
        <Route path="/waiting-room" element={<WaitingRoomPage />} />
        <Route path="/doctor" element={<DoctorPage />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
