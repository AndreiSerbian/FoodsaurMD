
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { NewCartProvider } from "./contexts/NewCartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Producers from "./pages/Producers";
import ProducerProfile from "./pages/ProducerProfile";
import ProducerPoints from "./pages/ProducerPoints";
import Products from "./pages/Products.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import OrderSearchPage from "./pages/OrderSearch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <NewCartProvider>
            <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Публичные маршруты */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/category/:categoryName" element={<Layout><Producers /></Layout>} />
                <Route path="/producer/:producerSlug" element={<Layout><ProducerProfile /></Layout>} />
                <Route path="/producer/:producerSlug/points" element={<Layout><ProducerPoints /></Layout>} />
                <Route path="/producer/:producerSlug/products" element={<Layout><Products /></Layout>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Защищенные маршруты */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute requiredRole="producer">
                      <Layout><Dashboard /></Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin-panel" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Layout><AdminPanel /></Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="/order-search" element={<Layout><OrderSearchPage /></Layout>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </CartProvider>
          </NewCartProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
