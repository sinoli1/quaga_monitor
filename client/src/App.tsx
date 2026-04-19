import { Route, Switch, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/tab1" />} />
      <Route path="/tab1" component={Dashboard} />
      <Route path="/tab2" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen overflow-y-auto relative">
        {/* Fondo animado */}
        <div className="floating-shapes pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
          <div className="shape shape-4" />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 relative z-10 w-full max-w-[1400px] 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-20">
          <Router />
          <Toaster />
        </div>
        <footer
          className="hidden md:flex
    fixed bottom-0 left-1/2
    transform -translate-x-1/2
    backdrop-blur-sm
    rounded-t-md
    overflow-hidden
    text-center text-sm text-gray-500
    py-2 px-4
    z-50
    shadow
  "
        >
          Propiedad intelectual de&nbsp;
          <a
            href="https://quaga.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            QUAGA SRL
          </a>
          &nbsp;· {new Date().getFullYear()}
        </footer>

      </div>
    </QueryClientProvider>
  );
}

export default App;
