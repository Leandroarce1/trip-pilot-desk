ALTER TABLE public.opportunities
ADD COLUMN IF NOT EXISTS owner text DEFAULT '' NOT NULL;