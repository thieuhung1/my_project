// ============================================================
// useAuth.js - Custom Hook quản lý xác thực người dùng
// ============================================================

import { useState, useEffect } from "react";
import { onAuthStateChange } from "../services/authService";
import { getUserProfile } from "../services/userService";

/**
 * Hook theo dõi trạng thái đăng nhập và lấy thông tin người dùng
 * @returns {{ user, userProfile, loading, isAdmin }}
 */
const useAuth = () => {
  const [user, setUser] = useState(null);           // Firebase Auth user
  const [userProfile, setUserProfile] = useState(null); // Firestore profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái đăng nhập
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Lấy hồ sơ người dùng từ Firestore
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch {
          // Người dùng chưa có hồ sơ Firestore
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Hủy lắng nghe khi component unmount
    return () => unsubscribe();
  }, []);

  // Kiểm tra xem người dùng có phải Admin không
  const isAdmin = userProfile?.role === "admin";

  return { user, userProfile, loading, isAdmin };
};

export default useAuth;
