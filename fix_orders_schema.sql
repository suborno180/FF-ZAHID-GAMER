-- Fix orders table schema for payment integration
-- This will work regardless of which schema you currently have

-- Option 1: If you have product_price, add total_price as an alias
DO $$ 
BEGIN
    -- Add total_price if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'total_price'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN total_price NUMERIC(10,2);
        -- Copy data from product_price if it exists
        UPDATE public.orders SET total_price = product_price WHERE product_price IS NOT NULL;
    END IF;

    -- Add payment_status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;

    -- Add transaction_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'transaction_id'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN transaction_id TEXT;
    END IF;

    -- Make buyer columns optional if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'buyer_name' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.orders ALTER COLUMN buyer_name DROP NOT NULL;
        ALTER TABLE public.orders ALTER COLUMN buyer_phone DROP NOT NULL;
        ALTER TABLE public.orders ALTER COLUMN buyer_whatsapp DROP NOT NULL;
        ALTER TABLE public.orders ALTER COLUMN product_title DROP NOT NULL;
    END IF;
END $$;

-- Add constraint for payment_status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_payment_status_check'
    ) THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT orders_payment_status_check 
        CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled'));
    END IF;
END $$;
