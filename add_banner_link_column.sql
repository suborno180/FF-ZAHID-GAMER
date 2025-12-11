-- Add link column to banners table
ALTER TABLE banners ADD COLUMN IF NOT EXISTS link TEXT;

-- Add comment
COMMENT ON COLUMN banners.link IS 'Optional URL link for the banner (internal or external)';
