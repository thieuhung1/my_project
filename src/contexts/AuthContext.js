// ============================================================
// AuthContext.js - Context xác thực người dùng (Firebase Auth)
// Thay thế localStorage bằng Firebase Authentication thật
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
} from '../backend';

const AuthContext = createContext();

// Hook để dùng trong các component
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);   // Firebase Auth user
  const [userProfile, setUserProfile] = useState(null);   // Firestore profile
  const [loading, setLoading]         = useState(true);   // Đang kiểm tra auth

  // ── Lắng nghe trạng thái đăng nhập từ Firebase ──────────
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── Đăng ký tài khoản mới ───────────────────────────────
  const signUp = async (email, password, displayName) => {
    const newUser = await registerWithEmail(email, password, displayName);
    // Tạo hồ sơ người dùng trong Firestore
    await createUserProfile(newUser.uid, {
      displayName,
      email,
      phone: '',
      avatarUrl: '',
      role: 'customer',
      addresses: [],
    });
    return newUser;
  };

  // ── Đăng nhập bằng email ─────────────────────────────────
  const signIn = async (email, password) => {
    return await loginWithEmail(email, password);
  };

  // ── Đăng nhập bằng Google ────────────────────────────────
  const signInWithGoogle = async () => {
    const googleUser = await loginWithGoogle();
    // Tự động tạo profile nếu chưa có
    try {
      await getUserProfile(googleUser.uid);
    } catch {
      await createUserProfile(googleUser.uid, {
        displayName: googleUser.displayName,
        email: googleUser.email,
        phone: '',
        avatarUrl: googleUser.photoURL || '',
        role: 'customer',
        addresses: [],
      });
    }
    return googleUser;
  };

  // ── Đăng xuất ────────────────────────────────────────────
  const signOut = async () => {
    await logout();
  };

  // ── Quên mật khẩu ────────────────────────────────────────
  const forgotPassword = async (email) => {
    await resetPassword(email);
  };

  // ── Cập nhật thông tin hồ sơ người dùng ─────────────
  const updateUser = async (updatedData) => {
    if (!user) return;
    await updateUserProfile(user.uid, updatedData);
    // Cập nhật lại local state
    const newProfile = await getUserProfile(user.uid);
    setUserProfile(newProfile);
  };

  const isAdmin = userProfile?.role === 'admin';
  const isAuthenticated = !!user;

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated,
    isAdmin,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    forgotPassword,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Không render app cho đến khi xác nhận xong trạng thái auth */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
