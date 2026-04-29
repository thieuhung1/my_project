# KẾ HOẠCH CLEAN CODE & TỐI ƯU TOÀN BỘ BACKEND - FOODHUB

## Mục tiêu chính
- Làm backend rõ ràng, dễ đọc, dễ sửa và dễ mở rộng.
- Chuẩn hóa route, service, model, helper và hook.
- Giảm code thừa, code trùng và file rác.
- Tối ưu luồng order, inventory, status và data flow.
- Loại bỏ hoàn toàn payment online còn sót trong backend.

---

## PHASE 1: KHẢO SÁT & LẬP BẢN ĐỒ BACKEND
### Mục tiêu
Hiểu rõ cấu trúc backend hiện tại trước khi chỉnh sửa để tránh làm hỏng luồng chính.

### Checklist
- [x] Rà soát toàn bộ thư mục `src/backend`.
- [x] Phân loại rõ các nhóm file: `firebase`, `services`, `models`, `hooks`, `seeds`.
- [x] Liệt kê toàn bộ endpoint / service / hook / model đang có.
- [x] Xác định phần nào đang được dùng thật sự, phần nào đã lỗi thời.
- [x] Tìm tất cả dấu vết payment online còn sót.
- [x] Ghi lại các file có nguy cơ trùng logic hoặc khó bảo trì.

### Kết quả mong muốn
- [x] Danh sách file backend cần giữ.
- [x] Danh sách file backend cần sửa.
- [x] Danh sách file backend cần xóa hoặc gộp.
- [x] Danh sách endpoint/service/model cần chuẩn hóa.

---

## PHASE 2: CHUẨN HÓA KIẾN TRÚC BACKEND
### Mục tiêu
Làm kiến trúc backend rõ trách nhiệm, dễ đọc và dễ sửa.

### Checklist
- [ ] Chuẩn hóa cách đặt tên file, hàm và hằng số.
- [ ] Tách rõ trách nhiệm giữa route, service, model và helper.
- [ ] Chuẩn hóa error handling và message trả về.
- [ ] Gom logic dùng chung vào helper thay vì copy-paste.
- [ ] Chuẩn hóa `index.js` export tập trung.
- [ ] Cập nhật `README.md` backend theo kiến trúc mới.

### Kết quả mong muốn
- [ ] Service gọn hơn, ít trách nhiệm chồng chéo hơn.
- [ ] Helper dùng chung được gom lại rõ ràng.
- [ ] Export/import backend đồng bộ hơn.

---

## PHASE 3: TỐI ƯU LUỒNG ORDER / INVENTORY / STATUS
### Mục tiêu
Làm luồng đặt hàng an toàn hơn, ít lỗi hơn và dễ bảo trì hơn.

### Checklist
- [ ] Rà soát `orderService.js`.
- [ ] Chuẩn hóa các trạng thái đơn hàng.
- [ ] Chuẩn hóa `paymentStatus`, `paymentMethod`, `paymentProvider`.
- [ ] Tách helper kiểm tra tồn kho, trừ tồn kho và cập nhật đơn.
- [ ] Kiểm tra luồng tạo đơn bằng transaction.
- [ ] Rà lại luồng lấy đơn theo user, admin và shipper.
- [ ] Xóa mọi logic payment online còn sót khỏi luồng order.

### Kết quả mong muốn
- [ ] Tạo đơn ổn định hơn.
- [ ] Inventory được trừ đúng.
- [ ] Status đơn và payment status nhất quán.
- [ ] Không còn dependency vào payment gateway.

---

## PHASE 4: SỬA LỖI HIỆN CÓ
### Mục tiêu
Ổn định backend trước khi dọn sâu hơn.

### Checklist
- [ ] Rà soát lỗi query Firestore.
- [ ] Rà soát lỗi transaction khi tạo đơn.
- [ ] Rà soát lỗi cập nhật trạng thái đơn.
- [ ] Rà soát lỗi import/export module.
- [ ] Rà soát lỗi seed data không khớp schema.
- [ ] Rà soát lỗi console / exception chưa bắt đúng.
- [ ] Sửa lỗi phát sinh sau refactor.

### Kết quả mong muốn
- [ ] Backend chạy ổn hơn.
- [ ] Lỗi logic và lỗi cấu trúc giảm rõ rệt.
- [ ] Không còn lỗi import / export gây đứt luồng.

---

## PHASE 5: XÓA HOÀN TOÀN THANH TOÁN ONLINE
### Mục tiêu
Loại bỏ sạch mọi logic payment online không còn dùng.

### Checklist
- [ ] Xóa service payment online không còn dùng.
- [ ] Xóa route payment create / webhook / notify / confirm.
- [ ] Xóa helper tạo chữ ký hoặc URL thanh toán.
- [ ] Xóa biến môi trường payment online trong `.env.example`.
- [ ] Xóa file / import / dependency payment online thừa.
- [ ] Kiểm tra backend vẫn tạo đơn bình thường bằng phương thức còn lại.

### Kết quả mong muốn
- [ ] Không còn MoMo / VNPay / PayOS trong backend.
- [ ] Không còn route payment gateway.
- [ ] Không còn env payment gateway.
- [ ] Không còn lỗi build sau khi xóa.

---

## PHASE 6: CHUẨN HÓA MODEL / SCHEMA / SEED DATA
### Mục tiêu
Làm dữ liệu backend đồng nhất và dễ seed lại.

