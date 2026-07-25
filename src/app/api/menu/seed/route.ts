import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // 1. Seed Menu Categories
    const categoriesList = ["Chef picks", "Starters", "Mains", "Beverages", "Desserts"];
    
    // Insert categories using admin client (bypasses RLS)
    for (const catName of categoriesList) {
      const { error } = await supabaseAdmin
        .from('menu_categories')
        .upsert({ name: catName }, { onConflict: 'name' });
      if (error) throw error;
    }

    const { data: dbCategories, error: getCatErr } = await supabaseAdmin
      .from('menu_categories')
      .select('*');

    if (getCatErr) throw getCatErr;

    const categoryMap = new Map(dbCategories?.map(c => [c.name, c.id]));

    // 2. Seed Menu Items
    const mockMenuItems = [
      {
        category: "Starters",
        name: "Charred Paneer Tikka",
        description: "Smoked cottage cheese, mustard cream, pickled onion",
        price: 280,
        is_veg: true,
        is_available: true,
        spice_level: 2,
        prep_time_minutes: 10,
        tags: ["Chef special", "Spicy"],
        image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80",
      },
      {
        category: "Mains",
        name: "Saffron Butter Bowl",
        description: "Slow-cooked rice, roasted vegetables, herb yoghurt",
        price: 340,
        is_veg: true,
        is_available: true,
        spice_level: 1,
        prep_time_minutes: 14,
        tags: ["Bestseller"],
        image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
      },
      {
        category: "Starters",
        name: "Tamarind Glazed Wings",
        description: "Crisp wings, jaggery-tamarind glaze, sesame",
        price: 390,
        is_veg: false,
        is_available: true,
        spice_level: 2,
        prep_time_minutes: 12,
        tags: ["Fast moving"],
        image_url: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80",
      },
      {
        category: "Desserts",
        name: "Mango Cream Kulfi",
        description: "Alphonso pulp, pistachio crumb, cardamom cream",
        price: 210,
        is_veg: true,
        is_available: false,
        spice_level: 0,
        prep_time_minutes: 4,
        tags: ["Sold out"],
        image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
      },
      {
        category: "Beverages",
        name: "House Nimbu Soda",
        description: "Fresh lime, black salt, mint, sparkling water",
        price: 120,
        is_veg: true,
        is_available: true,
        spice_level: 0,
        prep_time_minutes: 3,
        tags: ["Fresh"],
        image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
      },
      {
        category: "Mains",
        name: "Stuffed Amritsari Kulcha",
        description: "Crisp kulcha, chole, onion relish, tamarind chutney",
        price: 260,
        is_veg: true,
        is_available: true,
        spice_level: 2,
        prep_time_minutes: 16,
        tags: ["Comfort"],
        image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
      },
    ];

    for (const item of mockMenuItems) {
      const categoryId = categoryMap.get(item.category);
      if (categoryId) {
        const { error } = await supabaseAdmin
          .from('menu_items')
          .upsert({
            category_id: categoryId,
            name: item.name,
            description: item.description,
            price: item.price,
            image_url: item.image_url,
            is_available: item.is_available,
            is_veg: item.is_veg,
            spice_level: item.spice_level,
            tags: item.tags,
            prep_time_minutes: item.prep_time_minutes
          }, { onConflict: 'name' });
        if (error) throw error;
      }
    }

    // 3. Seed Tables
    const mockTables = Array.from({ length: 16 }, (_, index) => {
      const statuses = ["available", "occupied", "reserved", "available", "cleaning", "occupied", "available", "reserved"];
      return {
        table_number: index + 1,
        capacity: [2, 4, 4, 6][index % 4],
        status: statuses[index % statuses.length]
      };
    });

    for (const tbl of mockTables) {
      const { error } = await supabaseAdmin
        .from('restaurant_tables')
        .upsert(tbl, { onConflict: 'table_number' });
      if (error) throw error;
    }

    // 4. Seed Inventory
    const mockInventory = [
      { name: "Paneer", unit: "kg", current_stock: 4.2, reorder_threshold: 8.0 },
      { name: "Mint", unit: "bunch", current_stock: 7.0, reorder_threshold: 18.0 },
      { name: "Cream", unit: "litre", current_stock: 5.0, reorder_threshold: 10.0 },
      { name: "Rice", unit: "kg", current_stock: 38.0, reorder_threshold: 20.0 },
      { name: "Lime", unit: "kg", current_stock: 12.0, reorder_threshold: 9.0 },
    ];

    for (const inv of mockInventory) {
      const { error } = await supabaseAdmin
        .from('inventory_items')
        .upsert(inv, { onConflict: 'name' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    console.error("Seeder failed:", error);
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 });
  }
}
