import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Client, Quote, Flight, Transaction, TravelPackage, Notification, Supplier,
  TravelerProfile, TravelPreferences, ClientDocument, MilesAccount,
  Passenger, ReservationDocument, ReservationHistoryEntry, ItineraryDay,
  Opportunity, QuoteItem, Itinerary, ItineraryDayDetailed, Voucher,
} from "@/types/crm";

// ---------- Mappers (snake_case <-> camelCase) ----------

const mapClient = (r: any): Client => ({
  id: r.id,
  name: r.name ?? "",
  phone: r.phone ?? "",
  email: r.email ?? "",
  document: r.document ?? "",
  notes: r.notes ?? "",
  status: r.status,
  createdAt: r.created_at?.slice(0, 10) ?? "",
  profile: (r.profile ?? undefined) as TravelerProfile | undefined,
  preferences: (r.preferences ?? undefined) as TravelPreferences | undefined,
  miles: (r.miles ?? undefined) as MilesAccount | undefined,
  documents: undefined, // separate table; loaded on demand by ClientDetail
});

const clientToRow = (c: Partial<Client>, userId: string) => ({
  user_id: userId,
  name: c.name!,
  phone: c.phone ?? "",
  email: c.email ?? "",
  document: c.document ?? "",
  notes: c.notes ?? "",
  status: c.status ?? "lead",
  profile: (c.profile ?? {}) as any,
  preferences: (c.preferences ?? {}) as any,
  miles: (c.miles ?? {}) as any,
});

const mapQuote = (r: any, clientName: string): Quote => ({
  id: r.id,
  clientId: r.client_id ?? "",
  clientName,
  destination: r.destination ?? "",
  startDate: r.start_date ?? "",
  endDate: r.end_date ?? "",
  value: Number(r.value ?? 0),
  description: r.description ?? "",
  status: r.status,
  createdAt: r.created_at?.slice(0, 10) ?? "",
  itinerary: (r.itinerary ?? []) as ItineraryDay[],
  items: (r.items ?? []) as QuoteItem[],
  marginPercent: Number(r.margin_percent ?? 0),
  opportunityId: r.opportunity_id ?? undefined,
});

const quoteToRow = (q: Partial<Quote>, userId: string) => ({
  user_id: userId,
  client_id: q.clientId || null,
  destination: q.destination!,
  start_date: q.startDate || null,
  end_date: q.endDate || null,
  value: q.value ?? 0,
  description: q.description ?? "",
  status: q.status ?? "sent",
  itinerary: (q.itinerary ?? []) as any,
  items: (q.items ?? []) as any,
  margin_percent: q.marginPercent ?? 0,
  opportunity_id: q.opportunityId || null,
});

// ---------- Opportunities mappers ----------
const mapOpportunity = (r: any, clientName: string): Opportunity => ({
  id: r.id,
  clientId: r.client_id ?? "",
  clientName,
  title: r.title ?? "",
  destination: r.destination ?? "",
  estimatedValue: Number(r.estimated_value ?? 0),
  probability: Number(r.probability ?? 50),
  expectedCloseDate: r.expected_close_date ?? undefined,
  stage: r.stage,
  position: Number(r.position ?? 0),
  notes: r.notes ?? "",
  createdAt: r.created_at?.slice(0, 10) ?? "",
});

const opportunityToRow = (o: Partial<Opportunity>, userId: string) => ({
  user_id: userId,
  client_id: o.clientId || null,
  title: o.title!,
  destination: o.destination ?? "",
  estimated_value: o.estimatedValue ?? 0,
  probability: o.probability ?? 50,
  expected_close_date: o.expectedCloseDate || null,
  stage: o.stage ?? "new",
  position: o.position ?? 0,
  notes: o.notes ?? "",
});

const mapFlight = (r: any, clientName: string): Flight => ({
  id: r.id,
  clientId: r.client_id ?? "",
  clientName,
  airline: r.airline ?? "",
  flightNumber: r.flight_number ?? "",
  origin: r.origin ?? "",
  destination: r.destination ?? "",
  departureDate: r.departure_date ?? "",
  departureTime: r.departure_time ?? "",
  checkinAlert: !!r.checkin_alert,
  packageId: r.package_id ?? undefined,
});

