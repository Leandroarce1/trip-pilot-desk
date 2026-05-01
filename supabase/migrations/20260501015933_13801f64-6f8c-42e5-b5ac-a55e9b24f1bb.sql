
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.client_status AS ENUM ('lead','negotiation','sold','postSale','recurring');
CREATE TYPE public.gender_type AS ENUM ('male','female','unspecified');
CREATE TYPE public.origin_channel AS ENUM ('referral','instagram','google','whatsapp','in-person','other');
CREATE TYPE public.flight_class AS ENUM ('economy','business','first');
CREATE TYPE public.seat_preference AS ENUM ('window','aisle','none');
CREATE TYPE public.quote_status AS ENUM ('sent','approved','cancelled');
CREATE TYPE public.transaction_type AS ENUM ('income','expense');
CREATE TYPE public.transaction_status AS ENUM ('paid','pending');
CREATE TYPE public.reservation_status AS ENUM ('quoting','pending','confirmed','cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending','partial','paid');
CREATE TYPE public.trip_type AS ENUM ('air','package','cruise','road','hotel');
CREATE TYPE public.notification_type AS ENUM ('checkin','payment','departure','general');
CREATE TYPE public.supplier_category AS ENUM ('airline','hotel','operator','cruise','insurance','carRental','transfer','other');
CREATE TYPE public.task_status AS ENUM ('todo','in_progress','done');
CREATE TYPE public.task_priority AS ENUM ('low','medium','high');
CREATE TYPE public.voucher_type AS ENUM ('hotel','transfer','tour','ticket','insurance','other');

-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  document TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status public.client_status NOT NULL DEFAULT 'lead',
  profile JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  miles JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clients_user ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(user_id, status);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category public.supplier_category NOT NULL DEFAULT 'other',
  cnpj TEXT,
  website TEXT,
  contact_name TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  default_commission NUMERIC(5,2) DEFAULT 0,
  payment_term TEXT DEFAULT '30',
  access_notes TEXT,
  notes TEXT,
  rating SMALLINT DEFAULT 5,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_suppliers_user ON public.suppliers(user_id);

-- ============================================================
-- QUOTES (Propostas/Cotações)
-- ============================================================
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  value NUMERIC(12,2) DEFAULT 0,
  description TEXT DEFAULT '',
  status public.quote_status NOT NULL DEFAULT 'sent',
  itinerary JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quotes_user ON public.quotes(user_id);
CREATE INDEX idx_quotes_client ON public.quotes(client_id);

-- ============================================================
-- PACKAGES (Reservas — núcleo)
-- ============================================================
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  destination_city TEXT DEFAULT '',
  destination_country TEXT DEFAULT '',
  destination_flag TEXT,
  departure_date DATE,
  return_date DATE,
  trip_type public.trip_type NOT NULL DEFAULT 'package',
  supplier TEXT DEFAULT '',
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  confirmation_code TEXT,
  total_value NUMERIC(12,2) DEFAULT 0,
  commission_percent NUMERIC(5,2) DEFAULT 0,
  passengers JSONB DEFAULT '[]'::jsonb,
  reservation_status public.reservation_status NOT NULL DEFAULT 'quoting',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  documents JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_packages_user ON public.packages(user_id);
CREATE INDEX idx_packages_client ON public.packages(client_id);
CREATE INDEX idx_packages_status ON public.packages(user_id, reservation_status);

-- ============================================================
-- FLIGHTS
-- ============================================================
CREATE TABLE public.flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  airline TEXT DEFAULT '',
  flight_number TEXT DEFAULT '',
  origin TEXT DEFAULT '',
  destination TEXT DEFAULT '',
  departure_date DATE,
  departure_time TEXT DEFAULT '',
  checkin_alert BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_flights_user ON public.flights(user_id);
CREATE INDEX idx_flights_package ON public.flights(package_id);

-- ============================================================
-- TRANSACTIONS (Financeiro)
-- ============================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  type public.transaction_type NOT NULL,
  description TEXT NOT NULL,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_package ON public.transactions(package_id);

-- ============================================================
-- CLIENT_DOCUMENTS
-- ============================================================
CREATE TABLE public.client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  number TEXT,
  issuing_country TEXT,
  issue_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_client_documents_user ON public.client_documents(user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  read BOOLEAN NOT NULL DEFAULT false,
  related_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- ============================================================
-- ITINERARIES
-- ============================================================
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  days JSONB NOT NULL DEFAULT '[]'::jsonb,
  shareable_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_itineraries_user ON public.itineraries(user_id);
CREATE INDEX idx_itineraries_package ON public.itineraries(package_id);

-- ============================================================
-- VOUCHERS
-- ============================================================
CREATE TABLE public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  type public.voucher_type NOT NULL DEFAULT 'other',
  title TEXT NOT NULL,
  supplier TEXT DEFAULT '',
  confirmation_code TEXT,
  service_date DATE,
  details JSONB DEFAULT '{}'::jsonb,
  notes TEXT DEFAULT '',
  issued BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_vouchers_user ON public.vouchers(user_id);
CREATE INDEX idx_vouchers_package ON public.vouchers(package_id);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  related_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  related_package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_user ON public.tasks(user_id);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  description TEXT DEFAULT '',
  base_price NUMERIC(12,2) DEFAULT 0,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_user ON public.products(user_id);

-- ============================================================
-- DESTINATIONS
-- ============================================================
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  flag TEXT,
  notes TEXT DEFAULT '',
  best_season TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_destinations_user ON public.destinations(user_id);

-- ============================================================
-- updated_at triggers
-- ============================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'clients','suppliers','quotes','packages','flights','transactions',
    'itineraries','vouchers','tasks','products','destinations'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
  END LOOP;
END $$;

-- ============================================================
-- RLS — owner-scoped on every table
-- ============================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'clients','suppliers','quotes','packages','flights','transactions',
    'client_documents','notifications','itineraries','vouchers',
    'tasks','products','destinations'
  ]) LOOP
    EXECUTE format('ALTER TABLE public.%s ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format($f$CREATE POLICY "owner_select_%s" ON public.%s FOR SELECT USING (auth.uid() = user_id);$f$, t, t);
    EXECUTE format($f$CREATE POLICY "owner_insert_%s" ON public.%s FOR INSERT WITH CHECK (auth.uid() = user_id);$f$, t, t);
    EXECUTE format($f$CREATE POLICY "owner_update_%s" ON public.%s FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);$f$, t, t);
    EXECUTE format($f$CREATE POLICY "owner_delete_%s" ON public.%s FOR DELETE USING (auth.uid() = user_id);$f$, t, t);
  END LOOP;
END $$;

-- Public read for shared itineraries via shareable_slug
CREATE POLICY "public_read_shared_itineraries" ON public.itineraries
  FOR SELECT USING (shareable_slug IS NOT NULL);
