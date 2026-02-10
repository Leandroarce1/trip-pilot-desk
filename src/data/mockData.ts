import { Client, Quote, Flight, Transaction } from "@/types/crm";

export const mockClients: Client[] = [
  { id: "1", name: "Maria Silva", phone: "(11) 98765-4321", email: "maria@email.com", document: "123.456.789-00", notes: "Prefere destinos de praia", status: "sold", createdAt: "2026-01-15" },
  { id: "2", name: "João Santos", phone: "(21) 99876-5432", email: "joao@email.com", document: "987.654.321-00", notes: "Viagem de lua de mel", status: "negotiation", createdAt: "2026-01-20" },
  { id: "3", name: "Ana Oliveira", phone: "(31) 97654-3210", email: "ana@email.com", document: "456.789.123-00", notes: "", status: "lead", createdAt: "2026-02-01" },
  { id: "4", name: "Carlos Souza", phone: "(41) 96543-2109", email: "carlos@email.com", document: "321.654.987-00", notes: "Viagem corporativa", status: "postSale", createdAt: "2025-12-10" },
  { id: "5", name: "Beatriz Lima", phone: "(51) 95432-1098", email: "bia@email.com", document: "654.321.987-00", notes: "Família com 2 crianças", status: "lead", createdAt: "2026-02-05" },
];

export const mockQuotes: Quote[] = [
  { id: "1", clientId: "1", clientName: "Maria Silva", destination: "Cancún, México", startDate: "2026-03-15", endDate: "2026-03-22", value: 8500, description: "Pacote all-inclusive 7 noites", status: "approved", createdAt: "2026-01-16" },
  { id: "2", clientId: "2", clientName: "João Santos", destination: "Maldivas", startDate: "2026-04-10", endDate: "2026-04-17", value: 22000, description: "Resort overwater bungalow", status: "sent", createdAt: "2026-01-21" },
  { id: "3", clientId: "3", clientName: "Ana Oliveira", destination: "Paris, França", startDate: "2026-05-01", endDate: "2026-05-08", value: 15000, description: "Pacote cultural com guia", status: "sent", createdAt: "2026-02-02" },
  { id: "4", clientId: "5", clientName: "Beatriz Lima", destination: "Orlando, EUA", startDate: "2026-07-10", endDate: "2026-07-20", value: 32000, description: "Pacote família com parques", status: "cancelled", createdAt: "2026-02-06" },
];

export const mockFlights: Flight[] = [
  { id: "1", clientId: "1", clientName: "Maria Silva", airline: "LATAM", flightNumber: "LA8045", origin: "GRU", destination: "CUN", departureDate: "2026-02-12", departureTime: "08:30", checkinAlert: true },
  { id: "2", clientId: "1", clientName: "Maria Silva", airline: "LATAM", flightNumber: "LA8046", origin: "CUN", destination: "GRU", departureDate: "2026-03-22", departureTime: "14:00", checkinAlert: false },
  { id: "3", clientId: "4", clientName: "Carlos Souza", airline: "GOL", flightNumber: "G31234", origin: "GRU", destination: "MIA", departureDate: "2026-02-11", departureTime: "22:15", checkinAlert: true },
];

export const mockTransactions: Transaction[] = [
  { id: "1", type: "income", description: "Pacote Cancún - Maria Silva", value: 8500, date: "2026-01-20", status: "paid", clientName: "Maria Silva" },
  { id: "2", type: "expense", description: "Comissão plataforma", value: 425, date: "2026-01-20", status: "paid" },
  { id: "3", type: "income", description: "Pacote Maldivas - João Santos", value: 22000, date: "2026-02-01", status: "pending", clientName: "João Santos" },
  { id: "4", type: "expense", description: "Marketing digital", value: 800, date: "2026-02-05", status: "paid" },
  { id: "5", type: "income", description: "Pacote Orlando - Beatriz Lima", value: 32000, date: "2026-02-08", status: "pending", clientName: "Beatriz Lima" },
  { id: "6", type: "expense", description: "Software e ferramentas", value: 250, date: "2026-02-10", status: "paid" },
];
