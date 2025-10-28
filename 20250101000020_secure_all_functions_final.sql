/*
# [Function] is_admin
[This migration secures the `is_admin` function by setting a fixed search_path and recreating it. This prevents potential search path hijacking attacks.]

## Query Description: [This operation will safely drop and recreate the `is_admin` function with enhanced security settings. It ensures that the function's execution context is properly restricted. There is no risk of data loss, but it's a critical security update.]

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Function: `is_admin(uuid)`

## Security Implications:
- RLS Status: [N/A]
- Policy Changes: [No]
- Auth Requirements: [None]

## Performance Impact:
- Indexes: [N/A]
- Triggers: [N/A]
- Estimated Impact: [None]
*/
DROP FUNCTION IF EXISTS public.is_admin(user_id uuid);
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
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
    WHERE ur.user_id = is_admin.user_id AND r.name = 'admin'
  );
END;
$$;


/*
# [Function] get_users_with_details
[This migration secures the `get_users_with_details` function by setting a fixed search_path and recreating it. This prevents potential search path hijacking attacks and ensures consistent function behavior.]

## Query Description: [This operation will safely drop and recreate the `get_users_with_details` function with enhanced security settings. It ensures the function operates within a controlled environment, mitigating security risks. No data will be lost.]

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Function: `get_users_with_details()`

## Security Implications:
- RLS Status: [N/A]
- Policy Changes: [No]
- Auth Requirements: [Requires admin privileges to call]

## Performance Impact:
- Indexes: [N/A]
- Triggers: [N/A]
- Estimated Impact: [None]
*/
DROP FUNCTION IF EXISTS public.get_users_with_details();
CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  email text,
  created_at timestamptz,
  roles jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can access user details.';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    u.email::text,
    u.created_at,
    (
      SELECT jsonb_agg(jsonb_build_object('name', r.name))
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = p.id
    ) AS roles
  FROM profiles p
  JOIN auth.users u ON p.id = u.id;
END;
$$;
