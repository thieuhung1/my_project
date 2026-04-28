# BACKEND CLEAN CODE & OPTIMIZATION TODO - FOODHUB

## Mục tiêu chính
- Làm backend sạch hơn, rõ ràng hơn và dễ sửa hơn về lâu dài.
- Tách đúng trách nhiệm giữa route, service, model, helper và seed data.
- Giảm code lặp, giảm file rác, giảm logic chồng chéo.
- Chuẩn hóa luồng dữ liệu, error handling và naming convention.
- Loại bỏ hoàn toàn logic thanh toán online không còn dùng.

## PHASE 1: KHẢO SÁT & LẬP BẢN ĐỒ BACKEND
### Mục tiêu
Hiểu rõ cấu trúc backend hiện tại trước khi refactor để tránh phá vỡ luồng đang chạy.

### Việc cần làm
- [ ] Rà soát toàn bộ thư mục `src/backend`.
- [ ] Liệt kê tất cả file đang được import và file không còn dùng.
- [ ] Phân loại rõ:
  - [ ] `services`
  - [ ] `models`
  - [ ] `hooks`
  - [ ] `seeds`
  - [ ] `firebase`
  - [ ] `server`
- [ ] Kiểm tra toàn bộ endpoint hiện có.
- [ ] Xác định file nào đang ôm quá nhiều trách nhiệm.
- [ ] Tìm mọi dấu vết còn sót của MoMo / VNPay / PayOS / thanh toán online.
- [ ] Tìm các đoạn logic trùng nhau giữa service và helper.

### Kết quả mong muốn
- [ ] Danh sách file cần giữ.
- [ ] Danh sách file cần sửa.
- [ ] Danh sách file cần gộp.
- [ ] Danh sách file cần xóa.
- [ ] Danh sách phần thanh toán online cần loại bỏ.

## PHASE 2: CHUẨN HÓA KIẾN TRÚC BACKEND
### Mục tiêu
Làm backend có cấu trúc rõ ràng, mỗi lớp chỉ làm đúng việc của nó.

### Việc cần làm
- [ ] Route chỉ nhận request và trả response.
- [ ] Service xử lý nghiệp vụ.
- [ ] Model chỉ mô tả schema/structure dữ liệu.
- [ ] Helper chỉ chứa hàm dùng chung.
- [ ] Chuẩn hóa cách đặt tên file, hàm và hằng số.
- [ ] Chuẩn hóa export/import để tránh vòng phụ thuộc.
- [ ] Chuẩn hóa error handling và message trả về.
- [ ] Tách logic chung ra khỏi route hoặc component lớn.

## PHASE 3: CHUẨN HÓA SERVICE & HELPER
### Mục tiêu
Giảm code lặp và gom các phần dùng chung về đúng chỗ.

### Việc cần làm
- [ ] Rà soát `firestoreHelpers.js`.
- [ ] Gom các hàm map/format/timestamp dùng chung.
- [ ] Rà soát `authService.js`.
- [ ] Rà soát `productService.js`.
- [ ] Rà soát `orderService.js`.
- [ ] Rà soát `userService.js`.
- [ ] Rà soát `couponService.js`.
- [ ] Rà soát `reviewService.js`.
- [ ] Rà soát `storageService.js`.
- [ ] Xóa các helper trùng logic hoặc khó hiểu.

## PHASE 4: TỐI ƯU LUỒNG ORDER / INVENTORY
### Mục tiêu
Làm luồng đơn hàng ổn định, dễ đọc và ít lỗi cạnh tranh dữ liệu.

### Việc cần làm
- [ ] Rà soát `orderService.js`.
- [ ] Chuẩn hóa trạng thái đơn hàng.
- [ ] Chuẩn hóa trạng thái thanh toán.
- [ ] Kiểm tra transaction trừ tồn kho.
- [ ] Xác định rõ logic tạo đơn mới.
- [ ] Kiểm tra các hàm lấy đơn theo user, shipper, admin.
- [ ] Chuẩn hóa logic assign shipper.
- [ ] Giảm truy vấn dư thừa.

## PHASE 5: XÓA TOÀN BỘ PAYMENT ONLINE
### Mục tiêu
Loại bỏ sạch mọi logic backend không còn dùng đến liên quan MoMo / VNPay / PayOS.

### Việc cần làm
- [ ] Xóa service thanh toán online nếu còn.
- [ ] Xóa route payment create / webhook / callback / confirm.
- [ ] Xóa helper tạo chữ ký thanh toán.
- [ ] Xóa biến môi trường payment gateway.
- [ ] Xóa import và dependency thừa liên quan payment.
- [ ] Chuyển checkout sang luồng còn lại hợp lệ.
- [ ] Kiểm tra backend vẫn tạo đơn bình thường.

