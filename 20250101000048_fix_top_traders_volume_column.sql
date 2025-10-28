/*
# [SCHEMA FIX] Reconcile `top_traders` table structure
This migration ensures the `top_traders` table has a numeric `volume` column, resolving an inconsistency where an older `value` (text) column might exist.

## Query Description:
This operation will modify the `top_traders` table.
1. It first checks for a `volume` column. If it doesn't exist, it adds it as a `NUMERIC` type.
2. It then checks for an old `value` column (which was a `text` type).
3. If the `value` column is found, it attempts to convert the text data (e.g., "$1,234,567") into a number and copies it to the new `volume` column.
4. Finally, it drops the old `value` column.
There is a low risk of data loss if the `value` column contains text that cannot be converted to a number. However, the script is designed to handle common currency formats.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- **Table:** `public.top_traders`
- **Columns Added:** `volume` (NUMERIC, NOT NULL, DEFAULT 0)
- **Columns Removed:** `value` (if it exists)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges required to alter table.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Low. The update will be fast on a small `top_traders` table.
*/

-- Step 1: Add the 'volume' column if it doesn't already exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='top_traders' AND column_name='volume' AND table_schema = 'public') THEN
        ALTER TABLE public.top_traders ADD COLUMN volume NUMERIC NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added column "volume" to top_traders table.';
    END IF;
END $$;

-- Step 2: If the old 'value' column exists, migrate its data to 'volume' and then drop it.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='top_traders' AND column_name='value' AND table_schema = 'public') THEN
        -- Attempt to copy and cast data from 'value' to 'volume'
        -- This handles formats like '$1,234,567' by removing '$' and ','
        UPDATE public.top_traders
        SET volume = CAST(regexp_replace(value, '[$,]', '', 'g') AS NUMERIC)
        WHERE value ~ '^[0-9,$.]+$'; -- Only update rows where 'value' looks like a number

        -- Drop the old 'value' column
        ALTER TABLE public.top_traders DROP COLUMN value;

        RAISE NOTICE 'Migrated data from "value" to "volume" and dropped the "value" column.';
    END IF;
END $$;
