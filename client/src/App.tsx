import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Planning from "@/pages/planning";
import Dishes from "@/pages/dishes";
import Shopping from "@/pages/shopping";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Switch>
        <Route path="/" component={Planning} />
        <Route path="/planning" component={Planning} />
        <Route path="/dishes" component={Dishes} />
        <Route path="/shopping" component={Shopping} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
