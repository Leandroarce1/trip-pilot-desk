-- ============================================
-- RODADA 3: COMERCIAL
-- ============================================

-- 1) Enum para estágio do pipeline (oportunidades)
DO $$ BEGIN
  CREATE TYPE public.opportunity_stage AS ENUM ('new', 'contact', 'proposal', 'closed_won', 'closed_lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Tabela de oportunidades (Pipeline + Oportunidades)
CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid,
  title text NOT NULL,
  destination text DEFAULT '',
  estimated_value numeric DEFAULT 0,
  probability smallint DEFAULT 50,
  expected_close_date date,
  stage public.opportunity_stage NOT NULL DEFAULT 'new',
  position integer NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_opportunities" ON public.opportunities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_opportunities" ON public.opportunities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_opportunities" ON public.opportunities
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_delete_opportunities" ON public.opportunities
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER opportunities_set_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_opportunities_user_stage ON public.opportunities(user_id, stage);

-- 3) Estender enum de status de cotação para suportar draft/lost
DO $$ BEGIN
  ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'draft';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'lost';
EXCEPTION WHEN others THEN NULL; END $$;

-- 4) Adicionar colunas em quotes para itens, margem e vínculo a oportunidade
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS margin_percent numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS opportunity_id uuid;
