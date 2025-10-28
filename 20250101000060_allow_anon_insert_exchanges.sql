/*
# [Allow Anonymous Exchange Creation]
This policy grants anonymous (not logged-in) users the ability to create new records in the `exchanges` table.

## Query Description:
- This operation adds a new Row Level Security (RLS) policy to the `exchanges` table.
- It specifically allows `INSERT` operations for the `anon` role.
- This is necessary for the main exchange calculator to function for guest users, as they need to be able to initiate an exchange.
- There is no risk to existing data as this only affects the creation of new rows.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.exchanges
- Operation: CREATE POLICY

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes (New policy added)
- Auth Requirements: This policy applies to the `anon` role.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. RLS checks on insert have minimal overhead.
*/
CREATE POLICY "Allow anonymous users to create exchanges"
ON public.exchanges
FOR INSERT
TO anon
WITH CHECK (true);
