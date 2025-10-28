/*
# [Feature] Add Theme & Content Settings
This migration adds extensive customization options for the site's appearance and dynamic content, managed through the `app_config` table. It also ensures that all public-facing content tables have the correct Row Level Security (RLS) policies for read access.

## Query Description:
This script performs the following actions:
1.  **Inserts New Configuration Keys**: Adds new keys to the `app_config` table for managing the ship icon, Trustpilot widget, FAQ image, background style, leaderboard titles, and footer content. It uses `ON CONFLICT DO NOTHING` to prevent errors if keys already exist.
2.  **Enables RLS on Content Tables**: Enables Row Level Security for `features`, `how_it_works_steps`, `faq_items`, and `testimonials` tables to enforce access control.
3.  **Applies Public Read Policies**: Creates policies that allow anyone to read data from the content tables (`features`, `how_it_works_steps`, `faq_items`, `testimonials`, `leadership_team`). It uses `DROP POLICY IF EXISTS` to ensure the script can be run multiple times without errors. This will fix any "failed to load" issues for public content.

- **Data Impact**: No data will be lost. Default values are added for new settings. Existing settings are untouched.
- **Risks**: Low. The changes are additive and policies are applied safely.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (Can be reversed by deleting the keys and policies)

## Structure Details:
- **Tables Affected**: `app_config`, `features`, `how_it_works_steps`, `faq_items`, `testimonials`, `leadership_team`
- **Operations**: `INSERT`, `ALTER TABLE`, `CREATE POLICY`

## Security Implications:
- RLS Status: Enabled on multiple content tables.
- Policy Changes: Yes. Adds public read policies to ensure site content is visible to all visitors. This is crucial for the landing page and about us page to function correctly.
- Auth Requirements: None for the policies being created (public access).

## Performance Impact:
- Indexes: None.
- Triggers: None.
- Estimated Impact: Negligible. RLS checks have minimal overhead for simple `USING (true)` policies.
*/

-- 1. Add new keys to app_config for theme and content customization
INSERT INTO public.app_config (key, value)
VALUES
    ('ship_svg_code', '<g transform="translate(50, 100) scale(1.2) rotate(10)" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"><path d="M 50 300 C 100 320, 250 320, 300 300 L 280 280 L 70 280 Z" /><path d="M 70 280 L 280 280 L 270 260 L 80 260 Z" fill="hsl(var(--primary) / 0.1)" /><line x1="175" y1="280" x2="175" y2="100" /><path d="M 180 120 C 250 150, 250 220, 180 250 Z" fill="hsl(var(--primary) / 0.2)" /><path d="M 170 150 C 100 170, 100 220, 170 240 Z" fill="hsl(var(--primary) / 0.1)" /></g>'),
    ('trustpilot_icon_url', 'https://img.icons8.com/color/48/trustpilot.png'),
    ('trustpilot_rating', '4.5'),
    ('trustpilot_reviews_count', '12,887'),
    ('faq_image_url', 'https://www.pngall.com/wp-content/uploads/5/Cat-Anime-Girl-PNG.png'),
    ('leaderboard_tab1_title', 'Top Exchangers'),
    ('leaderboard_tab2_title', 'Top Clients'),
    ('background_component', 'modern'),
    ('footer_social_twitter_url', 'https://x.com/'),
    ('footer_social_telegram_url', 'https://t.me/'),
    ('footer_copyright_text', '© 2025 Pirate Exchange — All Rights Reserved.')
ON CONFLICT (key) DO NOTHING;

-- 2. Enable RLS and add public read policies for all public content tables

-- Features Table
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.features;
CREATE POLICY "Allow public read access" ON public.features FOR SELECT USING (true);

-- How It Works Steps Table
ALTER TABLE public.how_it_works_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.how_it_works_steps;
CREATE POLICY "Allow public read access" ON public.how_it_works_steps FOR SELECT USING (true);

-- FAQ Items Table
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.faq_items;
CREATE POLICY "Allow public read access" ON public.faq_items FOR SELECT USING (true);

-- Testimonials Table
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.testimonials;
CREATE POLICY "Allow public read access" ON public.testimonials FOR SELECT USING (true);

-- Leadership Team Table (re-asserting to be safe and fix loading issues)
ALTER TABLE public.leadership_team ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.leadership_team;
CREATE POLICY "Allow public read access" ON public.leadership_team FOR SELECT USING (true);
