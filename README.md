# Công việc Phòng Đào tạo – UNETI

Ứng dụng quản lý công việc của Phòng Đào tạo, dùng trên máy tính (trình duyệt) và điện thoại iPhone, Android (cài ra màn hình chính như một app). Giao diện gồm 5 mục: **Trang chủ, Công việc, Kế hoạch, Của tôi, Thêm**.

- **Giao diện app** đặt trên GitHub Pages (miễn phí).
- **Dữ liệu dùng chung** lưu trong một Google Sheet trên Google Drive của Trưởng phòng; tệp minh chứng tải lên nằm trong thư mục "Minh chứng - App công việc Phòng Đào tạo" trên cùng Drive.
- Cán bộ **đăng nhập bằng email của Trường** (`ten@uneti.edu.vn`; gõ phần trước @ cũng được). Trưởng phòng cấp tài khoản trong app, mật khẩu ban đầu là `1111`, phải đổi ở lần đăng nhập đầu. Không cần tài khoản Google.

## Chức năng

| Mục | Nội dung |
|---|---|
| Trang chủ | Việc cần chú ý (quá hạn, sắp đến hạn, chờ duyệt); thanh trạng thái công việc tháng của Phòng; số việc từng cán bộ; bảng tổng hợp Xong/Giao, Quá hạn, Điểm theo tháng hoặc năm học; nhắc sinh nhật, ghi chú riêng |
| Công việc | Tìm kiếm, lọc (cán bộ, tổ, ưu tiên, danh mục); xem Danh sách hoặc Tiến độ (biểu đồ theo ngày trong tháng); Đề xuất việc |
| Chi tiết việc | Cập nhật tiến độ %, báo hoàn thành, duyệt và chấm điểm, trả lại, hủy; minh chứng (dán link hoặc tải tệp lên Drive); trao đổi và lịch sử |
| Kế hoạch | Kế hoạch năm học (đã nạp sẵn 09 nhiệm vụ trọng tâm 2026–2027 kèm các mốc), kế hoạch từng tháng; giao việc thẳng từ nhiệm vụ, tiến độ nhiệm vụ tính theo các việc đã giao |
| Của tôi | Việc của tôi và điểm tháng; Ghi chú nhắc việc riêng tư (sinh nhật, kỷ niệm, nhắc việc), có ngày âm lịch, lặp theo âm lịch |
| Thêm | Thông báo, Việc chờ tôi duyệt, Đánh giá kết quả (tải Excel), Nhân sự, Cài đặt danh mục và cách tính điểm, Cài đặt app lên thiết bị, bật thông báo, âm thanh, giao diện sáng/tối, ngày sinh, đổi mật khẩu |

**Phân quyền 3 cấp**

| Quyền | Được làm |
|---|---|
| Lãnh đạo Phòng (Trưởng, Phó Trưởng phòng) | Giao việc cho mọi người, duyệt, chấm điểm, mở lại, hủy; lập và ban hành kế hoạch; quản lý nhân sự, cài đặt |
| Tổ trưởng | Giao và duyệt việc cho cán bộ trong tổ; duyệt đề xuất của tổ; lập kế hoạch tháng |
| Chuyên viên | Nhận việc, cập nhật tiến độ, nộp minh chứng, báo hoàn thành; đề xuất việc (chờ duyệt mới thành việc giao) |

**Cách tính điểm** (sửa được ở Thêm › Cài đặt): mỗi việc hoàn thành mặc định 100 điểm, trừ 2 điểm cho mỗi ngày nộp trễ (tối đa 30); người duyệt có thể chấm lại. Điểm cán bộ trong kỳ = bình quân điểm các việc hoàn thành, trừ 5 điểm cho mỗi việc đang quá hạn.

## Dùng thử ngay (không cần cài gì)

Để trống `API_URL` trong `config.js` thì app chạy ở **chế độ dùng thử**: có sẵn dữ liệu mẫu, chỉ lưu trên máy đang mở. Tài khoản mẫu (đuôi `@uneti.edu.vn`), mật khẩu chung `1111`: `truongphong` (lãnh đạo Phòng), `totruong1`, `totruong2`, `chuyenvien1` … `chuyenvien4`.

---

## Triển khai chính thức (làm một lần, khoảng 20 phút)

### Bước 1. Tạo nơi lưu dữ liệu trên Google Drive

1. Đăng nhập Google Drive bằng tài khoản của anh, tạo **Google Trang tính** mới, đặt tên `CSDL App cong viec Phong Dao tao`.
2. Trên trang tính: menu **Tiện ích mở rộng › Apps Script**.
3. Trong cửa sổ Apps Script:
   - Tệp `Code.gs` có sẵn: xóa hết nội dung, dán toàn bộ nội dung tệp `apps-script/Code.gs`.
   - Bấm dấu **+** cạnh "Tệp" › **Tập lệnh**, đặt tên `core`, dán toàn bộ nội dung tệp `apps-script/core.gs`.
   - Bấm biểu tượng **Lưu**.
4. Trên thanh công cụ chọn hàm **caiDat**, bấm **Chạy**. Lần đầu Google hỏi quyền: chọn tài khoản của anh › **Nâng cao** › **Đi tới … (không an toàn)** › **Cho phép** (đây là tập lệnh của chính anh, chỉ đọc ghi trang tính và thư mục minh chứng trên Drive của anh).
5. Xem **Nhật ký thực thi**: có dòng "Đã tạo tài khoản: <email Trưởng phòng> / 1111" (email đặt ở dòng `EMAIL_TRUONG_PHONG` đầu tệp Code.gs). Trang tính lúc này có các trang: Users, Tasks, Logs, Notes, Plans, Notifs, Settings.

