export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  document: string;
  notes: string;
  status: "lead" | "negotiation" | "sold" | "postSale";
  createdAt: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface Quote {
  id: string;
  clientId: string;
  clientName: string;
  destination: string;
  startDate: string;
  endDate: string;
  value: number;
  description: string;
  status: "sent" | "approved" | "cancelled";
  createdAt: string;
  itinerary?: ItineraryDay[];
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
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  value: number;
  date: string;
  status: "paid" | "pending";
  clientName?: string;
}

export type ReservationStatus = "quoting" | "pending" | "confirmed" | "cancelled";

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
  date: string; // ISO
  action: string;
}

export interface TravelPackage {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  // Destination
  destinationCity: string;
  destinationCountry: string;
  destinationFlag?: string; // emoji
  // Dates
  departureDate: string;
  returnDate: string;
  // Trip
  tripType: TripType;
  supplier: string;
  confirmationCode?: string;
  // Financials
  totalValue: number;
  commissionPercent: number;
  passengers: Passenger[];
  // Reservation status (new)
  reservationStatus: ReservationStatus;
  // Linked records (kept for backwards compatibility)
  quoteId?: string;
  flightIds: string[];
  transactionIds: string[];
  documents: ReservationDocument[];
  history: ReservationHistoryEntry[];
  /** @deprecated old high-level package status — keep optional for legacy */
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
