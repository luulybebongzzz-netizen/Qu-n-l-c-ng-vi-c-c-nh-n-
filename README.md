# App quản lý công việc trên Google Sheets

## Cấu trúc Google Sheet (tự tạo khi chạy lần đầu)

**CongViec**: ID · Tiêu đề · Mô tả · Trạng thái · Ưu tiên · Người phụ trách · Ngày bắt đầu · Hạn chót · Nhãn · Tiến độ (%) · Người tạo · Ngày tạo · Cập nhật lúc · Khu vực

**DonHang**: ID · Ngày nhận đơn · Khách hàng · Mã hàng · SL đặt · ĐVT · Kho (lấy hàng) · Ngày nhận dự kiến · Người gửi · Ghi chú · SL đã lấy · Trạng thái · Cập nhật lúc · Kho nhận hàng · Mã KH SAP · Mã hàng SAP · Khu vực · Mã đơn · Lô (app tự điền lại mã SAP đã dùng cho cùng khách / cùng mã hàng) (mỗi dòng là một mã hàng của một đơn)

**KhachHang**: Khách hàng · Mã KH SAP · Kho nhận mặc định · Cập nhật lúc
**MaHang**: Mã hàng · Mã hàng SAP · ĐVT · Viên/thùng · m²/thùng · Cập nhật lúc
(App tự thêm/cập nhật hai danh mục này mỗi khi lưu đơn; gõ tên khách hoặc mã hàng là tự điền mã SAP, kho nhận, ĐVT.)

**ThanhVien**: Tên · Email · Vai trò (danh sách người để giao việc; cột Email dùng cho mục "Của tôi")

**CaiDat**: Loại (TrangThai / UuTien) · Giá trị · Màu. Sửa sheet này để đổi tên, màu hoặc thêm trạng thái và mức ưu tiên mà không cần sửa code.

## Tính năng

- Tổng quan: tổng số việc, đang làm, quá hạn, % hoàn thành, việc sắp đến hạn, biểu đồ theo trạng thái, ưu tiên, theo người.
- Danh sách: bảng trên máy tính, dạng thẻ trên điện thoại.
- Kanban: kéo thả trên máy tính; trên điện thoại vuốt ngang giữa các cột và bấm "Chuyển sang..." để đổi trạng thái.
- Của tôi: chỉ các việc giao cho mình (theo email đăng nhập).
- Lọc theo từ khoá, trạng thái, ưu tiên, người phụ trách, hạn chót (quá hạn / hôm nay / 7 ngày tới).
- Thêm, sửa, xoá công việc; tiến độ %, nhãn, ngày bắt đầu, hạn chót; tô màu việc trễ hạn.
- Dán đơn: mỗi khách hiện một khung, trên cùng là tên khách, code khách, người đặt hàng; giữa là từng mã hàng một dòng; cuối là ngày lấy hàng và ghi chú.
- Đọc phiếu PDF điều chuyển: bấm "📄 Đọc phiếu PDF điều chuyển" (chọn được nhiều file), app lấy kho xuất, kho nhận (số cuối tên khách, ví dụ "- 1121"), mã hàng, mã SAP, lô, số lượng (dòng Thùng + Viên cùng mã gộp lại), số chứng từ vào ghi chú; chị chỉ gõ tên khách hàng. Cần PDF dạng chữ (xuất từ hệ thống), không phải ảnh scan.
- Đơn hàng: dán tin Zalo (ví dụ "Quỳnh An / 2080banyan002 20m / thứ 2 tuần sau khách nhận"), app tự tách khách hàng, mã hàng, số lượng, ngày nhận; xem trước, sửa, thêm dòng rồi lưu. Có nút thêm đơn tay. Đơn được nhóm theo Quá hẹn / Hôm nay / Ngày mai / Sắp nhận, bấm "Khách đã lấy đủ" để đóng đơn.
- Thùng / viên: điền "m²/thùng" và "Viên/thùng" cho mã hàng (trong đơn hoặc sheet MaHang), app tự đổi m² ra thùng + viên (làm tròn lên đủ viên). Khi nhập tay có thể gõ thẳng số thùng và số viên. Tin Zalo dạng "10 thùng 5 viên" cũng tách được.
- Xuất EX: nút "⬇ Xuất EX" trên từng đơn tải file Excel theo mẫu EX (Nơi lấy hàng · Nơi nhận hàng · Mã SAP · Mã Hàng · Số lượng TH / V · Lô · Khách hàng - code khách; mã chưa có quy đổi thì ghi nguyên SL + ĐVT, tô vàng). Nút "☑ Chọn đơn xuất EX" để chọn nhiều đơn, "Gộp thành 1 đơn lớn" cộng các dòng cùng kho lấy + mã hàng + lô.
- Báo cáo tháng: chọn tháng rồi bấm "📊 Báo cáo tháng", tải file Excel gồm Tổng hợp (theo khu vực và theo nơi lấy hàng / điều chuyển về), Theo khách (khách + mã hàng: đặt, đã lấy, còn lại, %), Chi tiết và EX. Theo khu vực đang chọn ở trên cùng.
- Điều chuyển / có sẵn kho: trong mỗi khu vực, đơn chia 2 phần. Đơn lấy hàng ở kho khác kho nhà (KV 27 khác 1121, KV 23 khác 1118) là đơn điều chuyển, có nhãn 🚚. Sửa kho nhà ở HOME_WAREHOUSE trong Index.html. Báo cáo tháng có thêm bảng theo loại đơn.
- Khu vực: nút Tất cả / KV 27 / KV 23 trên cùng lọc toàn bộ app; đơn hàng tự xếp theo kho nhận hàng (1121 → KV 27, kho khác → KV 23, sửa danh sách ở AREA_27_WAREHOUSES trong Index.html); công việc tự gán khu vực đang chọn, dữ liệu chưa gán khu vực hiện ở mọi khu vực.
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
