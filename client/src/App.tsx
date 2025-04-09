import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import Questions from "@/pages/questions";
import Settings from "@/pages/settings";
import MainLayout from "@/components/layouts/MainLayout";
import { useState } from "react";

// Define user type
export interface User {
  id: number;
  username: string;
  email: string;
}

function Router() {
  const [user, setUser] = useState<User | null>(null);
  const [_, navigate] = useLocation();

  // Auth methods
  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <MainLayout user={user} onLogin={login} onLogout={logout}>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="page-container">
          <Switch>
            <Route path="/" component={() => <Dashboard user={user} />} />
            <Route path="/documents" component={() => <Documents user={user} />} />
            <Route path="/questions" component={() => <Questions user={user} />} />
            <Route path="/settings" component={() => <Settings user={user} />} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
