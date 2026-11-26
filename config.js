/*
 * CẤU HÌNH DUY NHẤT CẦN SỬA
 * API_URL: dán đường dẫn "Ứng dụng web" của Google Apps Script (kết thúc bằng /exec).
 * Để trống thì app chạy ở chế độ DÙNG THỬ: dữ liệu mẫu, chỉ lưu trên máy đang mở.
 */
window.PDT_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbwswlFV8lJh3Gtug_eZhk5418PMdH4S5TxVQy4_cFX9RqmiYxsICEq23bTeq0OrU9Rq/exec',
  TEN_APP: 'Công việc Phòng Đào tạo',
  TEN_TRUONG: 'Trường Đại học Kinh tế - Kỹ thuật Công nghiệp',
  LAM_MOI_GIAY: 60,
  /*
   * FIREBASE: để nhận thông báo cả khi đã đóng app. Lấy ở Firebase console:
   * Cài đặt dự án > Chung > Ứng dụng web > Cấu hình SDK (firebaseConfig).
   * VAPID_KEY: Cài đặt dự án > Cloud Messaging > Chứng chỉ Web Push > Cặp khóa.
   * Hai mục này công khai được (không phải mật khẩu). Để trống thì chỉ báo khi app đang mở.
   */
  FIREBASE: {
    apiKey: 'AIzaSyDJWJ0ozGpfr2rz4sCas6bdpwDtsstQzOE',
    authDomain: 'cong-viec-pdt.firebaseapp.com',
    projectId: 'cong-viec-pdt',
    storageBucket: 'cong-viec-pdt.firebasestorage.app',
    messagingSenderId: '1029197138091',
    appId: '1:1029197138091:web:c9266b358ba7465d59cfee'
  },
  VAPID_KEY: 'BJXq2eGrJovsiYORD125C8n1UTnjL9cKMEGZ9fdYlRCUiuvUAd5luvqxGXkrtMSky_antrWMbn3pgoaY_z-6vSk'
};
