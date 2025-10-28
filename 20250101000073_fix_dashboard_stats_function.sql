/*
# [Fix] `get_dashboard_stats` function
This migration drops and recreates the `get_dashboard_stats` function to resolve an error where a non-existent "symbol" column was referenced. The new function correctly calculates all dashboard metrics without the faulty column reference.

## Query Description:
- **DROP FUNCTION**: The existing `get_dashboard_stats()` function is safely removed.
- **CREATE FUNCTION**: A new version of `get_dashboard_stats()` is created with corrected logic.
- **SECURITY DEFINER**: The function is set to run with the permissions of the user that created it (the owner), allowing it to access necessary tables like `auth.users`.
- **SEARCH PATH**: The search path is explicitly set to `public` to resolve potential security warnings and ensure stable function execution.

This operation is safe and will not result in any data loss. It only corrects a faulty database function.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false

## Structure Details:
- Function `get_dashboard_stats()` is modified.

## Security Implications:
- RLS Status: Not applicable to functions directly, but this function is used to read data.
- Policy Changes: No
- Auth Requirements: The function uses `SECURITY DEFINER` to read from `auth.users`.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Low. The function uses CTEs for clarity and should perform efficiently on moderately sized tables.
*/

DROP FUNCTION IF EXISTS public.get_dashboard_stats();

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE (
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
    monthly_revenue json
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH all_months AS (
        SELECT generate_series(
            date_trunc('month', now()) - interval '11 months',
            date_trunc('month', now()),
            '1 month'
        )::date as month
    ),
    revenue_by_month AS (
        SELECT
            date_trunc('month', created_at)::date as month,
            sum(fee_amount) as total
        FROM public.exchanges
        WHERE status = 'completed'
        GROUP BY 1
    ),
    full_monthly_revenue AS (
        SELECT
            to_char(am.month, 'Mon') as name,
            COALESCE(rbm.total, 0) as total
        FROM all_months am
        LEFT JOIN revenue_by_month rbm ON am.month = rbm.month
        ORDER BY am.month
    ),
    exchange_statuses AS (
        SELECT
            count(*) FILTER (WHERE status = 'pending') as pending,
            count(*) FILTER (WHERE status = 'completed') as completed,
            count(*) FILTER (WHERE status = 'cancelled') as cancelled,
            count(*) as total
        FROM public.exchanges
    ),
    user_counts AS (
        SELECT
            count(*) as total,
            count(*) FILTER (WHERE created_at >= date_trunc('month', now())) as this_month,
            count(*) FILTER (WHERE created_at >= date_trunc('month', now()) - interval '1 month' AND created_at < date_trunc('month', now())) as last_month
        FROM auth.users
    ),
    revenue_totals AS (
        SELECT
            sum(fee_amount) FILTER (WHERE status = 'completed') as total,
            sum(fee_amount) FILTER (WHERE status = 'completed' AND created_at >= date_trunc('month', now())) as this_month,
            sum(fee_amount) FILTER (WHERE status = 'completed' AND created_at >= date_trunc('month', now()) - interval '1 month' AND created_at < date_trunc('month', now())) as last_month
        FROM public.exchanges
    )
    SELECT
        COALESCE(rt.total, 0) as total_revenue,
        COALESCE(rt.this_month, 0) as revenue_this_month,
        COALESCE(rt.last_month, 0) as revenue_last_month,
        uc.total as total_users,
        uc.this_month as users_this_month,
        uc.last_month as users_last_month,
        es.total as total_exchanges,
        es.pending as pending_exchanges,
        es.completed as completed_exchanges,
        es.cancelled as cancelled_exchanges,
        (SELECT json_agg(fmr) FROM full_monthly_revenue fmr) as monthly_revenue
    FROM exchange_statuses es, user_counts uc, revenue_totals rt;
END;
$$;
