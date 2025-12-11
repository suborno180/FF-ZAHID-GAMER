-- Fix permissions for public.users table
-- This table is likely being accessed by a trigger or foreign key constraint

-- 1. Ensure public.users has RLS enabled
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if any to avoid conflicts (optional but safer)
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- 3. Add permissive policies
-- Allow everyone to view users (needed for FK checks and general access)
CREATE POLICY "Anyone can view users"
ON public.users FOR SELECT
USING (true);

-- Allow authenticated users to insert their own profile (if not handled by trigger)
CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- 4. Also ensure 'orders' table allows insert
-- (Re-applying this to be sure, using the logic from create_orders_table.sql)
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
CREATE POLICY "Buyers can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- 5. Grant usage on public schema (basic sanity check)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
