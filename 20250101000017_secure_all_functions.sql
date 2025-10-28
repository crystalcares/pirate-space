/*
# [Operation Name]
Secure All Custom Database Functions

## Query Description:
This operation secures all custom functions by setting a non-mutable search path. It alters the `is_admin` and `get_users_with_details` functions to explicitly set their `SEARCH_PATH` to 'public'. This is a safe, non-destructive operation that hardens the functions against potential security vulnerabilities (like CVE-2018-1058) by preventing search path hijacking. It does not alter data or table structures.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Functions affected:
  - public.is_admin(uuid)
  - public.get_users_with_details()

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions.
- Security Improvement: Mitigates the "Function Search Path Mutable" warning by preventing search path manipulation.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. This is a metadata change on the function definition.
*/

ALTER FUNCTION public.is_admin(user_id uuid) SET search_path = public;

ALTER FUNCTION public.get_users_with_details() SET search_path = public;
