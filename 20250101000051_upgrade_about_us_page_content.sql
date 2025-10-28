/*
# [Operation Name]
Upgrade About Us Page Content Structure

## Query Description: [This operation adds new configuration keys to the `app_config` table to support a more detailed and dynamic "About Us" page. It includes fields for a mission statement, three core values (with icons, titles, and descriptions), and a call-to-action section. Default values are provided to ensure the page is populated immediately after migration. This is a non-destructive operation.]

## Metadata:
- Schema-Category: ["Data"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Table: `public.app_config`
- Action: `INSERT`
- Rows Added: 11

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [Admin privileges to write to `app_config` table]

## Performance Impact:
- Indexes: [No change]
- Triggers: [No change]
- Estimated Impact: [Negligible. Inserts a few rows into a small configuration table.]
*/

-- Add new configuration keys for the enhanced About Us page
INSERT INTO public.app_config (key, value)
VALUES
    ('about_us_mission_title', 'Our Pirate Code'),
    ('about_us_mission_subtitle', 'We sail by a code that ensures fairness, freedom, and fortune for all who dare to trade with us.'),
    ('about_us_core_value_1_icon', 'ShieldCheck'),
    ('about_us_core_value_1_title', 'Ironclad Security'),
    ('about_us_core_value_1_description', 'Your assets are your own. We never take custody of your funds, providing a truly P2P experience fortified by robust security protocols.'),
    ('about_us_core_value_2_icon', 'Zap'),
    ('about_us_core_value_2_title', 'Swift & Anonymous'),
    ('about_us_core_value_2_description', 'Trade like a shadow in the night. Our platform is built for speed and privacy, letting you exchange assets without a trace.'),
    ('about_us_core_value_3_icon', 'Anchor'),
    ('about_us_core_value_3_title', 'Unyielding Reliability'),
    ('about_us_core_value_3_description', 'Our ship is built to weather any storm. Count on us for a stable and reliable trading experience, no matter the market conditions.'),
    ('about_us_cta_title', 'Ready to Hoist the Colors?'),
    ('about_us_cta_subtitle', 'Join our crew and start trading the pirate way. Your next treasure awaits.')
ON CONFLICT (key) DO NOTHING;
