import { serverTimestamp } from "firebase/firestore";

// Chuyển Firestore snapshot thành mảng object có kèm id.
export const mapDocs = (snapshot) =>
  snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));

// Trả về document data kèm id và báo lỗi nếu document không tồn tại.
export const getDocDataOrThrow = (snapshot, errorMessage) => {
  if (!snapshot.exists()) {
    throw new Error(errorMessage);
  }

  return { id: snapshot.id, ...snapshot.data() };
};

// Tạo field thời gian dùng chung cho cả create/update.
export const buildTimestamps = (data, isCreate = false) => ({
  ...data,
  ...(isCreate ? { createdAt: serverTimestamp() } : {}),
  updatedAt: serverTimestamp(),
});

