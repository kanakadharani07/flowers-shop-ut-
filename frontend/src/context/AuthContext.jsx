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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let userData = { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || 'User', role: 'user' };
          
          try {
            // Sync with backend to get JWT for secure API routes (like products)
            // also backend creates or updates the MongoDB profile with default role if it doesn't exist.
            const res = await api.post('/auth/firebase-sync', {
              email: userData.email,
              name: userData.name,
              uid: userData.uid,
              role: userData.role
            });
            localStorage.setItem('token', res.data.token);
            // Optionally pull true role from backend sync if needed, though default user is fine.
            if (res.data.user && res.data.user.role) {
                userData.role = res.data.user.role;
            }
          } catch (apiErr) {
            console.warn("Backend sync failed, but proceeding locally:", apiErr);
          }
          
          setUser(userData);
        } catch (err) {
          console.error("Critical error setting up user:", err);
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (name, email, password, role) => {
    // Only use Firebase Auth. Bypass Firestore entirely to avoid silent hangs if uninitialized.
    // The backend /auth/firebase-sync will automatically create the Mongoose profile.
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
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
