import { Client, Quote, Flight, Transaction, TravelPackage, Notification } from "@/types/crm";

export const mockClients: Client[] = [
  { id: "1", name: "Maria Silva", phone: "(11) 98765-4321", email: "maria@email.com", document: "123.456.789-00", notes: "Prefere destinos de praia", status: "sold", createdAt: "2026-01-15" },
  { id: "2", name: "João Santos", phone: "(21) 99876-5432", email: "joao@email.com", document: "987.654.321-00", notes: "Viagem de lua de mel", status: "negotiation", createdAt: "2026-01-20" },
  { id: "3", name: "Ana Oliveira", phone: "(31) 97654-3210", email: "ana@email.com", document: "456.789.123-00", notes: "", status: "lead", createdAt: "2026-02-01" },
  { id: "4", name: "Carlos Souza", phone: "(41) 96543-2109", email: "carlos@email.com", document: "321.654.987-00", notes: "Viagem corporativa", status: "postSale", createdAt: "2025-12-10" },
  { id: "5", name: "Beatriz Lima", phone: "(51) 95432-1098", email: "bia@email.com", document: "654.321.987-00", notes: "Família com 2 crianças", status: "lead", createdAt: "2026-02-05" },
];

export const mockQuotes: Quote[] = [
  { id: "1", clientId: "1", clientName: "Maria Silva", destination: "Cancún, México", startDate: "2026-03-15", endDate: "2026-03-22", value: 8500, description: "Pacote all-inclusive 7 noites", status: "approved", createdAt: "2026-01-16", itinerary: [
    { day: 1, title: "Chegada em Cancún", description: "Transfer aeroporto → hotel. Check-in e tarde livre na praia." },
    { day: 2, title: "Chichén Itzá", description: "Tour guiado às ruínas maias com almoço incluído." },
    { day: 3, title: "Isla Mujeres", description: "Passeio de barco e snorkeling na ilha." },
    { day: 4, title: "Dia livre", description: "Resort all-inclusive com atividades opcionais." },
    { day: 5, title: "Xcaret Park", description: "Dia inteiro no parque ecológico com show noturno." },
    { day: 6, title: "Cenotes e Playa del Carmen", description: "Visita aos cenotes e compras em Playa del Carmen." },
    { day: 7, title: "Retorno", description: "Check-out e transfer para o aeroporto." },
  ]},
  { id: "2", clientId: "2", clientName: "João Santos", destination: "Maldivas", startDate: "2026-04-10", endDate: "2026-04-17", value: 22000, description: "Resort overwater bungalow", status: "sent", createdAt: "2026-01-21" },
  { id: "3", clientId: "3", clientName: "Ana Oliveira", destination: "Paris, França", startDate: "2026-05-01", endDate: "2026-05-08", value: 15000, description: "Pacote cultural com guia", status: "sent", createdAt: "2026-02-02" },
  { id: "4", clientId: "5", clientName: "Beatriz Lima", destination: "Orlando, EUA", startDate: "2026-07-10", endDate: "2026-07-20", value: 32000, description: "Pacote família com parques", status: "cancelled", createdAt: "2026-02-06" },
];

export const mockFlights: Flight[] = [
  { id: "1", clientId: "1", clientName: "Maria Silva", airline: "LATAM", flightNumber: "LA8045", origin: "GRU", destination: "CUN", departureDate: "2026-02-14", departureTime: "08:30", checkinAlert: true },
  { id: "2", clientId: "1", clientName: "Maria Silva", airline: "LATAM", flightNumber: "LA8046", origin: "CUN", destination: "GRU", departureDate: "2026-03-22", departureTime: "14:00", checkinAlert: false },
  { id: "3", clientId: "4", clientName: "Carlos Souza", airline: "GOL", flightNumber: "G31234", origin: "GRU", destination: "MIA", departureDate: "2026-02-13", departureTime: "22:15", checkinAlert: true },
];

export const mockTransactions: Transaction[] = [
  { id: "1", type: "income", description: "Pacote Cancún - Maria Silva", value: 8500, date: "2026-01-20", status: "paid", clientName: "Maria Silva" },
  { id: "2", type: "expense", description: "Comissão plataforma", value: 425, date: "2026-01-20", status: "paid" },
  { id: "3", type: "income", description: "Pacote Maldivas - João Santos", value: 22000, date: "2026-02-01", status: "pending", clientName: "João Santos" },
  { id: "4", type: "expense", description: "Marketing digital", value: 800, date: "2026-02-05", status: "paid" },
  { id: "5", type: "income", description: "Pacote Orlando - Beatriz Lima", value: 32000, date: "2026-02-08", status: "pending", clientName: "Beatriz Lima" },
  { id: "6", type: "expense", description: "Software e ferramentas", value: 250, date: "2026-02-10", status: "paid" },
];

