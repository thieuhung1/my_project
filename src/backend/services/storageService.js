// ============================================================
// storageService.js - Dịch vụ lưu trữ file (Firebase Storage)
// ============================================================

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";

// ---- Upload ảnh sản phẩm lên Firebase Storage ----
// Trả về URL công khai của ảnh sau khi upload thành công
export const uploadProductImage = (file, productId, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `products/${productId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Tính % tiến trình upload
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        // Lấy URL download sau khi upload xong
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

// ---- Upload ảnh đại diện người dùng ----
export const uploadUserAvatar = (file, userId, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `avatars/${userId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

// ---- Xóa file khỏi Storage theo đường dẫn ----
export const deleteFile = async (filePath) => {
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
};

// ---- Lấy URL download từ đường dẫn Storage ----
export const getFileURL = async (filePath) => {
  const fileRef = ref(storage, filePath);
  return await getDownloadURL(fileRef);
};
