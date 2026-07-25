import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ai } from '@/lib/geminiClient';

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Fetch live menu items as context for Gemini
    const { data: menuData, error: menuErr } = await supabase
      .from('menu_items')
      .select('name, price, description, is_veg, is_available, spice_level, tags, menu_categories(name)');

    let menuContext = '';
    if (!menuErr && menuData) {
      menuContext = menuData
        .map(
          (item) =>
            `- Name: ${item.name}, Price: Rs. ${item.price}, Category: ${(item.menu_categories as any)?.name || 'General'}, Description: ${
              item.description || 'N/A'
            }, Veg: ${item.is_veg}, Spice Level: ${item.spice_level}/3, Tags: ${item.tags?.join(', ') || 'none'}, Available: ${
              item.is_available
            }`
        )
        .join('\n');
    }

    // 2. Build conversational prompt structure
    const systemPrompt = `You are the friendly, warm AI Dining Assistant for DineFlow restaurant. Your tone is appetizing, helpful, and concise.

Here is the current restaurant menu context:
${menuContext}

Instructions:
1. Concisely answer user queries about dishes, prices, ingredients, spice levels, and prep time.
2. ONLY recommend actual dishes present in the menu above. If they ask for something not on the menu, politely let them know we don't serve it and recommend the closest match from our menu.
3. Highlight vegetarian options (labeled as Veg: true) or spicy levels if relevant.
4. Keep answers short (1-3 sentences maximum).
5. If the user decides to choose something, suggest specific items from our menu.
`;

    // 3. Invoke Gemini
    const promptContents = [
      systemPrompt,
      ...(history || []).map((msg: any) => `${msg.from === 'bot' ? 'Assistant' : 'User'}: ${msg.text}`),
      `User: ${message}`,
      `Assistant:`
    ].join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptContents,
    });

    const reply = response.text || "Nice choice! Feel free to add it to your order.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'AI service failure' }, { status: 500 });
  }
}
