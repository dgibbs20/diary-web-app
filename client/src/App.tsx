import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Subscription from "./pages/Subscription";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/subscription" component={() => <ProtectedRoute component={Subscription} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [location] = useLocation();
  const isSplash = location === '/';

  return (
    <>
      {!isSplash && <Header />}
      <Router />
      {!isSplash && <Footer />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AuthProvider>
          <TooltipProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  borderRadius: '0.5rem',
                },
              }}
            />
            <AppLayout />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
