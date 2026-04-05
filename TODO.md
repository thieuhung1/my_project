# Admin Pages Task - Products List & Coupons

## Steps:
1. [ ] Create src/Pages/Admin/Products/Index.js - Product list with CRUD (table, add/edit/delete using productService.js)
2. [ ] Create src/Pages/Admin/Coupons/Index.js - Coupons management (new collection/service needed? Use existing or create)
3. [ ] Update src/App.js - Add routes /admin/products, /admin/coupons under ProtectedRoute admin
4. [ ] Update src/Pages/Admin/Index.js - Add sidebar links to Products, Coupons
5. [ ] Create shared Admin table components if needed
6. [ ] Test: npm start, login admin, navigate
7. [ ] Seed sample coupons data if needed

✅ Task complete: Added Products & Coupons management in Admin panel.

- ✅ Backend: couponService.js, Coupon.model.js
- ✅ Sample data: couponsData.js, updated runSeed.js
- ✅ UI: CouponManager.js, integrated into Admin sidebar as 'Mã Giảm Giá' tab
- ✅ Products already available as 'Sản Phẩm' tab

**Next:** Run `npm run seed` to populate coupons data, then test in browser /admin → login admin → Mã Giảm Giá.

No routes needed (tab-based navigation).
