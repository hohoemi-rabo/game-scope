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
      games: {
        Row: {
          id: string
          title_ja: string | null
          title_en: string
          platforms: string[] | null
          metascore: number | null
          review_count: number | null
          release_date: string | null
          thumbnail_url: string | null
          opencritic_id: string | null
          created_at: string | null
          updated_at: string | null
          twitch_game_id: string | null
          twitch_last_checked_at: string | null
        }
        Insert: {
          id?: string
          title_ja?: string | null
          title_en: string
          platforms?: string[] | null
          metascore?: number | null
          review_count?: number | null
          release_date?: string | null
          thumbnail_url?: string | null
          opencritic_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          twitch_game_id?: string | null
          twitch_last_checked_at?: string | null
        }
        Update: {
          id?: string
          title_ja?: string | null
          title_en?: string
          platforms?: string[] | null
          metascore?: number | null
          review_count?: number | null
          release_date?: string | null
          thumbnail_url?: string | null
          opencritic_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          twitch_game_id?: string | null
          twitch_last_checked_at?: string | null
        }
      }
      twitch_links: {
        Row: {
          id: string
          game_id: string | null
          clip_url: string | null
          thumbnail_url: string | null
          has_live: boolean | null
          viewer_count: number | null
          checked_at: string | null
          twitch_game_id: string | null
          live_streams_count: number | null
          total_viewers: number | null
          clips_count: number | null
          last_fetched_at: string | null
          is_live: boolean | null
        }
        Insert: {
          id?: string
          game_id?: string | null
          clip_url?: string | null
          thumbnail_url?: string | null
          has_live?: boolean | null
          viewer_count?: number | null
          checked_at?: string | null
          twitch_game_id?: string | null
          live_streams_count?: number | null
          total_viewers?: number | null
          clips_count?: number | null
          last_fetched_at?: string | null
          is_live?: boolean | null
        }
        Update: {
          id?: string
          game_id?: string | null
          clip_url?: string | null
          thumbnail_url?: string | null
          has_live?: boolean | null
          viewer_count?: number | null
          checked_at?: string | null
          twitch_game_id?: string | null
          live_streams_count?: number | null
          total_viewers?: number | null
          clips_count?: number | null
          last_fetched_at?: string | null
          is_live?: boolean | null
        }
      }
      releases: {
        Row: {
          id: string
          title: string
          platform: string | null
          release_date: string | null
          source: string | null
          link_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          platform?: string | null
          release_date?: string | null
          source?: string | null
          link_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          platform?: string | null
          release_date?: string | null
          source?: string | null
          link_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      operation_logs: {
        Row: {
          id: string
          operation_type: string | null
          status: string | null
          details: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          operation_type?: string | null
          status?: string | null
          details?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          operation_type?: string | null
          status?: string | null
          details?: Json | null
          created_at?: string | null
        }
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
