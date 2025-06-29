export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          phone: string
          birth_date: string
          birth_time: string
          birth_place: string
          natal_chart: Json
          natal_chart_interpretation: string | null
          natal_summary: string | null
          trial_ends_at: string
          subscription_status: 'trial' | 'active' | 'expired'
          last_guidance_sent: string | null
          daily_guidance_sms_enabled: boolean
          guidance_sms_time: string
          created_at: string
          updated_at: string
        }
        Insert: Partial<Profile>
        Update: Partial<Profile>
      }
      daily_guidance: {
        Row: {
          id: string
          user_id: string
          date: string
          summary: string
          love: Json
          work: Json
          energy: Json
          created_at: string
        }
        Insert: Partial<DailyGuidance>
        Update: Partial<DailyGuidance>
      }
      inbound_messages: {
        Row: InboundMessage;
        Insert: Omit<InboundMessage, 'id' | 'created_at'>;
        Update: Partial<InboundMessage>;
      }
      message_delivery_receipts: {
        Row: DeliveryReceipt;
        Insert: Omit<DeliveryReceipt, 'id' | 'created_at'>;
        Update: Partial<DeliveryReceipt>;
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type DailyGuidance = Database['public']['Tables']['daily_guidance']['Row']

export interface InboundMessage {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  user_id: string;
  status: 'received' | 'processed' | 'error';
  metadata?: Json;
  error?: string;
  processed_at?: string;
  created_at: string;
}

export interface DeliveryReceipt {
  id: string;
  message_id: string;
  status: string;
  error_code?: string;
  timestamp: string;
  metadata?: Json;
  created_at: string;
}