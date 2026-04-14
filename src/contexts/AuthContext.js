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
  toggleFavorite as toggleFavoriteService,
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
          // Default profile if one does not exist (useful for returning from Google SignIn Redirect)
          try {
             await createUserProfile(firebaseUser.uid, {
               displayName: firebaseUser.displayName || 'Thành viên',
               email: firebaseUser.email || '',
               phone: firebaseUser.phoneNumber || '',
               photoURL: firebaseUser.photoURL || '',
               address: '',
               role: 'customer',
             });
             const newProfile = await getUserProfile(firebaseUser.uid);
             setUserProfile(newProfile);
          } catch (e) {
             console.error("Lỗi khởi tạo profile mặc định:", e);
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

  // ── Đăng ký tài khoản mới ───────────────────────────────
  const signUp = async (email, password, displayName) => {
    const newUser = await registerWithEmail(email, password, displayName);
    // Tạo hồ sơ người dùng trong Firestore
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

  // ── Đăng nhập bằng email ─────────────────────────────────
  const signIn = async (email, password, options = {}) => {
    const { remember = true } = options;
    return await loginWithEmail(email, password, remember);
  };

  // ── Đăng nhập bằng Google (Popup) ────────────────────────
  const signInWithGoogle = async () => {
    try {
      await loginWithGoogle();
      // Quá trình đăng nhập rẽ nhánh, người dùng sẽ được chuyển hướng tới trang đăng nhập của Google.
      // Profile sẽ được xử lý tại onAuthStateChange khi quay lại web.
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      throw error;
    }
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
    
    // 1. Cập nhật Firestore
    await updateUserProfile(user.uid, updatedData);
    
    // 2. Đồng bộ với Firebase Auth Profile (nếu có đổi tên hoặc ảnh)
    const { displayName, photoURL } = updatedData;
    if (displayName || photoURL) {
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(user, { 
        displayName: displayName || user.displayName, 
        photoURL: photoURL || user.photoURL 
      });
    }

    // 3. Cập nhật lại local state
    const newProfile = await getUserProfile(user.uid);
    setUserProfile(newProfile);
    setUser({ ...user }); // Kích hoạt re-render để cập nhật auth user object
  };

  const toggleFavorite = async (productId) => {
    if (!user) throw new Error('Vui lòng đăng nhập để thực hiện tính năng này!');
    const isFavorite = userProfile?.favorites?.includes(productId);
    await toggleFavoriteService(user.uid, productId, !isFavorite);
    
    // Cập nhật state local
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
      {/* Không render app cho đến khi xác nhận xong trạng thái auth */}
      {!loading && children}
    </AuthContext.Provider>
  );
};