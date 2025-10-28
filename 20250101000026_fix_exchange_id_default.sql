/*
# [Operation Name]
Fix Exchange ID Default Value

[Description of what this operation does]
This migration alters the `exchanges` table to use a more robust default value for the `exchange_id` column. The previous default expression had a small but non-zero chance of generating duplicate IDs, causing unique constraint violations. This change uses `gen_random_uuid()` to ensure a much higher degree of randomness and prevent future collisions.

## Query Description: [This operation modifies the default value generation for new exchange records. It does not affect existing data. It is a safe, structural change to prevent future errors during exchange creation.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Table: `public.exchanges`
- Column: `exchange_id`
- Change: `ALTER COLUMN ... SET DEFAULT`

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [None for the migration itself]

## Performance Impact:
- Indexes: [No change]
- Triggers: [No change]
- Estimated Impact: [Negligible. The `gen_random_uuid()` function is highly optimized.]
*/
ALTER TABLE public.exchanges
ALTER COLUMN exchange_id SET DEFAULT ('EX' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));
