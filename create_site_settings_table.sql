-- Create site_settings table for storing global settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Anyone can read site settings"
ON public.site_settings
FOR SELECT
TO public
USING (true);

-- Only admins can insert/update/delete settings
CREATE POLICY "Only admins can modify site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Insert default account information message
INSERT INTO public.site_settings (key, value)
VALUES (
    'account_info_message',
    '✅ Verified and secure account
✅ Instant delivery after payment
✅ Full account access provided
✅ 24/7 customer support'
)
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.site_settings IS 'Stores global site settings like account info message';
