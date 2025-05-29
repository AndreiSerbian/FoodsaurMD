
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Producers from "./pages/Producers";
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";
import ProducerAuth from "./pages/ProducerAuth";
import ProducerDashboard from "./pages/ProducerDashboard";
import ProducersMap from "./pages/ProducersMap";
import AdminMigration from "./pages/AdminMigration";
import "./i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            <Route path="/category/:categorySlug" element={
              <Layout>
                <Producers />
              </Layout>
            } />
            <Route path="/producer/:producerName" element={
              <Layout>
                <Products />
              </Layout>
            } />
            <Route path="/map" element={
              <Layout>
                <ProducersMap />
              </Layout>
            } />
            <Route path="/auth" element={<ProducerAuth />} />
            <Route path="/producer/dashboard" element={<ProducerDashboard />} />
            <Route path="/admin-migration" element={<AdminMigration />} />
            <Route path="*" element={
              <Layout>
                <NotFound />
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
