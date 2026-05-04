ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS locator text,
  ADD COLUMN IF NOT EXISTS supplier_deadline date;