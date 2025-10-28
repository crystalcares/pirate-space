/*
# [Function] get_admin_exchanges
[This function fetches all exchanges with associated user details, intended for admin use.]

## Query Description: [Creates a function to securely fetch all exchange data for the admin panel. It joins exchanges with profiles to include user information. This simplifies frontend logic and centralizes the data fetching query.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true] (by dropping the function)

## Structure Details:
- Function: public.get_admin_exchanges()

## Security Implications:
- RLS Status: [Bypassed via SECURITY DEFINER]
- Policy Changes: [No]
- Auth Requirements: [The function internally checks if the caller is an admin using `public.is_admin(auth.uid())`.]

## Performance Impact:
- Indexes: [Relies on existing indexes on exchanges and profiles.]
- Triggers: [No]
- Estimated Impact: [Low, should be more performant than complex client-side queries.]
*/
CREATE OR REPLACE FUNCTION public.get_admin_exchanges()
RETURNS TABLE (
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
    -- Security check: only admins can run this
    IF NOT public.is_admin(auth.uid()) THEN
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
        e.user_id,
        p.username,
        p.email,
        p.avatar_url
    FROM
        public.exchanges e
    LEFT JOIN
        public.profiles p ON e.user_id = p.id
    ORDER BY
        e.created_at DESC;
END;
$$;

/*
# [Function] get_user_exchanges
[This function fetches all exchanges for the currently authenticated user.]

## Query Description: [Creates a function to fetch all exchanges belonging to the calling user. It uses SECURITY INVOKER, so it respects existing RLS policies, providing an extra layer of security.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true] (by dropping the function)

## Structure Details:
- Function: public.get_user_exchanges()

## Security Implications:
- RLS Status: [Respected via SECURITY INVOKER]
- Policy Changes: [No]
- Auth Requirements: [Must be called by an authenticated user.]

## Performance Impact:
- Indexes: [Relies on existing indexes on exchanges.user_id.]
- Triggers: [No]
- Estimated Impact: [Low]
*/
CREATE OR REPLACE FUNCTION public.get_user_exchanges()
RETURNS SETOF public.exchanges
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
    SELECT *
    FROM public.exchanges
    WHERE user_id = auth.uid()
    ORDER BY created_at DESC;
$$;


/*
# [Function] get_exchange_details
[This function fetches the details for a single exchange, including payment method info.]

## Query Description: [Creates a function for the public exchange details page. It fetches a single exchange and joins its associated payment method. This is safer than a broad RLS policy.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true] (by dropping the function)

## Structure Details:
- Function: public.get_exchange_details(p_exchange_id uuid)

## Security Implications:
- RLS Status: [Bypassed via SECURITY DEFINER]
- Policy Changes: [No]
- Auth Requirements: [None, it is for public access.]

## Performance Impact:
- Indexes: [Relies on indexes on exchanges.id and payment_methods.id.]
- Triggers: [No]
- Estimated Impact: [Low]
*/
CREATE OR REPLACE FUNCTION public.get_exchange_details(p_exchange_id uuid)
RETURNS TABLE (
    exchange_data json,
    payment_data json
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        row_to_json(e.*),
        row_to_json(pm.*)
    FROM
        public.exchanges e
    LEFT JOIN
        public.payment_methods pm ON e.payment_method_id = pm.id
    WHERE
        e.id = p_exchange_id;
END;
$$;

/*
# [RLS Policy] Exchange Pairs Public Read
[This policy ensures that the list of available exchange pairs is always readable by anyone.]

## Query Description: [Creates a simple RLS policy on the `exchange_pairs` table to allow public read access. This is necessary for the exchange calculator to function for all users, including those not logged in.]

## Metadata:
- Schema-Category: ["Security"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true] (by dropping the policy)

## Structure Details:
- Table: public.exchange_pairs
- Policy: "Allow public read access"

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [Yes]
- Auth Requirements: [None]
*/
DROP POLICY IF EXISTS "Allow public read access" ON public.exchange_pairs;
ALTER TABLE public.exchange_pairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.exchange_pairs
FOR SELECT
USING (true);
