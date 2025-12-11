-- ========================================
-- COMPLETE SUPABASE SETUP FROM SCRATCH
-- ========================================
-- Run this SQL script in your Supabase SQL Editor after creating a new project

-- ========================================
-- STEP 1: CREATE PRODUCTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    level INTEGER NOT NULL,
    diamonds INTEGER NOT NULL,
    skins INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ========================================
-- STEP 2: CREATE ORDERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- STEP 3: CREATE PUBLIC USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- STEP 4: CREATE BANNERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 6: CREATE PRODUCTS POLICIES
-- ========================================
-- Allow everyone to view products
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (true);

-- Allow authenticated users to insert their own products
CREATE POLICY "Authenticated users can create products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Allow sellers to update their own products
CREATE POLICY "Sellers can update own products"
ON public.products FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id);

-- Allow sellers to delete their own products
CREATE POLICY "Sellers can delete own products"
ON public.products FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);

-- ========================================
-- STEP 7: CREATE ORDERS POLICIES
-- ========================================
-- Users can view their own orders (as buyer or seller)
CREATE POLICY "Users can view their orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Authenticated users can create orders
CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- ========================================
-- STEP 8: CREATE USERS POLICIES
-- ========================================
-- Everyone can view users
CREATE POLICY "Anyone can view users"
ON public.users FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ========================================
-- STEP 9: CREATE BANNERS POLICIES
-- ========================================
-- Everyone can view active banners
CREATE POLICY "Anyone can view banners"
ON public.banners FOR SELECT
USING (true);

-- ========================================
-- STEP 10: CREATE TRIGGER FOR NEW USERS
-- ========================================
-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'user'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 11: STORAGE POLICIES (for 'products' bucket)
-- ========================================
-- Note: You must create the 'products' bucket manually in Storage UI first!
-- Make sure to set it as PUBLIC when creating it

-- Allow public to view images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to update
CREATE POLICY "Authenticated can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- ========================================
-- STEP 12: INSERT SAMPLE DATA (OPTIONAL)
-- ========================================
-- You can uncomment these to add sample banners
-- INSERT INTO public.banners (image_url, active) VALUES
--   ('/banner1.png', true),
--   ('/banner2.png', true),
--   ('/banner3.png', true);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify everything is set up correctly

-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check storage policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects';

-- Success message
SELECT 'Setup complete! Now create the "products" bucket in Storage (make it PUBLIC)' as message;
