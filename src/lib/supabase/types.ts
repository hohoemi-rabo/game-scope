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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      games: {
        Row: {
          created_at: string | null
          description_en: string | null
          genres: string[] | null
          id: string
          is_top_rated: boolean | null
          metascore: number | null
          opencritic_id: string | null
          opencritic_numeric_id: number | null
          platforms: string[] | null
          ranking: number | null
          rawg_id: number | null
          release_date: string | null
          review_count: number | null
          thumbnail_url: string | null
          title_en: string
          title_ja: string | null
          twitch_game_id: string | null
          twitch_last_checked_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          genres?: string[] | null
          id?: string
          is_top_rated?: boolean | null
          metascore?: number | null
          opencritic_id?: string | null
          opencritic_numeric_id?: number | null
          platforms?: string[] | null
          ranking?: number | null
          rawg_id?: number | null
          release_date?: string | null
          review_count?: number | null
          thumbnail_url?: string | null
          title_en: string
          title_ja?: string | null
          twitch_game_id?: string | null
          twitch_last_checked_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          genres?: string[] | null
          id?: string
          is_top_rated?: boolean | null
          metascore?: number | null
          opencritic_id?: string | null
          opencritic_numeric_id?: number | null
          platforms?: string[] | null
          ranking?: number | null
          rawg_id?: number | null
          release_date?: string | null
          review_count?: number | null
          thumbnail_url?: string | null
          title_en?: string
          title_ja?: string | null
          twitch_game_id?: string | null
          twitch_last_checked_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      operation_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          message: string | null
          operation_type: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          message?: string | null
          operation_type?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          message?: string | null
          operation_type?: string | null
          status?: string | null
        }
        Relationships: []
      }
      releases: {
        Row: {
          created_at: string | null
          id: string
          link_url: string | null
          platform: string | null
          release_date: string | null
          source: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_url?: string | null
          platform?: string | null
          release_date?: string | null
          source?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link_url?: string | null
          platform?: string | null
          release_date?: string | null
          source?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      twitch_links: {
        Row: {
          checked_at: string | null
          clip_url: string | null
          clips_count: number | null
          game_id: string | null
          has_live: boolean | null
          id: string
          is_live: boolean | null
          last_fetched_at: string | null
          live_streams_count: number | null
          thumbnail_url: string | null
          total_viewers: number | null
          twitch_game_id: string | null
          viewer_count: number | null
        }
        Insert: {
          checked_at?: string | null
          clip_url?: string | null
          clips_count?: number | null
          game_id?: string | null
          has_live?: boolean | null
          id?: string
          is_live?: boolean | null
          last_fetched_at?: string | null
          live_streams_count?: number | null
          thumbnail_url?: string | null
          total_viewers?: number | null
          twitch_game_id?: string | null
          viewer_count?: number | null
        }
        Update: {
          checked_at?: string | null
          clip_url?: string | null
          clips_count?: number | null
          game_id?: string | null
          has_live?: boolean | null
          id?: string
          is_live?: boolean | null
          last_fetched_at?: string | null
          live_streams_count?: number | null
          thumbnail_url?: string | null
          total_viewers?: number | null
          twitch_game_id?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "twitch_links_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_portfolios: {
        Row: {
          created_at: string
          game_id: string
          id: string
          is_subscription: boolean | null
          memo: string | null
          platform: string | null
          play_time_minutes: number | null
          purchase_price: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          is_subscription?: boolean | null
          memo?: string | null
          platform?: string | null
          play_time_minutes?: number | null
          purchase_price?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          is_subscription?: boolean | null
          memo?: string | null
          platform?: string | null
          play_time_minutes?: number | null
          purchase_price?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_portfolios_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_orphaned_games: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
