# Task: Fix lỗi lịch sử mua hàng không hiện thị (/my-orders)

## Analysis
- Code correct, handles empty state properly
- User confirmed logged in
- Likely cause: No data in Firestore (seeds not run) or uid mismatch
- Firestore rules correct for user read own orders

## Steps:
1. Run seeds for test data: `node src/backend/seeds/runSeed.js` 
2. Add debug console.logs in useOrders hook (userId, orders.length, error)
3. Enhance MyOrders empty state (distinguish !user vs no orders)
4. Test: npm start, login with seeded user, check /my-orders + browser console
5. If still empty: Check Firestore console for orders where userId = auth.uid
6. Complete

**Next:** Execute seeds first (main fix), then test.

