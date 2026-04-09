import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import OrderSuccess from './pages/OrderSuccess';


const FullPageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white">
    <div className="spinner mb-4"></div>
    <p className="font-serif text-xl animate-pulse">Flowers Hope</p>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <FullPageLoader />;
  return user ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
              <Toaster position="bottom-right" />
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/register" element={<Auth />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  
                  {/* Protected (Any authenticated user) */}
                  <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                   <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                   <Route path="/order-success" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />

                  
                  {/* Admin Only */}
                  <Route path="/admin" element={
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  } />
                  
                  {/* Seller Only */}
                  <Route path="/seller" element={
                    <RoleRoute allowedRoles={['seller']}>
                      <SellerDashboard />
                    </RoleRoute>
                  } />

                </Routes>
              </main>
              
              <footer className="bg-white py-6 border-t mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
                  <p>&copy; 2026 Flowers Hope. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
