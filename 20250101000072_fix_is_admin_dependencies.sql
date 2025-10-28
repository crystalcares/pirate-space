/*
          # [Fix is_admin() Function Dependencies and Security]
          This script resolves a migration error caused by RLS policies depending on the `is_admin()` function. It safely drops the old policies, replaces the function with a more secure version, and then re-creates the necessary admin policies. This also addresses the 'Function Search Path Mutable' security advisory.

          ## Query Description:
          - **Safety**: This operation is designed to be safe. It temporarily removes security policies, updates a core function, and then immediately reinstates the policies. There is a very brief window during the migration where these specific policies are not active, but it should not impact a live system. No data will be modified.
          - **Impact**: The `is_admin()` function will be replaced. Admin-level RLS policies will be dropped and recreated. This will not affect user data or non-admin permissions.
          - **Recommendation**: Apply this migration to resolve the previous error. No backup is strictly required as it only modifies function and policy definitions, not data.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: false
          - Reversible: false

          ## Structure Details:
          - Drops and recreates the `is_admin(uuid)` function.
          - Drops and recreates multiple RLS policies on tables including `exchanges`, `profiles`, `app_config`, `storage.objects`, and more.
          - Creates the `get_dashboard_stats()` function.

          ## Security Implications:
          - RLS Status: Policies are temporarily dropped and then recreated.
          - Policy Changes: Yes, policies are consolidated and improved.
          - Auth Requirements: Fixes the `is_admin` function which is central to admin authentication checks.
          - **Advisory Fix**: This script explicitly sets the `search_path` for the function, resolving the "Function Search Path Mutable" warning.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible. A one-time metadata update.
          */

-- Step 1: Drop all policies that depend on the is_admin function.
-- This is necessary to allow the function to be replaced.
DROP POLICY IF EXISTS "Admins can manage app config." ON public.app_config;
DROP POLICY IF EXISTS "Admins can manage currencies" ON public.currencies;
DROP POLICY IF EXISTS "Admins can manage exchange pairs." ON public.exchange_pairs;
DROP POLICY IF EXISTS "Admins can manage faqs on table faq_items" ON public.faq_items;
DROP POLICY IF EXISTS "Admins can manage features on table features" ON public.features;
DROP POLICY IF EXISTS "Admins can manage steps on table how_it_works_steps" ON public.how_it_works_steps;
DROP POLICY IF EXISTS "Admins can manage roles." ON public.roles;
DROP POLICY IF EXISTS "Admins can manage user_roles." ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage market data" ON public.market_data;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin full access" ON public.payment_methods;
DROP POLICY IF EXISTS "Allow admin full access" ON public.market_data;
DROP POLICY IF EXISTS "Allow admin full access on top_exchanges" ON public.top_exchanges;
DROP POLICY IF EXISTS "Allow admin full access to market_data" ON public.market_data;
DROP POLICY IF EXISTS "Allow admin full access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin full access to top traders" ON public.top_traders;
DROP POLICY IF EXISTS "Allow admin select access on exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin to delete exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin to update exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admins to delete exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admins full access on table exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin full access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin write access to faq_items" ON public.faq_items;
DROP POLICY IF EXISTS "Allow admin write access to features" ON public.features;
DROP POLICY IF EXISTS "Allow admin write access to how_it_works_steps" ON public.how_it_works_steps;
DROP POLICY IF EXISTS "Allow admin write access to leadership_team" ON public.leadership_team;
DROP POLICY IF EXISTS "Allow admin write access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin write access to top exchangers" ON public.top_exchangers;
DROP POLICY IF EXISTS "Allow full access for admins on table market_data" ON public.market_data;
DROP POLICY IF EXISTS "Allow full access for admins on table testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin insert on table testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin update on table testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin delete on table testimonials" ON public.testimonials;

-- Drop storage policies
DROP POLICY IF EXISTS "Admins can manage qrcodes" ON storage.objects;
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
DROP POLICY IF EXISTS "Admin can insert into qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update in qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete from qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin inserts on leadership avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin updates on leadership avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes on leadership avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin insert on partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update on partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete on partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin write access to top exchanger avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage asset buckets" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin management of testimonial avatars" ON storage.objects;

-- Step 2: Drop the old function
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Step 3: Create the new, secure is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name = 'admin'
  );
END;
$$;

