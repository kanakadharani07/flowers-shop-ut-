import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Keep Firebase sync for Google Login or if already signed in via Firebase
      if (firebaseUser && !localStorage.getItem('token')) {
        try {
          const res = await api.post('/auth/firebase-sync', {
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            uid: firebaseUser.uid
          });
          localStorage.setItem('token', res.data.token);
          setUser(res.data.user);
        } catch (err) {
          console.error("Firebase sync failed:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    // We'll primarily use backend login now to ensure isApproved check
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password, role, businessName, businessAddress) => {
    const res = await api.post('/auth/register', { 
      name, email, password, role, businessName, businessAddress 
    });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    await firebaseSignOut(auth).catch(() => {}); // optional firebase logout
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
