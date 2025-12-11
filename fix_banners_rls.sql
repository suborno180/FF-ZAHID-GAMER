-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can view all banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can update banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON public.banners;

-- Temporarily disable RLS to test (you can re-enable later with proper policies)
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, use these simpler policies:

-- Re-enable RLS
-- ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can view all banners (for testing)
-- CREATE POLICY "Anyone can view banners"
-- ON public.banners
-- FOR SELECT
-- USING (true);

-- Create policy: Authenticated users can insert banners
-- CREATE POLICY "Authenticated users can insert banners"
-- ON public.banners
-- FOR INSERT
-- WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy: Authenticated users can update banners
-- CREATE POLICY "Authenticated users can update banners"
-- ON public.banners
-- FOR UPDATE
-- USING (auth.uid() IS NOT NULL);

-- Create policy: Authenticated users can delete banners
-- CREATE POLICY "Authenticated users can delete banners"
-- ON public.banners
-- FOR DELETE
-- USING (auth.uid() IS NOT NULL);
