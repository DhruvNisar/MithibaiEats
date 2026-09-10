import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Student Pages
import { Home } from './pages/student/Home';
import { CanteenList } from './pages/student/CanteenList';
import { CanteenMenu } from './pages/student/CanteenMenu';
import { FoodDetail } from './pages/student/FoodDetail';
import { Checkout } from './pages/student/Checkout';
import { OrderTracking } from './pages/student/OrderTracking';
import { OrderHistory } from './pages/student/OrderHistory';
import { Profile } from './pages/student/Profile';
import { Favorites } from './pages/student/Favorites';
import { QRLanding } from './pages/student/QRLanding';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminFood } from './pages/admin/AdminFood';
import { AdminCanteens } from './pages/admin/AdminCanteens';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminQR } from './pages/admin/AdminQR';
import { AdminSettings } from './pages/admin/AdminSettings';
import { NotFound } from './pages/NotFound';

const ProtectedRoute = ({ allowedRoles, children }: { allowedRoles?: string[], children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/order" element={<QRLanding />} />
        <Route path="/qr" element={<QRLanding />} />

        {/* Student Routes */}
        <Route element={<StudentLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/canteens" element={<CanteenList />} />
          <Route path="/canteen/:id" element={<CanteenMenu />} />
          <Route path="/food/:id" element={<FoodDetail />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/order-tracking/:id" element={<OrderTracking />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <Favorites />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="food" element={<AdminFood />} />
          <Route path="canteens" element={<AdminCanteens />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="qr" element={<AdminQR />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
