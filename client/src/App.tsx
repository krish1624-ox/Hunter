import { Switch, Route } from "wouter";
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
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/filter-words" component={FilterWords} />
            <Route path="/user-logs" component={UserLogs} />
            <Route path="/settings" component={BotSettings} />
            <Route path="/help" component={HelpCommands} />
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
