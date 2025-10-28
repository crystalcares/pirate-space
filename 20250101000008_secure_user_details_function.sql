/*
# [Secure Function Search Path]
This migration secures the `get_users_with_details` function by setting a fixed search_path. This is a critical security best practice to prevent search path hijacking vulnerabilities, where a malicious user could potentially create objects in other schemas to alter the function's behavior.

## Query Description:
- This operation modifies the configuration of an existing database function.
- It does not alter any table data or structure.
- It is a safe, non-destructive operation that enhances security.

## Metadata:
- Schema-Category: ["Safe", "Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Function: `public.get_users_with_details()`

## Security Implications:
- RLS Status: Not applicable to function definition.
- Policy Changes: No
- Auth Requirements: Requires admin privileges to run.
- Mitigates: Search Path Hijacking.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. May provide a minor performance improvement by removing ambiguity from the function's search path.
*/
ALTER FUNCTION public.get_users_with_details()
SET search_path = public;
