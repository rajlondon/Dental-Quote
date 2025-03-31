import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "./pages/Home";
import ContactWidget from "@/components/ContactWidget";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // WhatsApp phone number (without + sign) and formatted display number for direct calls
  const whatsappNumber = "447572445856"; // UK WhatsApp number without + sign
  const phoneNumber = "+44 7572 445856"; // Formatted display number for direct calls
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ContactWidget whatsappNumber={whatsappNumber} phoneNumber={phoneNumber} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
