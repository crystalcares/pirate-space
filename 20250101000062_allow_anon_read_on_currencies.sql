/*
# [Allow Anonymous Read on Currencies]
This migration enables read access to the `currencies` table for all users, including anonymous guests.

## Query Description: [This operation creates a new Row Level Security (RLS) policy on the `public.currencies` table. It allows any user (anonymous or authenticated) to perform `SELECT` operations on this table. This is necessary for the exchange calculator to function correctly for guest users, as it needs to fetch the list of available currencies.]

## Metadata:
- Schema-Category: ["Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Table: `public.currencies`
- Operation: `CREATE POLICY`

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [Yes]
- Auth Requirements: [None]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Low. This is a simple read policy on a small configuration table.]
*/

-- Ensure RLS is enabled on the table
alter table public.currencies enable row level security;

-- Create the policy to allow read access for everyone
create policy "Allow public read access on currencies"
on public.currencies
for select
to anon, authenticated
using (true);
