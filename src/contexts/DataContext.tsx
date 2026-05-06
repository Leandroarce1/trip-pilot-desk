import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Client, Quote, Flight, Transaction, TravelPackage, Notification, Supplier,
  Opportunity, Itinerary, Voucher, Traveler,
} from "@/types/crm";
import {
  mapClient, clientToRow,
  mapQuote, quoteToRow,
  mapOpportunity, opportunityToRow,
  mapTraveler, travelerToRow,
  mapFlight, flightToRow,
  mapTransaction, transactionToRow,
  mapPackage, packageToRow,
  mapNotification,
  mapSupplier, supplierToRow,
  mapItinerary, itineraryToRow,
  mapVoucher, voucherToRow,
} from "@/lib/mappers";
import { buildClientSideNotifications } from "@/lib/automations";

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
  travelers: Traveler[];
  addClient: (c: Omit<Client, "id" | "createdAt">) => Promise<Client | void>;
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
  addTraveler: (t: Omit<Traveler, "id" | "createdAt">) => Promise<Traveler | void>;
  updateTraveler: (t: Traveler) => Promise<void>;
  deleteTraveler: (id: string) => Promise<void>;
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
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);

  const getClientName = useCallback(
    (clientId: string) => clients.find((c) => c.id === clientId)?.name || "",
    [clients]
  );

  const loadAll = useCallback(async () => {
    if (!user) {
      setClients([]); setQuotes([]); setFlights([]); setTransactions([]);
      setPackages([]); setNotifications([]); setSuppliers([]); setOpportunities([]);
      setItineraries([]); setVouchers([]); setTravelers([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [
      clientsRes, suppliersRes, quotesRes, flightsRes,
      transactionsRes, packagesRes, notificationsRes, opportunitiesRes,
      itinerariesRes, vouchersRes, travelersRes,
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
      supabase.from("travelers").select("*").order("created_at", { ascending: false }),
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
    setTravelers(((travelersRes as any).data ?? []).map(mapTraveler));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) loadAll();
  }, [authLoading, loadAll]);

  // Automações de notificação migraram para a edge function `run-automations`,
  // executada diariamente via pg_cron. Mantemos apenas o estado local aqui.

  // ---------- CRUD: Clients ----------
  const addClient = async (c: Omit<Client, "id" | "createdAt">) => {
    if (!user) return;
    const { data, error } = await supabase.from("clients").insert(clientToRow(c, user.id)).select().single();
    if (error) throw error;
    const mapped = mapClient(data);
    setClients((prev) => [mapped, ...prev]);
    return mapped;
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
    const previous = transactions.find((x) => x.id === t.id);
    const { data, error } = await supabase.from("transactions").update(transactionToRow(t, user.id)).eq("id", t.id).select().single();
    if (error) throw error;
    const mapped = mapTransaction(data, getClientName(data.client_id));
    setTransactions((prev) => prev.map((x) => (x.id === t.id ? mapped : x)));

    // ---- Automação: ao quitar recebimento principal de uma reserva, marcar como paga + confirmar ----
    const becamePaid = previous?.status !== "paid" && mapped.status === "paid";
    if (becamePaid && mapped.type === "income" && mapped.packageId && mapped.category !== "commission") {
      const pkg = packages.find((p) => p.id === mapped.packageId);
      if (pkg) {
        // soma de tudo já pago (income) para esta reserva, ignorando comissão
        const totalPaid = transactions
          .filter((x) => x.packageId === pkg.id && x.type === "income" && x.category !== "commission" && x.id !== mapped.id)
          .reduce((s, x) => s + (x.status === "paid" ? x.value : 0), 0) + mapped.value;

        const fullyPaid = totalPaid >= pkg.totalValue;
        const newPayment = fullyPaid ? "paid" : "partial";
        const newReservation = fullyPaid && pkg.reservationStatus !== "cancelled" ? "confirmed" : pkg.reservationStatus;

        if (pkg.paymentStatus !== newPayment || pkg.reservationStatus !== newReservation) {
          await updatePackage({
            ...pkg,
            paymentStatus: newPayment,
            reservationStatus: newReservation,
            history: [
              ...pkg.history,
              { date: new Date().toISOString(), action: fullyPaid ? "Pagamento total recebido — reserva confirmada" : "Pagamento parcial recebido" },
            ],
          });
        }
      }
    }
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
    const mapped = mapPackage(data, getClientName(data.client_id));
    setPackages((prev) => [mapped, ...prev]);

    // ---- Automação: gerar conta a receber pendente vinculada à reserva ----
    if (mapped.totalValue > 0 && mapped.clientId) {
      try {
        const receivable: Omit<Transaction, "id"> = {
          type: "income",
          description: `Recebimento — ${mapped.destinationCity || mapped.name} (${mapped.clientName})`,
          value: mapped.totalValue,
          date: mapped.departureDate || new Date().toISOString().slice(0, 10),
          status: "pending",
          category: "sale",
          clientName: mapped.clientName,
          clientId: mapped.clientId,
          packageId: mapped.id,
        };
        const { data: txData, error: txErr } = await supabase
          .from("transactions").insert(transactionToRow(receivable, user.id)).select().single();
        if (!txErr && txData) {
          setTransactions((prev) => [mapTransaction(txData, getClientName(txData.client_id)), ...prev]);
        }
      } catch (e) {
        console.warn("Falha ao gerar conta a receber automática:", e);
      }
    }
  };
  const updatePackage = async (p: TravelPackage) => {
    if (!user) return;
    const previous = packages.find((x) => x.id === p.id);
    const { data, error } = await supabase.from("packages").update(packageToRow(p, user.id)).eq("id", p.id).select().single();
    if (error) throw error;
    const mapped = mapPackage(data, getClientName(data.client_id));
    setPackages((prev) => prev.map((x) => (x.id === p.id ? mapped : x)));

    // ---- Automação: ao confirmar reserva, gera comissão (pendente) automaticamente ----
    const becameConfirmed = previous?.reservationStatus !== "confirmed" && mapped.reservationStatus === "confirmed";
    if (becameConfirmed && mapped.totalValue > 0 && mapped.commissionPercent > 0) {
      const expected = (mapped.totalValue * mapped.commissionPercent) / 100;
      const alreadyHasCommission = transactions.some(
        (t) => t.packageId === mapped.id && t.category === "commission",
      );
      if (!alreadyHasCommission && expected > 0) {
        try {
          const commissionTx: Omit<Transaction, "id"> = {
            type: "income",
            description: `Comissão — ${mapped.destinationCity} (${mapped.clientName})`,
            value: expected,
            date: new Date().toISOString().slice(0, 10),
            status: "pending",
            category: "commission",
            clientName: mapped.clientName,
            clientId: mapped.clientId,
            packageId: mapped.id,
          };
          const { data: txData, error: txErr } = await supabase
            .from("transactions").insert(transactionToRow(commissionTx, user.id)).select().single();
          if (!txErr && txData) {
            setTransactions((prev) => [mapTransaction(txData, getClientName(txData.client_id)), ...prev]);
          }
        } catch (e) {
          console.warn("Falha ao gerar comissão automática:", e);
        }
      }
    }
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

  // ---------- CRUD: Travelers ----------
  const addTraveler = async (t: Omit<Traveler, "id" | "createdAt">): Promise<Traveler | void> => {
    if (!user) return;
    const { data, error } = await supabase.from("travelers").insert(travelerToRow(t, user.id)).select().single();
    if (error) throw error;
    const mapped = mapTraveler(data);
    setTravelers((prev) => [mapped, ...prev]);
    return mapped;
  };
  const updateTraveler = async (t: Traveler) => {
    if (!user) return;
    const { data, error } = await supabase.from("travelers").update(travelerToRow(t, user.id)).eq("id", t.id).select().single();
    if (error) throw error;
    setTravelers((prev) => prev.map((x) => (x.id === t.id ? mapTraveler(data) : x)));
  };
  const deleteTraveler = async (id: string) => {
    const { error } = await supabase.from("travelers").delete().eq("id", id);
    if (error) throw error;
    setTravelers((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <DataContext.Provider value={{
      loading,
      clients, quotes, flights, transactions, packages, notifications, suppliers, opportunities,
      itineraries, vouchers, travelers,
      addClient, updateClient, deleteClient,
      addQuote, updateQuote, deleteQuote,
      addFlight, updateFlight, deleteFlight,
      addTransaction, updateTransaction, deleteTransaction,
      addPackage, updatePackage, deletePackage,
      addSupplier, updateSupplier, deleteSupplier,
      addOpportunity, updateOpportunity, deleteOpportunity,
      addItinerary, updateItinerary, deleteItinerary,
      addVoucher, updateVoucher, deleteVoucher,
      addTraveler, updateTraveler, deleteTraveler,
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
