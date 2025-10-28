/*
# [CRITICAL] Fix Function Dependencies and Secure Admin Function
This migration script resolves a critical database error by correctly managing dependencies on the `is_admin` function. It drops all policies that rely on this function, recreates the function with an explicit `search_path` to enhance security, and then reinstates consolidated, clearer admin policies for all relevant tables and storage buckets.

## Query Description:
- **IMPACT**: This operation will temporarily drop Row Level Security (RLS) policies for administrators across numerous tables. While the script immediately recreates them, there is a brief moment during execution where these specific admin checks are not in place.
- **RISK**: Low. The entire operation is atomic. If any part fails, the whole process is rolled back, leaving the database state unchanged.
- **SAFETY**: It is safe to run this script. It is designed to fix a blocking error and improve security.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: false

## Structure Details:
- **Dropped**: Multiple RLS policies across ~16 tables and `storage.objects`. The `public.is_admin(uuid)` function.
- **Created/Recreated**: A new `public.is_admin(uuid)` function with `SET search_path`. Consolidated "Admin full access" policies for all managed tables and storage buckets.

## Security Implications:
- RLS Status: RLS policies are dropped and recreated.
- Policy Changes: Yes. Consolidates multiple, sometimes redundant, admin policies into a single, clear policy per table.
- Auth Requirements: Fixes the `is_admin` function, which is central to admin authorization. The new function is more secure against search path hijacking attacks.

## Performance Impact:
- Indexes: None.
- Triggers: None.
- Estimated Impact: Negligible. This is a structural change with no impact on query performance.
*/

-- Step 1: Drop all known dependent policies to resolve the dependency lock.
-- We use IF EXISTS to prevent errors if a policy has already been removed or renamed.

-- Drop policies on public tables
DROP POLICY IF EXISTS "Admins can manage app config." ON public.app_config;
DROP POLICY IF EXISTS "Admins can manage exchange pairs." ON public.exchange_pairs;
DROP POLICY IF EXISTS "Admins can manage features" ON public.features;
DROP POLICY IF EXISTS "Allow admin write access to features" ON public.features;
DROP POLICY IF EXISTS "Admins can manage steps" ON public.how_it_works_steps;
DROP POLICY IF EXISTS "Allow admin write access to how_it_works_steps" ON public.how_it_works_steps;
DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faq_items;
DROP POLICY IF EXISTS "Allow admin write access to faq_items" ON public.faq_items;
DROP POLICY IF EXISTS "Allow admin full access" ON public.payment_methods;
DROP POLICY IF EXISTS "Admins can manage roles." ON public.roles;
DROP POLICY IF EXISTS "Admins can manage user_roles." ON public.user_roles;
DROP POLICY IF EXISTS "Allow admin full access" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin select access on exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin to update exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin to delete exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admins full access" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admins to delete exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access to top traders" ON public.top_traders;
DROP POLICY IF EXISTS "Allow admin write access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin to manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin insert on table testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin update on table testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin delete on table testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow full access for admins on table testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin full access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin full access on market_data" ON public.market_data;
DROP POLICY IF EXISTS "Allow admin full access to market_data" ON public.market_data;
DROP POLICY IF EXISTS "Admins can manage market data" ON public.market_data;
DROP POLICY IF EXISTS "Allow admin full access on top_exchanges" ON public.top_exchanges;
DROP POLICY IF EXISTS "Allow admin write access to top exchangers" ON public.top_exchanges;
DROP POLICY IF EXISTS "Admins can manage currencies" ON public.currencies;
DROP POLICY IF EXISTS "Allow admin write access to leadership_team" ON public.leadership_team;

-- Drop policies on storage.objects
DROP POLICY IF EXISTS "Admins can manage qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can insert into qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update in qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete from qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to upload trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to update trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to delete trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to upload top trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to update top trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to delete top trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can insert trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can insert into top_trader_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update in top_trader_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete from top_trader_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin inserts on leadership avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin updates on leadership avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes on leadership avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin insert on partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update on partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete on partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin management of testimonial avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin write access to top exchanger avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage asset buckets" ON storage.objects;

-- Step 2: Drop the problematic function
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Step 3: Recreate the is_admin function with security best practices (search_path)
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user has the 'admin' role
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name = 'admin'
  );
END;
$$;

-- Step 4: Recreate consolidated policies for all tables
-- This ensures admins have full control where needed, simplifying the RLS setup.

DO $$
DECLARE
    table_name TEXT;
    tables_list TEXT[] := ARRAY[
        'app_config', 'currencies', 'exchange_pairs', 'exchanges', 'faq_items', 
        'features', 'how_it_works_steps', 'leadership_team', 'payment_methods', 
        'profiles', 'roles', 'testimonials', 'top_exchanges', 'top_traders', 'user_roles'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_list
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
        EXECUTE format('CREATE POLICY "Admin full access" ON public.%I FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));', table_name);
    END LOOP;
END $$;

-- Re-enable RLS and create admin policy for market_data if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'market_data') THEN
        ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Admin full access" ON public.market_data FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
    END IF;
END $$;


-- Step 5: Recreate consolidated policies for storage buckets
-- This ensures admins have full control over specific buckets.

DO $$
DECLARE
    bucket_name TEXT;
    buckets_list TEXT[] := ARRAY[
        'qrcodes', 'site_assets', 'leadership_avatars', 
        'testimonial_avatars', 'top_trader_avatars', 'partner_logos'
    ];
BEGIN
    FOREACH bucket_name IN ARRAY buckets_list
    LOOP
        EXECUTE format('CREATE POLICY "Admin full access on %I bucket" ON storage.objects FOR ALL USING (bucket_id = %L AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = %L AND public.is_admin(auth.uid()));', bucket_name, bucket_name, bucket_name);
    END LOOP;
END $$;
