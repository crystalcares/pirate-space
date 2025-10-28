/*
# [Fix] Allow Guest Exchange Creation
This migration updates the Row Level Security (RLS) policy on the `exchanges` table to allow anonymous (guest) users to create new exchange records. The previous policy only allowed authenticated users, which prevented the "Exchange" and "Buy/Sell" buttons from working for non-logged-in visitors.

## Query Description:
This operation modifies a security policy. It broadens insert permissions on the `exchanges` table. It is designed to be safe and only allows anonymous users to insert records where the `user_id` is `NULL`. It maintains the rule that authenticated users can only create exchanges linked to their own `user_id`. There is no risk to existing data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by restoring the old policy)

## Structure Details:
- Table: `public.exchanges`
- Policy Affected: The `INSERT` policy on this table.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes. The `INSERT` policy is being replaced.
- Auth Requirements: This change specifically addresses anonymous user permissions.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact.
*/

-- Drop old, restrictive policies if they exist to prevent conflicts.
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.exchanges;
DROP POLICY IF EXISTS "Enable insert for users" ON public.exchanges;
DROP POLICY IF EXISTS "Allow anyone to create an exchange" ON public.exchanges;
DROP POLICY IF EXISTS "Allow guest and user exchange creation" ON public.exchanges;

-- Create a new, more permissive policy that handles both guests and authenticated users correctly.
CREATE POLICY "Allow guest and user exchange creation"
ON public.exchanges
FOR INSERT
WITH CHECK (
  -- Allows inserts where user_id is NULL (for guests)
  (user_id IS NULL)
  OR
  -- Or ensures the user_id matches the authenticated user's ID
  (user_id = auth.uid())
);
