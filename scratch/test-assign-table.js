const url = 'https://ljxftjhrfajyemipqwhe.supabase.co/rest/v1/restaurant_tables?id=eq.cf9bc19a-ab99-47cf-a641-f3ea62c25e61';
const apikey = 'sb_publishable_P9IGXGkM5YWyaYUkbzL4eA_HTkVjOyt';

fetch(url, {
  method: 'PATCH',
  headers: {
    'apikey': apikey,
    'Authorization': `Bearer ${apikey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    assigned_staff_id: '5f8c76c3-310a-496a-b051-389611ebf225'
  })
})
.then(res => res.json().then(data => ({ status: res.status, body: data })))
.then(result => {
  console.log("UPDATE ATTEMPT RESULT:");
  console.log(JSON.stringify(result, null, 2));
})
.catch(err => console.error("Error patching table:", err));