const flightToRow = (f: Partial<Flight>, userId: string) => ({
  user_id: userId,
  client_id: f.clientId || null,
  package_id: f.packageId || null,
  airline: f.airline ?? "",
  flight_number: f.flightNumber ?? "",
  origin: f.origin ?? "",
  destination: f.destination ?? "",
  departure_date: f.departureDate || null,
  departure_time: f.departureTime ?? "",
  checkin_alert: f.checkinAlert ?? true,
});

const mapTransaction = (r: any, clientName?: string): Transaction => ({
  id: r.id,
  type: r.type,
  description: r.description ?? "",
  value: Number(r.value ?? 0),
  date: r.date ?? "",
  status: r.status,
  category: r.category ?? undefined,
  clientName,
  clientId: r.client_id ?? undefined,
  packageId: r.package_id ?? undefined,
});

const transactionToRow = (t: Partial<Transaction>, userId: string) => ({
  user_id: userId,
  client_id: t.clientId || null,
  package_id: t.packageId || null,
  type: t.type!,
  description: t.description ?? "",
  value: t.value ?? 0,
  date: t.date || new Date().toISOString().slice(0, 10),
  status: t.status ?? "pending",
  category: t.category ?? "",
});

const mapPackage = (r: any, clientName: string): TravelPackage => ({
  id: r.id,
  name: r.name ?? "",
  clientId: r.client_id ?? "",
  clientName,
  destinationCity: r.destination_city ?? "",
  destinationCountry: r.destination_country ?? "",
  destinationFlag: r.destination_flag ?? undefined,
  departureDate: r.departure_date ?? "",
  returnDate: r.return_date ?? "",
  tripType: r.trip_type,
  supplier: r.supplier ?? "",
  supplierId: r.supplier_id ?? undefined,
  confirmationCode: r.confirmation_code ?? undefined,
  locator: r.locator ?? undefined,
  supplierDeadline: r.supplier_deadline ?? undefined,
  totalValue: Number(r.total_value ?? 0),
  commissionPercent: Number(r.commission_percent ?? 0),
  passengers: (r.passengers ?? []) as Passenger[],
  reservationStatus: r.reservation_status,
  paymentStatus: r.payment_status,
  quoteId: r.quote_id ?? undefined,
  flightIds: [], // derived; not stored on packages
  transactionIds: [],
  documents: (r.documents ?? []) as ReservationDocument[],
  history: (r.history ?? []) as ReservationHistoryEntry[],
  notes: r.notes ?? "",
  createdAt: r.created_at?.slice(0, 10) ?? "",
});

const packageToRow = (p: Partial<TravelPackage>, userId: string) => ({
  user_id: userId,
  client_id: p.clientId || null,
  name: p.name!,
  destination_city: p.destinationCity ?? "",
  destination_country: p.destinationCountry ?? "",
  destination_flag: p.destinationFlag ?? null,
  departure_date: p.departureDate || null,
  return_date: p.returnDate || null,
  trip_type: p.tripType ?? "package",
  supplier: p.supplier ?? "",
  supplier_id: p.supplierId || null,
  confirmation_code: p.confirmationCode ?? null,
  locator: p.locator ?? null,
  supplier_deadline: p.supplierDeadline || null,
  total_value: p.totalValue ?? 0,
  commission_percent: p.commissionPercent ?? 0,
  passengers: (p.passengers ?? []) as any,
  reservation_status: p.reservationStatus ?? "quoting",
  payment_status: p.paymentStatus ?? "pending",
  quote_id: p.quoteId || null,
  documents: (p.documents ?? []) as any,
  history: (p.history ?? []) as any,
  notes: p.notes ?? "",
});

const mapNotification = (r: any): Notification => ({
  id: r.id,
  type: r.type,
  title: r.title ?? "",
  message: r.message ?? "",
  date: r.date ?? "",
  read: !!r.read,
  relatedId: r.related_id ?? undefined,
});

