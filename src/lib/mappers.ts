// Mapeadores snake_case <-> camelCase para todas as entidades do CRM.
// Centralizados aqui para facilitar manutenção e reutilização fora do DataContext.
import type {
  Client, Quote, Flight, Transaction, TravelPackage, Notification, Supplier,
  TravelerProfile, TravelPreferences, MilesAccount, Passenger,
  ReservationDocument, ReservationHistoryEntry, ItineraryDay,
  Opportunity, QuoteItem, Itinerary, ItineraryDayDetailed, Voucher, Traveler,
} from "@/types/crm";

// ---------- Clients ----------
export const mapClient = (r: any): Client => ({
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
  documents: undefined,
});

export const clientToRow = (c: Partial<Client>, userId: string) => ({
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

// ---------- Quotes ----------
export const mapQuote = (r: any, clientName: string): Quote => ({
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

export const quoteToRow = (q: Partial<Quote>, userId: string) => ({
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

// ---------- Opportunities ----------
export const mapOpportunity = (r: any, clientName: string): Opportunity => ({
  id: r.id,
  clientId: r.client_id ?? "",
  clientName,
  title: r.title ?? "",
  destination: r.destination ?? "",
  estimatedValue: Number(r.estimated_value ?? 0),
  probability: Number(r.probability ?? 50),
  expectedCloseDate: r.expected_close_date ?? undefined,
  returnDate: r.return_date ?? undefined,
  travelersCount: r.travelers_count ?? undefined,
  leadSource: r.lead_source ?? undefined,
  stage: r.stage,
  position: Number(r.position ?? 0),
  notes: r.notes ?? "",
  createdAt: r.created_at?.slice(0, 10) ?? "",
});

export const opportunityToRow = (o: Partial<Opportunity>, userId: string) => ({
  user_id: userId,
  client_id: o.clientId || null,
  title: o.title!,
  destination: o.destination ?? "",
  estimated_value: o.estimatedValue ?? 0,
  probability: o.probability ?? 50,
  expected_close_date: o.expectedCloseDate || null,
  return_date: o.returnDate || null,
  travelers_count: o.travelersCount ?? 1,
  lead_source: o.leadSource ?? "",
  stage: o.stage ?? "new",
  position: o.position ?? 0,
  notes: o.notes ?? "",
});

// ---------- Travelers ----------
export const mapTraveler = (r: any): Traveler => ({
  id: r.id,
  clientId: r.client_id ?? "",
  name: r.name ?? "",
  document: r.document ?? "",
  birthDate: r.birth_date ?? undefined,
  passportNumber: r.passport_number ?? "",
  passportExpiry: r.passport_expiry ?? undefined,
  passportCountry: r.passport_country ?? "",
  nationality: r.nationality ?? "",
  relation: r.relation ?? "",
  notes: r.notes ?? "",
  createdAt: r.created_at?.slice(0, 10) ?? "",
});

export const travelerToRow = (t: Partial<Traveler>, userId: string) => ({
  user_id: userId,
  client_id: t.clientId!,
  name: t.name!,
  document: t.document ?? "",
  birth_date: t.birthDate || null,
  passport_number: t.passportNumber ?? "",
  passport_expiry: t.passportExpiry || null,
  passport_country: t.passportCountry ?? "",
  nationality: t.nationality ?? "",
  relation: t.relation ?? "",
  notes: t.notes ?? "",
});

// ---------- Flights ----------
export const mapFlight = (r: any, clientName: string): Flight => ({
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

export const flightToRow = (f: Partial<Flight>, userId: string) => ({
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

// ---------- Transactions ----------
export const mapTransaction = (r: any, clientName?: string): Transaction => ({
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

export const transactionToRow = (t: Partial<Transaction>, userId: string) => ({
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

// ---------- Packages ----------
export const mapPackage = (r: any, clientName: string): TravelPackage => ({
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
  flightIds: [],
  transactionIds: [],
  documents: (r.documents ?? []) as ReservationDocument[],
  history: (r.history ?? []) as ReservationHistoryEntry[],
  notes: r.notes ?? "",
  createdAt: r.created_at?.slice(0, 10) ?? "",
});

export const packageToRow = (p: Partial<TravelPackage>, userId: string) => ({
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

// ---------- Notifications ----------
export const mapNotification = (r: any): Notification => ({
  id: r.id,
  type: r.type,
  title: r.title ?? "",
  message: r.message ?? "",
  date: r.date ?? "",
  read: !!r.read,
  relatedId: r.related_id ?? undefined,
});

// ---------- Suppliers ----------
export const mapSupplier = (r: any): Supplier => ({
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

export const supplierToRow = (s: Partial<Supplier>, userId: string) => ({
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

// ---------- Itineraries ----------
export const mapItinerary = (r: any): Itinerary => ({
  id: r.id,
  title: r.title ?? "",
  packageId: r.package_id ?? undefined,
  quoteId: r.quote_id ?? undefined,
  days: (r.days ?? []) as ItineraryDayDetailed[],
  shareableSlug: r.shareable_slug ?? undefined,
  createdAt: r.created_at?.slice(0, 10) ?? "",
});

export const itineraryToRow = (i: Partial<Itinerary>, userId: string) => ({
  user_id: userId,
  title: i.title!,
  package_id: i.packageId || null,
  quote_id: i.quoteId || null,
  days: (i.days ?? []) as any,
  shareable_slug: i.shareableSlug ?? null,
});

// ---------- Vouchers ----------
export const mapVoucher = (r: any): Voucher => ({
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

export const voucherToRow = (v: Partial<Voucher>, userId: string) => ({
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
