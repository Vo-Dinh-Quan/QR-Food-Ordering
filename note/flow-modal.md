# Flow Hiển Thị Modal Món Ăn với Parallel-Route và Intercepting-Route

## 1. Khởi Tạo Từ Trang Danh Sách Món Ăn

- Khi người dùng click vào trang `/dishes/[id]` (với `id` của món ăn cụ thể), ứng dụng sẽ điều hướng đến trang chứa thông tin chi tiết của món ăn đó.

## 2. Intercepting-Route Bắt Đầu Tác Động

- Nhờ cấu hình intercepting-route được định nghĩa cùng route với `/dishes/[id]`, Next.js “chặn” lại quá trình chuyển hướng và thay vào đó mở modal.
- Lưu ý: Khi thực hiện F5, trang sẽ render theo route gốc vì intercepting-route chỉ áp dụng trong quá trình navigation thông qua click.

## 3. Trang “Chặn” Chỉ Chứa Modal

- Trang hiển thị modal chỉ có nội dung là modal, không có giao diện nền.
- Kết quả là, mặc dù modal được mở thành công, phần background phía sau lại trông trống rỗng.

## 4. Yêu Cầu Giữ Giao Diện Background Ban Đầu

- Mục tiêu là giữ nguyên background của trang chủ (trước khi mở modal) để mang lại trải nghiệm liền mạch cho người dùng.

## 5. Giải Pháp Tích Hợp Parallel-Route

- Sử dụng parallel-route giúp ứng dụng render đồng thời layout của trang chủ và modal.
- Điều này cho phép giữ lại giao diện của trang chủ ở background trong khi modal được hiển thị ở foreground.

## 6. Cấu Trúc Thư Mục với Parallel-Route

- Tạo một thư mục đặc biệt (ví dụ: `@modal`) bên trong layout để khai báo parallel-route theo lý thuyết của Next.js.
- Thư mục `@modal` được đặt cùng cấp với route chính (ví dụ: cùng cấp với `/`), giúp modal được render song song với nội dung của trang chủ.

## 7. Quy Trình Khi Người Dùng Click Vào `/dishes/[id]`

- Khi click, modal sẽ được mở ra từ `@modal` cùng với slot children (layout của trang chủ) đang được “ẩn” nhưng vẫn active phía sau.

## 8. Vấn Đề Khi Reload (F5)

- Nếu người dùng F5 trên trang `/dishes/[id]`, slot children sẽ không còn active và Next.js sẽ tìm file `default.tsx` để render giao diện.
- Nếu chưa có file `default.tsx` phù hợp, trang sẽ báo lỗi 404.

## 9. Giải Pháp Xử Lý File Default

- **Cần có 2 file `default.tsx`:**
  - **File default của modal:** Đảm bảo modal có giao diện mặc định khi không có dữ liệu cụ thể từ intercepting-route. (khi f5 lại từ modal sẽ được render mặc định)
  - **File default của layout:** Đảm bảo layout của trang chủ vẫn được render khi slot children không active. (khi f5 lại từ trang chủ sẽ được render mặc định)

---

Việc kết hợp intercepting-route và parallel-route theo cách này giúp đảm bảo:

- Modal hiển thị thông tin món ăn một cách linh hoạt.
- Giao diện background của trang chủ không bị mất đi, tạo cảm giác liền mạch cho người dùng.
