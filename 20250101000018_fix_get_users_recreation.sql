/*
# [Fix Function Recreation: get_users_with_details]
This script resolves a migration error by dropping and recreating the `get_users_with_details` function. This ensures the function signature is updated correctly without conflicts.

## Query Description:
This operation first drops the existing `get_users_with_details` function and then immediately recreates it with the intended secure definition. This is a safe procedure to align the database schema with the application's expectations and resolves the "cannot change return type" error. There is no risk of data loss as it only affects a function definition.

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Drops function: `public.get_users_with_details()`
- Recreates function: `public.get_users_with_details()`

## Security Implications:
- RLS Status: [Not Applicable]
- Policy Changes: [No]
- Auth Requirements: [The function itself is `SECURITY DEFINER` and runs with the privileges of `postgres`.]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Negligible. A brief moment where the function is unavailable during migration.]
*/

-- Drop the existing function to allow for signature changes
DROP FUNCTION IF EXISTS public.get_users_with_details();

-- Recreate the function with the correct and secure definition
CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE(
    id uuid,
    username text,
    avatar_url text,
    email text,
    created_at timestamptz,
    roles jsonb[]
)
LANGUAGE plpgsql
SECURITY DEFINER
-- Set a secure search_path to prevent hijacking
SET search_path = public
AS $$
BEGIN
    -- This function must be run by a privileged user (e.g., postgres)
    -- SECURITY DEFINER bypasses RLS, so we explicitly select only the data we intend to expose.
    RETURN QUERY
    SELECT
        p.id,
        p.username,
        p.avatar_url,
        u.email,
        u.created_at,
        (
            SELECT array_agg(jsonb_build_object('name', r.name))
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = p.id
        ) AS roles
    FROM
        public.profiles p
    JOIN
        auth.users u ON p.id = u.id;
END;
$$;

-- Grant execute permission to the 'service_role' so it can be called from the backend
GRANT EXECUTE ON FUNCTION public.get_users_with_details() TO service_role;
