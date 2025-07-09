
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Layout } from "@/components/layout/Layout";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Assets from "@/pages/Assets";
import AssetDetails from "@/pages/AssetDetails";
import CreateAsset from "@/pages/CreateAsset";
import EditAsset from "@/pages/EditAsset";
import Users from "@/pages/Users";
import Profile from "@/pages/Profile";
import MyPlan from "@/pages/MyPlan";
import AccessDenied from "@/pages/AccessDenied";
import "./App.css";
import AuthRedirectHandler from "@/components/auth/AuthRedirectHandler";
import ResetPassword from "@/pages/ResetPassword";
import SetPassword from "@/pages/SetPassword";
import Register from "./pages/Register";
import OnboardingNew from './pages/OnboardingNew';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Index from "@/pages/Index";
import { PWABanners } from "@/components/PWABanners";


const queryClient = new QueryClient();

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { profile, company, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && profile && !company && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, [profile, company, loading, location.pathname, navigate]);

  // Só renderiza children se já carregou e:
  // - tem empresa OU está na página de onboarding
  if (loading) return null;
  if (profile && !company && location.pathname !== '/onboarding') return null;
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthRedirectHandler />
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Routes>
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/register" element={<Register />} />
              <Route path="/acesso-negado" element={<AccessDenied />} />
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={
                <AuthGuard>
                  <OnboardingGuard>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </OnboardingGuard>
                </AuthGuard>
              } />
              <Route path="/assets" element={
                <AuthGuard>
                  <Layout>
                    <Assets />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/assets/new" element={
                <AuthGuard>
                  <Layout>
                    <CreateAsset />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/assets/:id" element={
                <AuthGuard>
                  <Layout>
                    <AssetDetails />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/assets/:id/edit" element={
                <AuthGuard>
                  <Layout>
                    <EditAsset />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/users" element={
                <AuthGuard requiredRole="admin">
                  <Layout>
                    <Users />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/profile" element={
                <AuthGuard>
                  <Layout>
                    <Profile />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/my-plan" element={
                <AuthGuard requiredRole="admin">
                  <Layout>
                    <MyPlan />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/onboarding" element={
                <AuthGuard>
                  <OnboardingNew />
                </AuthGuard>
              } />
            </Routes>
          </div>
          <OfflineIndicator />
          <PWABanners />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