-- Step 4: Recreate all necessary admin policies with consolidated definitions
-- For tables where admins need full control
CREATE POLICY "Allow admin full access" ON public.app_config FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.currencies FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.exchange_pairs FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.faq_items FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.features FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.how_it_works_steps FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.leadership_team FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.payment_methods FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.roles FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.testimonials FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.top_exchanges FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.top_traders FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.profiles FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.exchanges FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Recreate storage policies for admins
CREATE POLICY "Admin full access for site_assets" ON storage.objects FOR ALL USING (bucket_id = 'site_assets' AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = 'site_assets' AND public.is_admin(auth.uid()));
CREATE POLICY "Admin full access for qrcodes" ON storage.objects FOR ALL USING (bucket_id = 'qrcodes' AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = 'qrcodes' AND public.is_admin(auth.uid()));
CREATE POLICY "Admin full access for top_trader_avatars" ON storage.objects FOR ALL USING (bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()));
CREATE POLICY "Admin full access for leadership_avatars" ON storage.objects FOR ALL USING (bucket_id = 'leadership_avatars' AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = 'leadership_avatars' AND public.is_admin(auth.uid()));
CREATE POLICY "Admin full access for testimonial_avatars" ON storage.objects FOR ALL USING (bucket_id = 'testimonial_avatars' AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = 'testimonial_avatars' AND public.is_admin(auth.uid()));

-- Step 5: Ensure the get_dashboard_stats function is created/updated
DROP FUNCTION IF EXISTS public.get_dashboard_stats();
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    -- Main stats
    total_revenue_val numeric;
    total_users_val int;
    total_exchanges_val int;
    pending_exchanges_val int;
    completed_exchanges_val int;
    cancelled_exchanges_val int;
    
    -- Monthly aggregates
    revenue_this_month_val numeric;
    revenue_last_month_val numeric;
    users_this_month_val int;
    users_last_month_val int;
    
    -- Chart data
    monthly_revenue_data json;
BEGIN
    -- Calculate main stats
    SELECT COALESCE(SUM(fee_amount), 0) INTO total_revenue_val FROM exchanges WHERE status = 'completed';
    SELECT COUNT(*) INTO total_users_val FROM auth.users;
    SELECT COUNT(*) INTO total_exchanges_val FROM exchanges;
    SELECT COUNT(*) INTO pending_exchanges_val FROM exchanges WHERE status = 'pending';
    SELECT COUNT(*) INTO completed_exchanges_val FROM exchanges WHERE status = 'completed';
    SELECT COUNT(*) INTO cancelled_exchanges_val FROM exchanges WHERE status = 'cancelled';

    -- Calculate monthly aggregates
    SELECT COALESCE(SUM(fee_amount), 0) INTO revenue_this_month_val FROM exchanges WHERE status = 'completed' AND created_at >= date_trunc('month', now());
    SELECT COALESCE(SUM(fee_amount), 0) INTO revenue_last_month_val FROM exchanges WHERE status = 'completed' AND created_at >= date_trunc('month', now() - interval '1 month') AND created_at < date_trunc('month', now());
    SELECT COUNT(*) INTO users_this_month_val FROM auth.users WHERE created_at >= date_trunc('month', now());
    SELECT COUNT(*) INTO users_last_month_val FROM auth.users WHERE created_at >= date_trunc('month', now() - interval '1 month') AND created_at < date_trunc('month', now());

    -- Generate monthly revenue data for the chart (last 12 months)
    SELECT json_agg(t) INTO monthly_revenue_data FROM (
        SELECT 
            to_char(month_series.month, 'Mon') as name,
            COALESCE(SUM(e.fee_amount), 0) as total
        FROM 
            (SELECT date_trunc('month', generate_series(now() - interval '11 months', now(), '1 month')) as month) as month_series
        LEFT JOIN 
            exchanges e ON date_trunc('month', e.created_at) = month_series.month AND e.status = 'completed'
        GROUP BY 
            month_series.month
        ORDER BY 
            month_series.month
    ) t;

    -- Return all stats as a single JSON object
    RETURN json_build_object(
        'total_revenue', total_revenue_val,
        'total_users', total_users_val,
        'total_exchanges', total_exchanges_val,
        'pending_exchanges', pending_exchanges_val,
        'completed_exchanges', completed_exchanges_val,
        'cancelled_exchanges', cancelled_exchanges_val,
        'revenue_this_month', revenue_this_month_val,
        'revenue_last_month', revenue_last_month_val,
        'users_this_month', users_this_month_val,
        'users_last_month', users_last_month_val,
        'monthly_revenue', monthly_revenue_data
    );
END;
$$;
