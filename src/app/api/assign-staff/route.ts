import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, error: "Database admin client is not initialized on the server-side." },
      { status: 500 }
    );
  }

  try {
    const { action, staffId, tableId } = await req.json();

    if (action === "clear") {
      const { data, error } = await supabaseAdmin
        .from("restaurant_tables")
        .update({ assigned_staff_id: null })
        .eq("assigned_staff_id", staffId)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } else {
      const { data, error } = await supabaseAdmin
        .from("restaurant_tables")
        .update({ assigned_staff_id: staffId })
        .eq("id", tableId)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
  } catch (err: any) {
    console.error("Assign API Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}
