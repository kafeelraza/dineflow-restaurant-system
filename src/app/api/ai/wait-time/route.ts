import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ai } from '@/lib/geminiClient';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let pendingCount = body.pendingOrders;
    let chefsCount = body.activeChefs;

    // 1. If not provided in request body, calculate dynamically from Supabase database tables
    if (pendingCount === undefined) {
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['placed', 'confirmed', 'preparing']);
      pendingCount = dbOrders?.length || 0;
    }

    if (chefsCount === undefined) {
      // Fetch active chefs on shift
      const { data: dbShifts } = await supabase
        .from('staff_shifts')
        .select('id')
        .eq('role', 'chef');
      chefsCount = dbShifts?.length || 3; // Default to 3 if no active shifts recorded
    }

    // 2. Base formula: wait time = base (8 mins) + (pending_orders * avg_prep_time / active_chefs / 2)
    const basePrep = 8;
    const avgItemPrepTime = 12;
    const computedEta = Math.max(8, Math.round(basePrep + (pendingCount * avgItemPrepTime) / Math.max(1, chefsCount) / 2));

    // 3. Ask Gemini to generate a natural phrasing/suggestion for the customer based on this load
    const systemPrompt = `You are a helpful kitchen manager assistant. Based on computed waiting statistics, write a one-sentence friendly wait-time status update for the customer.
Details:
- Pending orders in queue: ${pendingCount}
- Active chefs: ${chefsCount}
- Estimated Wait Time: ${computedEta} minutes
Instructions:
- Keep the response warm, positive, and exactly one sentence.
- If wait time is high (> 15 mins), suggest they try a quick beverage like House Nimbu Soda.
- Example: "The kitchen is buzzing but our ${chefsCount} chefs are cooking fast! Your wait time is about ${computedEta} minutes; why not try a House Nimbu Soda while you wait?"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
    });

    const naturalPhrasing = response.text || `Kitchen load is moderate. Estimated wait is ${computedEta} minutes.`;

    return NextResponse.json({
      eta: computedEta,
      pendingOrders: pendingCount,
      activeChefs: chefsCount,
      suggestion: naturalPhrasing,
    });
  } catch (error: any) {
    console.error('Wait-Time Predictor API Error:', error);
    return NextResponse.json({ error: error.message || 'Wait time computation failed' }, { status: 500 });
  }
}
