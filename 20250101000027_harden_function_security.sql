/*
# [SECURITY] Harden Function Security
This migration enhances security by explicitly setting the `search_path` for all known user-defined functions. This mitigates the risk of search path hijacking attacks and resolves the "Function Search Path Mutable" security warning.

## Query Description:
This operation alters existing database functions to restrict their `search_path`. It ensures that functions only search within schemas you trust (like `public` and `extensions`), preventing them from executing malicious code that might be placed in other schemas by an attacker. This change is non-destructive and improves the overall security posture of the database.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- `public.is_admin(uuid)`
- `public.get_users_with_details()`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: This change hardens security for functions that may be used by RLS policies.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact.
*/

-- Harden is_admin function
ALTER FUNCTION public.is_admin(user_id uuid) SET search_path = public;

-- Harden get_users_with_details function
ALTER FUNCTION public.get_users_with_details() SET search_path = public;

-- Note: This script hardens all known custom functions. If other custom functions are added in the future,
-- they should also have their search_path explicitly set for maximum security.
