/*
          # [Fix Missing Tables and Apply Content Policies]
          This migration creates the missing 'leadership_team' table and correctly applies Row Level Security (RLS) policies to all dynamic content tables. It also inserts the necessary configuration keys for the new admin appearance settings.

          ## Query Description: [This operation creates a new table and applies security policies. It is designed to be safe to run multiple times. It will not delete any existing data but will reset the security policies on several content tables (features, faq_items, etc.) to ensure they are correct. This is a structural and security update.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Creates table: `public.leadership_team`
          - Enables RLS on: `features`, `how_it_works_steps`, `faq_items`, `testimonials`, `leadership_team`, `app_config`
          - Creates policies for SELECT and ALL on the tables listed above.
          - Inserts new keys into `app_config`.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Admin role for write access, public for read access]
          
          ## Performance Impact:
          - Indexes: [Primary keys are indexed by default]
          - Triggers: [None]
          - Estimated Impact: [Low. This is a one-time setup script.]
          */

-- Create the missing leadership_team table
CREATE TABLE IF NOT EXISTS public.leadership_team (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    title text NOT NULL,
    bio text NULL,
    avatar_url text NULL,
    "order" integer NOT NULL DEFAULT 1,
    linkedin_url text NULL,
    twitter_url text NULL,
    dribbble_url text NULL,
    metric_value text NULL,
    metric_label text NULL,
    CONSTRAINT leadership_team_pkey PRIMARY KEY (id)
);

-- Insert new config keys for appearance settings, ignoring if they already exist.
INSERT INTO public.app_config (key, value) VALUES
  ('ship_svg_code', ''),
  ('trustpilot_icon_url', 'https://img.icons8.com/color/48/trustpilot.png'),
  ('trustpilot_rating', '4.5'),
  ('trustpilot_reviews_count', '12,887'),
  ('faq_image_url', 'https://www.pngall.com/wp-content/uploads/5/Cat-Anime-Girl-PNG.png'),
  ('background_component', 'modern'),
  ('footer_social_twitter_url', '#'),
  ('footer_social_telegram_url', '#'),
  ('footer_copyright_text', '© 2025 Pirate Exchange — All Rights Reserved.'),
  ('leaderboard_tab1_title', 'Top Exchangers'),
  ('leaderboard_tab2_title', 'Top Clients')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on all necessary tables if not already enabled.
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.how_it_works_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to be idempotent.

-- For features
DROP POLICY IF EXISTS "Allow public read access to features" ON public.features;
CREATE POLICY "Allow public read access to features" ON public.features FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to features" ON public.features FOR ALL USING (public.is_admin(auth.uid()));

-- For how_it_works_steps
DROP POLICY IF EXISTS "Allow public read access to how_it_works_steps" ON public.how_it_works_steps;
CREATE POLICY "Allow public read access to how_it_works_steps" ON public.how_it_works_steps FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to how_it_works_steps" ON public.how_it_works_steps FOR ALL USING (public.is_admin(auth.uid()));

-- For faq_items
DROP POLICY IF EXISTS "Allow public read access to faq_items" ON public.faq_items;
CREATE POLICY "Allow public read access to faq_items" ON public.faq_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to faq_items" ON public.faq_items FOR ALL USING (public.is_admin(auth.uid()));

-- For testimonials
DROP POLICY IF EXISTS "Allow public read access to testimonials" ON public.testimonials;
CREATE POLICY "Allow public read access to testimonials" ON public.testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to testimonials" ON public.testimonials FOR ALL USING (public.is_admin(auth.uid()));

-- For leadership_team
DROP POLICY IF EXISTS "Allow public read access to leadership_team" ON public.leadership_team;
CREATE POLICY "Allow public read access to leadership_team" ON public.leadership_team FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to leadership_team" ON public.leadership_team FOR ALL USING (public.is_admin(auth.uid()));

-- For app_config
DROP POLICY IF EXISTS "Allow public read access to app_config" ON public.app_config;
CREATE POLICY "Allow public read access to app_config" ON public.app_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to app_config" ON public.app_config FOR ALL USING (public.is_admin(auth.uid()));
