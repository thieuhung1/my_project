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
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

// ---- Đăng ký tài khoản mới bằng email & mật khẩu ----
export const registerWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Cập nhật tên hiển thị sau khi đăng ký
  await updateProfile(userCredential.user, { displayName });
  return userCredential.user;
};

// ---- Đăng nhập bằng email & mật khẩu ----
export const loginWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// ---- Đăng nhập bằng tài khoản Google ----
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
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