### Checklist
- [ ] Rà soát `User.model.js`.
- [ ] Rà soát `Product.model.js`.
- [ ] Rà soát `Order.model.js`.
- [ ] Rà soát `Coupon.model.js`.
- [ ] Rà soát `Category.model.js`.
- [ ] Đồng bộ field giữa model và dữ liệu thực tế.
- [ ] Dọn seed data không dùng hoặc sai schema.
- [ ] Chuẩn hóa trạng thái order / payment trong model.

### Kết quả mong muốn
- [ ] Model rõ ràng hơn.
- [ ] Seed data khớp schema hơn.
- [ ] Dễ khởi tạo lại dữ liệu sau này.

---

## PHASE 7: TỐI ƯU FIRESTORE / STORAGE / AUTH
### Mục tiêu
Giảm truy vấn thừa và làm backend ổn định hơn.

### Checklist
- [ ] Rà soát `firestoreHelpers.js`.
- [ ] Kiểm tra các query Firestore trùng lặp.
- [ ] Rà lại `useAuth`, `useProducts`, `useOrders`, `useStorage`.
- [ ] Tối ưu upload và lấy file từ Storage.
- [ ] Chuẩn hóa xử lý lỗi network và permission.
- [ ] Tối ưu các luồng auth cơ bản.

### Kết quả mong muốn
- [ ] Query gọn hơn.
- [ ] Tải dữ liệu ổn hơn.
- [ ] Xử lý lỗi rõ hơn.

---

## PHASE 8: DỌN CODE & CHUẨN HÓA EXPORT / IMPORT
### Mục tiêu
Làm backend gọn, sạch và dễ bảo trì hơn.

### Checklist
- [ ] Xóa file thừa, file backup hoặc file trùng chức năng.
- [ ] Rà lại toàn bộ import không cần thiết.
- [ ] Chuẩn hóa default export / named export.
- [ ] Dọn TODO cũ, comment lỗi thời và code chết.
- [ ] Cập nhật `README.md` backend sau khi refactor.

### Kết quả mong muốn
- [ ] Backend gọn hơn.
- [ ] Ít file rác hơn.
- [ ] Dễ tìm logic hơn.

---

## PHASE 9: TEST CUỐI CÙNG & CHỐT CHECKLIST
### Mục tiêu
Đảm bảo backend hoạt động ổn định trước khi chốt.

### Checklist test
- [ ] Auth hoạt động bình thường.
- [ ] Product CRUD / đọc dữ liệu ổn.
- [ ] Order create/update/query ổn.
- [ ] Inventory trừ đúng khi tạo đơn.
- [ ] Coupon hoạt động đúng.
- [ ] Support chat hoạt động đúng.
- [ ] Không còn payment online trong backend.
- [ ] Không còn route/service chết.
- [ ] Backend không lỗi khi build/run.
- [ ] Không còn console error / exception chưa bắt.

### Kết quả mong muốn
- [ ] Backend ổn định.
- [ ] Code dễ sửa sau này.
- [ ] Checklist toàn bộ phase được chốt hoàn thành.

---

## Thứ tự ưu tiên triển khai
1. Khảo sát backend và lập bản đồ.
2. Chuẩn hóa kiến trúc.
3. Tối ưu order / inventory / status.
4. Sửa lỗi hiện có.
5. Xóa payment online còn sót.
6. Chuẩn hóa model / schema / seed data.
7. Tối ưu Firestore / Storage / Auth.
8. Dọn code và chuẩn hóa import/export.
9. Test cuối và chốt checklist.

## Kết quả khảo sát nhanh
- `src/backend` có 30 file, chia thành `firebase`, `services`, `models`, `hooks`, `seeds` và `index.js`.
- Không thấy dấu vết `MoMo`, `VNPay`, `PayOS`, webhook, URL thanh toán hay hàm tạo payment gateway trong backend hiện tại.
- `orderService.js` đã dùng transaction để kiểm tra và trừ tồn kho, nhưng vẫn nên tiếp tục chuẩn hóa thêm model/status nếu refactor sâu hơn.
- `supportChatService.js` có logic Realtime Database riêng, cần tách helper nếu muốn chuẩn hóa kiến trúc sâu hơn.
- `authService.js` và một số service khác còn comment/format chưa đồng nhất, phù hợp để dọn ở phase sau.

## Rủi ro cần chú ý
- Xóa payment online có thể kéo theo logic order/payment ở nhiều nơi.
- Refactor service dùng chung có thể ảnh hưởng luồng admin / shipper / waiter.
- Dữ liệu seed và dữ liệu thật lệch schema có thể gây lỗi khó phát hiện.
- Tối ưu transaction nếu làm sai có thể ảnh hưởng trực tiếp đến checkout.

## Kết quả mong muốn cuối cùng
- Backend gọn, sạch, rõ và dễ bảo trì hơn.
- Luồng đơn hàng ổn định hơn.
- Không còn payment online không dùng.
- Dữ liệu, service và model đồng nhất hơn.
- Sẵn sàng cho mở rộng tính năng sau này.

**Ngày bắt đầu:** Hôm nay
**Mục tiêu hoàn thành:** Trong 2 tuần
**Ưu tiên cao nhất:** Xóa payment online backend + chuẩn hóa order flow + dọn kiến trúc