const mapSupplier = (r: any): Supplier => ({
  id: r.id,
  name: r.name ?? "",
  category: r.category,
  cnpj: r.cnpj ?? undefined,
  website: r.website ?? undefined,
  contactName: r.contact_name ?? "",
  contactPhone: r.contact_phone ?? "",
  contactEmail: r.contact_email ?? "",
  defaultCommission: Number(r.default_commission ?? 0),
  paymentTerm: (r.payment_term ?? "30") as Supplier["paymentTerm"],
  accessNotes: r.access_notes ?? undefined,
  notes: r.notes ?? undefined,
  rating: r.rating ?? 5,
  active: !!r.active,
  createdAt: r.created_at?.slice(0, 10) ?? "",
});

const supplierToRow = (s: Partial<Supplier>, userId: string) => ({
  user_id: userId,
  name: s.name!,
  category: s.category ?? "other",
  cnpj: s.cnpj ?? null,
  website: s.website ?? null,
  contact_name: s.contactName ?? "",
  contact_phone: s.contactPhone ?? "",
  contact_email: s.contactEmail ?? "",
  default_commission: s.defaultCommission ?? 0,
  payment_term: s.paymentTerm ?? "30",
  access_notes: s.accessNotes ?? null,
  notes: s.notes ?? null,
  rating: s.rating ?? 5,
  active: s.active ?? true,
});

// ---------- Itineraries mappers ----------
const mapItinerary = (r: any): Itinerary => ({
  id: r.id,
  title: r.title ?? "",
  packageId: r.package_id ?? undefined,
  quoteId: r.quote_id ?? undefined,
  days: (r.days ?? []) as ItineraryDayDetailed[],
  shareableSlug: r.shareable_slug ?? undefined,
  createdAt: r.created_at?.slice(0, 10) ?? "",
});

const itineraryToRow = (i: Partial<Itinerary>, userId: string) => ({
  user_id: userId,
  title: i.title!,
  package_id: i.packageId || null,
  quote_id: i.quoteId || null,
  days: (i.days ?? []) as any,
  shareable_slug: i.shareableSlug ?? null,
});

// ---------- Vouchers mappers ----------
const mapVoucher = (r: any): Voucher => ({
  id: r.id,
  title: r.title ?? "",
  type: r.type,
  packageId: r.package_id ?? undefined,
  supplier: r.supplier ?? "",
  confirmationCode: r.confirmation_code ?? undefined,
  serviceDate: r.service_date ?? undefined,
  details: (r.details ?? {}) as Record<string, any>,
  notes: r.notes ?? "",
  issued: !!r.issued,
  createdAt: r.created_at?.slice(0, 10) ?? "",
});

const voucherToRow = (v: Partial<Voucher>, userId: string) => ({
  user_id: userId,
  title: v.title!,
  type: v.type ?? "other",
  package_id: v.packageId || null,
  supplier: v.supplier ?? "",
  confirmation_code: v.confirmationCode ?? null,
  service_date: v.serviceDate || null,
  details: (v.details ?? {}) as any,
  notes: v.notes ?? "",
  issued: v.issued ?? false,
});

// ---------- Context ----------

