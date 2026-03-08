import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { PageLoading } from './components/ui/Loading';
import Layout from './layouts/Layout';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/auth/ProtectedRoute';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const GradeShowcasePage = lazy(() => import('./pages/GradeShowcasePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Placeholder pages (to be created)
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').catch(() => ({ default: () => <PlaceholderPage title="Checkout" /> })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').catch(() => ({ default: () => <PlaceholderPage title="My Orders" /> })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').catch(() => ({ default: () => <PlaceholderPage title="Profile" /> })));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').catch(() => ({ default: () => <PlaceholderPage title="Admin Dashboard" /> })));

// Placeholder component for pages not yet created
function PlaceholderPage({ title }) {
  return (
    <div className="container-custom py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-500">หน้านี้กำลังอยู่ระหว่างการพัฒนา</p>
    </div>
  );
}

// 404 Page
function NotFoundPage() {
  return (
    <div className="container-custom py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบหน้าที่ค้นหา</h2>
      <p className="text-gray-500 mb-8">หน้าที่คุณกำลังมองหาไม่มีอยู่หรือถูกย้ายไปแล้ว</p>
      <a href="/" className="btn-primary inline-block">
        กลับหน้าแรก
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Public routes with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/grades" element={<GradeShowcasePage />} />
          
          {/* Protected routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Auth routes without layout */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
