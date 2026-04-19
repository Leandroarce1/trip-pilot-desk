import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { DataProvider } from "@/contexts/DataContext";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Quotes from "./pages/Quotes";
import Flights from "./pages/Flights";
import Financial from "./pages/Financial";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import BookingPage from "./pages/BookingPage";
import Notifications from "./pages/Notifications";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DataProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/clientes/:id" element={<ClientDetail />} />
              <Route path="/cotacoes" element={<Quotes />} />
              <Route path="/pacotes" element={<Packages />} />
              <Route path="/pacotes/:id" element={<PackageDetail />} />
              <Route path="/voos" element={<Flights />} />
              <Route path="/fornecedores" element={<Suppliers />} />
              <Route path="/fornecedores/:id" element={<SupplierDetail />} />
              <Route path="/financeiro" element={<Financial />} />
              <Route path="/alertas" element={<Notifications />} />
              <Route path="/reserva/:quoteId" element={<BookingPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </DataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
