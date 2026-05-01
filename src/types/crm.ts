export type ClientStatus = "lead" | "negotiation" | "sold" | "postSale" | "recurring";

export type Gender = "male" | "female" | "unspecified";
export type OriginChannel =
  | "referral" | "instagram" | "google" | "whatsapp" | "in-person" | "other";
export type TravelStyle =
  | "beach" | "adventure" | "culture" | "cruise" | "honeymoon" | "family" | "business";
export type FlightClass = "economy" | "business" | "first";
export type SeatPreference = "window" | "aisle" | "none";

export interface TravelerProfile {
  birthDate?: string; // ISO yyyy-mm-dd
  gender?: Gender;
  nationality?: string;
  cpf?: string;
  profession?: string;
  originChannel?: OriginChannel;
}

export interface TravelPreferences {
  styles: TravelStyle[];
  flightClass?: FlightClass;
  favoriteAirline?: string;
  seatPreference?: SeatPreference;
  dietaryRestrictions?: string;
  bucketList?: string;
  generalNotes?: string;
}

export type ClientDocType = "passport" | "id" | "visa" | "insurance" | "other";

export interface ClientDocument {
  id: string;
  type: ClientDocType;
  number: string;
  issuingCountry?: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface MilesAccount {
  program?: string;
  accountNumber?: string;
  balance?: number;
  expiresAt?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  document: string;
  notes: string;
  status: ClientStatus;
  createdAt: string;
  // Extended profile (Phase 2)
  profile?: TravelerProfile;
  preferences?: TravelPreferences;
  documents?: ClientDocument[];
  miles?: MilesAccount;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  cost?: number;
}

export type QuoteStatus = "draft" | "sent" | "approved" | "cancelled" | "lost";

export interface Quote {
  id: string;
  clientId: string;
  clientName: string;
  destination: string;
  startDate: string;
  endDate: string;
  value: number;
  description: string;
  status: QuoteStatus;
  createdAt: string;
  itinerary?: ItineraryDay[];
  items?: QuoteItem[];
  marginPercent?: number;
  opportunityId?: string;
}

// ---------- Opportunities (Pipeline) ----------
export type OpportunityStage = "new" | "contact" | "proposal" | "closed_won" | "closed_lost";

export interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  destination: string;
  estimatedValue: number;
  probability: number;
  expectedCloseDate?: string;
  stage: OpportunityStage;
  position: number;
  notes: string;
  createdAt: string;
}

export interface Flight {
  id: string;
  clientId: string;
  clientName: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  checkinAlert: boolean;
  packageId?: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  value: number;
  date: string;
  status: "paid" | "pending";
  clientName?: string;
  clientId?: string;
  packageId?: string;
}

export type ReservationStatus = "quoting" | "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "pending" | "partial" | "paid";

export type TripType = "air" | "package" | "cruise" | "road" | "hotel";

export interface Passenger {
  name: string;
  document?: string;
}

export interface ReservationDocument {
  type: "passport" | "visa" | "vaccine" | "other";
  label: string;
  expiresAt?: string;
}

export interface ReservationHistoryEntry {
  date: string;
  action: string;
}

export interface TravelPackage {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  destinationCity: string;
  destinationCountry: string;
  destinationFlag?: string;
  departureDate: string;
  returnDate: string;
  tripType: TripType;
  supplier: string;
  supplierId?: string;
  confirmationCode?: string;
  totalValue: number;
  commissionPercent: number;
  passengers: Passenger[];
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  quoteId?: string;
  flightIds: string[];
  transactionIds: string[];
  documents: ReservationDocument[];
  history: ReservationHistoryEntry[];
  /** @deprecated */
  status?: "planning" | "confirmed" | "traveling" | "completed";
  notes: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "checkin" | "payment" | "departure" | "general";
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedId?: string;
}

// ---------- Suppliers (Phase 3) ----------
export type SupplierCategory =
  | "airline" | "hotel" | "operator" | "cruise" | "insurance"
  | "carRental" | "transfer" | "other";

export type SupplierPaymentTerm = "15" | "30" | "45" | "60";

export interface Supplier {
  id: string;
  name: string;
  category: SupplierCategory;
  cnpj?: string;
  website?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  defaultCommission: number; // %
  paymentTerm: SupplierPaymentTerm;
  accessNotes?: string;
  notes?: string;
  rating: number; // 1-5
  active: boolean;
  createdAt: string;
}

// ---------- Itineraries (Operação) ----------
export interface ItineraryPeriod {
  morning?: string;
  afternoon?: string;
  evening?: string;
}

export interface ItineraryDayDetailed {
  day: number;
  date?: string;
  title: string;
  periods: ItineraryPeriod;
}

export interface Itinerary {
  id: string;
  title: string;
  packageId?: string;
  quoteId?: string;
  days: ItineraryDayDetailed[];
  shareableSlug?: string;
  createdAt: string;
}

// ---------- Vouchers (Operação) ----------
export type VoucherType = "hotel" | "transfer" | "tour" | "ticket" | "other";

export interface Voucher {
  id: string;
  title: string;
  type: VoucherType;
  packageId?: string;
  supplier: string;
  confirmationCode?: string;
  serviceDate?: string;
  details: Record<string, any>;
  notes: string;
  issued: boolean;
  createdAt: string;
}
