import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminCategories from './pages/AdminCategories';

function AdminPage({ children }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <WishlistProvider>
              <CartProvider>
                <Router>
                  <Routes>
                    {/* ── Admin routes (own layout, no Navbar/Footer) ── */}
                    <Route path="/admin" element={<AdminPage><AdminDashboard /></AdminPage>} />
                    <Route path="/admin/products"   element={<AdminPage><AdminProducts /></AdminPage>} />
                    <Route path="/admin/orders"     element={<AdminPage><AdminOrders /></AdminPage>} />
                    <Route path="/admin/categories" element={<AdminPage><AdminCategories /></AdminPage>} />

                    {/* ── Public + Customer routes (Navbar + Footer) ── */}
                    <Route path="/*" element={
                      <div className="flex flex-col min-h-screen transition-colors duration-300">
                        <Navbar />
                        <main className="flex-grow">
                          <Routes>
                            <Route path="/"              element={<HomePage />} />
                            <Route path="/shop"          element={<ShopPage />} />
                            <Route path="/products/:id"  element={<ProductDetailPage />} />
                            <Route path="/login"         element={<LoginPage />} />
                            <Route path="/register"      element={<RegisterPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                            <Route path="/cart" element={
                              <ProtectedRoute><CartPage /></ProtectedRoute>
                            } />
                            <Route path="/checkout" element={
                              <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                              <ProtectedRoute><ProfilePage /></ProtectedRoute>
                            } />
                            <Route path="/orders" element={
                              <ProtectedRoute><ProfilePage /></ProtectedRoute>
                            } />
                          </Routes>
                        </main>
                        <Footer />
                      </div>
                    } />
                  </Routes>
                </Router>
              </CartProvider>
            </WishlistProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
