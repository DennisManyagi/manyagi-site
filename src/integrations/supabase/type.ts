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
      assets: {
        Row: {
          alt_text: string | null
          bucket_name: string
          created_at: string | null
          dimensions: Json | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          mime_type: string
          name: string
          recommended_dimensions: Json | null
          section_type: string | null
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          bucket_name: string
          created_at?: string | null
          dimensions?: Json | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          mime_type: string
          name: string
          recommended_dimensions?: Json | null
          section_type?: string | null
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          bucket_name?: string
          created_at?: string | null
          dimensions?: Json | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          mime_type?: string
          name?: string
          recommended_dimensions?: Json | null
          section_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          genre: string | null
          id: string
          isbn: string | null
          price: number | null
          publication_date: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          isbn?: string | null
          price?: number | null
          publication_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          isbn?: string | null
          price?: number | null
          publication_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          id: string
          items: Json | null
          shipping_address: Json | null
          status: string | null
          stripe_session_id: string | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json | null
          shipping_address?: Json | null
          status?: string | null
          stripe_session_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json | null
          shipping_address?: Json | null
          status?: string | null
          stripe_session_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          printful_id: string | null
          status: string | null
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          printful_id?: string | null
          status?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          printful_id?: string | null
          status?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          images: Json | null
          price: number | null
          property_type: string | null
          square_feet: number | null
          state: string | null
          status: string | null
          title: string
          updated_at: string
          virtual_tour_url: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          price?: number | null
          property_type?: string | null
          square_feet?: number | null
          state?: string | null
          status?: string | null
          title: string
          updated_at?: string
          virtual_tour_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          price?: number | null
          property_type?: string | null
          square_feet?: number | null
          state?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          virtual_tour_url?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          confidence: number | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_premium: boolean | null
          price: number | null
          signal_type: string
          stop_loss: number | null
          symbol: string
          target_price: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean | null
          price?: number | null
          signal_type: string
          stop_loss?: number | null
          symbol: string
          target_price?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean | null
          price?: number | null
          signal_type?: string
          stop_loss?: number | null
          symbol?: string
          target_price?: number | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          config_data: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          config_data?: Json
          id: string
          updated_at?: string | null
        }
        Update: {
          config_data?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string | null
          status: string | null
          stripe_subscription_id: string | null
          telegram_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          telegram_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          telegram_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      website_sections: {
        Row: {
          content: Json
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          page_name: string
          section_name: string
          section_type: string
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          page_name: string
          section_name: string
          section_type: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          page_name?: string
          section_name?: string
          section_type?: string
          updated_at?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never