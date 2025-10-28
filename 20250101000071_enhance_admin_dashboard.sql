/*
          # [Operation Name]
          Enhance Admin Dashboard & Secure Functions

          ## Query Description: [This migration introduces a new, efficient `get_dashboard_stats` function to power a redesigned admin dashboard. It also hardens security by explicitly setting the `search_path` for all existing database functions, mitigating the "Function Search Path Mutable" warning from the security advisory. This ensures function calls are resolved safely and predictably.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Creates a new function: `get_dashboard_stats()`
          - Recreates existing functions (`get_admin_exchanges`, `get_top_users_by_volume`, `is_admin`, `get_exchange_details`, `get_user_exchanges`, `get_users_with_details`) to include a secure search path.
          
          ## Security Implications:
          - RLS Status: [No Change]
          - Policy Changes: [No]
          - Auth Requirements: [Admin for new function]
          - Fixes the "Function Search Path Mutable" security advisory by setting a non-mutable search path for all functions.
          
          ## Performance Impact:
          - Indexes: [No Change]
          - Triggers: [No Change]
          - Estimated Impact: [Positive. The new `get_dashboard_stats` function consolidates multiple queries into one, significantly improving the load time of the admin dashboard.]
          */

-- Drop existing functions to recreate them with security settings
DROP FUNCTION IF EXISTS public.is_admin(p_user_id uuid);
DROP FUNCTION IF EXISTS public.get_admin_exchanges();
DROP FUNCTION IF EXISTS public.get_top_users_by_volume();
DROP FUNCTION IF EXISTS public.get_users_with_details();
DROP FUNCTION IF EXISTS public.get_user_exchanges();
DROP FUNCTION IF EXISTS public.get_exchange_details(p_exchange_id text);


-- Function to check if a user is an admin
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin(p_user_id uuid) TO authenticated;


