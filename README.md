# App quản lý công việc trên Google Sheets

## Cấu trúc Google Sheet (tự tạo khi chạy lần đầu)

**CongViec**: ID · Tiêu đề · Mô tả · Trạng thái · Ưu tiên · Người phụ trách · Ngày bắt đầu · Hạn chót · Nhãn · Tiến độ (%) · Người tạo · Ngày tạo · Cập nhật lúc

**ThanhVien**: Tên · Email · Vai trò (danh sách người để giao việc; cột Email dùng cho mục "Của tôi")

**CaiDat**: Loại (TrangThai / UuTien) · Giá trị · Màu. Sửa sheet này để đổi tên, màu hoặc thêm trạng thái và mức ưu tiên mà không cần sửa code.

## Tính năng

- Tổng quan: tổng số việc, đang làm, quá hạn, % hoàn thành, việc sắp đến hạn, biểu đồ theo trạng thái, ưu tiên, theo người.
- Danh sách: bảng trên máy tính, dạng thẻ trên điện thoại.
- Kanban: kéo thả trên máy tính; trên điện thoại vuốt ngang giữa các cột và bấm "Chuyển sang..." để đổi trạng thái.
- Của tôi: chỉ các việc giao cho mình (theo email đăng nhập).
- Lọc theo từ khoá, trạng thái, ưu tiên, người phụ trách, hạn chót (quá hạn / hôm nay / 7 ngày tới).
- Thêm, sửa, xoá công việc; tiến độ %, nhãn, ngày bắt đầu, hạn chót; tô màu việc trễ hạn.
- Giao diện tối, nhớ màn hình đang xem.

## Cài đặt

1. Tạo Google Sheet mới, vào **Tiện ích mở rộng → Apps Script**.
2. Dán nội dung `Code.gs` vào file `Code.gs`.
3. Bấm **+ → HTML**, đặt tên đúng là `Index`, dán nội dung `Index.html`.
4. Lưu, chọn hàm `setup` rồi bấm **Chạy** và cấp quyền (lần đầu).
5. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web**:
   - Thực thi với tư cách: *Tôi*
   - Người có quyền truy cập: *Chỉ mình tôi* hoặc *Bất kỳ ai trong tổ chức* / *Bất kỳ ai có tài khoản Google*
6. Mở đường link `/exec` trên máy tính hoặc điện thoại. Trên điện thoại có thể chọn "Thêm vào màn hình chính" để dùng như app.

Khi sửa code, vào **Triển khai → Quản lý triển khai → Sửa → Phiên bản mới** để link cập nhật.

## Dùng trên GitHub Pages (lưu thẳng vào Google Sheet)

Trang GitHub Pages gọi tới link `/exec` của Apps Script (biến `API_URL` ở đầu phần `<script>` trong `Index.html`).

1. Dán `Code.gs` mới (có hàm `doPost`) vào Apps Script và lưu.
2. **Triển khai → Quản lý triển khai → Sửa (bút chì)**:
   - Thực thi với tư cách: *Tôi*
   - Người có quyền truy cập: **Bất kỳ ai**
   - Phiên bản: **Phiên bản mới** → Triển khai.
3. Giữ nguyên link `/exec` thì không cần sửa `API_URL`. Nếu tạo triển khai mới có link khác, sửa `API_URL` trong `Index.html` và `index.html`.

Lưu ý: với quyền "Bất kỳ ai", ai có link `/exec` cũng đọc và sửa được danh sách công việc. Trên GitHub Pages app không biết email người dùng, nên mục "Của tôi" sẽ hỏi chọn tên (lưu trên trình duyệt).

## Chế độ demo

Để `API_URL = ''` rồi mở `Index.html` bằng trình duyệt: app chạy demo, dữ liệu lưu trên trình duyệt.
