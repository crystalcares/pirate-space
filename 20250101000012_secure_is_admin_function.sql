/*
# [Fix] Secure is_admin function
This migration secures the `is_admin` function by setting a fixed `search_path`. This is a critical security best practice that prevents "search path hijacking" vulnerabilities, ensuring that the function's behavior is predictable and not influenced by the session's `search_path`.

## Query Description:
- This operation alters the existing `is_admin` function.
- It is non-destructive and does not affect any data.
- It directly resolves the "Function Search Path Mutable" security warning.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by altering the function again to remove the setting)

## Structure Details:
- Function being affected: `public.is_admin(uuid)`

## Security Implications:
- RLS Status: No change
- Policy Changes: No
- Auth Requirements: This change hardens security by preventing potential privilege escalation.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible.
*/

ALTER FUNCTION public.is_admin(user_id uuid) SET search_path = public;
