import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/not-found";
import AuthPage from "./pages/auth-page";
import ProfilePage from "./pages/profile-page";
import NetworkPage from "./pages/network-page";
import AutomationPage from "./pages/automation-page";
import SettingsPage from "./pages/settings-page";
import StorePage from "./pages/store-page";
import UpgradePage from "./pages/upgrade-page";
import DepositPage from "./pages/deposit-page";
import GuidePage from "./pages/guide-page";
import WorkflowPage from "./pages/workflow-page";
import HomePage from "./pages/home-page";
import { AppLayout } from "./layouts/app-layout";
import { queryClient } from "./lib/queryClient";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/us/useAuth";
import { BalanceProvider } from "./hooks/us/useBalance";


function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute
        path="/"
        component={() => (
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        )}
      />
      <ProtectedRoute
        path="/profile"
        component={() => (
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        )}
      />

      <ProtectedRoute
        path="/network"
        component={() => (
          <AppLayout>
            <NetworkPage />
          </AppLayout>
        )}
      />
      <ProtectedRoute
        path="/automation"
        component={() => (
          <AppLayout>
            <WorkflowPage />
          </AppLayout>
        )}
      />
      <ProtectedRoute
        path="/workflow"
        component={() => (
          <AppLayout>
            <WorkflowPage />
          </AppLayout>
        )}
      />
      <ProtectedRoute
        path="/settings"
        component={() => (
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        )}
      />
      <ProtectedRoute
        path="/store"
        component={() => (
          <AppLayout>
            <StorePage />
          </AppLayout>
        )}
      />
      <ProtectedRoute
        path="/upgrade"
        component={() => (
          <AppLayout>
            <UpgradePage />
          </AppLayout>
        )}
      />
      <ProtectedRoute
        path="/deposit"
        component={() => (
          <AppLayout>
            <DepositPage />
          </AppLayout>
        )}
      />
      <ProtectedRoute
        path="/guide"
        component={() => (
          <AppLayout>
            <GuidePage />
          </AppLayout>
        )}
      />
      <ProtectedRoute
        path="/home"
        component={() => (
          <AppLayout>
            <HomePage />
          </AppLayout>
        )}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BalanceProvider>
          <Router />
          <Toaster />
        </BalanceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
