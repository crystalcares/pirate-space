/*
# [Secure is_admin Function]
This migration secures the `is_admin` function by setting a fixed `search_path`. This is a critical security measure to prevent search path hijacking vulnerabilities, ensuring that the function's behavior is predictable and safe.

## Query Description:
- This operation modifies the `is_admin` function's configuration.
- It does not alter any data or table structures.
- It is a safe, non-destructive operation.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by altering the search_path back)

## Structure Details:
- Function: `public.is_admin(uuid)`

## Security Implications:
- RLS Status: No change
- Policy Changes: No
- Auth Requirements: Admin privileges to run `ALTER FUNCTION`.
- This change *improves* security by mitigating the risk of search path attacks.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible.
*/
ALTER FUNCTION public.is_admin(user_id uuid) SET search_path = public;
