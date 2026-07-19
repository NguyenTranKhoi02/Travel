const STORAGE_KEY = 'vibeeast_db';

const initialData = {
  tours: [
    { id: 'tour-hg-01', title: 'Hà Giang Loop: Chinh Phục Mã Pí Lèng', location: 'Hà Giang', price_base: 3200000, duration: '3 Ngày 2 Đêm', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80', is_featured: true, style: 'Self-ride', itinerary: ['Ngày 1: TP. Hà Giang - Quản Bạ - Yên Minh (100km)', 'Ngày 2: Yên Minh - Đồng Văn - Đèo Mã Pí Lèng - Mèo Vạc (80km)', 'Ngày 3: Mèo Vạc - Sông Nho Quế - TP. Hà Giang (140km)'], gallery: ['https://images.unsplash.com/photo-1549106486-1f819d7a1c33?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1539650116574-75c0c6d7347a?auto=format&fit=crop&w=1200&q=80'] },
    { id: 'tour-cb-01', title: 'Cao Bằng Bản Giốc: Nơi Biên Cương Kỳ Vĩ', location: 'Cao Bằng', price_base: 2800000, duration: '3 Ngày 2 Đêm', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT31qU9EKSVAqmOz-XuKmkvjx4Llq22B5Ino33hXRud0EBn0ZfkQqJ4O4k&s=10', is_featured: true, style: 'Easy Rider', itinerary: ['Ngày 1: TP. Cao Bằng - Đèo Khau Cốc Chà - Bảo Lạc', 'Ngày 2: Bảo Lạc - Trùng Khánh - Thác Bản Giốc', 'Ngày 3: Thác Bản Giốc - Mắt Thần Núi - TP. Cao Bằng'], gallery: ['https://images.unsplash.com/photo-1542304779-1e7c4b3b2f4d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1200&q=80', 'https://vstatic.vietnam.vn/vietnam/resource/IMAGE/2025/7/26/c80529321d4b437ab6695e7344e6bf16'] }
  ],
  bikes: [
    { id: 'bike-01', name: 'Honda XR 150cc (Cào Cào)', type: 'Côn tay', price_per_day: 350000, image: 'https://cafefcdn.com/203337114487263232/2026/5/2/hondacuve100-1728877048-3746-1728877135-11zon-1777448657292146252803-0-0-720-1152-crop-17774486603301426784818-1777685495776-1777685502768184833782.jpg', status: 'Sẵn sàng' },
    { id: 'bike-02', name: 'Honda Wave Alpha 110cc', type: 'Xe số', price_per_day: 150000, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80', status: 'Đang cho thuê' },
    { id: 'bike-03', name: 'Yamaha Exciter 155', type: 'Côn tay', price_per_day: 300000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', status: 'Sẵn sàng' }
  ],
  bookings_tour: [],
  bookings_bike: [],
  booking_logs: [],
  destinations: [
    { id: 'dest-01', name: 'Hà Giang', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80', description: 'Điểm đến lý tưởng cho chuyến đi của bạn.' },
    { id: 'dest-02', name: 'Cao Bằng', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT31qU9EKSVAqmOz-XuKmkvjx4Llq22B5Ino33hXRud0EBn0ZfkQqJ4O4k&s=10', description: 'Điểm đến lý tưởng cho chuyến đi của bạn.' }
  ],
  customer_gallery: [
    { id: 1, url: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1200&q=80', caption: 'Khách chinh phục Đèo Khau Cốc Chà' },
    { id: 2, url: 'https://images.unsplash.com/photo-1549106486-1f819d7a1c33?auto=format&fit=crop&w=1200&q=80', caption: 'Trên dòng sông Nho Quế' },
    { id: 3, url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80', caption: 'Khoảnh khắc bình minh Mã Pí Lèng' }
  ],
  settings: {
    heroVideoUrl: '',
    heroPosterUrl: ''
  },
  homestay_slides: [
    { id: 'hs-slide-1', text: "Welcome to Mama's Homestay in the center - 50 beds, where modern comfort meets traditional charm. Our homestay is thoughtfully designed to provide a welcoming and contemporary atmosphere for our guests. Mama’s Homestay offers one free night in the dormitory the day before the tour begins, and you can check in after 2 pm.", image: 'images/tour1.jpg' },
    { id: 'hs-slide-2', text: "Welcome to Mama's House - 20 beds. Mama’s Homestay offers one free night in the dormitory the day before the tour begins, and you can check in after 2 pm. Our reception is open 24/7. The free night is random and we don't charge any fee for it.", image: 'images/tour2.jpg' }
  ],
  homestay_rooms: [
    { id: 'hs-room-1', title: 'Family room (3-4pp) (2 king beds)', rates: '600.000', tour_price: '550.000', desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', image: 'images/tour1.jpg' },
    { id: 'hs-room-2', title: 'Private room (1-2pp) (1 king bed)', rates: '600.000', tour_price: '375.000', desc: "Private room for 2 people at Homestay HEAD OFFICE for the night before the loop starts.", image: 'images/tour2.jpg' },
    { id: 'hs-room-3', title: 'Dorm', rates: '200.000', tour_price: 'No fees', desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', image: 'images/tour1.jpg' }
  ],
  homestay_buses: [
    { id: 'hs-bus-1', title: 'Sleeper bus Ha Giang - Hanoi', rates: '350.000', tour_price: '300.000', desc: 'Comfortable sleeper bus from Ha Giang to Hanoi.', image: 'images/tour1.jpg' }
  ],
  reviews: [
    {
        id: 'rev-01',
        name: 'Petra K',
        avatarLetter: 'P',
        rating: 5,
        date: 'Thg 3 2026',
        title: 'Dịch vụ tuyệt vời và chuyến đi được tổ chức hoàn hảo',
        content: 'Hướng dẫn viên và tài xế của chúng tôi đều rất tuyệt vời và chuyên nghiệp. Toàn bộ lịch trình được lên kế hoạch rất tốt. Chỗ ở xác thực, đẹp. Họ đã làm rất tốt việc lái xe — chúng tôi luôn cảm thấy an toàn.',
        tourType: '6 đóng góp',
        status: 'approved'
    },
    {
        id: 'rev-02',
        name: 'Theodor L',
        avatarLetter: 'T',
        rating: 5,
        date: 'Thg 4 2026',
        title: 'Nhóm 8 người với xe máy',
        content: 'Hướng dẫn viên rất thân thiện và nhiệt tình. Anh ấy cho chúng tôi xem những tuyến đường đẹp nhất. Chúng tôi cảm thấy thực sự an toàn trong suốt chuyến đi. Tôi thực sự giới thiệu Horse Loop cho bất kỳ ai.',
        tourType: 'Bạn bè · chuyến đi nhóm',
        status: 'approved'
    },
    {
        id: 'rev-03',
        name: 'Emma B',
        avatarLetter: 'E',
        rating: 5,
        date: 'Thg 4 2026',
        title: 'Không thể tin được — 10 trên 10',
        content: 'Trải nghiệm tuyệt vời nhất từ trước đến nay. Hà Giang Loop là điều không thể bỏ qua ở Việt Nam. Các tài xế thực sự tuyệt vời — giờ chúng tôi gọi họ là bạn. Họ đã vượt xa mong đợi.',
        tourType: 'Bạn bè · 4N3Đ',
        status: 'approved'
    },
    {
        id: 'rev-04',
        name: 'Rick K',
        avatarLetter: 'R',
        rating: 5,
        date: 'Thg 3 2026',
        title: 'Trải nghiệm 10/10 với xe máy!',
        content: 'Chúng tôi đã đặt tour 3 ngày 2 đêm. Mọi thứ đều được tổ chức tốt. Các khách sạn nơi chúng tôi ở sạch sẽ và đẹp. Rất cảm ơn đội ngũ hướng dẫn viên Horse Loop.',
        tourType: 'Cặp đôi',
        status: 'approved'
    },
    {
        id: 'rev-05',
        name: 'Sarah M',
        avatarLetter: 'S',
        rating: 5,
        date: 'Thg 3 2026',
        title: 'Tour tuyệt vời nhất tôi từng tham gia',
        content: 'Không còn nghi ngờ gì nữa, đây là tour tuyệt vời nhất tôi từng đi. Hướng dẫn viên đã nỗ lực hết mình để đảm bảo chúng tôi thoải mái. Chỗ ở đẹp, đồ ăn ngon. Rất khuyến khích Horse Loop!',
        tourType: 'Bạn bè · Tour 3N2Đ',
        status: 'approved'
    }
  ]
};

async function loadDBAsync() {
  if (window.db) return window.db;

  if (window.FirebaseAPI && window.FirebaseAPI.db) {
    try {
      const docRef = window.FirebaseAPI.db.collection('system').doc('database');
      const doc = await docRef.get();
      const saved = localStorage.getItem(STORAGE_KEY);
      const localDb = saved ? JSON.parse(saved) : null;

      if (doc.exists) {
        window.db = { ...initialData, ...doc.data() };
        
        // Auto-migration: If local storage has MORE data than Firebase, it means Firebase was just initialized with dummy data, but user has real data locally.
        if (localDb) {
          const localCount = (localDb.tours?.length || 0) + (localDb.bikes?.length || 0);
          const cloudCount = (window.db.tours?.length || 0) + (window.db.bikes?.length || 0);
          if (localCount > cloudCount) {
            window.db = { ...initialData, ...localDb };
            await docRef.set(window.db);
            console.log("Migrated local data to Firebase");
          }
        }
        
        ['tours', 'bikes', 'bookings_tour', 'bookings_bike', 'booking_logs', 'destinations', 'customer_gallery', 'reviews', 'homestay_slides', 'homestay_rooms', 'homestay_buses'].forEach(k => {
          if (!Array.isArray(window.db[k])) window.db[k] = initialData[k] || [];
        });
        if (!window.db.settings) window.db.settings = initialData.settings;
      } else {
        window.db = localDb ? { ...initialData, ...localDb } : structuredClone(initialData);
        await docRef.set(window.db);
      }
    } catch (e) {
      console.error("Firebase load error, falling back to local:", e);
      const saved = localStorage.getItem(STORAGE_KEY);
      window.db = saved ? { ...initialData, ...JSON.parse(saved) } : structuredClone(initialData);
    }
  } else {
    const saved = localStorage.getItem(STORAGE_KEY);
    window.db = saved ? { ...initialData, ...JSON.parse(saved) } : structuredClone(initialData);
  }
  return window.db;
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  
  if (window.FirebaseAPI && window.FirebaseAPI.db) {
    window.FirebaseAPI.db.collection('system').doc('database').set(db)
      .catch(e => console.error("Firebase save error:", e));
  }
}

async function sendTelegramNotification(message) {
  const token = "8798940856:AAEwFHbwZ8Jo5l_Lc638VlzAFLd239dX51c";
  const chatId = "8266678111";
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" })
    });
  } catch (e) {
    console.error("Telegram error:", e);
  }
}

function downloadJSON(filename, data) {
  const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 0);
}

window.VibeEast = {
  loadDBAsync,
  saveDB,
  sendTelegramNotification,
  downloadJSON,
  loadDB: () => { console.warn("Sync loadDB called, use loadDBAsync"); return window.db || initialData; }
};