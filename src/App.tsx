import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SellPhone from "./pages/SellPhone";
import PhoneDetail from "./pages/PhoneDetail";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";
import OrderDetails from "@/pages/OrderDetails";
import MyOrders from "@/pages/MyOrders";




// Lazy load less critical pages
const Login = lazy(() => import("./pages/Login"));
const Brands = lazy(() => import("./pages/Brands"));

const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
const Checkout = lazy(() => import("./pages/Checkout"));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="h-screen w-screen flex items-center justify-center">
                Loading...
              </div>
            }
          >
            <Routes>
              {/* Main pages */}
              <Route path="/" element={<Index />} />
              <Route path="/sell" element={<SellPhone />} />
              <Route path="/sell/:phoneId" element={<PhoneDetail />} />

              {/* Lazy loaded pages */}
              <Route path="/login" element={<Login />} />

              <Route path="/brands" element={<Brands />} />
              <Route path="/brands/:brandId" element={<Brands />} />
              
              
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
              
              <Route path="/order/:orderId" element={<OrderDetails />} />
              <Route path="/my-orders" element={<MyOrders />} />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
