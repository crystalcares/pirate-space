/*
# [Final Security Fix] Secure All Custom Functions
[This script applies the recommended security settings to all custom database functions to resolve the 'Function Search Path Mutable' warning.]

## Query Description: [This operation safely modifies the configuration of existing database functions (`is_admin`, `get_users_with_details`) to set a fixed `search_path`. This is a non-destructive security enhancement that prevents potential hijacking vulnerabilities. It does not alter the logic or data of the functions.]

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Functions affected: `public.is_admin(uuid)`, `public.get_users_with_details()`

## Security Implications:
- RLS Status: [No Change]
- Policy Changes: [No]
- Auth Requirements: [None]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Negligible. This is a configuration change.]
*/

ALTER FUNCTION public.is_admin(user_id uuid)
SET search_path = 'public', 'auth';

ALTER FUNCTION public.get_users_with_details()
SET search_path = 'public', 'auth';
