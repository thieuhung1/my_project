// ============================================================
// firebaseConfig.js - Khởi tạo và cấu hình Firebase
// ============================================================

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database"; // Realtime Database


// Cấu hình Firebase từ Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB3wcQBBzbDdEhvxLfGgCcs5s3yFycipak",
  authDomain: "shop1-f2616.firebaseapp.com",
  databaseURL: "https://shop1-f2616-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shop1-f2616",
  storageBucket: "shop1-f2616.firebasestorage.app",
  messagingSenderId: "867242356024",
  appId: "1:867242356024:web:44a578fa3308a9b8eba5cd",
  measurementId: "G-VMWYL2SGL7"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ Firebase
const analytics = getAnalytics(app);  // Google Analytics
const auth = getAuth(app);            // Authentication
const db = getFirestore(app);         // Firestore Database
const storage = getStorage(app);      // Cloud Storage
const rtdb = getDatabase(app); // Realtime Database

export { app, analytics, auth, db, storage, rtdb } 
