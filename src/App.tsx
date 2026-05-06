import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Quotes from "./pages/Quotes";
import Pipeline from "./pages/Pipeline";
import Opportunities from "./pages/Opportunities";
import Flights from "./pages/Flights";
import Financial from "./pages/Financial";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import BookingPage from "./pages/BookingPage";
import Notifications from "./pages/Notifications";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import Itineraries from "./pages/Itineraries";
import ItineraryPublic from "./pages/ItineraryPublic";
import Vouchers from "./pages/Vouchers";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ConnectionIndicator } from "@/components/ConnectionIndicator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ConnectionIndicator />
      <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reserva/:quoteId" element={
              <DataProvider>
                <BookingPage />
              </DataProvider>
            } />
            <Route path="/itinerario/:slug" element={<ItineraryPublic />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <DataProvider>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/clientes" element={<Clients />} />
                      <Route path="/clientes/:id" element={<ClientDetail />} />
                      <Route path="/pipeline" element={<Pipeline />} />
                      <Route path="/oportunidades" element={<Opportunities />} />
                      <Route path="/cotacoes" element={<Quotes />} />
                      <Route path="/pacotes" element={<Packages />} />
                      <Route path="/pacotes/:id" element={<PackageDetail />} />
                      <Route path="/voos" element={<Flights />} />
                      <Route path="/itinerarios" element={<Itineraries />} />
                      <Route path="/vouchers" element={<Vouchers />} />
                      <Route path="/fornecedores" element={<Suppliers />} />
                      <Route path="/fornecedores/:id" element={<SupplierDetail />} />
                      <Route path="/financeiro" element={<Financial />} />
                      <Route path="/alertas" element={<Notifications />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </DataProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
