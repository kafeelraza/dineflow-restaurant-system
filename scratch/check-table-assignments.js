const url = 'https://ljxftjhrfajyemipqwhe.supabase.co/rest/v1/restaurant_tables?select=table_number,assigned_staff_id';
const apikey = 'sb_publishable_P9IGXGkM5YWyaYUkbzL4eA_HTkVjOyt';

fetch(url, {
  headers: {
    'apikey': apikey,
    'Authorization': `Bearer ${apikey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log("TABLE WAITER ASSIGNMENTS:");
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error("Error fetching table assignments:", err));
