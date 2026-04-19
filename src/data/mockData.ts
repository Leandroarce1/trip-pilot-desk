import {
  Client, Quote, Flight, Transaction, TravelPackage, Notification, Supplier,
} from "@/types/crm";

export const mockClients: Client[] = [
  {
    id: "1", name: "Maria Silva", phone: "(11) 98765-4321", email: "maria@email.com",
    document: "123.456.789-00", notes: "Prefere destinos de praia", status: "recurring",
    createdAt: "2026-01-15",
    profile: {
      birthDate: "1985-04-22", gender: "female", nationality: "Brasileira",
      cpf: "123.456.789-00", profession: "Arquiteta", originChannel: "instagram",
    },
    preferences: {
      styles: ["beach", "honeymoon"], flightClass: "business",
      favoriteAirline: "LATAM", seatPreference: "window",
      dietaryRestrictions: "Sem frutos do mar",
      bucketList: "Bora Bora, Seychelles, Fiji",
      generalNotes: "Adora resorts all-inclusive.",
    },
    documents: [
      { id: "d1", type: "passport", number: "FH123456", issuingCountry: "Brasil", issueDate: "2020-06-10", expiryDate: "2030-06-10" },
    ],
    miles: { program: "LATAM Pass", accountNumber: "LP-998877", balance: 84500, expiresAt: "2027-06-30" },
  },
  {
    id: "2", name: "João Santos", phone: "(21) 99876-5432", email: "joao@email.com",
    document: "987.654.321-00", notes: "Viagem de lua de mel", status: "negotiation",
    createdAt: "2026-01-20",
    profile: {
      birthDate: "1990-09-12", gender: "male", nationality: "Brasileiro",
      cpf: "987.654.321-00", profession: "Engenheiro", originChannel: "referral",
    },
    preferences: {
      styles: ["honeymoon", "beach"], flightClass: "business",
      favoriteAirline: "Emirates", seatPreference: "aisle",
      bucketList: "Maldivas, Santorini, Maurício",
    },
    documents: [
      { id: "d2", type: "passport", number: "GK334455", issuingCountry: "Brasil", issueDate: "2021-02-20", expiryDate: "2031-02-20" },
    ],
  },
  {
    id: "3", name: "Ana Oliveira", phone: "(31) 97654-3210", email: "ana@email.com",
    document: "456.789.123-00", notes: "", status: "lead",
    createdAt: "2026-02-01",
    profile: { birthDate: "1995-11-03", gender: "female", nationality: "Brasileira", originChannel: "google" },
    preferences: { styles: ["culture", "adventure"] },
  },
  {
    id: "4", name: "Carlos Souza", phone: "(41) 96543-2109", email: "carlos@email.com",
    document: "321.654.987-00", notes: "Viagem corporativa", status: "sold",
    createdAt: "2025-12-10",
    profile: {
      birthDate: "1978-03-15", gender: "male", nationality: "Brasileiro",
      cpf: "321.654.987-00", profession: "CEO", originChannel: "in-person",
    },
    preferences: {
      styles: ["business"], flightClass: "first",
      favoriteAirline: "GOL", seatPreference: "aisle",
      generalNotes: "Sempre voa em executiva.",
    },
    documents: [
      { id: "d3", type: "passport", number: "AB778899", issuingCountry: "Brasil", issueDate: "2019-08-01", expiryDate: "2029-08-01" },
      { id: "d4", type: "visa", number: "B1B2-552211", issuingCountry: "EUA", issueDate: "2021-03-22", expiryDate: "2031-03-22" },
    ],
    miles: { program: "Smiles", accountNumber: "SM-554433", balance: 120000, expiresAt: "2026-12-31" },
  },
  {
    id: "5", name: "Beatriz Lima", phone: "(51) 95432-1098", email: "bia@email.com",
    document: "654.321.987-00", notes: "Família com 2 crianças", status: "lead",
    createdAt: "2026-02-05",
    profile: { birthDate: "1988-07-30", gender: "female", originChannel: "whatsapp" },
    preferences: { styles: ["family"] },
  },
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

// Keep flight dates in the near future relative to mock "now" of early 2026
export const mockFlights: Flight[] = [
  { id: "1", clientId: "1", clientName: "Maria Silva", airline: "LATAM", flightNumber: "LA8045", origin: "GRU", destination: "CUN", departureDate: "2026-02-14", departureTime: "08:30", checkinAlert: true },
  { id: "2", clientId: "1", clientName: "Maria Silva", airline: "LATAM", flightNumber: "LA8046", origin: "CUN", destination: "GRU", departureDate: "2026-03-22", departureTime: "14:00", checkinAlert: false },
  { id: "3", clientId: "4", clientName: "Carlos Souza", airline: "GOL", flightNumber: "G31234", origin: "GRU", destination: "MIA", departureDate: "2026-02-13", departureTime: "22:15", checkinAlert: true },
];

const today = new Date();
const isoMonth = today.toISOString().slice(0, 7); // yyyy-mm
const dayOf = (d: number) => `${isoMonth}-${String(d).padStart(2, "0")}`;

export const mockTransactions: Transaction[] = [
  { id: "1", type: "income", description: "Pacote Cancún - Maria Silva", value: 8500, date: dayOf(5), status: "paid", clientName: "Maria Silva" },
  { id: "2", type: "expense", description: "Comissão plataforma", value: 425, date: dayOf(6), status: "paid" },
  { id: "3", type: "income", description: "Pacote Maldivas - João Santos", value: 22000, date: dayOf(10), status: "pending", clientName: "João Santos" },
  { id: "4", type: "expense", description: "Marketing digital", value: 800, date: dayOf(8), status: "paid" },
  { id: "5", type: "income", description: "Pacote Orlando - Beatriz Lima", value: 32000, date: dayOf(12), status: "pending", clientName: "Beatriz Lima" },
  { id: "6", type: "expense", description: "Software e ferramentas", value: 250, date: dayOf(14), status: "paid" },
  { id: "7", type: "income", description: "Reserva Miami - Carlos Souza", value: 6800, date: dayOf(2), status: "paid", clientName: "Carlos Souza" },
];

// Reservations — at least one departure in the next 30 days from "now" so KPIs work
const inDays = (n: number) => {
  const d = new Date(today.getTime() + n * 86400000);
  return d.toISOString().slice(0, 10);
};

export const mockPackages: TravelPackage[] = [
  {
    id: "1", name: "Cancún All-Inclusive", clientId: "1", clientName: "Maria Silva",
    destinationCity: "Cancún", destinationCountry: "México", destinationFlag: "🇲🇽",
    departureDate: inDays(12), returnDate: inDays(19),
    tripType: "package", supplier: "CVC", supplierId: "s5", confirmationCode: "CVC-CUN-998812",
    totalValue: 8500, commissionPercent: 10,
    passengers: [{ name: "Maria Silva", document: "123.456.789-00" }],
    reservationStatus: "confirmed", paymentStatus: "paid",
    quoteId: "1", flightIds: ["1", "2"], transactionIds: ["1"],
    documents: [{ type: "passport", label: "Passaporte Maria Silva", expiresAt: "2030-06-10" }],
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
    departureDate: inDays(28), returnDate: inDays(35),
    tripType: "package", supplier: "Decolar", supplierId: "s6", confirmationCode: "DEC-MLE-447721",
    totalValue: 22000, commissionPercent: 12,
    passengers: [
      { name: "João Santos", document: "987.654.321-00" },
      { name: "Marina Santos", document: "111.222.333-44" },
    ],
    reservationStatus: "pending", paymentStatus: "pending",
    flightIds: [], transactionIds: ["3"],
    documents: [
      { type: "passport", label: "Passaporte João Santos", expiresAt: "2031-02-20" },
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
    departureDate: inDays(75), returnDate: inDays(82),
    tripType: "air", supplier: "LATAM", supplierId: "s1", confirmationCode: "LA-CDG-220045",
    totalValue: 15000, commissionPercent: 8,
    passengers: [{ name: "Ana Oliveira", document: "456.789.123-00" }],
    reservationStatus: "quoting", paymentStatus: "pending",
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
    departureDate: inDays(8), returnDate: inDays(14),
    tripType: "air", supplier: "GOL", supplierId: "s2", confirmationCode: "G3-MIA-557790",
    totalValue: 6800, commissionPercent: 7,
    passengers: [{ name: "Carlos Souza", document: "321.654.987-00" }],
    reservationStatus: "confirmed", paymentStatus: "paid",
    flightIds: ["3"], transactionIds: ["7"],
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
    departureDate: inDays(150), returnDate: inDays(160),
    tripType: "package", supplier: "CVC", supplierId: "s5", confirmationCode: "CVC-MCO-883301",
    totalValue: 32000, commissionPercent: 11,
    passengers: [
      { name: "Beatriz Lima", document: "654.321.987-00" },
      { name: "Pedro Lima" }, { name: "Sofia Lima" }, { name: "Lucas Lima" },
    ],
    reservationStatus: "cancelled", paymentStatus: "pending",
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

export const mockSuppliers: Supplier[] = [
  { id: "s1", name: "LATAM Airlines", category: "airline", cnpj: "02.012.862/0001-60", website: "https://www.latamairlines.com",
    contactName: "Renata Pires", contactPhone: "(11) 4002-5700", contactEmail: "agencias@latam.com",
    defaultCommission: 7, paymentTerm: "30", accessNotes: "Portal: agency.latam.com / Login: agente@flowdestinos.com",
    notes: "Parceiro estratégico para rotas internacionais.", rating: 5, active: true, createdAt: "2025-08-01" },
  { id: "s2", name: "GOL Linhas Aéreas", category: "airline", cnpj: "06.164.253/0001-87", website: "https://www.voegol.com.br",
    contactName: "Marcos Tavares", contactPhone: "(11) 5098-2200", contactEmail: "b2b@voegol.com.br",
    defaultCommission: 6, paymentTerm: "30", accessNotes: "Portal: gol.travel/agencias",
    notes: "Boa comissão em rotas domésticas.", rating: 4, active: true, createdAt: "2025-08-12" },
  { id: "s3", name: "Resort Paradisus Cancún", category: "hotel", cnpj: "—", website: "https://www.melia.com",
    contactName: "Lucía Hernández", contactPhone: "+52 998 881 1100", contactEmail: "agencias@paradisus.com",
    defaultCommission: 14, paymentTerm: "45", accessNotes: "Reservas via plataforma Meliá Pro.",
    notes: "Resort 5★ all-inclusive premium.", rating: 5, active: true, createdAt: "2025-09-03" },
  { id: "s4", name: "Iberostar Selection", category: "hotel", cnpj: "—", website: "https://www.iberostar.com",
    contactName: "Patricia Gomes", contactPhone: "(11) 3251-9000", contactEmail: "agencias.br@iberostar.com",
    defaultCommission: 12, paymentTerm: "30",
    notes: "Promoções sazonais frequentes.", rating: 4, active: true, createdAt: "2025-09-10" },
  { id: "s5", name: "CVC Operadora", category: "operator", cnpj: "10.760.260/0001-19", website: "https://www.cvc.com.br",
    contactName: "Eduardo Ramos", contactPhone: "(11) 2191-3700", contactEmail: "agencias@cvc.com.br",
    defaultCommission: 10, paymentTerm: "30", accessNotes: "Portal: cvclob.com.br",
    notes: "Maior operadora do Brasil.", rating: 4, active: true, createdAt: "2025-07-22" },
  { id: "s6", name: "Decolar.com", category: "operator", cnpj: "11.461.997/0001-08", website: "https://www.decolar.com",
    contactName: "Camila Rocha", contactPhone: "(11) 3192-5500", contactEmail: "parceiros@decolar.com",
    defaultCommission: 9, paymentTerm: "45",
    notes: "Boa para pacotes internacionais.", rating: 4, active: true, createdAt: "2025-10-05" },
  { id: "s7", name: "Assist Card Seguros", category: "insurance", cnpj: "01.299.466/0001-53", website: "https://www.assistcard.com",
    contactName: "Roberta Mendes", contactPhone: "(11) 3145-0900", contactEmail: "vendas@assistcard.com",
    defaultCommission: 30, paymentTerm: "15",
    notes: "Maior comissão do mercado em seguro viagem.", rating: 5, active: true, createdAt: "2025-08-28" },
  { id: "s8", name: "MSC Cruzeiros", category: "cruise", cnpj: "07.220.060/0001-12", website: "https://www.msccruzeiros.com.br",
    contactName: "André Castro", contactPhone: "(11) 3956-9595", contactEmail: "agencias@msccruzeiros.com.br",
    defaultCommission: 15, paymentTerm: "60", accessNotes: "Portal: mscbook.com",
    notes: "Cruzeiros temáticos e família.", rating: 5, active: true, createdAt: "2025-11-15" },
];
