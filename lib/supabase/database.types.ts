export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      comments: {
        Row: {
          audio_version_id: string | null
          author_id: string
          body: string
          course_id: string | null
          created_at: string
          id: string
          lesson_id: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          pack_id: string | null
          parent_comment_id: string | null
          timepoint_seconds: number | null
          updated_at: string
        }
        Insert: {
          audio_version_id?: string | null
          author_id: string
          body: string
          course_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          pack_id?: string | null
          parent_comment_id?: string | null
          timepoint_seconds?: number | null
          updated_at?: string
        }
        Update: {
          audio_version_id?: string | null
          author_id?: string
          body?: string
          course_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          pack_id?: string | null
          parent_comment_id?: string | null
          timepoint_seconds?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_audio_version_id_lesson_audio_versions_id_fk"
            columns: ["audio_version_id"]
            isOneToOne: false
            referencedRelation: "lesson_audio_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_author_id_users_id_fk"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_course_id_courses_id_fk"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_lesson_id_lessons_id_fk"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_moderated_by_users_id_fk"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_pack_id_packs_id_fk"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_comments_id_fk"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          base_language_id: string
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          is_published: boolean
          slug: string
          target_language_id: string
          title: string
          updated_at: string
        }
        Insert: {
          base_language_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          slug: string
          target_language_id: string
          title: string
          updated_at?: string
        }
        Update: {
          base_language_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          slug?: string
          target_language_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_base_language_id_languages_id_fk"
            columns: ["base_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_target_language_id_languages_id_fk"
            columns: ["target_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_audio_versions: {
        Row: {
          audio_duration_seconds: number | null
          audio_path: string
          created_at: string
          id: string
          is_current: boolean
          label: string
          lesson_id: string
          updated_at: string
        }
        Insert: {
          audio_duration_seconds?: number | null
          audio_path: string
          created_at?: string
          id?: string
          is_current?: boolean
          label: string
          lesson_id: string
          updated_at?: string
        }
        Update: {
          audio_duration_seconds?: number | null
          audio_path?: string
          created_at?: string
          id?: string
          is_current?: boolean
          label?: string
          lesson_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_audio_versions_lesson_id_lessons_id_fk"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_dependencies: {
        Row: {
          created_at: string
          lesson_id: string
          required_pack_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          lesson_id: string
          required_pack_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          lesson_id?: string
          required_pack_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_dependencies_lesson_id_lessons_id_fk"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_dependencies_required_pack_id_packs_id_fk"
            columns: ["required_pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_tags: {
        Row: {
          created_at: string
          lesson_id: string
          tag_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          lesson_id: string
          tag_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          lesson_id?: string
          tag_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_tags_lesson_id_lessons_id_fk"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_tags_tag_id_tags_id_fk"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          pack_id: string
          position: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          pack_id: string
          position: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          pack_id?: string
          position?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_pack_id_packs_id_fk"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      packs: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          is_published: boolean
          position: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          position: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          position?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packs_course_id_courses_id_fk"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          label: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { uid: string }; Returns: boolean }
    }
    Enums: {
      moderation_status: "pending" | "approved" | "rejected"
      user_role: "user" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      moderation_status: ["pending", "approved", "rejected"],
      user_role: ["user", "admin"],
    },
  },
} as const

