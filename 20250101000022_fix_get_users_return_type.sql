/*
# [Fix Function Return Type Mismatch]
This migration corrects the return type of the `get_users_with_details` function to resolve a type mismatch error.

## Query Description:
- This operation drops the existing `get_users_with_details` function and recreates it.
- The new function explicitly casts the `email` column from `auth.users` to `text`, ensuring the function's output structure matches its definition.
- This change is non-destructive and resolves the "structure of query does not match function result type" error without affecting any stored data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by reverting to the previous function definition)

## Structure Details:
- Modifies function: `public.get_users_with_details()`

## Security Implications:
- RLS Status: Not Applicable
- Policy Changes: No
- Auth Requirements: Admin privileges to modify functions.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. The cast operation has minimal performance overhead.
*/

DROP FUNCTION IF EXISTS public.get_users_with_details();

CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE (
    id uuid,
    username text,
    avatar_url text,
    email text,
    created_at timestamptz,
    roles jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    p.username,
    p.avatar_url,
    u.email::text, -- Explicitly cast email to text to match return type
    u.created_at,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object('name', r.name))
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = u.id
      ),
      '[]'::jsonb
    ) AS roles
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE is_admin(auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.get_users_with_details() TO authenticated;