export const mockPackages: TravelPackage[] = [
  {
    id: "1", name: "Cancún All-Inclusive", clientId: "1", clientName: "Maria Silva",
    destinationCity: "Cancún", destinationCountry: "México", destinationFlag: "🇲🇽",
    departureDate: "2026-03-15", returnDate: "2026-03-22",
    tripType: "package", supplier: "CVC", confirmationCode: "CVC-CUN-998812",
    totalValue: 8500, commissionPercent: 10,
    passengers: [{ name: "Maria Silva", document: "123.456.789-00" }],
    reservationStatus: "confirmed",
    quoteId: "1", flightIds: ["1", "2"], transactionIds: ["1"],
    documents: [{ type: "passport", label: "Passaporte Maria Silva", expiresAt: "2028-06-10" }],
    history: [
      { date: "2026-01-17T09:00", action: "Reserva criada" },
      { date: "2026-01-18T11:30", action: "Pagamento confirmado" },
      { date: "2026-01-20T14:15", action: "Status alterado para Confirmada" },
    ],
    notes: "Pacote completo com voos, hotel e transfers.", createdAt: "2026-01-17",
  },
  {
    id: "2", name: "Lua de Mel Maldivas", clientId: "2", clientName: "João Santos",
    destinationCity: "Malé", destinationCountry: "Maldivas", destinationFlag: "🇲🇻",
    departureDate: "2026-04-10", returnDate: "2026-04-17",
    tripType: "package", supplier: "Decolar", confirmationCode: "DEC-MLE-447721",
    totalValue: 22000, commissionPercent: 12,
    passengers: [
      { name: "João Santos", document: "987.654.321-00" },
      { name: "Marina Santos", document: "111.222.333-44" },
    ],
    reservationStatus: "pending",
    flightIds: [], transactionIds: ["3"],
    documents: [
      { type: "passport", label: "Passaporte João Santos", expiresAt: "2027-02-20" },
      { type: "passport", label: "Passaporte Marina Santos", expiresAt: "2026-12-05" },
    ],
    history: [
      { date: "2026-01-21T10:00", action: "Reserva criada" },
      { date: "2026-01-22T16:00", action: "Proposta enviada ao cliente" },
    ],
    notes: "Bangalô overwater, regime meia-pensão.", createdAt: "2026-01-21",
  },
  {
    id: "3", name: "Paris Cultural", clientId: "3", clientName: "Ana Oliveira",
    destinationCity: "Paris", destinationCountry: "França", destinationFlag: "🇫🇷",
    departureDate: "2026-05-01", returnDate: "2026-05-08",
    tripType: "air", supplier: "LATAM", confirmationCode: "LA-CDG-220045",
    totalValue: 15000, commissionPercent: 8,
    passengers: [{ name: "Ana Oliveira", document: "456.789.123-00" }],
    reservationStatus: "quoting",
    quoteId: "3", flightIds: [], transactionIds: [],
    documents: [
      { type: "passport", label: "Passaporte Ana Oliveira", expiresAt: "2030-09-15" },
      { type: "visa", label: "Visto Schengen", expiresAt: "2026-04-25" },
    ],
    history: [{ date: "2026-02-02T09:30", action: "Reserva criada em cotação" }],
    notes: "Aguardando confirmação do cliente.", createdAt: "2026-02-02",
  },
  {
    id: "4", name: "Miami Business", clientId: "4", clientName: "Carlos Souza",
    destinationCity: "Miami", destinationCountry: "EUA", destinationFlag: "🇺🇸",
    departureDate: "2026-02-13", returnDate: "2026-02-19",
    tripType: "air", supplier: "GOL", confirmationCode: "G3-MIA-557790",
    totalValue: 6800, commissionPercent: 7,
    passengers: [{ name: "Carlos Souza", document: "321.654.987-00" }],
    reservationStatus: "confirmed",
    flightIds: ["3"], transactionIds: [],
    documents: [
      { type: "passport", label: "Passaporte Carlos Souza", expiresAt: "2029-08-01" },
      { type: "visa", label: "Visto B1/B2 EUA", expiresAt: "2031-03-22" },
    ],
    history: [
      { date: "2026-01-30T08:00", action: "Reserva criada" },
      { date: "2026-02-01T13:00", action: "Pagamento confirmado" },
    ],
    notes: "Viagem corporativa.", createdAt: "2026-01-30",
  },
  {
    id: "5", name: "Orlando em Família", clientId: "5", clientName: "Beatriz Lima",
    destinationCity: "Orlando", destinationCountry: "EUA", destinationFlag: "🇺🇸",
    departureDate: "2026-07-10", returnDate: "2026-07-20",
    tripType: "package", supplier: "CVC", confirmationCode: "CVC-MCO-883301",
    totalValue: 32000, commissionPercent: 11,
    passengers: [
      { name: "Beatriz Lima", document: "654.321.987-00" },
      { name: "Pedro Lima" }, { name: "Sofia Lima" }, { name: "Lucas Lima" },
    ],
    reservationStatus: "cancelled",
    quoteId: "4", flightIds: [], transactionIds: ["5"],
    documents: [],
    history: [
      { date: "2026-02-06T11:00", action: "Reserva criada" },
      { date: "2026-02-09T15:00", action: "Cancelada pelo cliente" },
    ],
    notes: "Cliente reagendará para 2027.", createdAt: "2026-02-06",
  },
];

export const mockNotifications: Notification[] = [
  { id: "1", type: "checkin", title: "Check-in disponível", message: "Voo LA8045 de Maria Silva - check-in em 48h", date: "2026-02-12T08:00", read: false, relatedId: "1" },
  { id: "2", type: "payment", title: "Pagamento pendente", message: "Pacote Maldivas - João Santos: R$ 22.000 aguardando", date: "2026-02-10T09:00", read: false, relatedId: "3" },
  { id: "3", type: "departure", title: "Embarque próximo", message: "Carlos Souza embarca em 2 dias para MIA", date: "2026-02-11T10:00", read: true, relatedId: "3" },
];
