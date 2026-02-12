import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Client, Quote, Flight, Transaction, TravelPackage, Notification } from "@/types/crm";
import { mockClients, mockQuotes, mockFlights, mockTransactions, mockPackages, mockNotifications } from "@/data/mockData";

interface DataContextType {
  clients: Client[];
  quotes: Quote[];
  flights: Flight[];
  transactions: Transaction[];
  packages: TravelPackage[];
  notifications: Notification[];
  addClient: (c: Omit<Client, "id" | "createdAt">) => void;
  updateClient: (c: Client) => void;
  deleteClient: (id: string) => void;
  addQuote: (q: Omit<Quote, "id" | "createdAt" | "clientName">) => void;
  updateQuote: (q: Quote) => void;
  deleteQuote: (id: string) => void;
  addFlight: (f: Omit<Flight, "id" | "clientName">) => void;
  updateFlight: (f: Flight) => void;
  deleteFlight: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addPackage: (p: Omit<TravelPackage, "id" | "clientName" | "createdAt">) => void;
  updatePackage: (p: TravelPackage) => void;
  deletePackage: (id: string) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (n: Omit<Notification, "id">) => void;
  getClientName: (clientId: string) => string;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [flights, setFlights] = useState<Flight[]>(mockFlights);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [packages, setPackages] = useState<TravelPackage[]>(mockPackages);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const getClientName = useCallback((clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "";
  }, [clients]);

  const addClient = useCallback((c: Omit<Client, "id" | "createdAt">) => {
    setClients((prev) => [{ ...c, id: String(Date.now()), createdAt: new Date().toISOString().split("T")[0] }, ...prev]);
  }, []);

  const updateClient = useCallback((c: Client) => {
    setClients((prev) => prev.map((x) => (x.id === c.id ? c : x)));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addQuote = useCallback((q: Omit<Quote, "id" | "createdAt" | "clientName">) => {
    const clientName = clients.find((c) => c.id === q.clientId)?.name || "";
    setQuotes((prev) => [{ ...q, id: String(Date.now()), clientName, createdAt: new Date().toISOString().split("T")[0] }, ...prev]);
  }, [clients]);

  const updateQuote = useCallback((q: Quote) => {
    setQuotes((prev) => prev.map((x) => (x.id === q.id ? q : x)));
  }, []);

  const deleteQuote = useCallback((id: string) => {
    setQuotes((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addFlight = useCallback((f: Omit<Flight, "id" | "clientName">) => {
    const clientName = clients.find((c) => c.id === f.clientId)?.name || "";
    setFlights((prev) => [{ ...f, id: String(Date.now()), clientName }, ...prev]);
  }, [clients]);

  const updateFlight = useCallback((f: Flight) => {
    setFlights((prev) => prev.map((x) => (x.id === f.id ? f : x)));
  }, []);

  const deleteFlight = useCallback((id: string) => {
    setFlights((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [{ ...t, id: String(Date.now()) }, ...prev]);
  }, []);

  const updateTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addPackage = useCallback((p: Omit<TravelPackage, "id" | "clientName" | "createdAt">) => {
    const clientName = clients.find((c) => c.id === p.clientId)?.name || "";
    setPackages((prev) => [{ ...p, id: String(Date.now()), clientName, createdAt: new Date().toISOString().split("T")[0] }, ...prev]);
  }, [clients]);

  const updatePackage = useCallback((p: TravelPackage) => {
    setPackages((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  }, []);

  const deletePackage = useCallback((id: string) => {
    setPackages((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, "id">) => {
    setNotifications((prev) => [{ ...n, id: String(Date.now()) }, ...prev]);
  }, []);

  return (
    <DataContext.Provider value={{
      clients, quotes, flights, transactions, packages, notifications,
      addClient, updateClient, deleteClient,
      addQuote, updateQuote, deleteQuote,
      addFlight, updateFlight, deleteFlight,
      addTransaction, updateTransaction, deleteTransaction,
      addPackage, updatePackage, deletePackage,
      markNotificationRead, addNotification,
      getClientName,
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
