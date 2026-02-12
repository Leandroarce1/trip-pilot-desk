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

export interface TravelPackage {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  quoteId?: string;
  flightIds: string[];
  transactionIds: string[];
  status: "planning" | "confirmed" | "traveling" | "completed";
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
