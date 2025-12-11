-- COMPREHENSIVE PERMISSION FIX
-- Run this entire script in the SQL Editor to fix "permission denied for table users"

-- 1. Grant base permissions to roles (RLS will still enforce security)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Fix public.users table RLS
-- This is likely causing the issue if orders references it
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Allow everyone to view users (Required for Foreign Key checks from other tables)
CREATE POLICY "Anyone can view users"
ON public.users FOR SELECT
USING (true);

-- Allow authenticated users to insert/update their own profile
CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- 3. Fix orders table RLS (Ensure buyers can insert)
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
CREATE POLICY "Buyers can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- 4. Fix products table RLS (Ensure everyone can view)
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (true);

SELECT 'Permissions fixed successfully' as result;
