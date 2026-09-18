import { supabase } from "@/src/lib/supabase";

export type Payment = {
  payment_id: string;
  order_id: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  provider_reference: string | null;
  paid_at: string | null;
  created_at: string;
};

export const paymentService = {
  async getByOrderId(orderId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from("payment")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
