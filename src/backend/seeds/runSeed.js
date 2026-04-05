// ============================================================
// runSeed.js - Script tự động seed toàn bộ dữ liệu vào Firestore
// Chạy lệnh: node src/backend/seeds/runSeed.js
// ============================================================

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  Timestamp,
  writeBatch,
} = require("firebase/firestore");

// --- Import dữ liệu mẫu ---
const categoriesData = require("./data/categoriesData");
const productsData   = require("./data/productsData");
const usersData      = require("./data/usersData");
const ordersData     = require("./data/ordersData");
const reviewsData    = require("./data/reviewsData");

// --- Cấu hình Firebase (không dùng Analytics ở Node.js) ---
const firebaseConfig = {
  apiKey: "AIzaSyDjHVcEciX8zDQXDUTUwkCs-CSATz0UVJc",
  authDomain: "do-an-food-hub.firebaseapp.com",
  projectId: "do-an-food-hub",
  storageBucket: "do-an-food-hub.firebasestorage.app",
  messagingSenderId: "158553211792",
  appId: "1:158553211792:web:35746edd053c3c22eca915",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// Helper: in log màu
const log  = (msg) => console.log(`\x1b[36m[SEED]\x1b[0m ${msg}`);
const ok   = (msg) => console.log(`\x1b[32m[✓]\x1b[0m ${msg}`);
const fail = (msg) => console.error(`\x1b[31m[✗]\x1b[0m ${msg}`);
const now  = () => Timestamp.now();

// ============================================================
// 1. SEED CATEGORIES
// ============================================================
async function seedCategories() {
  log("Đang seed danh mục...");
  const ids = [];
  for (const cat of categoriesData) {
    const ref = await addDoc(collection(db, "categories"), {
      ...cat,
      createdAt: now(),
      updatedAt: now(),
    });
    ids.push(ref.id);
    ok(`Danh mục: ${cat.name} → ${ref.id}`);
  }
  return ids; // Trả về mảng ID để dùng sau
}

// ============================================================
// 2. SEED PRODUCTS
// ============================================================
async function seedProducts() {
  log("Đang seed sản phẩm...");
  const ids = [];
  for (const product of productsData) {
    const ref = await addDoc(collection(db, "products"), {
      ...product,
      createdAt: now(),
      updatedAt: now(),
    });
    ids.push(ref.id);
    ok(`Sản phẩm: ${product.name} → ${ref.id}`);
  }
  return ids;
}

// ============================================================
// 3. SEED USERS (lưu vào Firestore, không tạo Auth account)
// ============================================================
async function seedUsers() {
  log("Đang seed người dùng...");
  const ids = [];
  for (let i = 0; i < usersData.length; i++) {
    const user = usersData[i];
    // Dùng ID giả để mô phỏng Firebase Auth UID
    const fakeUid = `seed_user_${String(i + 1).padStart(3, "0")}`;
    await setDoc(doc(db, "users", fakeUid), {
      ...user,
      createdAt: now(),
      updatedAt: now(),
    });
    ids.push(fakeUid);
    ok(`Người dùng: ${user.displayName} → ${fakeUid}`);
  }
  return ids;
}

// ============================================================
// 4. SEED ORDERS (tính totalAmount từ products)
// ============================================================
async function seedOrders(productIds, productDataArr, userIds) {
  log("Đang seed đơn hàng...");
  for (const order of ordersData) {
    const userId   = userIds[order.userIndex];
    const userName = order.userName;

    // Xây dựng danh sách items với giá thực từ productsData
    const items = order.items.map(({ productIndex, quantity }) => {
      const p = productDataArr[productIndex];
      const price =
        p.discount > 0
          ? Math.round(p.price * (1 - p.discount / 100))
          : p.price;
      return {
        productId:   productIds[productIndex],
        productName: p.name,
        imageUrl:    p.imageUrl,
        quantity,
        price,
      };
    });

    // Tính tổng tiền
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const ref = await addDoc(collection(db, "orders"), {
      userId,
      userName,
      phone:         order.phone,
      address:       order.address,
      items,
      totalAmount,
      paymentMethod: order.paymentMethod,
      status:        order.status,
      note:          order.note,
      createdAt:     now(),
      updatedAt:     now(),
    });
    ok(`Đơn hàng: ${userName} (${totalAmount.toLocaleString("vi-VN")}đ) → ${ref.id}`);
  }
}

// ============================================================
// 5. SEED REVIEWS
// ============================================================
async function seedReviews(productIds, userIds) {
  log("Đang seed đánh giá...");
  for (const review of reviewsData) {
    const productId = productIds[review.productIndex];
    const userId    = userIds[review.userIndex];
    const userName  = usersData[review.userIndex].displayName;

    const ref = await addDoc(collection(db, "reviews"), {
      productId,
      userId,
      userName,
      avatarUrl: usersData[review.userIndex].avatarUrl,
      rating:    review.rating,
      comment:   review.comment,
      createdAt: now(),
    });
    ok(`Đánh giá: ${userName} → SP[${review.productIndex}] ⭐${review.rating}`);
  }
}

// ============================================================
// MAIN - Chạy toàn bộ seed theo thứ tự
// ============================================================
async function main() {
  console.log("\n\x1b[35m╔══════════════════════════════════════╗\x1b[0m");
  console.log("\x1b[35m║   🌱 FOOD HUB - AUTO SEED FIRESTORE  ║\x1b[0m");
  console.log("\x1b[35m╚══════════════════════════════════════╝\x1b[0m\n");

  try {
    // Thứ tự quan trọng: categories → products → users → orders → reviews
    const categoryIds = await seedCategories();
    console.log();

    const productIds = await seedProducts();
    console.log();

    const userIds = await seedUsers();
    console.log();

    await seedOrders(productIds, productsData, userIds);
    console.log();

    await seedReviews(productIds, userIds);
    console.log();

    console.log("\x1b[32m╔══════════════════════════════════════╗\x1b[0m");
    console.log("\x1b[32m║   ✅ SEED HOÀN THÀNH THÀNH CÔNG!     ║\x1b[0m");
    console.log(`\x1b[32m║   📦 ${categoryIds.length} danh mục                     ║\x1b[0m`);
    console.log(`\x1b[32m║   🍔 ${productIds.length} sản phẩm                      ║\x1b[0m`);
    console.log(`\x1b[32m║   👤 ${userIds.length} người dùng                      ║\x1b[0m`);
    console.log(`\x1b[32m║   📋 ${ordersData.length} đơn hàng                       ║\x1b[0m`);
    console.log(`\x1b[32m║   ⭐ ${reviewsData.length} đánh giá                      ║\x1b[0m`);
    console.log("\x1b[32m╚══════════════════════════════════════╝\x1b[0m\n");

    process.exit(0);
  } catch (error) {
    fail("Seed thất bại: " + error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
