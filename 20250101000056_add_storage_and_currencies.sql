/*
          # [Create Storage Buckets and Currency Table]
          This migration sets up the necessary storage infrastructure and creates a new table for managing currencies dynamically.

          ## Query Description: [This script creates five storage buckets: `site_assets`, `avatars`, `qrcodes`, `leaderboard_avatars`, and `leadership_avatars`. It also establishes security policies for each bucket, allowing public read access and restricting write access to authorized users (admins or the user themselves for their own avatar). Additionally, it creates and populates a new `currencies` table to manage crypto and fiat options dynamically. This is a foundational and non-destructive setup.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - **New Buckets:** `site_assets`, `avatars`, `qrcodes`, `leaderboard_avatars`, `leadership_avatars`
          - **New Table:** `public.currencies` (id, name, symbol, icon_url, type, created_at)
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Admin or authenticated user, depending on the policy]
          - **Description:** Adds RLS policies to all new buckets and the `currencies` table to enforce proper access control.
          
          ## Performance Impact:
          - Indexes: [Primary key index added to `currencies`]
          - Triggers: [None]
          - Estimated Impact: [Low. Adds new structures without modifying existing high-traffic tables.]
          */

-- 1. Create Storage Buckets
-- These buckets are required by various parts of the application for storing images and assets.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('site_assets', 'site_assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml']),
    ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg']),
    ('qrcodes', 'qrcodes', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml']),
    ('leaderboard_avatars', 'leaderboard_avatars', true, 5242880, ARRAY['image/png', 'image/jpeg']),
    ('leadership_avatars', 'leadership_avatars', true, 5242880, ARRAY['image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- 2. Create Storage Policies
-- Secure the buckets by defining who can read, write, update, and delete files.

-- Allow public read access to all buckets
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (true);

-- Allow authenticated users to manage their own avatars in the 'avatars' bucket
CREATE POLICY "User can manage own avatar" ON storage.objects
FOR ALL
USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid)
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow admins to manage all other asset buckets
CREATE POLICY "Admins can manage asset buckets" ON storage.objects
FOR ALL
USING (public.is_admin(auth.uid()) AND bucket_id IN ('site_assets', 'qrcodes', 'leaderboard_avatars', 'leadership_avatars'))
WITH CHECK (public.is_admin(auth.uid()) AND bucket_id IN ('site_assets', 'qrcodes', 'leaderboard_avatars', 'leadership_avatars'));

-- 3. Create Currencies Table
-- This table will store all crypto and fiat currencies available for exchange.
CREATE TABLE IF NOT EXISTS public.currencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    symbol TEXT NOT NULL UNIQUE,
    icon_url TEXT,
    type TEXT NOT NULL CHECK (type IN ('crypto', 'fiat')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Enable RLS and Create Policies for Currencies Table
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read currencies" ON public.currencies;
CREATE POLICY "Public can read currencies" ON public.currencies
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage currencies" ON public.currencies;
CREATE POLICY "Admins can manage currencies" ON public.currencies
FOR ALL USING (public.is_admin(auth.uid()));

-- 5. Seed the Currencies Table
-- Populate the table with the initial set of currencies from the old hardcoded list.
INSERT INTO public.currencies (name, symbol, type, icon_url) VALUES
    ('Bitcoin', 'BTC', 'crypto', 'https://img.icons8.com/fluency/96/bitcoin.png'),
    ('Ethereum', 'ETH', 'crypto', 'https://img.icons8.com/fluency/96/ethereum.png'),
    ('Solana', 'SOL', 'crypto', 'https://img.icons8.com/fluency/96/solana.png'),
    ('Litecoin', 'LTC', 'crypto', 'https://img.icons8.com/fluency/96/litecoin.png'),
    ('Tether', 'USDT', 'crypto', 'https://img.icons8.com/fluency/96/tether.png'),
    ('Dogecoin', 'DOGE', 'crypto', 'https://img.icons8.com/fluency/96/dogecoin.png'),
    ('USD Coin', 'USDC', 'crypto', 'https://seeklogo.com/images/U/usd-coin-usdc-logo-CB4C38B395-seeklogo.com.png'),
    ('Polygon', 'MATIC', 'crypto', 'https://img.icons8.com/fluency/96/polygon.png'),
    ('Monero', 'XMR', 'crypto', 'https://img.icons8.com/fluency/96/monero.png'),
    ('Theta', 'THETA', 'crypto', 'https://img.icons8.com/fluency/96/theta.png'),
    ('Tron', 'TRX', 'crypto', 'https://img.icons8.com/fluency/96/tron.png'),
    ('Indian Rupee', 'INR', 'fiat', 'https://img.icons8.com/color/96/india-circular.png'),
    ('US Dollar', 'USD', 'fiat', 'https://img.icons8.com/fluency/96/us-dollar-circled.png'),
    ('Euro', 'EUR', 'fiat', 'https://img.icons8.com/fluency/96/euro-pound-exchange.png')
ON CONFLICT (symbol) DO NOTHING;
