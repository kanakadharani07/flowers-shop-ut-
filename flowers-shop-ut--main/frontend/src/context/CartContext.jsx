import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.cart) {
      setCart(user.cart);
    } else if (!user) {
      setCart([]);
    }
  }, [user]);

  const syncCartToBackend = async (newCart) => {
    if (user) {
      try {
        await api.post('/auth/cart', { cart: newCart });
      } catch (err) {
        console.error("Error syncing cart to backend", err);
      }
    }
  };

  const addToCart = (product, qty = 1) => {
    if (!user) return;
    const existing = cart.find((item) => item.product === (product._id || product.product));
    let newCart;
    if (existing) {
      if (existing.qty + qty > (product.stock || existing.stock)) {
        toast.error("Not enough stock available.");
        return;
      }
      newCart = cart.map((item) =>
        item.product === (product._id || product.product) ? { ...item, qty: item.qty + qty } : item
      );
      setCart(newCart);
      toast.success(qty > 1 ? `Added ${qty} items to cart!` : "Added to cart!");
    } else {
      if (product.stock === 0) {
        toast.error("Product is out of stock.");
        return;
      }
      if (qty > product.stock) {
        toast.error("Not enough stock available.");
        return;
      }
      newCart = [...cart, { 
        product: product._id, 
        name: product.name, 
        price: product.price, 
        image: product.image, 
        qty: qty, 
        stock: product.stock 
      }];
      setCart(newCart);
      toast.success(qty > 1 ? `Added ${qty} items to cart!` : "Added to cart!");
    }
    syncCartToBackend(newCart);
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
    syncCartToBackend(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter((item) => item.product !== productId);
    setCart(newCart);
    toast.success("Removed from cart");
    syncCartToBackend(newCart);
  };

  const clearCart = () => {
    setCart([]);
    syncCartToBackend([]);
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
