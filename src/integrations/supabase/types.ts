export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      producer_categories: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          producer_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          producer_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          producer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producer_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producer_categories_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      producer_profiles: {
        Row: {
          address: string | null
          categories: string[] | null
          category_id: string | null
          category_name: string | null
          created_at: string | null
          discount_available_time: string | null
          email_verified: boolean | null
          exterior_image_url: string | null
          id: string
          interior_image_url: string | null
          is_approved: boolean | null
          is_demo: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          phone: string | null
          producer_name: string
          slug: string | null
          telegram_handle: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          categories?: string[] | null
          category_id?: string | null
          category_name?: string | null
          created_at?: string | null
          discount_available_time?: string | null
          email_verified?: boolean | null
          exterior_image_url?: string | null
          id?: string
          interior_image_url?: string | null
          is_approved?: boolean | null
          is_demo?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          producer_name: string
          slug?: string | null
          telegram_handle?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          categories?: string[] | null
          category_id?: string | null
          category_name?: string | null
          created_at?: string | null
          discount_available_time?: string | null
          email_verified?: boolean | null
          exterior_image_url?: string | null
          id?: string
          interior_image_url?: string | null
          is_approved?: boolean | null
          is_demo?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          producer_name?: string
          slug?: string | null
          telegram_handle?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "producer_profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          company_name: string
          created_at: string | null
          email: string
          id: string
          phone: string | null
          producer_profile_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          email: string
          id?: string
          phone?: string | null
          producer_profile_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          email?: string
          id?: string
          phone?: string | null
          producer_profile_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producers_producer_profile_id_fkey"
            columns: ["producer_profile_id"]
            isOneToOne: false
            referencedRelation: "producer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_images_products"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string
          id: string
          in_stock: boolean | null
          name: string
          price_discount: number | null
          price_regular: number
          price_unit: string
          producer_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          in_stock?: boolean | null
          name: string
          price_discount?: number | null
          price_regular: number
          price_unit?: string
          producer_id: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          in_stock?: boolean | null
          name?: string
          price_discount?: number | null
          price_regular?: number
          price_unit?: string
          producer_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_producer_profiles"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "producer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "producer"],
    },
  },
} as const
