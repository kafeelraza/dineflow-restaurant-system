import { supabase } from "@/lib/supabaseClient";

export async function claimOrder(orderId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { error } = await supabase
    .from("orders")
    .update({ assigned_staff_id: user.id })
    .eq("id", orderId);

  if (error) throw error;
}