### Kết quả mong muốn
- [ ] Không còn endpoint payment online.
- [ ] Không còn service payment gateway.
- [ ] Không còn env payment gateway.
- [ ] Không còn logic payment online rơi rớt trong code.

## PHASE 6: CHUẨN HÓA MODEL & SEED DATA
### Mục tiêu
Làm dữ liệu backend đồng nhất, dễ seed và dễ bảo trì.

### Việc cần làm
- [ ] Rà soát toàn bộ model:
  - [ ] `User.model.js`
  - [ ] `Product.model.js`
  - [ ] `Order.model.js`
  - [ ] `Coupon.model.js`
  - [ ] `Category.model.js`
- [ ] Chuẩn hóa field giữa model và dữ liệu thực tế.
- [ ] Rà soát seed data.
- [ ] Chuẩn hóa trạng thái order / payment / role.
- [ ] Xóa seed data không còn dùng.
- [ ] Đảm bảo dữ liệu mẫu không chứa logic payment online cũ.

## PHASE 7: TỐI ƯU FIRESTORE / AUTH / STORAGE
### Mục tiêu
Giảm lỗi query, giảm code phức tạp và tăng tính ổn định.

### Việc cần làm
- [ ] Tối ưu query Firestore.
- [ ] Kiểm tra index và sort/query logic.
- [ ] Rà soát `firebaseConfig`.
- [ ] Rà soát `useAuth`, `useProducts`, `useOrders`, `useStorage`.
- [ ] Chuẩn hóa upload file và lấy URL.
- [ ] Tối ưu xử lý lỗi network và quyền truy cập.

## PHASE 8: DỌN CODE & CHUẨN HÓA IMPORT / EXPORT
### Mục tiêu
Làm codebase gọn, sạch và dễ đọc hơn.

### Việc cần làm
- [ ] Xóa file không còn dùng.
- [ ] Xóa function không còn dùng.
- [ ] Xóa comment cũ, TODO cũ, code thử nghiệm.
- [ ] Chuẩn hóa `default export` và `named export`.
- [ ] Rà lại toàn bộ import thừa.
- [ ] Dọn file README backend nếu cần cập nhật lại.
- [ ] Kiểm tra lại cấu trúc folder backend.

## PHASE 9: KIỂM THỬ CUỐI CÙNG
### Mục tiêu
Đảm bảo backend ổn định trước khi chốt.

### Checklist test
- [ ] Auth hoạt động bình thường.
- [ ] Product CRUD hoạt động đúng.
- [ ] Order create/update/query ổn.
- [ ] Inventory trừ đúng khi tạo đơn.
- [ ] Coupon hoạt động đúng.
- [ ] Review hoạt động đúng.
- [ ] Storage upload/download hoạt động đúng.
- [ ] Không còn MoMo / VNPay / PayOS.
- [ ] Không còn route chết, file chết, import chết.
- [ ] Không có lỗi console hoặc exception chưa bắt.
- [ ] Backend chạy ổn định sau refactor.

## Thứ tự ưu tiên triển khai
1. Khảo sát backend và lập bản đồ file / endpoint / logic.
2. Chuẩn hóa kiến trúc route - service - model - helper.
3. Tối ưu order / inventory flow.
4. Xóa payment online còn sót.
5. Chuẩn hóa model và seed data.
6. Tối ưu Firestore / auth / storage.
7. Dọn code, chuẩn hóa export/import.
8. Test và debug cuối cùng.

## Rủi ro cần chú ý
- Xóa payment online có thể kéo theo logic order/payment ở nhiều nơi.
- Refactor service dùng chung có thể làm đứt các luồng admin / shipper / waiter.
- Sửa transaction tồn kho có thể ảnh hưởng trực tiếp đến checkout.
- Seed data và dữ liệu thật lệch schema có thể gây lỗi khó phát hiện.

## Kết quả mong muốn cuối cùng
- Backend gọn hơn, rõ hơn và dễ sửa hơn.
- Logic được chia đúng lớp.
- Ít bug hơn, ít code lặp hơn.
- Không còn payment online không dùng.
- Dễ mở rộng và bảo trì về lâu dài.

**Ngày bắt đầu:** Hôm nay
**Mục tiêu hoàn thành:** Trong 2 tuần
**Ưu tiên cao nhất:** Clean code backend + chuẩn hóa order flow + xóa payment online