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
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

// ---- Đăng ký tài khoản mới bằng email & mật khẩu ----
export const registerWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Cập nhật tên hiển thị sau khi đăng ký
  await updateProfile(userCredential.user, { displayName });
  return userCredential.user;
};

// ---- Đăng nhập bằng email & mật khẩu (có tuỳ chọn ghi nhớ) ----
export const loginWithEmail = async (email, password, remember = true) => {
  // Thiết lập mức độ ghi nhớ phiên bản đăng nhập
  const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// ---- Đăng nhập bằng tài khoản Google (Redirect) ----
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  // Chuyển sang Redirect để tránh lỗi Cross-Origin-Opener-Policy trên một số trình duyệt
  await signInWithRedirect(auth, provider);
};

// ---- Lấy kết quả sau khi Redirect ----
export const getAuthRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Lỗi khi lấy kết quả Redirect:", error);
    throw error;
  }
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
