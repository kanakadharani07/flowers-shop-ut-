import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().wishlist) {
            setWishlist(docSnap.data().wishlist);
          } else {
            setWishlist([]);
          }
        } catch (e) {
          console.error("Error fetching wishlist", e);
        }
      } else {
        setWishlist([]);
      }
    };
    fetchWishlist();
  }, [user]);

  const syncWishlistToFirebase = async (newWishlist) => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { wishlist: newWishlist }, { merge: true });
      } catch (err) {
        console.error("Error syncing wishlist", err);
      }
    }
  };

  const toggleWishlist = (product) => {
    if (!user) return; // Handled by component redirect
    const exists = wishlist.find(item => item._id === product._id);
    let newWishlist;
    if (exists) {
      newWishlist = wishlist.filter(item => item._id !== product._id);
      setWishlist(newWishlist);
      toast.success("Removed from wishlist");
    } else {
      newWishlist = [...wishlist, product];
      setWishlist(newWishlist);
      toast.success("Added to wishlist");
    }
    syncWishlistToFirebase(newWishlist);
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
