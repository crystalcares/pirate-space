/*
# [Operation Name]
Finalize security for all database functions by setting a non-mutable search_path.

## Query Description:
This operation will alter the existing `is_admin` and `get_users_with_details` functions to explicitly set their `search_path` to 'public'. This is a crucial security best practice that prevents potential hijacking of function execution by malicious actors. This change is non-destructive and is intended to resolve the "Function Search Path Mutable" security warning for good.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by altering the functions again)

## Structure Details:
- Modifies function: `public.is_admin(uuid)`
- Modifies function: `public.get_users_with_details()`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions.
- Mitigates: "Function Search Path Mutable" warning by hardening function security.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible.
*/
ALTER FUNCTION public.is_admin(user_id uuid)
SET search_path = public;

ALTER FUNCTION public.get_users_with_details()
SET search_path = public;
