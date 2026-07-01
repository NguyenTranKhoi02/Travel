🗺️ MASTER BLUEPRINT: WEBSITE VIBEEAST
1. TỔNG QUAN DỰ ÁN
Tên thương hiệu: AnTravel (Du lịch trải nghiệm Đông Bắc)

Dịch vụ trọng tâm: Tour phượt Hà Giang/Cao Bằng (Tự lái hoặc Easy Rider) & Cho thuê xe máy phượt chuyên nghiệp.

Phong cách giao diện (Vibe): Bụi bặm nhưng hiện đại. Tone màu chủ đạo là xanh rêu đại ngàn (#1E3A2F), cam đất bụi đường (#D97706), và trắng kem (#F9FAC7).

Công nghệ: HTML5, CSS3 (Flexbox/Grid, CSS Variables), JavaScript thuần (ES6+), cơ sở dữ liệu giả lập sử dụng localStorage và định dạng JSON.

2. CẤU TRÚC THƯ MỤC DỰ ÁN (FOLDER STRUCTURE)
Plaintext
vibeeast-travel/
│
├── index.html          # Trang chủ (Giới thiệu, Tour hot, Thuê xe nhanh)
├── tours.html          # Danh sách tour Hà Giang - Cao Bằng + Bộ lọc
├── tour-detail.html    # Chi tiết tour + Bản đồ lịch trình + Form tính tiền tự động
├── rental.html         # Danh sách xe máy + Form chọn ngày nhận/trả xe
├── admin.html          # Dashboard quản trị tổng hợp (Tất cả tab nằm trong 1 file)
│
├── css/
│   ├── style.css       # Toàn bộ giao diện Client (Dùng chung biến màu)
│   └── admin.css       # Giao diện Dashboard Admin
│
└── js/
    ├── app.js          # Khởi tạo dữ liệu gốc, quản lý LocalStorage chung
    ├── client.js       # Logic render tour/xe, tính tiền form, đặt hàng
    └── admin.js        # Logic Dashboard: Thêm/Xóa tour, Đổi trạng thái đơn hàng
3. CẤU TRÚC CƠ SỞ DỮ LIỆU GIẢ LẬP (db.json / localStorage)
JSON
{
  "tours": [
    {
      "id": "tour-hg-01",
      "title": "Hà Giang Loop: Chinh Phục Mã Pí Lèng",
      "location": "Hà Giang",
      "price_base": 3200000,
      "duration": "3 Ngày 2 Đêm",
      "image": "images/hagiang-loop.jpg",
      "is_featured": true,
      "itinerary": [
        "Ngày 1: TP. Hà Giang - Quản Bạ - Yên Minh (100km)",
        "Ngày 2: Yên Minh - Đồng Văn - Đèo Mã Pí Lèng - Mèo Vạc (80km)",
        "Ngày 3: Mèo Vạc - Sông Nho Quế - TP. Hà Giang (140km)"
      ]
    },
    {
      "id": "tour-cb-01",
      "title": "Cao Bằng Bản Giốc: Nơi Biên Cương Kỳ Vĩ",
      "location": "Cao Bằng",
      "price_base": 2800000,
      "duration": "3 Ngày 2 Đêm",
      "image": "images/bangioc.jpg",
      "is_featured": true,
      "itinerary": [
        "Ngày 1: TP. Cao Bằng - Đèo Khau Cốc Chà - Bảo Lạc",
        "Ngày 2: Bảo Lạc - Trùng Khánh - Thác Bản Giốc",
        "Ngày 3: Thác Bản Giốc - Mắt Thần Núi - TP. Cao Bằng"
      ]
    }
  ],
  "bikes": [
    {
      "id": "bike-01",
      "name": "Honda XR 150cc (Cào Cào)",
      "type": "Côn tay",
      "price_per_day": 350000,
      "image": "images/xr150.jpg",
      "status": "Sẵn sàng"
    },
    {
      "id": "bike-02",
      "name": "Honda Wave Alpha 110cc",
      "type": "Xe số",
      "price_per_day": 150000,
      "image": "images/wave.jpg",
      "status": "Đang cho thuê"
    }
  ],
  "bookings_tour": [],
  "bookings_bike": []
}
4. KỊCH BẢN CHI TIẾT CÁC TRANG GIAO DIỆN
4.1. Giao diện khách hàng (Client Site)
A. Trang Chủ (index.html)
Hero Section: Banner video chạy dọc đường đèo dốc Thẩm Mã. Thanh tìm kiếm lớn ở giữa: [Chọn điểm đến (Hà Giang/Cao Bằng)] | [Chọn dịch vụ (Tour/Thuê xe)] | [Nút Tìm Vibe].

Khối "Vibe Hà Giang vs Cao Bằng": Thiết kế 2 thẻ hình ảnh lớn đại diện cho 2 tỉnh. Di chuột (Hover) vào tỉnh nào thì hình ảnh phóng to nhẹ và hiện số lượng tour đang có.

Khối Tour Nổi Bật (Featured Tours): Dùng CSS Grid hiển thị các tour có thuộc tính is_featured: true. Dưới mỗi card có nhãn: "Self-ride" (Tự lái) hoặc "Easy Rider" (Có xế chở).

Khối Thuê Xe Máy Nhanh: Giới thiệu 3 dòng xe phổ biến nhất kèm cam kết: "Bảo dưỡng trước chuyến đi, tặng kèm giáp bảo hộ, mũ 3/4 và gói cứu hộ đèo dốc".

B. Trang Danh Sách Tour (tours.html)
Thanh bộ lọc (Sidebar): * Phân loại theo Tỉnh thành (Checkbox: Hà Giang, Cao Bằng).

Phân loại theo Thời gian (Checkbox: 2 Ngày, 3 Ngày, 4 Ngày).

Bộ lọc giá (Range Slider).

Khu vực hiển thị (Main Grid): Tự động render danh sách tour dựa trên bộ lọc bằng JavaScript mà không load lại trang.

C. Trang Chi Tiết Tour (tour-detail.html)
Bố cục layout: Cột trái (70%) là thông tin chi tiết; Cột phải (30%) là form đặt tour cố định khi cuộn trang (Sticky).

Cột trái: * Slider ảnh phong cảnh.

Khối Lịch trình tương tác (Interactive Itinerary): Thiết kế dạng Accordion. Click vào "Ngày 1" sẽ xổ nội dung chi tiết của Ngày 1 ra, đồng thời một bản đồ lộ trình vẽ bằng CSS (hoặc ảnh sơ đồ) bên cạnh sẽ sáng đèn ở chặng tương ứng.

Cột phải (Form Đặt Tour thông minh):

Nhập thông tin: Ngày khởi hành, Số lượng người.

Chọn chế độ di chuyển (Radio Button):

[ ] Tự lái xe máy (Giữ nguyên giá gốc).

[ ] Easy Rider - Tài xế bản địa chở (+500,000 đ/ngày/người).

[ ] Ô tô du lịch (+300,000 đ/người).

Xử lý JavaScript: Khi người dùng thay đổi số lượng người hoặc tick chọn chế độ di chuyển, hàm updateTotalPrice() sẽ lập tức tính toán và hiển thị số tiền cuối cùng. Khi bấm "Đặt Tour", dữ liệu đẩy vào mảng bookings_tour trong localStorage.

D. Trang Thuê Xe Máy (rental.html)
Giao diện: Danh sách các loại xe máy hiện có dưới dạng thẻ. Mỗi thẻ có trạng thái (Còn xe / Hết xe).

Form Đặt Xe: Nhập Ngày nhận xe, Ngày trả xe, Nơi nhận xe (Ví dụ: "Bến xe Hà Giang (Hỗ trợ giao xe đêm lúc 3h sáng)"). Hệ thống tự nhân số ngày thuê với đơn giá xe để ra tổng tiền.

4.2. Giao diện quản trị (Admin Site - admin.html)
Để tiện lợi cho việc code giao diện tĩnh, toàn bộ trang quản trị sẽ nằm trong một file duy nhất, sử dụng menu Sidebar bên trái để chuyển đổi hiển thị các tab nội dung bằng JavaScript (ẩn/hiển class .active).

Tab 1: Tổng Quan (Dashboard Overview)
Các widget hiển thị số liệu nhanh dưới dạng con số lớn: Tổng doanh thu, Tổng số tour đang chạy, Số lượng xe máy đang được thuê ngoài đường, Số lượng đơn hàng mới chưa duyệt.

Tab 2: Quản Lý Sản Phẩm (Tour & Bike Management)
Chia làm 2 bảng dữ liệu: Bảng Tour và Bảng Xe Máy.

Mỗi hàng trong bảng đều có nút [Sửa] và [Xóa].

Có một nút lớn [+ Thêm Mới]. Khi bấm vào sẽ kích hoạt một Modal Pop-up Form phủ lên màn hình để nhập liệu sản phẩm mới.

Tab 3: Quản Lý Đơn Đặt Tour & Xe (Booking Management)
Danh sách hiển thị chi tiết tất cả các đơn hàng mà khách đã đặt từ trang ngoài.

Cột trạng thái hiển thị các nhãn màu (Badge CSS): Chờ xác nhận (Màu vàng), Đã đặt cọc (Màu xanh dương), Đang đi tour (Màu xanh lá).

Người quản trị có thể click trực tiếp vào nhãn trạng thái để đổi trạng thái của đơn hàng, dữ liệu này sẽ lập tức cập nhật lại vào hệ thống localStorage.

5. KỊCH BẢN XỬ LÝ JAVASCRIPT (FLOW LOGIC)
Bước 1: Khởi tạo dữ liệu (Chạy ngay khi mở web)
Khi trang web được tải, hệ thống kiểm tra xem localStorage đã có dữ liệu chưa. Nếu chưa, nó sẽ nạp toàn bộ dữ liệu cấu trúc mẫu từ file JSON cấu hình ở mục 3 vào hệ thống để bắt đầu vận hành.

Bước 2: Đồng bộ hóa giỏ hàng và đơn hàng
Khi khách hàng bấm đặt tour hoặc đặt xe tại trang Client, JavaScript sẽ dùng hàm JSON.stringify() để đóng gói thông tin (Tên khách, SĐT, Sản phẩm, Tổng tiền, Ngày đi) và đẩy vào mảng quản lý đơn hàng tương ứng.

Chuyển hướng khách hàng sang trang thông báo thành công.

Bước 3: Phản hồi thời gian thực tại Admin
Khi Admin mở trang admin.html, JavaScript sẽ đọc dữ liệu đơn hàng mới nhất từ localStorage, dùng vòng lặp forEach để render ra các dòng <tr> tương ứng trong bảng quản lý đơn hàng để nhân viên xử lý.