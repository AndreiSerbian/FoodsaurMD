export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      pickup_point_products: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          pickup_point_id: string
          product_id: string
          quantity_available: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          pickup_point_id: string
          product_id: string
          quantity_available?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          pickup_point_id?: string
          product_id?: string
          quantity_available?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pickup_point_products_pickup_point_id"
            columns: ["pickup_point_id"]
            isOneToOne: false
            referencedRelation: "pickup_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pickup_point_products_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_point_products_pickup_point_id_fkey"
            columns: ["pickup_point_id"]
            isOneToOne: false
            referencedRelation: "pickup_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_point_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_points: {
        Row: {
          address: string
          created_at: string
          discount_available_from: string | null
          discount_available_to: string | null
          id: string
          is_active: boolean
          name: string
          producer_id: string
          updated_at: string
          working_hours_from: string | null
          working_hours_to: string | null
        }
        Insert: {
          address: string
          created_at?: string
          discount_available_from?: string | null
          discount_available_to?: string | null
          id?: string
          is_active?: boolean
          name: string
          producer_id: string
          updated_at?: string
          working_hours_from?: string | null
          working_hours_to?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          discount_available_from?: string | null
          discount_available_to?: string | null
          id?: string
          is_active?: boolean
          name?: string
          producer_id?: string
          updated_at?: string
          working_hours_from?: string | null
          working_hours_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pickup_points_producer_id"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_points_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_order_items: {
        Row: {
          created_at: string
          id: string
          pre_order_id: string
          price_discount: number | null
          price_regular: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          pre_order_id: string
          price_discount?: number | null
          price_regular: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          pre_order_id?: string
          price_discount?: number | null
          price_regular?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_pre_order_items_pre_order_id"
            columns: ["pre_order_id"]
            isOneToOne: false
            referencedRelation: "pre_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pre_order_items_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_order_items_pre_order_id_fkey"
            columns: ["pre_order_id"]
            isOneToOne: false
            referencedRelation: "pre_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_orders: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          order_code: string
          pickup_point_id: string
          pickup_time: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          id?: string
          order_code: string
          pickup_point_id: string
          pickup_time: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          order_code?: string
          pickup_point_id?: string
          pickup_time?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pre_orders_pickup_point_id"
            columns: ["pickup_point_id"]
            isOneToOne: false
            referencedRelation: "pickup_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_orders_pickup_point_id_fkey"
            columns: ["pickup_point_id"]
            isOneToOne: false
            referencedRelation: "pickup_points"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "fk_producer_categories_category_id"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_producer_categories_producer_id"
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
      producer_telegram_settings: {
        Row: {
          bot_token: string | null
          chat_id: string | null
          created_at: string
          id: string
          is_active: boolean
          producer_id: string
          updated_at: string
        }
        Insert: {
          bot_token?: string | null
          chat_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          producer_id: string
          updated_at?: string
        }
        Update: {
          bot_token?: string | null
          chat_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          producer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_producer_telegram_settings_producer_id"
            columns: ["producer_id"]
            isOneToOne: true
            referencedRelation: "producer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producer_telegram_settings_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: true
            referencedRelation: "producer_profiles"
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
        ]
      }
      products: {
        Row: {
          allergen_info: string | null
          created_at: string | null
          description: string
          discount_size: number | null
          id: string
          in_stock: boolean | null
          ingredients: string | null
          name: string
          price_discount: number | null
          price_regular: number
          price_unit: string
          producer_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          allergen_info?: string | null
          created_at?: string | null
          description: string
          discount_size?: number | null
          id?: string
          in_stock?: boolean | null
          ingredients?: string | null
          name: string
          price_discount?: number | null
          price_regular: number
          price_unit?: string
          producer_id: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          allergen_info?: string | null
          created_at?: string | null
          description?: string
          discount_size?: number | null
          id?: string
          in_stock?: boolean | null
          ingredients?: string | null
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
      generate_order_code: {
        Args: { length_param?: number }
        Returns: string
      }
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
      app_role: ["admin", "producer"],
    },
  },
} as const
