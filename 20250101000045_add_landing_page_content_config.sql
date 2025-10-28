/*
# [Data] Add Landing Page Content Configuration
This migration adds new key-value pairs to the `app_config` table to allow for dynamic management of the landing page content from the admin panel.

## Query Description: 
This operation inserts multiple rows into the `app_config` table. It uses an `ON CONFLICT` clause to prevent errors if the keys already exist, updating the value instead. This makes the script safe to re-run. No existing data is at risk of being lost.

## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (can be reversed by deleting the inserted keys)

## Structure Details:
- Table: `public.app_config`
- Columns affected: `key`, `value`

## Security Implications:
- RLS Status: Enabled (as per existing policies)
- Policy Changes: No
- Auth Requirements: Admin privileges required to write to this table.

## Performance Impact:
- Indexes: Uses the primary key on `key`.
- Triggers: None.
- Estimated Impact: Negligible.
*/
INSERT INTO public.app_config (key, value) VALUES
('site_name', 'Pirate.Exchange'),
('hero_badge', 'Trade Like a Captain'),
('hero_title', 'The Pirate Way to Exchange.'),
('hero_subtitle', 'Your trusted port for P2P crypto trading. Secure, swift, and anonymous. Exchange Bitcoin, Ethereum, and other digital treasures.'),
('hero_cta1_text', 'Exchange Now'),
('hero_cta2_text', 'Join Discord'),
('features_title', 'A New Standard for Digital Exchange'),
('features_subtitle', 'We''ve built a platform that''s simple, secure, and puts you first.'),
('calculator_title', 'Crypto Exchange'),
('calculator_subtitle', 'Free from sign-up, limits, complications.'),
('top_traders_title', 'Hall of Captains'),
('top_traders_subtitle', 'Meet the most legendary traders sailing the crypto seas with us.'),
('testimonials_title', 'What Our Traders Say'),
('testimonials_subtitle', 'Hear from pirates who have successfully navigated the treacherous waters of P2P trading with us.'),
('how_it_works_title', 'Get Started in Minutes'),
('how_it_works_subtitle', 'Trading has never been this straightforward. Follow these simple steps.'),
('faq_title', 'Frequently Asked Questions'),
('faq_subtitle', 'Have questions? We''ve got answers. If you need more help, feel free to join our Discord.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
