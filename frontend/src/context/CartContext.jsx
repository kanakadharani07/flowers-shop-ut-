import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().cart) {
            setCart(docSnap.data().cart);
          } else {
            setCart([]);
          }
        } catch (err) {
          console.error("Error fetching cart from Firestore", err);
        }
      } else {
        setCart([]); // Clear cart if logged out
      }
    };
    fetchCart();
  }, [user]);

  const syncCartToFirebase = async (newCart) => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { cart: newCart }, { merge: true });
      } catch (err) {
        console.error("Error syncing cart to Firestore", err);
      }
    }
  };

  const addToCart = (product) => {
    if (!user) return; // Handled by component redirect
    const existing = cart.find((item) => item.product === (product._id || product.product));
    let newCart;
    if (existing) {
      if (existing.qty >= (product.stock || existing.stock)) {
        toast.error("Not enough stock available.");
        return;
      }
      newCart = cart.map((item) =>
        item.product === (product._id || product.product) ? { ...item, qty: item.qty + 1 } : item
      );
      setCart(newCart);
      toast.success("Added another to cart!");
    } else {
      if (product.stock === 0) {
        toast.error("Product is out of stock.");
        return;
      }
      newCart = [...cart, { 
        product: product._id, 
        name: product.name, 
        price: product.price, 
        image: product.image, 
        qty: 1, 
        stock: product.stock 
      }];
      setCart(newCart);
      toast.success("Added to cart!");
    }
    syncCartToFirebase(newCart);
  };

  const updateQty = (productId, newQty) => {
    let newCart = cart.map((item) => {
      if (item.product === productId) {
        if (newQty > item.stock) {
            toast.error('Cannot exceed available stock.');
            return item;
        }
        if (newQty < 1) return item;
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCart(newCart);
    syncCartToFirebase(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter((item) => item.product !== productId);
    setCart(newCart);
    toast.success("Removed from cart");
    syncCartToFirebase(newCart);
  };

  const clearCart = () => {
    setCart([]);
    syncCartToFirebase([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.qty, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
