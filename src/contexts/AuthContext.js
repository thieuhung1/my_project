// ============================================================
// AuthContext.js - Context xác thực người dùng (Firebase Auth)
// Fixed: PhotoURL length + dynamic import
// ============================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  logout,
  resetPassword,
  onAuthStateChange,
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  toggleFavorite as toggleFavoriteService,
} from '../backend';
import { updateProfile } from 'firebase/auth';  // Pre-import fix dynamic issue

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading]         = useState(true);

  // Sanitize profile data for Firebase limits
  const sanitizeProfileData = (data) => {
    const { displayName, photoURL, ...rest } = data;
    
    let safeDisplayName = displayName ? String(displayName).trim() : 'User';
    safeDisplayName = safeDisplayName.length > 30 ? safeDisplayName.substring(0, 30) : safeDisplayName;
    
    let safePhotoURL = photoURL || '';
    if (safePhotoURL && safePhotoURL.length > 2048) {
      console.warn('PhotoURL too long, truncated:', safePhotoURL.length);
      safePhotoURL = safePhotoURL.substring(0, 2048);
    }
    
    return {
      displayName: safeDisplayName,
      photoURL: safePhotoURL,
      ...rest
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch {
          try {
            await createUserProfile(firebaseUser.uid, {
              displayName: sanitizeProfileData({ displayName: firebaseUser.displayName }).displayName,
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              photoURL: sanitizeProfileData({ photoURL: firebaseUser.photoURL }).photoURL,
              address: '',
              role: 'customer',
            });
            const newProfile = await getUserProfile(firebaseUser.uid);
            setUserProfile(newProfile);
          } catch (e) {
            console.error("Lỗi khởi tạo profile:", e);
            setUserProfile(null);
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, displayName) => {
    const newUser = await registerWithEmail(email, password, displayName);
    await createUserProfile(newUser.uid, {
      displayName,
      email,
      phone: '',
      photoURL: '',
      address: '',
      role: 'customer',
    });
    return newUser;
  };

  const signIn = async (email, password, options = {}) => {
    const { remember = true } = options;
    return await loginWithEmail(email, password, remember);
  };

  const signInWithGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await logout();
  };

  const forgotPassword = async (email) => {
    await resetPassword(email);
  };

  const updateUser = async (updatedData) => {
    if (!user) return;
    
    await updateUserProfile(user.uid, updatedData);
    
    const { displayName, photoURL } = updatedData;
    if (displayName !== undefined || photoURL !== undefined) {
      try {
        const safeData = sanitizeProfileData({ 
          displayName: displayName !== undefined ? displayName : user.displayName,
          photoURL: photoURL !== undefined ? photoURL : user.photoURL 
        });
        await updateProfile(user, safeData);
      } catch (error) {
        console.warn('Auth profile update failed:', error.message);
      }
    }

    const newProfile = await getUserProfile(user.uid);
    setUserProfile(newProfile);
    setUser({ ...user });
  };

  const toggleFavorite = async (productId) => {
    if (!user) throw new Error('Vui lòng đăng nhập!');
    const isFavorite = userProfile?.favorites?.includes(productId);
    await toggleFavoriteService(user.uid, productId, !isFavorite);
    const newProfile = await getUserProfile(user.uid);
    setUserProfile(newProfile);
  };

  const isAdmin = userProfile?.role === 'admin';
  const isShipper = userProfile?.role === 'staff';
  const isWaiter = userProfile?.role === 'waiter';
  const isAuthenticated = !!user;

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated,
    isAdmin,
    isShipper,
    isWaiter,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    forgotPassword,
    updateUser,
    toggleFavorite,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

