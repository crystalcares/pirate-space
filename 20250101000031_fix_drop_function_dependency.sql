/*
# [Fix] Safely Remove Obsolete Exchange ID Generator

This migration script resolves a dependency issue that prevented the `generate_exchange_id` function from being dropped. It safely removes the trigger that depends on the function before dropping the function itself. This is the final step in replacing the old, faulty ID generation mechanism with a more robust UUID-based default value.

## Query Description:
This operation is safe and primarily structural. It removes an old trigger and function that are no longer needed. It does not alter existing data. The final state ensures that new exchanges will use the database's built-in UUID generator for their IDs, preventing the "duplicate key" errors seen previously.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false (The old function is being deprecated intentionally)

## Structure Details:
- Drops trigger `tr_generate_exchange_id` from table `public.exchanges`.
- Drops function `public.generate_exchange_id()`.
- Ensures the `exchange_id` column's default value is correctly set to a UUID-based generator.

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: Unchanged
- Triggers: One trigger removed. This may slightly improve insert performance on the `exchanges` table.
- Estimated Impact: Positive but negligible performance improvement on inserts.
*/

-- Step 1: Drop the trigger that depends on the function.
-- This must be done first to remove the dependency.
DROP TRIGGER IF EXISTS tr_generate_exchange_id ON public.exchanges;

-- Step 2: Now that the trigger is gone, safely drop the function.
DROP FUNCTION IF EXISTS public.generate_exchange_id();

-- Step 3: Ensure the column default is correctly set to use a robust UUID-based generator.
-- This replaces the old function-based trigger mechanism permanently.
ALTER TABLE public.exchanges
ALTER COLUMN exchange_id SET DEFAULT ('EX' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
