/*
          # [Operation Name]
          Create Dashboard Statistics Function

          ## Query Description: [This operation creates a new PostgreSQL function named `get_dashboard_stats` that aggregates key performance indicators for the admin dashboard. It is a read-only function and does not modify any data, making it safe to run. It consolidates multiple queries into a single RPC call, improving dashboard loading performance.]
          
          ## Metadata:
          - Schema-Category: ["Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Creates a new function: `public.get_dashboard_stats()`
          
          ## Security Implications:
          - RLS Status: [N/A]
          - Policy Changes: [No]
          - Auth Requirements: [The function is defined with `SECURITY DEFINER` and should be restricted to admin users via table-level RLS on the tables it accesses, or by restricting RPC execution.]
          
          ## Performance Impact:
          - Indexes: [Relies on existing indexes on `exchanges` and `profiles` tables.]
          - Triggers: [None]
          - Estimated Impact: [Positive. Reduces the number of round-trips to the database for loading the admin dashboard.]
          */
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_revenue_val numeric;
    total_users_val int;
    total_exchanges_val int;
    pending_exchanges_val int;
    completed_exchanges_val int;
    cancelled_exchanges_val int;
    revenue_this_month_val numeric;
    revenue_last_month_val numeric;
    users_this_month_val int;
    users_last_month_val int;
    monthly_revenue_data json;
BEGIN
    -- Aggregate exchange data
    SELECT
        COALESCE(SUM(CASE WHEN status = 'completed' THEN fee_amount ELSE 0 END), 0),
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'pending'),
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'cancelled'),
        COALESCE(SUM(CASE WHEN status = 'completed' AND created_at >= date_trunc('month', NOW()) THEN fee_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN status = 'completed' AND created_at >= date_trunc('month', NOW() - interval '1 month') AND created_at < date_trunc('month', NOW()) THEN fee_amount ELSE 0 END), 0)
    INTO
        total_revenue_val,
        total_exchanges_val,
        pending_exchanges_val,
        completed_exchanges_val,
        cancelled_exchanges_val,
        revenue_this_month_val,
        revenue_last_month_val
    FROM public.exchanges;

    -- Aggregate user data
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())),
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW() - interval '1 month') AND created_at < date_trunc('month', NOW()))
    INTO
        total_users_val,
        users_this_month_val,
        users_last_month_val
    FROM public.profiles;

    -- Monthly revenue for chart
    SELECT json_agg(t)
    INTO monthly_revenue_data
    FROM (
        SELECT
            to_char(month_start, 'Mon') AS name,
            COALESCE(SUM(fee_amount), 0) AS total
        FROM generate_series(
            date_trunc('year', NOW()),
            date_trunc('month', NOW()),
            '1 month'
        ) AS month_start
        LEFT JOIN public.exchanges ON date_trunc('month', created_at) = month_start AND status = 'completed'
        GROUP BY month_start
        ORDER BY month_start
    ) t;

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

-- Grant execution to authenticated users (RLS will handle admin check)
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
