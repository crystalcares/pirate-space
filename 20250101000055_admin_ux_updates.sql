/*
          # [Admin UX and Content Updates]
          This migration adds new tables, storage buckets, and configuration options to support enhanced admin customization features. It creates a new manually-managed 'top_exchangers' leaderboard, a bucket for their avatars, and adds new configuration keys for theme and content settings.

          ## Query Description: [This operation is structural and adds new capabilities. It creates a new table 'top_exchangers', a new storage bucket 'top_exchanger_avatars', and inserts several new keys into the 'app_config' table. It is safe to run and does not affect existing data, but it is required for the new admin features to function correctly.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Data"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Adds table: `public.top_exchangers`
          - Adds storage bucket: `top_exchanger_avatars`
          - Adds RLS policies to `public.top_exchangers`
          - Adds storage policies to `top_exchanger_avatars`
          - Inserts new keys into `public.app_config`: `trustpilot_brand_name`, `ship_image_url`, `leaderboard_tab1_title`, `leaderboard_tab2_title`.
          
          ## Security Implications:
          - RLS Status: [Enabled] on the new table.
          - Policy Changes: [Yes] - new policies are added for the new table and bucket.
          - Auth Requirements: [Admin role required for write access to new resources.]
          
          ## Performance Impact:
          - Indexes: [Primary key index added on new table.]
          - Triggers: [No]
          - Estimated Impact: [Low. Adds new structures without modifying existing high-traffic tables.]
          */

-- 1. Create top_exchangers table (similar to top_traders)
CREATE TABLE IF NOT EXISTS public.top_exchangers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    title text NOT NULL,
    volume numeric NOT NULL,
    "order" integer NOT NULL,
    avatar_url text
);

ALTER TABLE public.top_exchangers OWNER TO postgres;
ALTER TABLE ONLY public.top_exchangers ADD CONSTRAINT top_exchangers_pkey PRIMARY KEY (id);

-- 2. Enable RLS and add policies for top_exchangers
ALTER TABLE public.top_exchangers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to top exchangers" ON public.top_exchangers;
CREATE POLICY "Allow public read access to top exchangers" ON public.top_exchangers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write access to top exchangers" ON public.top_exchangers;
CREATE POLICY "Allow admin write access to top exchangers" ON public.top_exchangers FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 3. Create storage bucket for top exchanger avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('top_exchanger_avatars', 'top_exchanger_avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 4. Add policies for the new storage bucket
DROP POLICY IF EXISTS "Allow public read access to top exchanger avatars" ON storage.objects;
CREATE POLICY "Allow public read access to top exchanger avatars" ON storage.objects FOR SELECT USING (bucket_id = 'top_exchanger_avatars');

DROP POLICY IF EXISTS "Allow admin write access to top exchanger avatars" ON storage.objects;
CREATE POLICY "Allow admin write access to top exchanger avatars" ON storage.objects FOR ALL USING (bucket_id = 'top_exchanger_avatars' AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = 'top_exchanger_avatars' AND public.is_admin(auth.uid()));

-- 5. Insert new configuration keys
INSERT INTO public.app_config (key, value) VALUES
    ('trustpilot_brand_name', 'Trustpilot'),
    ('ship_image_url', ''),
    ('leaderboard_tab1_title', 'Top Exchangers'),
    ('leaderboard_tab2_title', 'Top Clients')
ON CONFLICT (key) DO NOTHING;
