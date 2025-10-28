/*
# [CRITICAL] Definitive Fix for is_admin Function Dependencies
This script resolves a critical migration failure caused by numerous RLS policies depending on the `is_admin(uuid)` function. It safely recreates the function and all associated admin policies.

## Query Description:
This operation will temporarily drop all administrative RLS policies, update the core `is_admin` security function, and then recreate the policies. This is a necessary step to resolve a database dependency lock. While access for admins will be briefly interrupted during the migration, no user data will be lost. It is a structural and security-hardening change.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Drops the `is_admin(uuid)` function and all dependent RLS policies using `CASCADE`.
- Recreates the `public.is_admin(uuid)` function with `SECURITY DEFINER` and a fixed `search_path`.
- Recreates the `public.get_dashboard_stats()` function.
- Recreates all necessary admin policies with a consolidated and secure definition on tables: app_config, currencies, exchange_pairs, exchanges, faq_items, features, how_it_works_steps, leadership_team, market_data, payment_methods, profiles, roles, testimonials, top_exchanges, top_traders, user_roles, and storage.objects.

## Security Implications:
- RLS Status: Policies are temporarily dropped and then recreated.
- Policy Changes: Yes. Policies are recreated to be more secure and robust.
- Auth Requirements: This migration affects admin-level permissions.

## Performance Impact:
- Indexes: None.
- Triggers: None.
- Estimated Impact: Minimal performance impact post-migration. The function update is a security and stability improvement.
*/

-- Step 1: Drop the problematic function and all its dependent policies.
-- The CASCADE option automatically handles removing all policies that use this function.
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- Step 2: Recreate the is_admin function with security best practices.
-- This version uses SECURITY DEFINER and sets a specific search_path to prevent hijacking.
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Ensures the function runs with a safe search path
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

-- Revoke execute from public and explicitly grant to authenticated users
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Step 3: Recreate the dashboard stats function (from previous migration)
-- Dropping first to ensure a clean state
DROP FUNCTION IF EXISTS public.get_dashboard_stats();
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(
    total_revenue numeric,
    revenue_this_month numeric,
    revenue_last_month numeric,
    total_users bigint,
    users_this_month bigint,
    users_last_month bigint,
    total_exchanges bigint,
    pending_exchanges bigint,
    completed_exchanges bigint,
    cancelled_exchanges bigint,
    monthly_revenue jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    last_month_start date := date_trunc('month', now() - interval '1 month');
    last_month_end date := date_trunc('month', now()) - interval '1 day';
    this_month_start date := date_trunc('month', now());
BEGIN
    RETURN QUERY
    WITH revenue_data AS (
        SELECT
            SUM(e.send_amount * COALESCE(md.price_usd, 1)) as total_revenue,
            SUM(CASE WHEN e.created_at >= this_month_start THEN e.send_amount * COALESCE(md.price_usd, 1) ELSE 0 END) as revenue_this_month,
            SUM(CASE WHEN e.created_at BETWEEN last_month_start AND last_month_end THEN e.send_amount * COALESCE(md.price_usd, 1) ELSE 0 END) as revenue_last_month
        FROM exchanges e
        LEFT JOIN (
            SELECT DISTINCT ON (symbol) symbol, price_usd
            FROM market_data
            ORDER BY symbol, created_at DESC
        ) md ON e.from_currency = md.symbol
        WHERE e.status = 'completed'
    ),
    user_data AS (
        SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN p.created_at >= this_month_start THEN 1 END) as users_this_month,
            COUNT(CASE WHEN p.created_at BETWEEN last_month_start AND last_month_end THEN 1 END) as users_last_month
        FROM profiles p
    ),
    exchange_counts AS (
        SELECT
            COUNT(*) as total_exchanges,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_exchanges,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_exchanges,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_exchanges
        FROM exchanges
    ),
    monthly_revenue_agg AS (
        SELECT jsonb_agg(monthly_data) as monthly_revenue
        FROM (
            SELECT
                to_char(date_trunc('month', e.created_at), 'Mon') as name,
                SUM(e.send_amount * COALESCE(md.price_usd, 1)) as total
            FROM exchanges e
            LEFT JOIN (
                SELECT DISTINCT ON (symbol) symbol, price_usd
                FROM market_data
                ORDER BY symbol, created_at DESC
            ) md ON e.from_currency = md.symbol
            WHERE e.status = 'completed' AND e.created_at >= date_trunc('month', now() - interval '11 months')
            GROUP BY date_trunc('month', e.created_at)
            ORDER BY date_trunc('month', e.created_at)
        ) monthly_data
    )
    SELECT
        COALESCE(rd.total_revenue, 0),
        COALESCE(rd.revenue_this_month, 0),
        COALESCE(rd.revenue_last_month, 0),
        ud.total_users,
        ud.users_this_month,
        ud.users_last_month,
        ec.total_exchanges,
        ec.pending_exchanges,
        ec.completed_exchanges,
        ec.cancelled_exchanges,
        mra.monthly_revenue
    FROM revenue_data rd, user_data ud, exchange_counts ec, monthly_revenue_agg mra;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_dashboard_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;


-- Step 4: Recreate all admin policies for the necessary tables.
-- A helper function to create policies idempotently
CREATE OR REPLACE PROCEDURE create_admin_policy(p_table_name text)
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('CREATE POLICY "Allow admin full access" ON public.%I FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));', p_table_name);
END;
$$;

-- Apply the policy to all relevant tables
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'app_config', 'currencies', 'exchange_pairs', 'exchanges', 'faq_items', 
    'features', 'how_it_works_steps', 'leadership_team', 'market_data', 
    'payment_methods', 'profiles', 'roles', 'testimonials', 'top_exchanges', 
    'top_traders', 'user_roles'
  ]
  LOOP
    -- Drop existing policy if it exists to avoid conflicts
    EXECUTE format('DROP POLICY IF EXISTS "Allow admin full access" ON public.%I;', t);
    -- Create the new policy
    CALL create_admin_policy(t);
  END LOOP;
END;
$$;

-- Drop the helper procedure
DROP PROCEDURE create_admin_policy(text);

-- Step 5: Recreate Storage policies for admins
-- Drop old policies first to ensure a clean slate
DROP POLICY IF EXISTS "Admin can manage all asset buckets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage leadership avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage testimonial avatars" ON storage.objects;

-- Create a single, powerful policy for admins on all relevant buckets
CREATE POLICY "Admin can manage all asset buckets"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id IN ('site_assets', 'qrcodes', 'testimonial_avatars', 'leadership_avatars', 'top_trader_avatars')
  AND public.is_admin(auth.uid())
);
