import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import FilterWords from "@/pages/FilterWords";
import UserLogs from "@/pages/UserLogs";
import BotSettings from "@/pages/BotSettings";
import HelpCommands from "@/pages/HelpCommands";
import Login from "@/pages/Login";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

// Protected route component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  
  // While checking authentication status, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }
  
  // If authenticated, render the component
  return <Component />;
}

function Router() {
  const { isAuthenticated } = useAuth();
  
  // If not logged in, only show login page with minimal layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/:rest*">
            {() => {
              window.location.href = "/login";
              return null;
            }}
          </Route>
        </Switch>
        <Toaster />
      </div>
    );
  }
  
  // If logged in, show full dashboard with navigation
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <Switch>
            <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
            <Route path="/filter-words" component={() => <ProtectedRoute component={FilterWords} />} />
            <Route path="/user-logs" component={() => <ProtectedRoute component={UserLogs} />} />
            <Route path="/settings" component={() => <ProtectedRoute component={BotSettings} />} />
            <Route path="/help" component={() => <ProtectedRoute component={HelpCommands} />} />
            <Route path="/login" component={Login} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
