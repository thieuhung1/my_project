// ============================================================
// authService.js - Dịch vụ xác thực người dùng (Firebase Auth)
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
} from "firebase/auth";
import { auth } from "../../firebase/firebase.Config";

// ---- Đăng ký tài khoản mới bằng email & mật khẩu ----
export const registerWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Validate and safely update displayName (fix 400 error)
  const safeDisplayName = (displayName || 'User').trim();
  if (safeDisplayName.length > 0 && safeDisplayName.length <= 30) {
    try {
      await updateProfile(userCredential.user, { displayName: safeDisplayName });
    } catch (error) {
      console.warn('Failed to update displayName:', error.message);
      // Don't throw, auth succeeded
    }
  }
  
  return userCredential.user;
};

// ---- Đăng nhập bằng email & mật khẩu (có tùy chọn ghi nhớ) ----
export const loginWithEmail = async (email, password, remember = true) => {
  // Thiết lập mức độ ghi nhớ phiên đăng nhập
  const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// ---- Đăng nhập bằng tài khoản Google (Popup - better UX) ----
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ 
    prompt: 'select_account' 
  });
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

// ---- Lấy người dùng hiện tại ----
export const getCurrentUser = () => {
  return auth.currentUser;
};

