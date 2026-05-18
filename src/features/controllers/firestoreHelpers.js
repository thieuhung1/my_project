// firestoreHelpers.js - Các helper dùng chung cho thao tác với Firestore.
// File này chuẩn hóa cách map snapshot, kiểm tra document tồn tại và gắn timestamp.

import { serverTimestamp } from "firebase/firestore";

export const mapDocs = (snapshot) =>
  snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));

export const getDocDataOrThrow = (snapshot, errorMessage) => {
  if (!snapshot.exists()) {
    throw new Error(errorMessage);
  }

  return { id: snapshot.id, ...snapshot.data() };
};

export const buildTimestamps = (data, isCreate = false) => ({
  ...data,
  ...(isCreate ? { createdAt: serverTimestamp() } : {}),
  updatedAt: serverTimestamp(),
});

export const createFirestoreError = (message, cause) => {
  const error = new Error(message);
  if (cause) error.cause = cause;
  return error;
};

export const normalizeCollectionOrderQuery = (field = "createdAt") => field;

