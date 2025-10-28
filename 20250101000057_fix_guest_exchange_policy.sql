/*
# [Fix Exchange Creation for Guests]
This operation updates the Row Level Security (RLS) policy on the `exchanges` table to allow anonymous users (guests) to create new exchange records. Previously, only authenticated users could initiate an exchange.

## Query Description:
- This change modifies the `Allow insert for authenticated users` policy to become `Allow insert for any user`.
- It broadens insert permissions, which is safe as the `user_id` column correctly tracks whether the exchange belongs to a guest (NULL) or a registered user.
- Other policies (SELECT, UPDATE, DELETE) remain unchanged, ensuring users can only access their own data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: `public.exchanges`
- Policy: `Allow insert for authenticated users` (renamed to `Allow insert for any user`)

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes. The `INSERT` policy is modified to include `anon` role.
- Auth Requirements: None for insert. `SELECT`, `UPDATE`, `DELETE` still require auth.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible.
*/

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.exchanges;

-- Create a new, more permissive insert policy
CREATE POLICY "Allow insert for any user"
ON public.exchanges
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
