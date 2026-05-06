# CONVENTIONS

## 1. Quy ước chung
- Giữ ngôn ngữ và tên biến nhất quán với code hiện tại.
- Ưu tiên tên mô tả rõ vai trò.
- Không đổi tên file / folder hàng loạt nếu chưa có lý do mạnh.
- Hạn chế thêm dependency mới.

## 2. Quy ước React
- Component nên ngắn gọn, dễ đọc, chia nhỏ khi logic tăng.
- Dùng hooks hiện có như `useMemo`, `useNavigate`, `useContext` đúng mục đích.
- Không đưa side-effect không cần thiết vào render.
- Mỗi page nên bám theo một luồng nghiệp vụ rõ ràng.

## 3. Quy ước state
- Dữ liệu dùng chung nhiều nơi đặt vào context.
- Trạng thái ngắn hạn, chỉ phục vụ một màn hình thì để local state.
- Nếu state có nguồn dữ liệu bền vững, ưu tiên đồng bộ với localStorage hoặc backend theo kiến trúc hiện có.

## 4. Quy ước dữ liệu và model
- Enum / constant phải là nguồn chuẩn cho trạng thái.
- Không tự ý thêm giá trị mới vào order/payment status nếu chưa cập nhật toàn bộ flow.
- Khi thay đổi model, phải rà lại mọi nơi đang map hoặc normalize dữ liệu.

## 5. Quy ước UI
- Bootstrap là nền tảng layout chính.
- Giữ theme cam-trắng và cảm giác food delivery.
- Responsive phải ưu tiên mobile trước.
- Các hiệu ứng chỉ nên hỗ trợ trải nghiệm, không làm rối logic.

## 6. Quy ước xử lý lỗi
- Không âm thầm nuốt lỗi nghiệp vụ quan trọng.
- Với thanh toán, đơn hàng, stock, auth: phải báo lỗi rõ ràng.
- Với ảnh hoặc UI phụ trợ: có thể dùng fallback an toàn.

## 7. Quy ước khi AI sửa code
- Chỉ sửa đúng phần liên quan.
- Không tự thay kiến trúc.
- Không tạo lại toàn bộ file nếu chỉ cần chỉnh nhỏ.
- Nếu gặp đoạn chưa chắc, hãy hỏi trước khi tiếp tục.
