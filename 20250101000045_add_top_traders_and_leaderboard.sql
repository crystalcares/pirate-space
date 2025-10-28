/*
          # [Operation Name]
          Create Top Traders table and Leaderboard function

          ## Query Description: "This migration adds a new 'top_traders' table for manually managing a leaderboard, sets up a corresponding 'trader_avatars' storage bucket with security policies, and creates a 'get_top_users_by_volume' function to dynamically rank users by their completed exchange volume. This is a structural change and is non-destructive to existing data."
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Adds table: `public.top_traders`
          - Adds function: `public.get_top_users_by_volume`
          - Adds storage bucket: `trader_avatars`
          - Adds RLS policies to `public.top_traders`
          - Adds Storage policies to `trader_avatars` bucket
          
          ## Security Implications:
          - RLS Status: Enabled on `public.top_traders`
          - Policy Changes: Yes, new policies for the new table and storage bucket.
          - Auth Requirements: Admin role is required for write access.
          
          ## Performance Impact:
          - Indexes: Primary key index on `top_traders`.
          - Triggers: None
          - Estimated Impact: Low. The new function aggregates data but is expected to be called infrequently on a dedicated page.
          */

-- 1. Create the new table for manually managed top traders
CREATE TABLE public.top_traders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    "order" INT NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    value TEXT NOT NULL,
    avatar_url TEXT
);

-- 2. Create a new storage bucket for trader avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('trader_avatars', 'trader_avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS on the new table
ALTER TABLE public.top_traders ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Public can read
CREATE POLICY "Allow public read access to top traders"
ON public.top_traders
FOR SELECT USING (TRUE);

-- Admins can do everything
CREATE POLICY "Allow admin full access to top traders"
ON public.top_traders
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 5. Create Storage Policies for the new bucket
CREATE POLICY "Allow public read access to trader avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'trader_avatars');

CREATE POLICY "Allow admin to upload trader avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'trader_avatars' AND public.is_admin(auth.uid()));

CREATE POLICY "Allow admin to update trader avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'trader_avatars' AND public.is_admin(auth.uid()));

CREATE POLICY "Allow admin to delete trader avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'trader_avatars' AND public.is_admin(auth.uid()));

-- 6. Add config key for leaderboard CTA
INSERT INTO public.app_config (key, value)
VALUES ('leaderboard_cta_text', 'View Leaderboard')
ON CONFLICT (key) DO NOTHING;

-- 7. Create function to get top users by volume (for the dynamic part of the leaderboard)
CREATE OR REPLACE FUNCTION get_top_users_by_volume()
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    total_volume NUMERIC,
    exchange_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as user_id,
        p.username,
        p.avatar_url,
        COALESCE(SUM(e.send_amount), 0) as total_volume,
        COUNT(e.id) as exchange_count
    FROM
        profiles p
    JOIN
        exchanges e ON p.id = e.user_id
    WHERE
        e.status = 'completed'
    GROUP BY
        p.id, p.username, p.avatar_url
    ORDER BY
        total_volume DESC
    LIMIT 10;
END;
$$;
