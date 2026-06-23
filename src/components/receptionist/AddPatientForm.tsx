import React, { useState } from 'react';
import { useQueueStore } from '../../store/useQueueStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'react-hot-toast';
import { printTokenSlip } from './TokenReceipt';
import { Printer, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AddPatientForm: React.FC = () => {
  const { patients, registerPatient, settings } = useQueueStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('General');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'elderly'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track last registered patient for printing receipt
  const [lastRegistered, setLastRegistered] = useState<{
    tokenNumber: number;
    name: string;
    chiefComplaint: string;
    estWait: number;
  } | null>(null);

  // Auto-calculated next token number (highest token today + 1)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartTime = todayStart.getTime();

  const todayTokens = patients
    .filter((p) => new Date(p.created_at || p.checked_in_at).getTime() >= todayStartTime)
    .map((p) => p.token_number);

  const nextToken = todayTokens.length > 0 ? Math.max(...todayTokens) + 1 : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Patient name is required');
      return;
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setIsSubmitting(true);
    setLastRegistered(null);

    // Calculate wait time at time of registration
    const avgConsult = settings?.avg_consult_minutes || 7;
    // Count waiting patients ahead of this new patient
    const priorityWeights = { urgent: 3, elderly: 2, normal: 1 };
    const newWeight = priorityWeights[priority];
    
    const patientsAhead = patients.filter((p) => {
      if (p.status !== 'waiting') return false;
      const pWeight = priorityWeights[p.priority] || 1;
      if (pWeight !== newWeight) {
        return pWeight > newWeight; // higher priority is ahead
      }
      return p.token_number < nextToken; // lower token is ahead
    }).length;

    const estWait = patientsAhead * avgConsult;

    const registeredToken = await registerPatient(name, phone, chiefComplaint, priority);

    setIsSubmitting(false);

    if (registeredToken !== null) {
      toast.success(`Token #${registeredToken} issued successfully!`);
      
      const newReg = {
        tokenNumber: registeredToken,
        name,
        chiefComplaint,
        estWait,
      };
      setLastRegistered(newReg);

      // Auto-print option or keep button visible
      setName('');
      setPhone('');
      setChiefComplaint('General');
      setPriority('normal');
    } else {
      toast.error('Failed to register patient. Please check database connection.');
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2 text-gray-800">
          <UserPlus className="h-5 w-5 text-blue-600" />
          <span>Register New Patient</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Next Token (Read-Only Badge) */}
            <div className="flex flex-col justify-end space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Next Token Number
              </label>
              <div className="h-10 flex items-center px-3 bg-blue-50 border border-blue-200 rounded-md">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={nextToken}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    className="font-mono text-lg font-bold text-blue-600"
                  >
                    #{nextToken}
                  </motion.div>
                </AnimatePresence>
                <Badge className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">
                  Auto-Gen
                </Badge>
              </div>
            </div>

            {/* Patient Name */}
            <div className="flex flex-col justify-end space-y-2">
              <label htmlFor="patient-name" className="text-xs font-semibold text-gray-500 uppercase">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="patient-name"
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col justify-end space-y-2">
              <label htmlFor="patient-phone" className="text-xs font-semibold text-gray-500 uppercase">
                Phone Number (10 Digits)
              </label>
              <Input
                id="patient-phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="h-10"
                disabled={isSubmitting}
              />
            </div>

            {/* Chief Complaint */}
            <div className="flex flex-col justify-end space-y-2">
              <label htmlFor="patient-complaint" className="text-xs font-semibold text-gray-500 uppercase">
                Chief Complaint
              </label>
              <Select
                value={chiefComplaint}
                onValueChange={setChiefComplaint}
                disabled={isSubmitting}
              >
                <SelectTrigger id="patient-complaint" className="h-10">
                  <SelectValue placeholder="Select complaint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Fever">Fever</SelectItem>
                  <SelectItem value="Injury">Injury</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Prescription">Prescription</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Priority Selection */}
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Priority Level:
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    priority === 'normal'
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('elderly')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    priority === 'elderly'
                      ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  Elderly
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    priority === 'urgent'
                      ? 'bg-red-100 text-red-800 border-2 border-red-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  Urgent
                </button>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center space-x-2">
              {lastRegistered && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    printTokenSlip(
                      settings?.clinic_name || 'City Clinic',
                      lastRegistered.tokenNumber,
                      lastRegistered.name,
                      lastRegistered.chiefComplaint,
                      lastRegistered.estWait
                    )
                  }
                  className="h-10 text-gray-700 hover:bg-gray-50 border-gray-300"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Token #{lastRegistered.tokenNumber}
                </Button>
              )}
              
              <Button type="submit" disabled={isSubmitting} className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                {isSubmitting ? 'Registering...' : 'Register Patient'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
