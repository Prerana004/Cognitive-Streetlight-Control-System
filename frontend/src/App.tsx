import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SmartCitySidebar } from "@/components/SmartCity/SmartCitySidebar";
import { SmartCityProvider } from "@/components/SmartCity/SmartCityContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Simulation from "./pages/Simulation";
import Demo from "./pages/Demo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SmartCityProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="min-h-screen flex w-full bg-background">
              <SmartCitySidebar />

              <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 sticky top-0 z-40">
                  <SidebarTrigger className="mr-4" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse shadow-lg shadow-green-600/50"></div>
                    <span className="text-sm text-muted-foreground">Smart City Operations Center</span>
                  </div>
                  <div className="ml-auto flex items-center gap-4">
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-primary"></div>
                  </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/simulation" element={<Simulation />} />
                    <Route path="/demo" element={<Demo />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </SmartCityProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
