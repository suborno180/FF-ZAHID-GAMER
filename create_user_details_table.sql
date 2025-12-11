-- Create user_details table
CREATE TABLE IF NOT EXISTS user_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    whatsapp TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own details" ON user_details;
DROP POLICY IF EXISTS "Users can insert own details" ON user_details;
DROP POLICY IF EXISTS "Users can update own details" ON user_details;
DROP POLICY IF EXISTS "Users can delete own details" ON user_details;
DROP POLICY IF EXISTS "Admin can view all details" ON user_details;
DROP POLICY IF EXISTS "Admin can view all user details" ON user_details;

-- Allow users to read their own details
CREATE POLICY "Users can view own details"
    ON user_details
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow admin to view all user details
CREATE POLICY "Admin can view all user details"
    ON user_details
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_details 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Allow users to insert their own details
CREATE POLICY "Users can insert own details"
    ON user_details
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own details
CREATE POLICY "Users can update own details"
    ON user_details
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own details
CREATE POLICY "Users can delete own details"
    ON user_details
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_details_user_id ON user_details(user_id);
