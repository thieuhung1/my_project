// ============================================================
// authService.js - Dá»‹ch vá»¥ xĂ¡c thá»±c ngÆ°á»i dĂ¹ng (Firebase Auth)
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
import { auth } from "../firebase/firebaseConfig";

// ---- ÄÄƒng kĂ½ tĂ i khoáº£n má»›i báº±ng email & máº­t kháº©u ----
export const registerWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Cáº­p nháº­t tĂªn hiá»ƒn thá»‹ sau khi Ä‘Äƒng kĂ½
  await updateProfile(userCredential.user, { displayName });
  return userCredential.user;
};

// ---- ÄÄƒng nháº­p báº±ng email & máº­t kháº©u (cĂ³ tuá»³ chá»n ghi nhá»›) ----
export const loginWithEmail = async (email, password, remember = true) => {
  // Thiáº¿t láº­p má»©c Ä‘á»™ ghi nhá»› phiĂªn báº£n Ä‘Äƒng nháº­p
  const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// ---- ÄÄƒng nháº­p báº±ng tĂ i khoáº£n Google (Popup) ----
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
};

// ---- ÄÄƒng xuáº¥t ----
export const logout = async () => {
  await signOut(auth);
};

// ---- Gá»­i email Ä‘áº·t láº¡i máº­t kháº©u ----
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

// ---- Láº¯ng nghe tráº¡ng thĂ¡i Ä‘Äƒng nháº­p cá»§a ngÆ°á»i dĂ¹ng ----
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ---- Láº¥y ngÆ°á»i dĂ¹ng hiá»‡n táº¡i ----
export const getCurrentUser = () => {
  return auth.currentUser;
};

