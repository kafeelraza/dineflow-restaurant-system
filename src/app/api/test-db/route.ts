import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message, details: error });
    }

    return NextResponse.json({
      success: true,
      columns: data && data.length > 0 ? Object.keys(data[0]) : "No rows in orders table to inspect columns, or empty table.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
