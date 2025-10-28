/*
          # [Operation Name]
          Add About Us Page Content Configuration

          ## Query Description: [This operation adds new configuration keys to the `app_config` table to store the content for the new "About Us" page. It will insert default placeholder values for the title, subtitle, main content, and an image URL. This is a non-destructive operation and will not affect existing data. If the keys already exist, it will do nothing.]
          
          ## Metadata:
          - Schema-Category: ["Data"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Table: `app_config`
          - Columns Affected: `key`, `value`
          - Rows to be added: 4
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [No]
          - Auth Requirements: [Admin privileges to write to `app_config`]
          
          ## Performance Impact:
          - Indexes: [No change]
          - Triggers: [No change]
          - Estimated Impact: [Negligible. A few rows will be added to a configuration table.]
          */

INSERT INTO public.app_config (key, value)
VALUES
    ('about_title', 'Our Voyage'),
    ('about_subtitle', 'The crew behind the compass.'),
    ('about_main_content', 'Founded in the digital mists of 2025, Pirate.Exchange was born from a simple creed: that the exchange of digital treasures should be as free as the open sea. Our crew, a motley assembly of veteran developers, security experts, and crypto-enthusiasts, grew tired of the centralized galleons and their hefty tolls. We envisioned a new kind of port, a decentralized haven where traders could meet, barter, and exchange value with the assurance of security and the freedom of anonymity. We are more than a platform; we are a community of digital buccaneers charting a new course in the world of finance. Our compass is set by our users, and our map is drawn by the principles of freedom, security, and decentralization. Join our voyage and be part of the legend.'),
    ('about_image_url', 'https://i.ibb.co/6yTzBym/pirate-crew.png')
ON CONFLICT (key) DO NOTHING;
