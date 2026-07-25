const url = 'https://ljxftjhrfajyemipqwhe.supabase.co/rest/v1/orders?select=id,order_type,restaurant_tables(table_number,assigned_staff_id,profiles(full_name)),profiles!orders_assigned_staff_id_fkey(full_name)&order=created_at.desc&limit=2';
const apikey = 'sb_publishable_P9IGXGkM5YWyaYUkbzL4eA_HTkVjOyt';

fetch(url, {
  headers: {
    'apikey': apikey,
    'Authorization': `Bearer ${apikey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log("JOINED NAMES QUERY RESULT:");
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error("Error fetching joined names:", err));
