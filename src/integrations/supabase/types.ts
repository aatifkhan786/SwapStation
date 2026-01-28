export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["alert_priority"]
          risk_type: Database["public"]["Enums"]["risk_type"]
          station_id: string
          status: Database["public"]["Enums"]["alert_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          priority: Database["public"]["Enums"]["alert_priority"]
          risk_type: Database["public"]["Enums"]["risk_type"]
          station_id: string
          status?: Database["public"]["Enums"]["alert_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["alert_priority"]
          risk_type?: Database["public"]["Enums"]["risk_type"]
          station_id?: string
          status?: Database["public"]["Enums"]["alert_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          id: string
          is_read: boolean
          message_text: string
          recommendation_id: string | null
          sent_at: string
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string | null
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          id?: string
          is_read?: boolean
          message_text: string
          recommendation_id?: string | null
          sent_at?: string
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          id?: string
          is_read?: boolean
          message_text?: string
          recommendation_id?: string | null
          sent_at?: string
          target_role?: Database["public"]["Enums"]["app_role"]
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          vehicle_info: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id: string
          name: string
          updated_at?: string
          vehicle_info?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          vehicle_info?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"]
          alert_id: string | null
          confidence_score: number
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_status: Database["public"]["Enums"]["decision_status"]
          id: string
          impact_text: string
          owner_role: Database["public"]["Enums"]["app_role"]
          station_id: string
          why_text: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type"]
          alert_id?: string | null
          confidence_score: number
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_status?: Database["public"]["Enums"]["decision_status"]
          id?: string
          impact_text: string
          owner_role: Database["public"]["Enums"]["app_role"]
          station_id: string
          why_text: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"]
          alert_id?: string | null
          confidence_score?: number
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_status?: Database["public"]["Enums"]["decision_status"]
          id?: string
          impact_text?: string
          owner_role?: Database["public"]["Enums"]["app_role"]
          station_id?: string
          why_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      station_metrics: {
        Row: {
          charged_inventory: number
          charger_uptime: number
          error_count: number
          id: string
          queue_level: number
          station_id: string
          swap_rate: number
          timestamp: string
          uncharged_inventory: number
        }
        Insert: {
          charged_inventory?: number
          charger_uptime?: number
          error_count?: number
          id?: string
          queue_level?: number
          station_id: string
          swap_rate?: number
          timestamp?: string
          uncharged_inventory?: number
        }
        Update: {
          charged_inventory?: number
          charger_uptime?: number
          error_count?: number
          id?: string
          queue_level?: number
          station_id?: string
          swap_rate?: number
          timestamp?: string
          uncharged_inventory?: number
        }
        Relationships: [
          {
            foreignKeyName: "station_metrics_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          city: string
          created_at: string
          id: string
          lat: number
          lng: number
          station_name: string
          status: Database["public"]["Enums"]["station_status"]
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          lat: number
          lng: number
          station_name: string
          status?: Database["public"]["Enums"]["station_status"]
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          station_name?: string
          status?: Database["public"]["Enums"]["station_status"]
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          issue_type: string
          priority: Database["public"]["Enums"]["alert_priority"]
          probable_root_cause: string | null
          resolution_notes: string | null
          resolved_at: string | null
          station_id: string
          status: Database["public"]["Enums"]["ticket_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          issue_type: string
          priority?: Database["public"]["Enums"]["alert_priority"]
          probable_root_cause?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          station_id: string
          status?: Database["public"]["Enums"]["ticket_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          issue_type?: string
          priority?: Database["public"]["Enums"]["alert_priority"]
          probable_root_cause?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          station_id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_type: "reroute" | "ticket" | "rebalance" | "escalate" | "monitor"
      alert_priority: "P0" | "P1" | "P2" | "P3"
      alert_status: "new" | "acknowledged" | "resolved"
      app_role: "driver" | "field_ops" | "admin"
      decision_status: "pending" | "approved" | "rejected" | "snoozed"
      notification_channel: "sms" | "whatsapp" | "dashboard_log"
      risk_type:
        | "congestion"
        | "stockout"
        | "charger_fault"
        | "outage"
        | "error_spike"
      station_status: "healthy" | "attention" | "risk" | "critical"
      ticket_status: "new" | "acknowledged" | "in_progress" | "resolved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_type: ["reroute", "ticket", "rebalance", "escalate", "monitor"],
      alert_priority: ["P0", "P1", "P2", "P3"],
      alert_status: ["new", "acknowledged", "resolved"],
      app_role: ["driver", "field_ops", "admin"],
      decision_status: ["pending", "approved", "rejected", "snoozed"],
      notification_channel: ["sms", "whatsapp", "dashboard_log"],
      risk_type: [
        "congestion",
        "stockout",
        "charger_fault",
        "outage",
        "error_spike",
      ],
      station_status: ["healthy", "attention", "risk", "critical"],
      ticket_status: ["new", "acknowledged", "in_progress", "resolved"],
    },
  },
} as const
