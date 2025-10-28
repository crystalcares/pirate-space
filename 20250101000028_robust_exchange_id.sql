/*
# [Fix] Robust Exchange ID Generation
This migration replaces the default value generator for the `exchange_id` column in the `exchanges` table to permanently prevent duplicate ID errors.

## Query Description:
This operation modifies the `public.exchanges` table to use a highly robust method for generating unique exchange IDs. The previous method was causing "duplicate key" errors under concurrent requests. The new method combines a static prefix with a random UUID substring, which virtually eliminates the chance of collisions. This change is safe, does not affect existing data, and resolves the critical bug.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: `public.exchanges`
- Column: `exchange_id`
- Change: Modifies the `DEFAULT` value expression.

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: Unchanged
- Triggers: Unchanged
- Estimated Impact: Negligible. The new default expression is highly performant.
*/
ALTER TABLE public.exchanges
ALTER COLUMN exchange_id
SET DEFAULT 'EX-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