interface DataContextType {
  loading: boolean;
  clients: Client[];
  quotes: Quote[];
  flights: Flight[];
  transactions: Transaction[];
  packages: TravelPackage[];
  notifications: Notification[];
  suppliers: Supplier[];
  opportunities: Opportunity[];
  itineraries: Itinerary[];
  vouchers: Voucher[];
  addClient: (c: Omit<Client, "id" | "createdAt">) => Promise<void>;
  updateClient: (c: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addQuote: (q: Omit<Quote, "id" | "createdAt" | "clientName">) => Promise<Quote | void>;
  updateQuote: (q: Quote) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  addFlight: (f: Omit<Flight, "id" | "clientName">) => Promise<void>;
  updateFlight: (f: Flight) => Promise<void>;
  deleteFlight: (id: string) => Promise<void>;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addPackage: (p: Omit<TravelPackage, "id" | "clientName" | "createdAt">) => Promise<void>;
  updatePackage: (p: TravelPackage) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  addSupplier: (s: Omit<Supplier, "id" | "createdAt">) => Promise<void>;
  updateSupplier: (s: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addOpportunity: (o: Omit<Opportunity, "id" | "createdAt" | "clientName">) => Promise<Opportunity | void>;
  updateOpportunity: (o: Opportunity) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
  addItinerary: (i: Omit<Itinerary, "id" | "createdAt">) => Promise<Itinerary | void>;
  updateItinerary: (i: Itinerary) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  addVoucher: (v: Omit<Voucher, "id" | "createdAt">) => Promise<Voucher | void>;
  updateVoucher: (v: Voucher) => Promise<void>;
  deleteVoucher: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (n: Omit<Notification, "id">) => Promise<void>;
  getClientName: (clientId: string) => string;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  const getClientName = useCallback(
    (clientId: string) => clients.find((c) => c.id === clientId)?.name || "",
    [clients]
  );

  const loadAll = useCallback(async () => {
    if (!user) {
      setClients([]); setQuotes([]); setFlights([]); setTransactions([]);
      setPackages([]); setNotifications([]); setSuppliers([]); setOpportunities([]);
      setItineraries([]); setVouchers([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [
      clientsRes, suppliersRes, quotesRes, flightsRes,
      transactionsRes, packagesRes, notificationsRes, opportunitiesRes,
      itinerariesRes, vouchersRes,
    ] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("suppliers").select("*").order("created_at", { ascending: false }),
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("flights").select("*").order("departure_date", { ascending: true }),
      supabase.from("transactions").select("*").order("date", { ascending: false }),
      supabase.from("packages").select("*").order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").order("date", { ascending: false }),
      supabase.from("opportunities").select("*").order("position", { ascending: true }),
      supabase.from("itineraries").select("*").order("created_at", { ascending: false }),
      supabase.from("vouchers").select("*").order("created_at", { ascending: false }),
    ]);

    const clientsData = (clientsRes.data ?? []).map(mapClient);
    const nameById = new Map(clientsData.map((c) => [c.id, c.name]));

    setClients(clientsData);
    setSuppliers((suppliersRes.data ?? []).map(mapSupplier));
    setQuotes((quotesRes.data ?? []).map((r: any) => mapQuote(r, nameById.get(r.client_id) ?? "")));
    setFlights((flightsRes.data ?? []).map((r: any) => mapFlight(r, nameById.get(r.client_id) ?? "")));
    setTransactions((transactionsRes.data ?? []).map((r: any) => mapTransaction(r, nameById.get(r.client_id))));
    setPackages((packagesRes.data ?? []).map((r: any) => mapPackage(r, nameById.get(r.client_id) ?? "")));
    setNotifications((notificationsRes.data ?? []).map(mapNotification));
    setOpportunities((opportunitiesRes.data ?? []).map((r: any) => mapOpportunity(r, nameById.get(r.client_id) ?? "")));
    setItineraries((itinerariesRes.data ?? []).map(mapItinerary));
    setVouchers((vouchersRes.data ?? []).map(mapVoucher));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) loadAll();
  }, [authLoading, loadAll]);

  // ---------- CRUD: Clients ----------
  const addClient = async (c: Omit<Client, "id" | "createdAt">) => {
    if (!user) return;
    const { data, error } = await supabase.from("clients").insert(clientToRow(c, user.id)).select().single();
    if (error) throw error;
    setClients((prev) => [mapClient(data), ...prev]);
  };
  const updateClient = async (c: Client) => {
    if (!user) return;
    const { data, error } = await supabase.from("clients").update(clientToRow(c, user.id)).eq("id", c.id).select().single();
    if (error) throw error;
    setClients((prev) => prev.map((x) => (x.id === c.id ? mapClient(data) : x)));
  };
  const deleteClient = async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
    setClients((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------- CRUD: Quotes ----------
  const addQuote = async (q: Omit<Quote, "id" | "createdAt" | "clientName">): Promise<Quote | void> => {
    if (!user) return;
    const { data, error } = await supabase.from("quotes").insert(quoteToRow(q, user.id)).select().single();
    if (error) throw error;
    const mapped = mapQuote(data, getClientName(data.client_id));
    setQuotes((prev) => [mapped, ...prev]);
    return mapped;
  };
  const updateQuote = async (q: Quote) => {
    if (!user) return;
    const { data, error } = await supabase.from("quotes").update(quoteToRow(q, user.id)).eq("id", q.id).select().single();
    if (error) throw error;
    setQuotes((prev) => prev.map((x) => (x.id === q.id ? mapQuote(data, getClientName(data.client_id)) : x)));
  };
  const deleteQuote = async (id: string) => {
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) throw error;
    setQuotes((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------- CRUD: Flights ----------
  const addFlight = async (f: Omit<Flight, "id" | "clientName">) => {
    if (!user) return;
    const { data, error } = await supabase.from("flights").insert(flightToRow(f, user.id)).select().single();
    if (error) throw error;
    setFlights((prev) => [mapFlight(data, getClientName(data.client_id)), ...prev]);
  };
  const updateFlight = async (f: Flight) => {
    if (!user) return;
    const { data, error } = await supabase.from("flights").update(flightToRow(f, user.id)).eq("id", f.id).select().single();
    if (error) throw error;
    setFlights((prev) => prev.map((x) => (x.id === f.id ? mapFlight(data, getClientName(data.client_id)) : x)));
  };
  const deleteFlight = async (id: string) => {
    const { error } = await supabase.from("flights").delete().eq("id", id);
    if (error) throw error;
    setFlights((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------- CRUD: Transactions ----------
  const addTransaction = async (t: Omit<Transaction, "id">) => {
    if (!user) return;
    const { data, error } = await supabase.from("transactions").insert(transactionToRow(t, user.id)).select().single();
    if (error) throw error;
    setTransactions((prev) => [mapTransaction(data, getClientName(data.client_id)), ...prev]);
  };
  const updateTransaction = async (t: Transaction) => {
    if (!user) return;
    const { data, error } = await supabase.from("transactions").update(transactionToRow(t, user.id)).eq("id", t.id).select().single();
    if (error) throw error;
    setTransactions((prev) => prev.map((x) => (x.id === t.id ? mapTransaction(data, getClientName(data.client_id)) : x)));
  };
  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
    setTransactions((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------- CRUD: Packages ----------
  const addPackage = async (p: Omit<TravelPackage, "id" | "clientName" | "createdAt">) => {
    if (!user) return;
    const { data, error } = await supabase.from("packages").insert(packageToRow(p, user.id)).select().single();
    if (error) throw error;
    setPackages((prev) => [mapPackage(data, getClientName(data.client_id)), ...prev]);
  };
  const updatePackage = async (p: TravelPackage) => {
    if (!user) return;
    const { data, error } = await supabase.from("packages").update(packageToRow(p, user.id)).eq("id", p.id).select().single();
    if (error) throw error;
    setPackages((prev) => prev.map((x) => (x.id === p.id ? mapPackage(data, getClientName(data.client_id)) : x)));
  };
  const deletePackage = async (id: string) => {
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) throw error;
    setPackages((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------- CRUD: Suppliers ----------
  const addSupplier = async (s: Omit<Supplier, "id" | "createdAt">) => {
    if (!user) return;
    const { data, error } = await supabase.from("suppliers").insert(supplierToRow(s, user.id)).select().single();
    if (error) throw error;
    setSuppliers((prev) => [mapSupplier(data), ...prev]);
  };
  const updateSupplier = async (s: Supplier) => {
    if (!user) return;
    const { data, error } = await supabase.from("suppliers").update(supplierToRow(s, user.id)).eq("id", s.id).select().single();
    if (error) throw error;
    setSuppliers((prev) => prev.map((x) => (x.id === s.id ? mapSupplier(data) : x)));
  };
  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) throw error;
    setSuppliers((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------- CRUD: Opportunities ----------
  const addOpportunity = async (o: Omit<Opportunity, "id" | "createdAt" | "clientName">): Promise<Opportunity | void> => {
    if (!user) return;
    const { data, error } = await supabase.from("opportunities").insert(opportunityToRow(o, user.id)).select().single();
    if (error) throw error;
    const mapped = mapOpportunity(data, getClientName(data.client_id));
    setOpportunities((prev) => [...prev, mapped]);
    return mapped;
  };
  const updateOpportunity = async (o: Opportunity) => {
    if (!user) return;
    const { data, error } = await supabase.from("opportunities").update(opportunityToRow(o, user.id)).eq("id", o.id).select().single();
    if (error) throw error;
    setOpportunities((prev) => prev.map((x) => (x.id === o.id ? mapOpportunity(data, getClientName(data.client_id)) : x)));
  };
  const deleteOpportunity = async (id: string) => {
    const { error } = await supabase.from("opportunities").delete().eq("id", id);
    if (error) throw error;
    setOpportunities((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------- CRUD: Itineraries ----------
  const addItinerary = async (i: Omit<Itinerary, "id" | "createdAt">): Promise<Itinerary | void> => {
    if (!user) return;
    const { data, error } = await supabase.from("itineraries").insert(itineraryToRow(i, user.id)).select().single();
    if (error) throw error;
    const mapped = mapItinerary(data);
    setItineraries((prev) => [mapped, ...prev]);
    return mapped;
  };
  const updateItinerary = async (i: Itinerary) => {
    if (!user) return;
    const { data, error } = await supabase.from("itineraries").update(itineraryToRow(i, user.id)).eq("id", i.id).select().single();
    if (error) throw error;
    setItineraries((prev) => prev.map((x) => (x.id === i.id ? mapItinerary(data) : x)));
  };
  const deleteItinerary = async (id: string) => {
    const { error } = await supabase.from("itineraries").delete().eq("id", id);
    if (error) throw error;
    setItineraries((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------- CRUD: Vouchers ----------
  const addVoucher = async (v: Omit<Voucher, "id" | "createdAt">): Promise<Voucher | void> => {
    if (!user) return;
    const { data, error } = await supabase.from("vouchers").insert(voucherToRow(v, user.id)).select().single();
    if (error) throw error;
    const mapped = mapVoucher(data);
    setVouchers((prev) => [mapped, ...prev]);
    return mapped;
  };
  const updateVoucher = async (v: Voucher) => {
    if (!user) return;
    const { data, error } = await supabase.from("vouchers").update(voucherToRow(v, user.id)).eq("id", v.id).select().single();
    if (error) throw error;
    setVouchers((prev) => prev.map((x) => (x.id === v.id ? mapVoucher(data) : x)));
  };
  const deleteVoucher = async (id: string) => {
    const { error } = await supabase.from("vouchers").delete().eq("id", id);
    if (error) throw error;
    setVouchers((prev) => prev.filter((x) => x.id !== id));
  };

  const markNotificationRead = async (id: string) => {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
    if (error) throw error;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const addNotification = async (n: Omit<Notification, "id">) => {
    if (!user) return;
    const { data, error } = await supabase.from("notifications").insert({
      user_id: user.id,
      type: n.type,
      title: n.title,
      message: n.message,
      date: n.date || new Date().toISOString().slice(0, 10),
      read: n.read ?? false,
      related_id: n.relatedId ?? null,
    }).select().single();
    if (error) throw error;
    setNotifications((prev) => [mapNotification(data), ...prev]);
  };

  return (
    <DataContext.Provider value={{
      loading,
      clients, quotes, flights, transactions, packages, notifications, suppliers, opportunities,
      itineraries, vouchers,
      addClient, updateClient, deleteClient,
      addQuote, updateQuote, deleteQuote,
      addFlight, updateFlight, deleteFlight,
      addTransaction, updateTransaction, deleteTransaction,
      addPackage, updatePackage, deletePackage,
      addSupplier, updateSupplier, deleteSupplier,
      addOpportunity, updateOpportunity, deleteOpportunity,
      addItinerary, updateItinerary, deleteItinerary,
      addVoucher, updateVoucher, deleteVoucher,
      markNotificationRead, addNotification,
      getClientName, refresh: loadAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
