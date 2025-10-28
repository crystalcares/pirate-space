/*
          # [Operation Name]
          Create Testimonials Table

          ## Query Description: [This migration creates a new `testimonials` table to store customer reviews and feedback. It includes columns for the author's name, title, content, rating, and avatar. It also enables Row Level Security (RLS) and sets up policies to allow public read access while restricting write access to administrators.]

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true

          ## Structure Details:
          - Table(s) Added: `public.testimonials`
          - Column(s) Added: `id`, `created_at`, `author_name`, `author_title`, `author_avatar_url`, `content`, `rating`, `order`

          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Public read, admin write

          ## Performance Impact:
          - Indexes: Primary key on `id`.
          - Triggers: None
          - Estimated Impact: Low. This is a new table and will not affect existing operations.
          */

-- 1. Create the testimonials table
CREATE TABLE public.testimonials (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    author_name character varying NOT NULL,
    author_title character varying,
    author_avatar_url text,
    content text NOT NULL,
    rating smallint NOT NULL DEFAULT 5,
    "order" integer NOT NULL DEFAULT 0,
    CONSTRAINT testimonials_pkey PRIMARY KEY (id),
    CONSTRAINT testimonials_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);

-- 2. Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Public can read all testimonials
CREATE POLICY "Allow public read access to testimonials"
ON public.testimonials
FOR SELECT
USING (true);

-- Admins can do everything
CREATE POLICY "Allow full access for admins"
ON public.testimonials
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 4. Add some sample data
INSERT INTO public.testimonials (author_name, author_title, content, rating, "order")
VALUES
  ('Captain Jack', 'Satisfied Customer', 'This is the best exchange on the seven seas! Fast, reliable, and I didn''t even have to walk the plank.', 5, 1),
  ('Anne Bonny', 'Veteran Trader', 'I''ve traded treasures all over the world, and this platform is as good as gold. The crew is helpful and the process is smooth.', 5, 2),
  ('Blackbeard', 'Power User', 'Arrr, I be pleased with this service. It''s robust and secure, perfect for a captain of my stature. Highly recommended!', 4, 3);
