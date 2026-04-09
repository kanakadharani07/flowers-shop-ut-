import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.wishlist) {
      setWishlist(user.wishlist);
    } else if (!user) {
      setWishlist([]);
    }
  }, [user]);

  const syncWishlistToBackend = async (newWishlist) => {
    if (user) {
      try {
        await api.post('/auth/wishlist', { wishlist: newWishlist });
      } catch (err) {
        console.error("Error syncing wishlist to backend", err);
      }
    }
  };

  const toggleWishlist = (product) => {
    if (!user) return;
    const exists = wishlist.some(item => (item._id || item) === product._id);
    let newWishlist;
    if (exists) {
      newWishlist = wishlist.filter(item => (item._id || item) !== product._id);
      setWishlist(newWishlist);
      toast.success("Removed from wishlist");
    } else {
      newWishlist = [...wishlist, product];
      setWishlist(newWishlist);
      toast.success("Added to wishlist");
    }
    syncWishlistToBackend(newWishlist);
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
