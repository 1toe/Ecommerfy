import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmailJsInitializer from '@/components/EmailJsInitializer';

import { AuthProvider } from "./contexts/AuthContext";
import { ProductProvider } from "./contexts/ProductContext";
import { CartProvider } from "./contexts/CartContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import OrderSuccess from "./pages/OrderSuccess";

const queryClient = new QueryClient();

// Configuración de EmailJS se importa desde las variables de entorno
const emailJsPublicKey = "JWo9NZfMPxqB-MI_a";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Inicializar EmailJS al cargar la aplicación */}
      <EmailJsInitializer publicKey={emailJsPublicKey} />
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/order/success/:orderId" element={<OrderSuccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
