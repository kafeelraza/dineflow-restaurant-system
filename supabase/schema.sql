-- DineFlow PostgreSQL Schema for Supabase SQL Editor

-- 1. PROFILE TABLE (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('customer', 'staff', 'admin')),
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger to automatically create a profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. RESTAURANT SETTINGS
create table public.restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  opening_time time,
  closing_time time,
  total_tables integer default 16
);


-- 3. MENU CATEGORIES
create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer default 0
);


-- 4. MENU ITEMS
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null unique,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_available boolean default true,
  is_veg boolean default true,
  spice_level integer default 0 check (spice_level >= 0 and spice_level <= 3),
  tags text[] default '{}',
  prep_time_minutes integer default 15,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 5. RESTAURANT TABLES
create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  table_number integer not null unique,
  capacity integer not null,
  status text not null default 'available' check (status in ('available', 'occupied', 'reserved', 'cleaning')),
  assigned_staff_id uuid references public.profiles(id) on delete set null
);


-- 6. RESERVATIONS
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  table_id uuid references public.restaurant_tables(id) on delete set null,
  name text not null,
  phone text not null,
  party_size integer not null,
  reserved_at timestamp with time zone not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'seated', 'cancelled', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 7. ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  guest_name text,
  guest_phone text,
  table_id uuid references public.restaurant_tables(id) on delete set null,
  status text not null default 'placed' check (status in ('placed', 'confirmed', 'preparing', 'ready', 'served', 'billed', 'cancelled')),
  order_type text not null default 'dine-in' check (order_type in ('dine-in', 'takeaway')),
  total_amount numeric(10,2) not null default 0.00,
  assigned_staff_id uuid references public.profiles(id) on delete set null,
  estimated_ready_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 8. ORDER ITEMS
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price_at_order numeric(10,2) not null,
  special_instructions text
);


-- 9. INVENTORY ITEMS
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unit text not null,
  current_stock numeric(10,2) not null default 0.00,
  reorder_threshold numeric(10,2) not null default 0.00,
  last_restocked timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 10. STAFF SHIFTS
create table public.staff_shifts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references public.profiles(id) on delete cascade not null,
  shift_start timestamp with time zone not null,
  shift_end timestamp with time zone not null,
  role text not null check (role in ('waiter', 'chef', 'cashier'))
);


-- 11. BILLS
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade unique not null,
  subtotal numeric(10,2) not null,
  tax numeric(10,2) not null default 0.00,
  discount numeric(10,2) not null default 0.00,
  total numeric(10,2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  payment_method text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 12. AI INSIGHTS
create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('daily_digest', 'demand_forecast', 'low_stock_alert')),
  content text not null,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 13. NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for other tables
alter table public.restaurant_settings enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.reservations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.staff_shifts enable row level security;
alter table public.bills enable row level security;
alter table public.ai_insights enable row level security;
alter table public.notifications enable row level security;

-- Setup basic read-for-all policies
create policy "Allow read access to anyone" on public.restaurant_settings for select using (true);
create policy "Allow read access to anyone" on public.menu_categories for select using (true);
create policy "Allow read access to anyone" on public.menu_items for select using (true);
create policy "Allow read access to anyone" on public.restaurant_tables for select using (true);
create policy "Allow read access to anyone" on public.reservations for select using (true);
create policy "Allow read access to anyone" on public.orders for select using (true);
create policy "Allow read access to anyone" on public.order_items for select using (true);
create policy "Allow read access to anyone" on public.inventory_items for select using (true);
create policy "Allow read access to anyone" on public.bills for select using (true);
create policy "Allow read access to anyone" on public.ai_insights for select using (true);
create policy "Allow read access to anyone" on public.notifications for select using (true);

-- Allow authenticated writes for staff and admins
create policy "Allow write access to staff/admins" on public.menu_categories for all using (true);
create policy "Allow write access to staff/admins" on public.menu_items for all using (true);
create policy "Allow write access to staff/admins" on public.restaurant_tables for all using (true);
create policy "Allow write access to staff/admins" on public.inventory_items for all using (true);
create policy "Allow write access to staff/admins" on public.staff_shifts for all using (true);
create policy "Allow write access to staff/admins" on public.bills for all using (true);
create policy "Allow write access to staff/admins" on public.ai_insights for all using (true);
create policy "Allow write access to staff/admins" on public.notifications for all using (true);

-- Client orders policies
create policy "Allow anyone to place an order" on public.orders for insert with check (true);
create policy "Allow anyone to update orders" on public.orders for update using (true);

create policy "Allow anyone to manage order items" on public.order_items for all using (true);

-- Client reservations policies
create policy "Allow anyone to book a reservation" on public.reservations for insert with check (true);
create policy "Allow anyone to update reservations" on public.reservations for update using (true);

