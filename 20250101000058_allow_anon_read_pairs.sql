/*
# [Safe] Allow Anonymous Read on Exchange Pairs
This migration enables read-only access to the `exchange_pairs` table for anonymous (guest) users.

## Query Description:
This operation creates a new Row Level Security (RLS) policy on the `exchange_pairs` table. It allows any user, including unauthenticated ones, to perform `SELECT` operations. This is necessary for the exchange calculator to function correctly for all visitors by allowing it to fetch available trading pairs. This change is safe and does not expose any sensitive user data.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: `public.exchange_pairs`
- Operation: `CREATE POLICY`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes, a new `SELECT` policy is added.
- Auth Requirements: Allows anonymous access for `SELECT`.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible.
*/

-- Ensure RLS is enabled on the table. It's safe to run this even if it's already enabled.
ALTER TABLE public.exchange_pairs ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists to ensure a clean state and avoid conflicts.
DROP POLICY IF EXISTS "Allow public read access to exchange pairs" ON public.exchange_pairs;

-- Create the policy to allow any user (anonymous or authenticated) to read from the table.
CREATE POLICY "Allow public read access to exchange pairs"
ON public.exchange_pairs
FOR SELECT
TO anon, authenticated
USING (true);
