import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Cronograma from "@/pages/cronograma";
import Tarefas from "@/pages/tarefas";
import Disciplinas from "@/pages/disciplinas";
import Notas from "@/pages/notas";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/cronograma" component={Cronograma} />
      <Route path="/tarefas" component={Tarefas} />
      <Route path="/disciplinas" component={Disciplinas} />
      <Route path="/notas" component={Notas} />
      <Route component={NotFound} />
    </Switch>
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
