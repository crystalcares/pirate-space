/*
# [Fix Function Search Path]
This migration sets a fixed `search_path` for all user-defined functions to mitigate the "Function Search Path Mutable" security warning. By explicitly setting the search path, we prevent potential vulnerabilities where a malicious user could temporarily create objects (like tables or functions) in a schema that precedes the intended schema in the search path.

This migration also corrects a potential type mismatch in the `get_users_with_details` function, changing `json_agg` to `array_agg` to correctly return a `json[]` type for the roles.

## Query Description:
- This operation alters an existing database function (`is_admin`) and recreates another (`get_users_with_details`).
- It does not modify any table data.
- It is a safe, non-destructive operation aimed at improving security and correctness.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by running a previous migration version of the function)

## Structure Details:
- Functions affected:
  - `public.is_admin(user_id uuid)`
  - `public.get_users_with_details()`

## Security Implications:
- RLS Status: Not affected.
- Policy Changes: No.
- Auth Requirements: Requires database admin privileges to run.
- Mitigates: Search path injection vulnerabilities.

## Performance Impact:
- Indexes: None.
- Triggers: None.
- Estimated Impact: Negligible performance impact.
*/

-- Secure the is_admin function by setting its search path.
-- This prevents search path hijacking.
ALTER FUNCTION public.is_admin(user_id uuid) SET search_path = public, extensions;

-- Recreate the get_users_with_details function to include a secure search path.
-- This version also corrects a potential type mismatch by using `array_agg` to ensure the `roles` column is of type `json[]`.
CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE(id uuid, username text, avatar_url text, email text, created_at timestamptz, roles json[])
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    -- This function can only be executed by an admin, as enforced by the WHERE clause.
    SELECT
        p.id,
        p.username,
        p.avatar_url,
        u.email,
        u.created_at,
        COALESCE(
            (
                SELECT array_agg(json_build_object('name', r.name))
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = p.id
            ),
            '{}'::json[]
        ) AS roles
    FROM
        profiles p
    JOIN
        auth.users u ON p.id = u.id
    WHERE
        is_admin(auth.uid());
$$;
