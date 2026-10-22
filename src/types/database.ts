export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        { id: string; full_name: string; phone: string | null; created_at: string; updated_at: string },
        { id: string; full_name?: string; phone?: string | null; created_at?: string; updated_at?: string },
        { full_name?: string; phone?: string | null; updated_at?: string }
      >
      doctors: Table<
        { id: string; full_name: string; specialty: string; crm: string; avatar_url: string | null; rating: number; reviews_count: number; experience_years: number; price_per_session: number; bio: string; available_online: boolean; available_in_person: boolean; available_slots: Json; created_at: string },
        { id: string; full_name: string; specialty: string; crm: string; avatar_url?: string | null; rating?: number; reviews_count?: number; experience_years?: number; price_per_session?: number; bio?: string; available_online?: boolean; available_in_person?: boolean; available_slots?: Json; created_at?: string }
      >
      appointments: Table<
        { id: string; user_id: string; doctor_id: string; scheduled_at: string; duration_minutes: number; status: string; type: string; notes: string | null; created_at: string; updated_at: string },
        { id?: string; user_id: string; doctor_id: string; scheduled_at: string; duration_minutes?: number; status?: string; type: string; notes?: string | null; created_at?: string; updated_at?: string },
        { scheduled_at?: string; duration_minutes?: number; status?: string; type?: string; notes?: string | null; updated_at?: string }
      >
      exams: Table<
        { id: string; user_id: string; name: string; category: string; lab_name: string; performed_at: string; result_value: string | null; unit: string; reference_range: string; range_status: string; status: string; report_path: string | null; created_at: string },
        { id?: string; user_id: string; name: string; category?: string; lab_name?: string; performed_at: string; result_value?: string | null; unit?: string; reference_range?: string; range_status?: string; status?: string; report_path?: string | null; created_at?: string },
        { report_path?: string | null }
      >
      notifications: Table<
        { id: string; user_id: string; title: string; message: string; type: string; read: boolean; action_url: string | null; created_at: string },
        { id?: string; user_id: string; title: string; message: string; type?: string; read?: boolean; action_url?: string | null; created_at?: string },
        { read?: boolean }
      >
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
