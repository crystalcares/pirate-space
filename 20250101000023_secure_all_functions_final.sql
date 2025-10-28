/*
# [Security] Secure All Functions (Final)
This migration hardens all custom database functions by setting a non-mutable `search_path`. This is a critical security best practice that prevents potential context-switching attacks (e.g., hijacking) by ensuring functions only search for objects in expected, safe schemas.

## Query Description:
- **Impact**: This is a low-risk, non-destructive security enhancement. It modifies function metadata without altering logic or data.
- **Safety**: No data is at risk. This operation is reversible by altering the function again, but reversal is not recommended.
- **Recommendation**: This is a mandatory security fix to address the 'Function Search Path Mutable' warning.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Functions affected: `is_admin(uuid)`, `get_users_with_details()`

## Security Implications:
- RLS Status: No change.
- Policy Changes: No.
- Auth Requirements: No change.
- **Enhancement**: Mitigates function hijacking vulnerabilities by restricting the `search_path`.

## Performance Impact:
- Indexes: None.
- Triggers: None.
- Estimated Impact: Negligible. May offer a micro-optimization by reducing schema search paths.
*/

ALTER FUNCTION public.is_admin(user_id uuid) SET search_path = public;
ALTER FUNCTION public.get_users_with_details() SET search_path = public;
