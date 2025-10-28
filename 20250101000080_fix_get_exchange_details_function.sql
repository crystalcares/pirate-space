/*
# [Fix] Recreate get_exchange_details Function
This migration drops and recreates the `get_exchange_details` function to ensure it correctly fetches data for the order tracking page, even for anonymous users.

## Query Description:
This operation redefines a core function used by the user-facing order tracking page. It is designed to be safe and non-destructive. The function is set to `SECURITY DEFINER` to bypass row-level security, allowing anyone with a valid exchange ID to view the status of that specific exchange, which is standard behavior for public tracking pages.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by restoring the previous function definition if available)

## Structure Details:
- Function `get_exchange_details(p_exchange_id uuid)` is dropped and recreated.

## Security Implications:
- RLS Status: The function uses `SECURITY DEFINER` to bypass RLS for the `exchanges` and `payment_methods` tables. This is intentional to allow public tracking.
- Policy Changes: No
- Auth Requirements: The function is callable by `anon` and `authenticated` roles.

## Performance Impact:
- Indexes: The query relies on the primary key index of the `exchanges` table, which is highly performant.
- Triggers: No
- Estimated Impact: Negligible performance impact.
*/

-- Drop the existing function if it exists to avoid conflicts.
DROP FUNCTION IF EXISTS public.get_exchange_details(p_exchange_id uuid);

-- Recreate the function with the correct logic and security settings.
CREATE OR REPLACE FUNCTION public.get_exchange_details(p_exchange_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    exchange_record exchanges;
    payment_record payment_methods;
    result json;
BEGIN
    -- Select the exchange record
    SELECT *
    INTO exchange_record
    FROM public.exchanges
    WHERE id = p_exchange_id;

    -- If no exchange is found, return null
    IF NOT FOUND THEN
        RETURN null;
    END IF;

    -- If the exchange has a payment_method_id, fetch the payment method
    IF exchange_record.payment_method_id IS NOT NULL THEN
        SELECT *
        INTO payment_record
        FROM public.payment_methods
        WHERE id = exchange_record.payment_method_id;
    END IF;

    -- Construct the JSON response
    result := json_build_object(
        'exchange_data', row_to_json(exchange_record),
        'payment_data', row_to_json(payment_record)
    );

    RETURN result;
END;
$$;

-- Grant execution rights to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_exchange_details(p_exchange_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_exchange_details(p_exchange_id uuid) TO authenticated;