-- Function to get all exchanges for the admin view
CREATE OR REPLACE FUNCTION public.get_admin_exchanges()
RETURNS TABLE(
    id uuid,
    created_at timestamptz,
    exchange_id text,
    from_currency text,
    to_currency text,
    send_amount numeric,
    receive_amount numeric,
    fee_amount numeric,
    fee_details text,
    status text,
    recipient_wallet_address text,
    payment_method_id uuid,
    user_id uuid,
    username text,
    email text,
    avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;

    RETURN QUERY
    SELECT 
        e.id,
        e.created_at,
        e.exchange_id,
        e.from_currency,
        e.to_currency,
        e.send_amount,
        e.receive_amount,
        e.fee_amount,
        e.fee_details,
        e.status,
        e.recipient_wallet_address,
        e.payment_method_id,
        e.user_id,
        p.username,
        u.email,
        p.avatar_url
    FROM exchanges e
    LEFT JOIN profiles p ON e.user_id = p.id
    LEFT JOIN auth.users u ON e.user_id = u.id
    ORDER BY e.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_exchanges() TO authenticated;


-- Function to get top users by volume
CREATE OR REPLACE FUNCTION public.get_top_users_by_volume()
RETURNS TABLE (
    user_id uuid,
    username text,
    avatar_url text,
    total_volume numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id as user_id,
        p.username,
        p.avatar_url,
        SUM(e.send_amount * COALESCE(cr.usd_rate, 1)) as total_volume
    FROM
        exchanges e
    JOIN
        auth.users u ON e.user_id = u.id
    JOIN
        profiles p ON u.id = p.id
    LEFT JOIN
        (SELECT symbol, 1 as usd_rate FROM currencies WHERE symbol = 'USD'
         UNION ALL
         SELECT symbol, 0.012 as usd_rate FROM currencies WHERE symbol = 'INR' -- Example static rate
        ) cr ON e.from_currency = cr.symbol
    WHERE
        e.status = 'completed' AND e.user_id IS NOT NULL
    GROUP BY
        u.id, p.username, p.avatar_url
    ORDER BY
        total_volume DESC
    LIMIT 10;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_top_users_by_volume() TO authenticated;


-- Function to get all users with their roles
CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE (
    id uuid,
    username text,
    email text,
    avatar_url text,
    created_at timestamptz,
    roles json
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.username,
        u.email,
        p.avatar_url,
        u.created_at,
        COALESCE(
            (
                SELECT json_agg(json_build_object('name', r.name))
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = p.id
            ),
            '[]'::json
        ) as roles
    FROM
        profiles p
    JOIN
        auth.users u ON p.id = u.id
    ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_with_details() TO authenticated;


-- Function for a user to get their own exchanges
CREATE OR REPLACE FUNCTION public.get_user_exchanges()
RETURNS SETOF exchanges
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM exchanges
    WHERE user_id = auth.uid()
    ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_exchanges() TO authenticated;

-- Function to get details for a single exchange
CREATE OR REPLACE FUNCTION public.get_exchange_details(p_exchange_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    exchange_record exchanges;
    payment_record payment_methods;
    is_user_admin boolean;
    result_json json;
BEGIN
    -- Check if user is admin
    is_user_admin := is_admin(auth.uid());

    -- Find the exchange
    SELECT * INTO exchange_record
    FROM exchanges
    WHERE id::text = p_exchange_id;

    -- If not found, return null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Check permissions
    IF exchange_record.user_id IS NOT NULL AND exchange_record.user_id != auth.uid() AND NOT is_user_admin THEN
        RAISE EXCEPTION 'User does not have permission to view this exchange';
    END IF;

    -- Get payment method if it exists
    IF exchange_record.payment_method_id IS NOT NULL THEN
        SELECT * INTO payment_record
        FROM payment_methods
        WHERE id = exchange_record.payment_method_id;
    END IF;

    -- Build the result
    result_json := json_build_object(
        'exchange_data', row_to_json(exchange_record),
        'payment_data', row_to_json(payment_record)
    );

    RETURN result_json;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_exchange_details(p_exchange_id text) TO authenticated;


-- New function for dashboard stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
BEGIN
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;

    WITH monthly_revenue AS (
        SELECT
            date_trunc('month', created_at) AS month,
            SUM(send_amount) AS total
        FROM exchanges
        WHERE status = 'completed' AND created_at >= date_trunc('month', NOW() - interval '11 months')
        GROUP BY 1
    ),
    all_months AS (
        SELECT generate_series(
            date_trunc('month', NOW() - interval '11 months'),
            date_trunc('month', NOW()),
            '1 month'
        ) AS month
    )
    SELECT json_build_object(
        'total_revenue', (SELECT COALESCE(SUM(send_amount), 0) FROM exchanges WHERE status = 'completed'),
        'revenue_this_month', (SELECT COALESCE(SUM(send_amount), 0) FROM exchanges WHERE status = 'completed' AND date_trunc('month', created_at) = date_trunc('month', NOW())),
        'revenue_last_month', (SELECT COALESCE(SUM(send_amount), 0) FROM exchanges WHERE status = 'completed' AND date_trunc('month', created_at) = date_trunc('month', NOW() - interval '1 month')),
        'total_users', (SELECT COUNT(*) FROM auth.users),
        'users_this_month', (SELECT COUNT(*) FROM auth.users WHERE date_trunc('month', created_at) = date_trunc('month', NOW())),
        'users_last_month', (SELECT COUNT(*) FROM auth.users WHERE date_trunc('month', created_at) = date_trunc('month', NOW() - interval '1 month')),
        'total_exchanges', (SELECT COUNT(*) FROM exchanges),
        'pending_exchanges', (SELECT COUNT(*) FROM exchanges WHERE status = 'pending'),
        'completed_exchanges', (SELECT COUNT(*) FROM exchanges WHERE status = 'completed'),
        'cancelled_exchanges', (SELECT COUNT(*) FROM exchanges WHERE status = 'cancelled'),
        'monthly_revenue', (
            SELECT json_agg(
                json_build_object(
                    'name', to_char(am.month, 'Mon'),
                    'total', COALESCE(mr.total, 0)
                ) ORDER BY am.month
            )
            FROM all_months am
            LEFT JOIN monthly_revenue mr ON am.month = mr.month
        )
    ) INTO result;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
