
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import BudgetTracker from "./pages/BudgetTracker";
import Transactions from "./pages/Transactions";
import Milestones from "./pages/Milestones";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <SidebarInset className="flex-1">
                        <main className="flex-1 p-6">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/budget" element={<BudgetTracker />} />
                            <Route path="/transactions" element={<Transactions />} />
                            <Route path="/milestones" element={<Milestones />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
