-- Tabela de viajantes/dependentes vinculados a um cliente
CREATE TABLE public.travelers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid NOT NULL,
  name text NOT NULL,
  document text DEFAULT '',
  birth_date date,
  passport_number text DEFAULT '',
  passport_expiry date,
  passport_country text DEFAULT '',
  nationality text DEFAULT '',
  relation text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_travelers_client_id ON public.travelers(client_id);
CREATE INDEX idx_travelers_user_id ON public.travelers(user_id);

ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_select_travelers ON public.travelers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY owner_insert_travelers ON public.travelers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY owner_update_travelers ON public.travelers FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY owner_delete_travelers ON public.travelers FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_travelers_updated_at
  BEFORE UPDATE ON public.travelers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Campos extras no lead/cliente para capturar origem do contato e quantidade de viajantes
-- (mantemos profile jsonb para CPF/passaporte do titular já existente)
-- Nada a alterar em clients (usaremos profile.origin, profile.travelersCount já no jsonb).

-- Campos extras em opportunities para guardar contexto vindo do lead
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS travelers_count smallint DEFAULT 1,
  ADD COLUMN IF NOT EXISTS return_date date,
  ADD COLUMN IF NOT EXISTS lead_source text DEFAULT '';