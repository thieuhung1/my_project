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
} from '../features';
import { updateProfile } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const DEFAULT_ROLE = 'customer';
const MAX_DISPLAY_NAME_LENGTH = 30;
const MAX_PHOTO_URL_LENGTH = 2048;

// Chuẩn hoá dữ liệu profile để tránh vượt giới hạn Firebase.
const sanitizeProfileData = (data = {}) => {
  const { displayName, photoURL, ...rest } = data;

  let safeDisplayName = displayName ? String(displayName).trim() : 'User';
  if (safeDisplayName.length > MAX_DISPLAY_NAME_LENGTH) {
    safeDisplayName = safeDisplayName.slice(0, MAX_DISPLAY_NAME_LENGTH);
  }

  let safePhotoURL = photoURL || '';
  if (safePhotoURL.length > MAX_PHOTO_URL_LENGTH) {
    console.warn('PhotoURL too long, truncated:', safePhotoURL.length);
    safePhotoURL = safePhotoURL.slice(0, MAX_PHOTO_URL_LENGTH);
  }

  return {
    ...rest,
    displayName: safeDisplayName,
    photoURL: safePhotoURL,
  };
};

// Tạo profile mặc định khi user vừa đăng nhập nhưng chưa có profile Firestore.
const createDefaultProfile = async (firebaseUser) => {
  await createUserProfile(firebaseUser.uid, {
    displayName: sanitizeProfileData({ displayName: firebaseUser.displayName }).displayName,
    email: firebaseUser.email || '',
    phone: firebaseUser.phoneNumber || '',
    photoURL: sanitizeProfileData({ photoURL: firebaseUser.photoURL }).photoURL,
    address: '',
    role: DEFAULT_ROLE,
  });

  return getUserProfile(firebaseUser.uid);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lắng nghe trạng thái đăng nhập một lần để đồng bộ auth + profile.
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setUserProfile(null);
          return;
        }

        setUser(firebaseUser);

        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch {
          const newProfile = await createDefaultProfile(firebaseUser);
          setUserProfile(newProfile);
        }
      } catch (error) {
        console.error('Lỗi khởi tạo auth state:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
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
      role: DEFAULT_ROLE,
    });

    return newUser;
  };

  const signIn = async (email, password, options = {}) => {
    const { remember = true } = options;
    return loginWithEmail(email, password, remember);
  };

  const signInWithGoogle = async () => {
    await loginWithGoogle();
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
    const shouldSyncAuthProfile = displayName !== undefined || photoURL !== undefined;

    if (shouldSyncAuthProfile) {
      try {
        // Chỉ sync phần auth profile khi có thay đổi tên/ảnh.
        const safeData = sanitizeProfileData({
          displayName: displayName ?? user.displayName,
          photoURL: photoURL ?? user.photoURL,
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

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin',
    isShipper: userProfile?.role === 'staff',
    isWaiter: userProfile?.role === 'waiter',
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

