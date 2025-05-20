
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { ProducerAuthProvider } from "./contexts/ProducerAuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Producers from "./pages/Producers";
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";
import ProducerLogin from "./pages/ProducerLogin";
import ProducerDashboard from "./pages/ProducerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProducerAuthProvider>
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
              <Route path="/category/:categoryName" element={
                <Layout>
                  <Producers />
                </Layout>
              } />
              <Route path="/producer/:producerName" element={
                <Layout>
                  <Products />
                </Layout>
              } />
              <Route path="/producer/login" element={<ProducerLogin />} />
              <Route path="/producer/dashboard" element={<ProducerDashboard />} />
              <Route path="*" element={
                <Layout>
                  <NotFound />
                </Layout>
              } />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ProducerAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
