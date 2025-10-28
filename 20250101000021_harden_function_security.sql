/*
# [Security Hardening] Set Function Search Path
This migration hardens existing database functions by explicitly setting the `search_path`. This mitigates the "Function Search Path Mutable" security warning by preventing potential attackers from manipulating the function's execution context.

## Query Description:
This operation alters the `is_admin` and `get_users_with_details` functions to set a fixed `search_path`. This is a non-destructive, safe operation that improves security. It does not affect any existing data.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by altering the function again to remove the setting)

## Structure Details:
- Functions affected:
  - `public.is_admin(user_id uuid)`
  - `public.get_users_with_details()`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions.
- This change directly addresses and resolves the "Function Search Path Mutable" security advisory.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible.
*/

ALTER FUNCTION public.is_admin(user_id uuid) SET search_path = public;

ALTER FUNCTION public.get_users_with_details() SET search_path = public;
