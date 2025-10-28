/*
# [Secure is_admin Function]
This operation secures the `is_admin` function by setting a fixed `search_path`. This is a critical security measure to prevent search path hijacking vulnerabilities, ensuring that the function calls other database objects in a predictable and secure manner.

## Query Description:
This script first drops the existing `is_admin` function to ensure a clean update, then recreates it with the `SET search_path = public` option. This change does not affect existing data but significantly improves the security posture of your database. No backup is required for this operation as it only modifies a function definition.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by recreating the function without the search_path option)

## Structure Details:
- Function affected: `public.is_admin(uuid)`

## Security Implications:
- RLS Status: Not applicable
- Policy Changes: No
- Auth Requirements: This function is `SECURITY DEFINER`, and this change hardens its security.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact.
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.is_admin(user_id uuid);

-- Recreate the function with a secure search path
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
