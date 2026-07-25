const url = 'https://ljxftjhrfajyemipqwhe.supabase.co/rest/v1/orders?select=id,status,order_type,guest_name,created_at&order=created_at.desc&limit=5';
const apikey = 'sb_publishable_P9IGXGkM5YWyaYUkbzL4eA_HTkVjOyt';

fetch(url, {
  headers: {
    'apikey': apikey,
    'Authorization': `Bearer ${apikey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log("LATEST 5 ORDERS IN DATABASE:");
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error("Error fetching orders:", err));