### Bước 2. Mở máy chủ dữ liệu

1. Trong Apps Script bấm **Triển khai › Tùy chọn triển khai mới**.
2. Biểu tượng bánh răng › chọn **Ứng dụng web**.
   - Thực thi với tư cách: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
3. Bấm **Triển khai**, sao chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/…/exec`).

> "Bất kỳ ai" nghĩa là app gọi được máy chủ mà không cần tài khoản Google; mọi thao tác vẫn phải đăng nhập bằng tài khoản app. Không chia sẻ trang tính cho người khác: trang tính chứa mật khẩu đã mã hóa.

### Bước 3. Gắn máy chủ vào app

Mở tệp `config.js`, dán URL vừa sao chép vào giữa hai dấu nháy của `API_URL`:

```js
API_URL: 'https://script.google.com/macros/s/XXXX/exec',
```

### Bước 4. Đưa app lên GitHub Pages

1. Vào github.com, tạo kho mới (New repository), ví dụ `cong-viec-phong-dao-tao`, chọn **Public** (GitHub Pages miễn phí cho kho công khai; dữ liệu không nằm trong kho này nên không lộ dữ liệu).
2. Bấm **Add file › Upload files**, kéo thả các tệp: index.html, app.js, core.js, lunar.js, config.js, styles.css, sw.js, manifest.webmanifest, README.md và thư mục icons › **Commit changes**. **Không tải thư mục apps-script** lên GitHub (mã máy chủ đã nằm trong Apps Script; tệp Code.gs có email của Trưởng phòng).
3. Vào **Settings › Pages**: Source chọn **Deploy from a branch**, Branch chọn **main** và **/(root)** › **Save**.
4. Sau 1–2 phút, đường dẫn app hiện ở đầu trang Pages, dạng `https://<tên-tài-khoản>.github.io/cong-viec-phong-dao-tao/`.

### Bước 5. Đưa cả Phòng vào dùng

1. Mở đường dẫn app, đăng nhập bằng email Trưởng phòng, mật khẩu `1111`, đặt mật khẩu mới.
2. **Thêm › Nhân sự › Thêm cán bộ**: nhập họ tên, email @uneti.edu.vn, quyền, tổ. Mật khẩu ban đầu `1111` (đổi được ở Thêm › Cài đặt); cán bộ phải đặt mật khẩu riêng ở lần đăng nhập đầu. Quên mật khẩu thì Trưởng phòng bấm **Đặt lại mật khẩu** để về `1111`.
3. Gửi đường dẫn app cho cán bộ, hướng dẫn cài ra màn hình chính (**Thêm › Cài đặt ứng dụng lên thiết bị** có hướng dẫn cho iPhone, Android, máy tính) và bật **Thông báo trên thiết bị**.

## Đã cài bản cũ (đăng nhập bằng tên)?

Dán lại hai tệp `Code.gs`, `core.gs` mới vào Apps Script, chạy hàm **chuyenSangEmail** một lần, rồi **Triển khai › Quản lý các lần triển khai › Chỉnh sửa (bút chì) › Phiên bản: Phiên bản mới › Triển khai** (giữ nguyên URL).

## Nâng lên phiên bản 1.2 (logo, nhãn PT)

Dán lại `Code.gs`, `core.gs` mới vào Apps Script, bấm Lưu, rồi **Triển khai › Quản lý các lần triển khai › Chỉnh sửa › Phiên bản mới › Triển khai**. Trang Users tự có thêm cột `badge` (nhãn chức vụ) ở lần dùng đầu.

## Cập nhật app về sau

- Sửa giao diện: tải tệp mới đè lên kho GitHub. Đổi số phiên bản trong dòng `var CACHE = 'pdt-v1.0.0'` của `sw.js` để điện thoại nhận bản mới.
- Sửa lõi nghiệp vụ `core.js`: chép nội dung sang `core.gs` trong Apps Script, rồi **Triển khai › Quản lý các lần triển khai › Chỉnh sửa › Phiên bản mới › Triển khai** (giữ nguyên URL).
- Sao lưu: Google Trang tính tự lưu lịch sử phiên bản; có thể **Tệp › Tạo bản sao** định kỳ.

## Giới hạn cần biết

- **Thông báo**: app kiểm tra việc mới mỗi 60 giây khi đang mở trên màn hình, và kiểm tra ngay mỗi lần mở lại app; có việc mới thì báo bằng âm thanh, thông báo của thiết bị và số đỏ trên chuông. Khi app đóng hoặc chạy nền thì không nhận được thông báo, vì Google Apps Script không gửi được thông báo đẩy. Muốn nhận cả khi đóng app cần thêm máy chủ đẩy thông báo (ví dụ Firebase Cloud Messaging).
- **Quy mô**: phù hợp một phòng vài chục người, vài nghìn công việc. Mỗi thao tác mất khoảng 1–2 giây do Google Sheet xử lý.
- **Tệp minh chứng** tải lên tối đa 8 MB; tệp lớn hơn thì để trên Drive rồi dán link. Tệp tải lên được đặt quyền "ai có link thì xem được" để cán bộ không có tài khoản Google vẫn mở được.
- **App Store, Google Play**: bản hiện tại cài từ trình duyệt (PWA). Đưa lên kho ứng dụng cần tài khoản nhà phát triển của Trường (Apple 99 USD/năm, Google 25 USD một lần) và đóng gói thêm.
