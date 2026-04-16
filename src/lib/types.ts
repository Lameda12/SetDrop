export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          artist_id: string;
          code: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          code: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          code?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          session_id: string;
          song_title: string;
          requester_name: string;
          upvotes: number;
          played_at: string | null;
          created_at: string;
          fingerprint: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          song_title: string;
          requester_name?: string;
          upvotes?: number;
          played_at?: string | null;
          created_at?: string;
          fingerprint?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          song_title?: string;
          requester_name?: string;
          upvotes?: number;
          played_at?: string | null;
          created_at?: string;
          fingerprint?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "requests_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      votes: {
        Row: {
          id: string;
          request_id: string;
          fingerprint: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          fingerprint: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          fingerprint?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "requests";
            referencedColumns: ["id"];
          }
        ];
      };
      reactions: {
        Row: {
          id: string;
          session_id: string;
          type: "fire" | "heart" | "music";
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          type: "fire" | "heart" | "music";
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          type?: "fire" | "heart" | "music";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reactions_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_upvote: {
        Args: { request_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type Request = Database["public"]["Tables"]["requests"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type ReactionType = "fire" | "heart" | "music";
