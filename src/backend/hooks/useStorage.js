// ============================================================
// useStorage.js - Custom Hook upload file lên Firebase Storage
// ============================================================

import { useState } from "react";
import { uploadProductImage, uploadUserAvatar } from "../services/storageService";

/**
 * Hook hỗ trợ upload file lên Firebase Storage với tiến trình
 * @returns {{ uploadProgress, uploading, error, uploadProduct, uploadAvatar }}
 */
const useStorage = () => {
  const [uploadProgress, setUploadProgress] = useState(0); // % tiến trình
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Reset trạng thái
  const resetState = () => {
    setUploadProgress(0);
    setError(null);
    setUploading(false);
  };

  // ---- Upload ảnh sản phẩm ----
  const uploadProduct = async (file, productId) => {
    resetState();
    setUploading(true);
    try {
      const url = await uploadProductImage(file, productId, (progress) => {
        setUploadProgress(progress);
      });
      return url; // Trả về URL download
    } catch (err) {
      setError(err.message || "Upload thất bại!");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ---- Upload ảnh đại diện người dùng ----
  const uploadAvatar = async (file, userId) => {
    resetState();
    setUploading(true);
    try {
      const url = await uploadUserAvatar(file, userId, (progress) => {
        setUploadProgress(progress);
      });
      return url;
    } catch (err) {
      setError(err.message || "Upload thất bại!");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadProgress, uploading, error, uploadProduct, uploadAvatar };
};

export default useStorage;
