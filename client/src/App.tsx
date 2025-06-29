import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContext, useAuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!auth.user) {
    return <AuthModal isOpen={true} onClose={() => {}} />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const auth = useAuthProvider();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthContext.Provider value={auth}>
          <Toaster />
          <AuthenticatedApp />
        </AuthContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
