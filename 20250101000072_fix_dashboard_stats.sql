/*
# [Fix] Admin Dashboard Stats Calculation
This migration fixes the admin dashboard statistics by adding a dedicated column for USD value to exchanges and updating the calculation function to use it.

## Query Description: 
- **Adds `usd_value` column:** A new `usd_value` column of type `numeric` is added to the `exchanges` table. This will store the transaction's value in USD at the time of creation, enabling accurate revenue and volume tracking. Existing rows will have a default value of 0.
- **Recreates `get_dashboard_stats` function:** The existing function is replaced with a corrected version that properly calculates all dashboard metrics, including total revenue, monthly revenue, and exchange counts, by using the new `usd_value` column. This resolves the bug where dashboard stats appeared as zero.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (column can be dropped, function can be reverted)

## Structure Details:
- **Table Modified:** `public.exchanges` (adds `usd_value` column)
- **Function Replaced:** `public.get_dashboard_stats()`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None for this migration.

## Performance Impact:
- Indexes: None added. The function's performance will depend on the size of the `exchanges` table.
- Triggers: None
- Estimated Impact: Low. The function is only called by admins.
*/

-- Add usd_value column to exchanges table
ALTER TABLE public.exchanges
ADD COLUMN usd_value numeric DEFAULT 0;

COMMENT ON COLUMN public.exchanges.usd_value IS 'The approximate USD value of the send_amount at the time of creation.';

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS public.get_dashboard_stats();

-- Recreate the function with correct logic
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total_revenue', (SELECT COALESCE(SUM(usd_value), 0) FROM public.exchanges WHERE status = 'completed'),
        'revenue_this_month', (SELECT COALESCE(SUM(usd_value), 0) FROM public.exchanges WHERE status = 'completed' AND created_at >= date_trunc('month', now())),
        'revenue_last_month', (SELECT COALESCE(SUM(usd_value), 0) FROM public.exchanges WHERE status = 'completed' AND created_at >= date_trunc('month', now() - interval '1 month') AND created_at < date_trunc('month', now())),
        'total_users', (SELECT COUNT(*) FROM auth.users),
        'users_this_month', (SELECT COUNT(*) FROM auth.users WHERE created_at >= date_trunc('month', now())),
        'users_last_month', (SELECT COUNT(*) FROM auth.users WHERE created_at >= date_trunc('month', now() - interval '1 month') AND created_at < date_trunc('month', now())),
        'total_exchanges', (SELECT COUNT(*) FROM public.exchanges),
        'pending_exchanges', (SELECT COUNT(*) FROM public.exchanges WHERE status = 'pending'),
        'completed_exchanges', (SELECT COUNT(*) FROM public.exchanges WHERE status = 'completed'),
        'cancelled_exchanges', (SELECT COUNT(*) FROM public.exchanges WHERE status = 'cancelled'),
        'monthly_revenue', (
            SELECT json_agg(t)
            FROM (
                SELECT
                    to_char(m.month, 'Mon') as name,
                    COALESCE(d.total, 0) as total
                FROM generate_series(
                    date_trunc('year', now()),
                    date_trunc('year', now()) + interval '11 months',
                    interval '1 month'
                ) as m(month)
                LEFT JOIN (
                    SELECT
                        date_trunc('month', created_at) as month,
                        SUM(usd_value) as total
                    FROM public.exchanges
                    WHERE status = 'completed' AND created_at >= date_trunc('year', now())
                    GROUP BY 1
                ) as d ON m.month = d.month
                ORDER BY m.month
            ) t
        )
    ) INTO result;

    RETURN result;
END;
$$;
