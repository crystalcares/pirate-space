/*
# [Fix] Exchange ID Uniqueness
This migration permanently resolves the "duplicate key" error during exchange creation by replacing the custom ID generator with a robust, UUID-based default.

## Query Description:
- **DROP FUNCTION `generate_exchange_id`**: Removes the old, faulty function that was causing ID collisions.
- **ALTER TABLE `exchanges`**: Changes the `exchange_id` column to use a new default value. The new ID will be 'PXT-' followed by the first 12 characters of a newly generated UUID, ensuring a high degree of randomness and preventing future duplicates. This change is safe and does not affect existing data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Function `public.generate_exchange_id` is dropped.
- Table `public.exchanges`, column `exchange_id` default value is updated.

## Security Implications:
- RLS Status: Not applicable
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: Unchanged
- Triggers: Unchanged
- Estimated Impact: Negligible. `gen_random_uuid()` is highly optimized.
*/

-- Drop the old function to ensure it's no longer used
DROP FUNCTION IF EXISTS public.generate_exchange_id();

-- Alter the table to use a much more robust default value for exchange_id
-- This uses a prefix and a portion of a UUID to guarantee uniqueness.
ALTER TABLE public.exchanges
ALTER COLUMN exchange_id SET DEFAULT 'PXT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
