/*
# [Fix Function Search Path]
[This migration secures the `get_users_with_details` function by setting a fixed `search_path`. This mitigates the "Function Search Path Mutable" security warning by preventing potential search path hijacking attacks.]

## Query Description: [This operation modifies an existing function to enhance security. It is a safe, non-destructive change and does not affect any stored data. It's a best practice for PostgreSQL functions.]

## Metadata:
- Schema-Category: ["Safe", "Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Function `get_users_with_details` will be altered.

## Security Implications:
- RLS Status: [N/A]
- Policy Changes: [No]
- Auth Requirements: [N/A]
- Mitigates: Search Path Hijacking.

## Performance Impact:
- Indexes: [N/A]
- Triggers: [N/A]
- Estimated Impact: [None]
*/
ALTER FUNCTION public.get_users_with_details()
SET search_path = public, auth;
