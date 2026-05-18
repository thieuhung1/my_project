// ============================================================
// authService.js - Dịch vụ xác thực người dùng (Firebase Auth)
// File này gom toàn bộ thao tác đăng nhập, đăng ký, đăng xuất,
// reset mật khẩu và lắng nghe trạng thái phiên của người dùng.
//
// Mỗi hàm ở đây bọc trực tiếp Firebase Auth để caller không phải xử lý
// những chi tiết lặp lại như persistence, profile update hay popup login.
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInAnonymously,
} from 'firebase/auth';
import { auth } from "../../firebase/firebase.Config";

// ---- Đăng ký tài khoản mới bằng email & mật khẩu ----
const sanitizeDisplayName = (value = 'User') => String(value || 'User').trim().slice(0, 30);

export const registerWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  const safeDisplayName = sanitizeDisplayName(displayName);
  if (safeDisplayName.length > 0) {
    try {
      await updateProfile(userCredential.user, { displayName: safeDisplayName });
    } catch (error) {
      console.warn('Failed to update displayName:', error.message);
    }
  }

  return userCredential.user;
};

// ---- Đăng nhập bằng email & mật khẩu (có tùy chọn ghi nhớ) ----
export const loginWithEmail = async (email, password, remember = true) => {
  const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// ---- Đăng nhập bằng tài khoản Google (Popup - better UX) ----
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// ---- Đăng xuất ----
export const logout = async () => {
  await signOut(auth);
};

// ---- Gửi email đặt lại mật khẩu ----
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

// ---- Lắng nghe trạng thái đăng nhập của người dùng ----
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ---- Đăng nhập ẩn danh để hỗ trợ guest chat ----
export const loginAnonymously = async () => {
  const result = await signInAnonymously(auth);
  return result.user;
};

// ---- Lấy người dùng hiện tại ----
export const getCurrentUser = () => {
  return auth.currentUser;
};

