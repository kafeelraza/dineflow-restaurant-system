const url = 'https://ljxftjhrfajyemipqwhe.supabase.co/rest/v1/profiles?select=id,full_name,role';
const apikey = 'sb_publishable_P9IGXGkM5YWyaYUkbzL4eA_HTkVjOyt';

fetch(url, {
  headers: {
    'apikey': apikey,
    'Authorization': `Bearer ${apikey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log("PROFILES IN DATABASE:");
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error("Error fetching profiles:", err));
