// ============================================================
// firebaseConfig.js - Khởi tạo và cấu hình Firebase
// ============================================================

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Cấu hình Firebase từ Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDjHVcEciX8zDQXDUTUwkCs-CSATz0UVJc",
  authDomain: "do-an-food-hub.firebaseapp.com",
  projectId: "do-an-food-hub",
  storageBucket: "do-an-food-hub.firebasestorage.app",
  messagingSenderId: "158553211792",
  appId: "1:158553211792:web:35746edd053c3c22eca915",
  measurementId: "G-D0N58NRV0J",
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ Firebase
const analytics = getAnalytics(app);  // Google Analytics
const auth = getAuth(app);            // Authentication
const db = getFirestore(app);         // Firestore Database
const storage = getStorage(app);      // Cloud Storage

export { app, analytics, auth, db, storage };
