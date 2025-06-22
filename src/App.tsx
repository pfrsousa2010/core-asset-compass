
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Layout } from "@/components/layout/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Assets from "@/pages/Assets";
import AssetDetails from "@/pages/AssetDetails";
import CreateAsset from "@/pages/CreateAsset";
import EditAsset from "@/pages/EditAsset";
import Users from "@/pages/Users";
import Profile from "@/pages/Profile";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-[85vh] bg-gradient-to-br from-slate-50 to-blue-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <AuthGuard>
                  <Layout>
                    <Navigate to="/dashboard" replace />
                  </Layout>
                </AuthGuard>
              } />
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Layout>
                    <Dashboard />
                  </Layout>
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
            </Routes>
          </div>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
