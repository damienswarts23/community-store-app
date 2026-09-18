export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      student: {
        Row: {
          student_id: string;
          first_name: string;
          last_name: string;
          stud_email: string;
          address: string | null;
          phone_number: string | null;
          created_at: string;
        };
        Insert: {
          student_id: string;
          first_name: string;
          last_name: string;
          stud_email: string;
          address?: string | null;
          phone_number?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["student"]["Insert"]>;
        Relationships: [];
      };
      faculty_member: {
        Row: {
          fmember_id: string;
          first_name: string;
          last_name: string;
          fmember_email: string;
          address: string | null;
          phone_number: string | null;
          created_at: string;
        };
        Insert: {
          fmember_id: string;
          first_name: string;
          last_name: string;
          fmember_email: string;
          address?: string | null;
          phone_number?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["faculty_member"]["Insert"]
        >;
        Relationships: [];
      };
      vendor: {
        Row: {
          vendor_id: string;
          first_name: string;
          last_name: string;
          email: string;
          address: string | null;
          phone_number: string | null;
          created_at: string;
        };
        Insert: {
          vendor_id: string;
          first_name: string;
          last_name: string;
          email: string;
          address?: string | null;
          phone_number?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vendor"]["Insert"]>;
        Relationships: [];
      };
      item: {
        Row: {
          item_id: string;
          vendor_id: string;
          item_name: string;
          item_description: string;
          image_url: string | null;
          price: number;
          available: boolean;
          category:
            | "books"
            | "electronics"
            | "household"
            | "fashion"
            | "leisure"
            | null;
          tag: string | null;
          created_at: string;
        };
        Insert: {
          item_id?: string;
          vendor_id: string;
          item_name: string;
          item_description: string;
          image_url?: string | null;
          price: number;
          available?: boolean;
          category?:
            | "books"
            | "electronics"
            | "household"
            | "fashion"
            | "leisure"
            | null;
          tag?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["item"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          order_id: string;
          student_id: string;
          status:
            | "pending"
            | "confirmed"
            | "preparing"
            | "ready"
            | "completed"
            | "cancelled";
          total_price: number;
          delivery_name: string | null;
          delivery_address: string | null;
          delivery_city: string | null;
          delivery_zip: string | null;
          payment_method: "collection" | "card" | null;
          created_at: string;
        };
        Insert: {
          order_id?: string;
          student_id: string;
          status?:
            | "pending"
            | "confirmed"
            | "preparing"
            | "ready"
            | "completed"
            | "cancelled";
          total_price?: number;
          delivery_name?: string | null;
          delivery_address?: string | null;
          delivery_city?: string | null;
          delivery_zip?: string | null;
          payment_method?: "collection" | "card" | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_item: {
        Row: {
          order_id: string;
          item_id: string;
          quantity: number;
          price_at_purchase: number;
        };
        Insert: {
          order_id: string;
          item_id: string;
          quantity: number;
          price_at_purchase: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_item"]["Insert"]>;
        Relationships: [];
      };
      payment: {
        Row: {
          payment_id: string;
          order_id: string;
          amount: number;
          status: "pending" | "paid" | "failed" | "refunded";
          provider_reference: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          payment_id?: string;
          order_id: string;
          amount: number;
          status?: "pending" | "paid" | "failed" | "refunded";
          provider_reference?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment"]["Insert"]>;
        Relationships: [];
      };
      review: {
        Row: {
          review_id: string;
          student_id: string;
          item_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          review_id?: string;
          student_id: string;
          item_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["review"]["Insert"]>;
        Relationships: [];
      };
      post: {
        Row: {
          post_id: string;
          author_id: string;
          title: string;
          body: string;
          created_at: string;
        };
        Insert: {
          post_id?: string;
          author_id: string;
          title: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["post"]["Insert"]>;
        Relationships: [];
      };
      notification: {
        Row: {
          notification_id: string;
          recipient_id: string;
          type: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          notification_id?: string;
          recipient_id: string;
          type: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notification"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      item_with_rating: {
        Row: Database["public"]["Tables"]["item"]["Row"] & {
          category:
            | "books"
            | "electronics"
            | "household"
            | "fashion"
            | "leisure"
            | null;
          tag: string | null;
          avg_rating: number;
          review_count: number;
        };
        Relationships: [];
      };
      vendor_with_rating: {
        Row: Database["public"]["Tables"]["vendor"]["Row"] & {
          avg_rating: number;
          review_count: number;
        };
        Relationships: [];
      };
      post_with_author: {
        Row: Database["public"]["Tables"]["post"]["Row"] & {
          author_first_name: string;
          author_last_name: string;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
