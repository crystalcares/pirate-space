/*
          # [Fix & Setup] Full Content and Theme Configuration
          [This script corrects a syntax error in the previous migration and ensures all tables, policies, and configurations for admin-editable content are correctly set up. It creates the 'leadership_team' table, applies correct RLS policies to all content tables, and inserts default values for the new theme and content settings.]

          ## Query Description: [This operation is designed to be safe to re-run. It will drop and recreate several security policies for content management and insert configuration data. It checks for the existence of tables before creating them to avoid errors.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Data"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Creates table: `leadership_team` (if not exists)
          - Enables RLS on: `features`, `how_it_works_steps`, `faq_items`, `testimonials`, `leadership_team`
          - Drops and recreates policies on the tables listed above.
          - Inserts/updates rows in `app_config`.
          
          ## Security Implications:
          - RLS Status: Enabled on multiple tables
          - Policy Changes: Yes, policies are reset to allow public read and admin write.
          - Auth Requirements: Admin privileges are required to write to these tables.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Low. This is a one-time setup script.
          */

-- 1. Create leadership_team table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.leadership_team (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    title text NOT NULL,
    bio text,
    avatar_url text,
    "order" integer NOT NULL,
    linkedin_url text,
    twitter_url text,
    dribbble_url text,
    metric_value text,
    metric_label text
);
COMMENT ON TABLE public.leadership_team IS 'Stores information about the company leadership team.';


-- 2. Insert default configuration values for all new settings
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
    ('leaderboard_tab2_title', 'Top Clients'),
    ('about_us_hero_title', 'We Are Pirate Exchange'),
    ('about_us_hero_subtitle', 'Providing you with the most actionable exchange data.'),
    ('about_us_hero_paragraph1', 'Publishers need to know what apps to build, how to monetize them, and where to price them. Advertisers and brands need to identify their target users, and determine where to allocate resources in order to reach them most effectively.'),
    ('about_us_hero_paragraph2', 'In business, we need data to make informed decisions. Pirate Exchange provides the most actionable insights in the industry. We aim to make this data available to as many people as possible.'),
    ('about_us_leadership_title', 'Meet Our Leadership')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- 3. Apply RLS policies to all content tables
-- Note: Using correct DROP POLICY syntax now.

-- For features
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to features" ON public.features;
CREATE POLICY "Allow public read access to features" ON public.features FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to features" ON public.features;
CREATE POLICY "Allow admin write access to features" ON public.features FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- For how_it_works_steps
ALTER TABLE public.how_it_works_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to how_it_works_steps" ON public.how_it_works_steps;
CREATE POLICY "Allow public read access to how_it_works_steps" ON public.how_it_works_steps FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to how_it_works_steps" ON public.how_it_works_steps;
CREATE POLICY "Allow admin write access to how_it_works_steps" ON public.how_it_works_steps FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- For faq_items
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to faq_items" ON public.faq_items;
CREATE POLICY "Allow public read access to faq_items" ON public.faq_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to faq_items" ON public.faq_items;
CREATE POLICY "Allow admin write access to faq_items" ON public.faq_items FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- For testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to testimonials" ON public.testimonials;
CREATE POLICY "Allow public read access to testimonials" ON public.testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to testimonials" ON public.testimonials;
CREATE POLICY "Allow admin write access to testimonials" ON public.testimonials FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- For leadership_team
ALTER TABLE public.leadership_team ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to leadership_team" ON public.leadership_team;
CREATE POLICY "Allow public read access to leadership_team" ON public.leadership_team FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to leadership_team" ON public.leadership_team;
CREATE POLICY "Allow admin write access to leadership_team" ON public.leadership_team FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
