/*
# [Secure Function Search Path]
This migration secures the `get_users_with_details` function by setting a fixed `search_path`.

## Query Description:
This operation modifies the existing `get_users_with_details` function to explicitly set its `search_path` to `public`. This is a critical security enhancement that prevents potential "search path hijacking" vulnerabilities, where a malicious user could create objects in other schemas that the function might inadvertently execute. This change is non-destructive and only improves security.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Function: `public.get_users_with_details()`

## Security Implications:
- RLS Status: Not applicable to function definition.
- Policy Changes: No
- Auth Requirements: None for applying the migration.
- Mitigates: Search path hijacking vulnerability.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. May slightly improve performance by removing ambiguity in object resolution.
*/
ALTER FUNCTION public.get_users_with_details()
SET search_path = public;
