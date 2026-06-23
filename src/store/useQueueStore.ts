import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Patient, ClinicSettings, QueueEvent } from '../lib/types';

interface QueueState {
  patients: Patient[];
  settings: ClinicSettings | null;
  events: QueueEvent[];
  isLoading: boolean;
  error: string | null;
  complexCaseActive: boolean;

  fetchInitialData: () => Promise<void>;
  subscribe: () => () => void;
  registerPatient: (
    name: string,
    phone: string,
    chiefComplaint: string,
    priority: 'normal' | 'urgent' | 'elderly'
  ) => Promise<number | null>;
  callNext: () => Promise<void>;
  markAsDone: (id: string, note?: string) => Promise<void>;
  markAsUrgent: (id: string) => Promise<void>;
  removeFromQueue: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<ClinicSettings>) => Promise<void>;
  setComplexCaseActive: (active: boolean) => void;
}

export const useQueueStore = create<QueueState>((set, get) => {
  let callNextDebounceTimeout: any = null;

  return {
    patients: [],
    settings: null,
    events: [],
    isLoading: false,
    error: null,
    complexCaseActive: false,

    fetchInitialData: async () => {
      set({ isLoading: true, error: null });
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStartIso = todayStart.toISOString();

        // 1. Fetch patients checked in today, or not done yet (covers carry-over)
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .or(`checked_in_at.gte.${todayStartIso},status.neq.done`);

        if (patientsError) throw patientsError;

        // 2. Fetch settings
        let { data: settingsData, error: settingsError } = await supabase
          .from('clinic_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (settingsError) throw settingsError;

        // If for some reason settings doesn't exist, create default
        if (!settingsData) {
          const { data: newSettings, error: insertError } = await supabase
            .from('clinic_settings')
            .insert([{ id: 1, clinic_name: 'City Clinic', avg_consult_minutes: 7, current_token: 0, is_paused: false }])
            .select()
            .single();

          if (insertError) throw insertError;
          settingsData = newSettings;
        }

        // 3. Fetch recent events (last 10)
        const { data: eventsData, error: eventsError } = await supabase
          .from('queue_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (eventsError) throw eventsError;

        set({
          patients: patientsData || [],
          settings: settingsData,
          events: eventsData || [],
          isLoading: false,
        });
      } catch (err: any) {
        console.error('Error fetching initial queue data:', err);
        set({ error: err.message || 'Failed to fetch queue data', isLoading: false });
      }
    },

    subscribe: () => {
      const channel = supabase.channel('queue-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'patients' },
          (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            set((state) => {
              let updatedPatients = [...state.patients];
              if (eventType === 'INSERT') {
                const inserted = newRecord as Patient;
                if (!updatedPatients.some((p) => p.id === inserted.id)) {
                  updatedPatients.push(inserted);
                }
              } else if (eventType === 'UPDATE') {
                const updated = newRecord as Patient;
                updatedPatients = updatedPatients.map((p) =>
                  p.id === updated.id ? updated : p
                );
              } else if (eventType === 'DELETE') {
                const deletedId = oldRecord.id;
                updatedPatients = updatedPatients.filter((p) => p.id !== deletedId);
              }
              return { patients: updatedPatients };
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'clinic_settings' },
          (payload) => {
            const { new: newRecord } = payload;
            set({ settings: newRecord as ClinicSettings });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'queue_events' },
          (payload) => {
            const { eventType, new: newRecord } = payload;
            if (eventType === 'INSERT') {
              const insertedEvent = newRecord as QueueEvent;
              set((state) => {
                const updatedEvents = [insertedEvent, ...state.events].slice(0, 10);
                return { events: updatedEvents };
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            set({ error: null });
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            set({ error: 'Offline — reconnecting...' });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    },

    registerPatient: async (name, phone, chiefComplaint, priority) => {
      try {
        set({ error: null });

        // Calculate auto-generated token number
        // Max token number today in DB + 1
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { data: maxPatient, error: maxError } = await supabase
          .from('patients')
          .select('token_number')
          .gte('created_at', todayStart.toISOString())
          .order('token_number', { ascending: false })
          .limit(1);

        if (maxError) throw maxError;

        const nextToken = maxPatient && maxPatient.length > 0
          ? maxPatient[0].token_number + 1
          : 1;

        // Insert new patient
        const { data: newPatient, error: insertError } = await supabase
          .from('patients')
          .insert([
            {
              token_number: nextToken,
              name,
              phone: phone || null,
              chief_complaint: chiefComplaint || 'General',
              priority,
              status: 'waiting',
              checked_in_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // Insert audit log event
        await supabase.from('queue_events').insert([
          {
            event_type: 'registered',
            token_number: nextToken,
            patient_id: newPatient.id,
            payload: { name },
          },
        ]);

        return nextToken;
      } catch (err: any) {
        console.error('Error registering patient:', err);
        set({ error: err.message || 'Failed to register patient' });
        return null;
      }
    },

    callNext: async () => {
      // Debounce logic (300ms) to prevent double clicks
      if (callNextDebounceTimeout) {
        return;
      }
      callNextDebounceTimeout = setTimeout(() => {
        callNextDebounceTimeout = null;
      }, 300);

      const state = get();
      if (state.settings?.is_paused) return;

      // Find waiting patients
      const waitingPatients = state.patients
        .filter((p) => p.status === 'waiting')
        .sort((a, b) => {
          const priorityWeights = { urgent: 3, elderly: 2, normal: 1 };
          const weightA = priorityWeights[a.priority] || 1;
          const weightB = priorityWeights[b.priority] || 1;
          
          if (weightA !== weightB) {
            return weightB - weightA; // Higher priority weights first
          }
          return a.token_number - b.token_number; // Ascending token number
        });

      if (waitingPatients.length === 0) return;

      const nextPatient = waitingPatients[0];
      const nowStr = new Date().toISOString();

      try {
        set({ error: null });

        // 1. Set the previous consulting patient's status to 'done'
        const previousConsulting = state.patients.filter((p) => p.status === 'consulting');
        for (const prev of previousConsulting) {
          const { error: prevError } = await supabase
            .from('patients')
            .update({ status: 'done', done_at: nowStr })
            .eq('id', prev.id);

          if (prevError) throw prevError;

          // Insert 'done' queue event
          await supabase.from('queue_events').insert([
            {
              event_type: 'done',
              token_number: prev.token_number,
              patient_id: prev.id,
              payload: { name: prev.name },
            },
          ]);
        }

        // 2. Set next patient to 'consulting'
        const { error: nextError } = await supabase
          .from('patients')
          .update({ status: 'consulting', called_at: nowStr })
          .eq('id', nextPatient.id);

        if (nextError) throw nextError;

        // 3. Update current token in settings
        const { error: settingsError } = await supabase
          .from('clinic_settings')
          .update({ current_token: nextPatient.token_number })
          .eq('id', 1);

        if (settingsError) throw settingsError;

        // 4. Insert queue event 'called'
        await supabase.from('queue_events').insert([
          {
            event_type: 'called',
            token_number: nextPatient.token_number,
            patient_id: nextPatient.id,
            payload: { name: nextPatient.name },
          },
        ]);

        // If complex case was active, deactivate it after calling next
        if (state.complexCaseActive) {
          set({ complexCaseActive: false });
        }
      } catch (err: any) {
        console.error('Error calling next patient:', err);
        set({ error: err.message || 'Failed to call next patient' });
      }
    },

    markAsDone: async (id, note) => {
      try {
        set({ error: null });
        const nowStr = new Date().toISOString();

        // Get patient data before updating
        const patient = get().patients.find((p) => p.id === id);
        if (!patient) return;

        const { error: updateError } = await supabase
          .from('patients')
          .update({ status: 'done', done_at: nowStr })
          .eq('id', id);

        if (updateError) throw updateError;

        // Insert event
        await supabase.from('queue_events').insert([
          {
            event_type: 'done',
            token_number: patient.token_number,
            patient_id: patient.id,
            payload: note ? { note, name: patient.name } : { name: patient.name },
          },
        ]);

        // If this patient was the consulting patient, we reset current_token in settings if needed,
        // or let it remain as the last called token (normally clinic current_token is the last called).
      } catch (err: any) {
        console.error('Error marking patient as done:', err);
        set({ error: err.message || 'Failed to mark patient as done' });
      }
    },

    markAsUrgent: async (id) => {
      try {
        set({ error: null });
        const patient = get().patients.find((p) => p.id === id);
        if (!patient) return;

        const { error: updateError } = await supabase
          .from('patients')
          .update({ priority: 'urgent' })
          .eq('id', id);

        if (updateError) throw updateError;

        await supabase.from('queue_events').insert([
          {
            event_type: 'marked_urgent',
            token_number: patient.token_number,
            patient_id: patient.id,
            payload: { name: patient.name },
          },
        ]);
      } catch (err: any) {
        console.error('Error marking patient as urgent:', err);
        set({ error: err.message || 'Failed to mark patient as urgent' });
      }
    },

    removeFromQueue: async (id) => {
      try {
        set({ error: null });
        const patient = get().patients.find((p) => p.id === id);
        if (!patient) return;

        const { error: deleteError } = await supabase
          .from('patients')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        await supabase.from('queue_events').insert([
          {
            event_type: 'removed',
            token_number: patient.token_number,
            patient_id: null,
            payload: { name: patient.name },
          },
        ]);
      } catch (err: any) {
        console.error('Error removing patient from queue:', err);
        set({ error: err.message || 'Failed to remove patient' });
      }
    },

    updateSettings: async (updates) => {
      try {
        set({ error: null });

        // Capture pause action details for event log
        const oldSettings = get().settings;
        const isPausingChange = updates.is_paused !== undefined && updates.is_paused !== oldSettings?.is_paused;

        const { error: updateError } = await supabase
          .from('clinic_settings')
          .update(updates)
          .eq('id', 1);

        if (updateError) throw updateError;

        // Log settings changes
        if (isPausingChange) {
          await supabase.from('queue_events').insert([
            {
              event_type: updates.is_paused ? 'queue_paused' : 'queue_active',
              payload: { reason: updates.pause_reason || null },
            },
          ]);
        }
      } catch (err: any) {
        console.error('Error updating clinic settings:', err);
        set({ error: err.message || 'Failed to update clinic settings' });
      }
    },

    setComplexCaseActive: (active) => {
      set({ complexCaseActive: active });
    },
  };
});
