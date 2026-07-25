export type Role = "customer" | "staff" | "admin";
export type OrderStatus = "placed" | "confirmed" | "preparing" | "ready" | "served" | "billed";
export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export const categories = ["Chef picks", "Starters", "Mains", "Beverages", "Desserts"];

export const menuItems = [
  {
    id: "paneer-tikka",
    category: "Starters",
    name: "Charred Paneer Tikka",
    description: "Smoked cottage cheese, mustard cream, pickled onion",
    price: 280,
    isVeg: true,
    isAvailable: true,
    spice: 2,
    prepTime: 10,
    tags: ["Chef special", "Spicy"],
    img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "saffron-bowl",
    category: "Mains",
    name: "Saffron Butter Bowl",
    description: "Slow-cooked rice, roasted vegetables, herb yoghurt",
    price: 340,
    isVeg: true,
    isAvailable: true,
    spice: 1,
    prepTime: 14,
    tags: ["Bestseller"],
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "tamarind-wings",
    category: "Starters",
    name: "Tamarind Glazed Wings",
    description: "Crisp wings, jaggery-tamarind glaze, sesame",
    price: 390,
    isVeg: false,
    isAvailable: true,
    spice: 2,
    prepTime: 12,
    tags: ["Fast moving"],
    img: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "mango-cream",
    category: "Desserts",
    name: "Mango Cream Kulfi",
    description: "Alphonso pulp, pistachio crumb, cardamom cream",
    price: 210,
    isVeg: true,
    isAvailable: false,
    spice: 0,
    prepTime: 4,
    tags: ["Sold out"],
    img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "nimbu-soda",
    category: "Beverages",
    name: "House Nimbu Soda",
    description: "Fresh lime, black salt, mint, sparkling water",
    price: 120,
    isVeg: true,
    isAvailable: true,
    spice: 0,
    prepTime: 3,
    tags: ["Fresh"],
    img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "kulcha",
    category: "Mains",
    name: "Stuffed Amritsari Kulcha",
    description: "Crisp kulcha, chole, onion relish, tamarind chutney",
    price: 260,
    isVeg: true,
    isAvailable: true,
    spice: 2,
    prepTime: 16,
    tags: ["Comfort"],
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
  },
];

export const orders = [
  { id: "1842", table: "T07", customer: "Aarav", items: ["Charred Paneer Tikka", "House Nimbu Soda"], total: 400, eta: 8, status: "preparing" as OrderStatus },
  { id: "1843", table: "T11", customer: "Meera", items: ["Saffron Butter Bowl x2"], total: 680, eta: 14, status: "placed" as OrderStatus },
  { id: "1844", table: "Takeaway", customer: "Kabir", items: ["Tamarind Glazed Wings", "Kulcha"], total: 650, eta: 0, status: "ready" as OrderStatus },
  { id: "1845", table: "T02", customer: "Riya", items: ["Kulcha", "Nimbu Soda x2"], total: 500, eta: 18, status: "confirmed" as OrderStatus },
  { id: "1846", table: "T05", customer: "Zoya", items: ["Saffron Butter Bowl"], total: 340, eta: 0, status: "served" as OrderStatus },
];

export const tables = Array.from({ length: 16 }, (_, index) => {
  const statuses: TableStatus[] = ["available", "occupied", "reserved", "available", "cleaning", "occupied", "available", "reserved"];
  return {
    id: `T${String(index + 1).padStart(2, "0")}`,
    capacity: [2, 4, 4, 6][index % 4],
    status: statuses[index % statuses.length],
    server: ["Nikhil", "Sara", "Dev", "Ira"][index % 4],
  };
});

export const inventory = [
  { item: "Paneer", unit: "kg", stock: 4.2, threshold: 8, supplier: "Fresh Dairy Co.", trend: "High demand" },
  { item: "Mint", unit: "bunch", stock: 7, threshold: 18, supplier: "Green Basket", trend: "Low by dinner" },
  { item: "Cream", unit: "litre", stock: 5, threshold: 10, supplier: "Fresh Dairy Co.", trend: "Restock today" },
  { item: "Rice", unit: "kg", stock: 38, threshold: 20, supplier: "Indore Grains", trend: "Healthy" },
  { item: "Lime", unit: "kg", stock: 12, threshold: 9, supplier: "Green Basket", trend: "Healthy" },
];

export const staff = [
  { name: "Nikhil Jain", role: "Chef", shift: "10:00 - 18:00", load: "4 active tickets", status: "On shift" },
  { name: "Sara Khan", role: "Waiter", shift: "12:00 - 22:00", load: "5 tables", status: "On shift" },
  { name: "Dev Mehta", role: "Cashier", shift: "14:00 - 23:00", load: "Bills desk", status: "On shift" },
  { name: "Ira Shah", role: "Host", shift: "17:00 - 23:00", load: "Reservations", status: "Starts soon" },
];

export const customers = [
  { name: "Aarav", visits: 8, favorite: "Paneer Tikka", lastBill: 400, note: "Likes spicy veg starters" },
  { name: "Meera", visits: 5, favorite: "Saffron Bowl", lastBill: 680, note: "Often reserves T11" },
  { name: "Kabir", visits: 3, favorite: "Tamarind Wings", lastBill: 650, note: "Takeaway regular" },
];

export const notifications = [
  "Order #1844 is ready for pickup.",
  "Mint stock may run low before dinner closes.",
  "T03 reservation confirmed for 8:30 PM.",
  "AI predicts a 22-minute kitchen load spike at 8 PM.",
];

export const aiInsights = [
  "Butter Bowl is leading sales by 22% today.",
  "Average bill value rises when drinks are suggested with mains.",
  "Restock mint and cream before tomorrow lunch.",
  "Add one runner between 7:45 PM and 9:00 PM to reduce table wait.",
];

export function formatRs(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}
