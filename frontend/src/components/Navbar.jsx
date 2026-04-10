import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalItems = cart.reduce((total, item) => total + item.qty, 0);
  const totalWishlist = wishlist ? wishlist.length : 0;

  return (
    <nav className="navbar sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-pink-100 shadow-sm transition-all duration-300">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
              <span className="font-serif text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent transform transition hover:scale-105 inline-block">Flowers Hope</span>
            </Link>
          </div>
          
          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            
            {(!user || user.role === 'user') && (
              <>
                <Link to="/wishlist" className="nav-link cart-link">
                  Wishlist
                  {totalWishlist > 0 && (
                    <span className="badge">{totalWishlist}</span>
                  )}
                </Link>
                <Link to="/cart" className="nav-link cart-link">
                  Cart
                  {totalItems > 0 && (
                    <span className="badge">{totalItems}</span>
                  )}
                </Link>
              </>
            )}

            {!user ? (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link nav-link-primary">Register</Link>
              </>
            ) : (
              <div className="nav-user-actions">
                {user.role === 'admin' && <Link to="/admin" className="role-link-admin">Admin Panel</Link>}
                {user.role === 'seller' && <Link to="/seller" className="role-link-seller">Seller Panel</Link>}
                {user.role === 'user' && <Link to="/orders" className="nav-link">My Orders</Link>}
                
                <span className="nav-greeting">Hi, {user.name}</span>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
