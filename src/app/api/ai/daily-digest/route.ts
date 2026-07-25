import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ai } from '@/lib/geminiClient';

export async function GET() {
  try {
    // 1. Fetch today's orders
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString();

    const { data: ordersData, error: ordersErr } = await supabase
      .from('orders')
      .select('status, total_amount, order_items(quantity, menu_items(name))')
      .gte('created_at', todayStr);

    if (ordersErr) throw ordersErr;

    // Calculate basic sales data
    let totalSales = 0;
    let orderCount = 0;
    const itemSalesMap = new Map<string, number>();

    ordersData?.forEach((o) => {
      orderCount++;
      if (o.status === 'served' || o.status === 'billed') {
        totalSales += Number(o.total_amount);
      }
      o.order_items?.forEach((item: any) => {
        const itemName = item.menu_items?.name || 'Unknown';
        itemSalesMap.set(itemName, (itemSalesMap.get(itemName) || 0) + item.quantity);
      });
    });

    // Find best selling item
    let bestSeller = 'None';
    let maxQty = 0;
    itemSalesMap.forEach((qty, name) => {
      if (qty > maxQty) {
        maxQty = qty;
        bestSeller = name;
      }
    });

    // 2. Fetch inventory stock alerts
    const { data: inventoryData } = await supabase
      .from('inventory_items')
      .select('name, current_stock, reorder_threshold');

    const lowStockItems = inventoryData
      ?.filter((i) => Number(i.current_stock) < Number(i.reorder_threshold))
      .map((i) => i.name) || [];

    // 3. Package metrics into prompt
    const salesJson = JSON.stringify({
      totalRevenue: totalSales,
      completedOrdersCount: ordersData?.filter(o => ['served','billed'].includes(o.status)).length || 0,
      totalOrdersCount: orderCount,
      bestSellingItem: `${bestSeller} (x${maxQty})`,
    });

    const inventoryJson = JSON.stringify({
      lowStockWarnings: lowStockItems,
    });

    const systemPrompt = `You are an elite restaurant analytics consultant. Based on the daily operations data below, generate exactly 3 highly actionable, bulleted points summarizing today's restaurant performance for the manager's dashboard.
Data:
- Sales Data: ${salesJson}
- Inventory Status: ${inventoryJson}

Instructions:
- Write exactly 3 short bullet points.
- Bullet 1: Summarize today's revenue (Rs.) and order count metrics.
- Bullet 2: State the top-selling dish and highlight any critical stock warnings (e.g. low stock on ${lowStockItems.join(', ') || 'none'}).
- Bullet 3: Provide one highly specific, actionable operational recommendation based on the data.
- Do not use markdown bullet characters (like * or -) in the text itself, just output plain lines starting with the bullet text.
- Keep the tone professional, direct, and data-driven.
`;

    // 4. Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
    });

    const digestContent = response.text || "Daily summary generation completed successfully.";

    // Split text into array of lines and clean it
    const insightsList = digestContent
      .split('\n')
      .map(line => line.replace(/^[-*•\s]+/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3); // Take first 3 bullet points

    // 5. Store each insight line into the public.ai_insights table
    await supabase.from('ai_insights').delete().eq('type', 'daily_digest'); // Clear old daily digest

    for (const insightText of insightsList) {
      await supabase.from('ai_insights').insert({
        type: 'daily_digest',
        content: insightText,
      });
    }

    return NextResponse.json({
      success: true,
      digest: insightsList.join(" "),
      insights: insightsList,
    });
  } catch (error: any) {
    console.error('Daily Digest Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate digest' }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
