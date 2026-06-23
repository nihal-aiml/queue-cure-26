export interface Patient {
  id: string;
  token_number: number;
  name: string;
  phone?: string | null;
  chief_complaint: string;
  priority: 'normal' | 'urgent' | 'elderly';
  status: 'waiting' | 'consulting' | 'done';
  checked_in_at: string;
  called_at?: string | null;
  done_at?: string | null;
  created_at: string;
}

export interface ClinicSettings {
  id: number;
  avg_consult_minutes: number;
  clinic_name: string;
  current_token: number;
  is_paused: boolean;
  pause_reason?: string | null;
}

export interface QueueEvent {
  id: string;
  event_type: string;
  token_number?: number | null;
  patient_id?: string | null;
  payload?: {
    note?: string;
    [key: string]: any;
  } | null;
  created_at: string;
}
