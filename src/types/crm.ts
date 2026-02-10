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
