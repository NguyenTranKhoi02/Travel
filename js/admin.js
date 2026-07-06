(async () => {
  const db = await window.VibeEast.loadDBAsync();
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];
  const formatPriceInput = (val) => String(val).replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const money = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' đ';
  const statusClasses = { 'Chờ xác nhận': 'status-yellow', 'Đã đặt cọc': 'status-blue', 'Đang đi tour': 'status-green', 'Đã hoàn thành': 'status-gray' };
  let editState = { type: null, id: null };
  let productScope = 'all';
  let orderScope = 'all';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); };
  const persist = () => window.VibeEast.saveDB(db);
  const refresh = () => { renderDashboard(); renderProducts(); renderOrders(); renderGallery(); renderSettings(); renderReviews(); };
  const initTabs = () => { const items = $$('.admin-menu-item'); const tabs = $$('.admin-tab'); items.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); items.forEach(i => i.classList.remove('active')); tabs.forEach(t => t.classList.remove('active')); link.classList.add('active'); $('#' + link.dataset.tab).classList.add('active'); })); };
  const calcRevenue = () => ({ tour: db.bookings_tour.reduce((s, b) => s + (b.total || 0), 0), bike: db.bookings_bike.reduce((s, b) => s + (b.total || 0), 0) });
  const ordersAll = () => [...db.bookings_tour.map(o => ({ ...o, kind: 'Tour', productName: db.tours.find(t => t.id === o.tourId)?.title || o.tourId || '-' })), ...db.bookings_bike.map(o => ({ ...o, kind: 'Xe', productName: db.bikes.find(b => b.id === o.bikeId)?.name || o.bikeId || '-' }))];

  function renderDashboard() {
    const revenue = calcRevenue(); const all = ordersAll();
    $('#statsGrid').innerHTML = `<div class="stat-card"><span>Tổng doanh thu</span><strong>${money(revenue.tour + revenue.bike)}</strong></div><div class="stat-card"><span>Tổng số tour</span><strong>${db.tours.length}</strong></div><div class="stat-card"><span>Tổng số xe</span><strong>${db.bikes.length}</strong></div><div class="stat-card"><span>Đơn hàng</span><strong>${all.length}</strong></div>`;
    $('#revenueBars').innerHTML = [{ label: 'Tour', value: revenue.tour }, { label: 'Thuê xe', value: revenue.bike }].map(x => `<div class="chart-item"><div style="display:flex;justify-content:space-between;gap:12px"><strong>${x.label}</strong><span>${money(x.value)}</span></div><div class="chart-track"><div class="chart-fill" style="width:${Math.min(100, (x.value / Math.max(revenue.tour + revenue.bike, 1)) * 100)}%"></div></div></div>`).join('');
    const orderStatusCount = all.reduce((acc, item) => { const key = item.status || 'Chờ xác nhận'; acc[key] = (acc[key] || 0) + 1; return acc; }, {}); const maxStatus = Math.max(...Object.values(orderStatusCount), 1);
    $('#statusBars').innerHTML = ['Chờ xác nhận', 'Đã đặt cọc', 'Đang đi tour', 'Đã hoàn thành'].map(status => { const count = orderStatusCount[status] || 0; return `<div class="chart-item"><div style="display:flex;justify-content:space-between;gap:12px"><strong>${status}</strong><span>${count}</span></div><div class="chart-track"><div class="chart-fill" style="width:${(count / maxStatus) * 100}%"></div></div></div>`; }).join('');
  }

  // --- Cấu hình Cloudinary ---
  // HƯỚNG DẪN: Đăng ký tài khoản tại cloudinary.com
  // 1. Thay 'YOUR_CLOUD_NAME' bằng Cloud Name của bạn
  // 2. Vào Settings -> Upload -> Enable "Unsigned" và tạo Upload preset, điền tên preset vào 'YOUR_UPLOAD_PRESET'
  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/teahouse/auto/upload';
  const CLOUDINARY_PRESET = 'antravel_preset';

  async function handleFileUpload(fileInput, targetInputId) {
    const file = fileInput.files[0];
    if (!file) return;

    if (CLOUDINARY_URL.includes('YOUR_CLOUD_NAME')) {
      alert("Vui lòng thay đổi cấu hình Cloudinary trong file js/admin.js (dòng 34) trước khi sử dụng tính năng tải lên!");
      return;
    }

    try {
      toast('Đang tải lên Cloudinary...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.secure_url) {
        $(targetInputId).value = data.secure_url;
        toast('Tải lên thành công');
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (e) {
      console.error(e);
      toast('Lỗi tải lên: ' + e.message);
    }
  }

  function renderItineraryBuilder(items) {
    const builder = $('#itineraryBuilder');
    builder.innerHTML = '';
    if (!items || items.length === 0) items = [''];
    items.forEach((item) => addItineraryInput(item));
  }

  function addItineraryInput(value = '') {
    const builder = $('#itineraryBuilder');
    const idx = builder.children.length;
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '8px';
    div.className = 'itinerary-day-row';
    div.innerHTML = `
      <div class="day-index" style="width:40px;height:40px;background:var(--primary);color:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0;">${idx + 1}</div>
      <textarea class="itinerary-day-input" rows="2" style="flex:1;padding:12px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:0.95rem;resize:vertical;" placeholder="Nội dung ngày ${idx + 1}...">${value}</textarea>
      <button type="button" class="btn delete-day-btn" style="background:#fee2e2;color:#ef4444;border-radius:8px;padding:0 12px;font-weight:bold;align-self:flex-start;" title="Xóa ngày này">X</button>
    `;
    div.querySelector('.delete-day-btn').addEventListener('click', () => {
      div.remove();
      [...builder.children].forEach((child, i) => {
        child.querySelector('.day-index').textContent = i + 1;
        child.querySelector('textarea').placeholder = `Nội dung ngày ${i + 1}...`;
      });
    });
    builder.appendChild(div);
  }

  function openModal(mode, item = null) {
    editState = { type: mode, id: item?.id || null };
    $('#productModal').classList.add('active');
    if (mode === 'tour') {
      $('#modalTitle').textContent = item ? 'Sửa Tour' : 'Thêm Tour';
      $('#pfTitle').value = item?.title || '';
      $('#pfMeta1').style.display = 'none';
      $('#pfTourLocation').style.display = 'block';
      const destOptions = (db.destinations || []).map(d => `<option value="${d.name}">${d.name}</option>`).join('');
      $('#pfTourLocation').innerHTML = destOptions || '<option value="">(Chưa có điểm đến)</option>';
      if (item?.location) $('#pfTourLocation').value = item.location;
      $('#pfPriceBase').style.display = 'block'; $('#pfPriceBase').value = item ? formatPriceInput(item.price_base) : '';
      $('#pfSurchargeMotorbike').style.display = 'block'; $('#pfSurchargeMotorbike').value = item && item.surcharge_motorbike ? formatPriceInput(item.surcharge_motorbike) : '';
      $('#pfDiscountSelfDrive').style.display = 'block'; $('#pfDiscountSelfDrive').value = item && item.discount_selfdrive ? formatPriceInput(item.discount_selfdrive) : '';
      $('#pfSurcharge7SeatWrap').style.display = 'block'; 
      if (item && item.surcharge_7seat) {
        let s7 = item.surcharge_7seat;
        if (typeof s7 === 'number') s7 = [s7, s7, s7, s7];
        $('#pfSurcharge7Seat_1').value = formatPriceInput(s7[0] || '');
        $('#pfSurcharge7Seat_2').value = formatPriceInput(s7[1] || '');
        $('#pfSurcharge7Seat_3').value = formatPriceInput(s7[2] || '');
        $('#pfSurcharge7Seat_4').value = formatPriceInput(s7[3] || '');
      } else {
        $('#pfSurcharge7Seat_1').value = ''; $('#pfSurcharge7Seat_2').value = ''; $('#pfSurcharge7Seat_3').value = ''; $('#pfSurcharge7Seat_4').value = '';
      }
      $('#pfSurchargeJeepWrap').style.display = 'block';
      if (item && item.surcharge_jeep) {
        let sj = item.surcharge_jeep;
        if (typeof sj === 'number') sj = [sj, sj, sj, sj];
        $('#pfSurchargeJeep_1').value = formatPriceInput(sj[0] || '');
        $('#pfSurchargeJeep_2').value = formatPriceInput(sj[1] || '');
        $('#pfSurchargeJeep_3').value = formatPriceInput(sj[2] || '');
        $('#pfSurchargeJeep_4').value = formatPriceInput(sj[3] || '');
      } else {
        $('#pfSurchargeJeep_1').value = ''; $('#pfSurchargeJeep_2').value = ''; $('#pfSurchargeJeep_3').value = ''; $('#pfSurchargeJeep_4').value = '';
      }
      $('#pfMeta2').style.display = 'block'; $('#pfMeta2').value = item?.duration || '';
      $('#pfImage').value = item?.image || '';
      $('#itineraryBuilderWrap').style.display = 'flex';
      renderItineraryBuilder(item?.itinerary || []);
      $('#pfFeaturedWrap').style.display = 'flex';
      $('#pfFeatured').checked = item?.is_featured || false;
    } else if (mode === 'bike') {
      $('#modalTitle').textContent = item ? 'Sửa Xe' : 'Thêm Xe';
      $('#pfTitle').value = item?.name || '';
      $('#pfMeta1').style.display = 'block'; $('#pfMeta1').placeholder = 'Loại xe'; $('#pfMeta1').value = item?.type || '';
      $('#pfTourLocation').style.display = 'none';
      $('#pfPriceBase').style.display = 'block'; $('#pfPriceBase').value = item ? formatPriceInput(item.price_per_day) : '';
      $('#pfSurchargeMotorbike').style.display = 'none'; $('#pfDiscountSelfDrive').style.display = 'none'; $('#pfSurcharge7SeatWrap').style.display = 'none'; $('#pfSurchargeJeepWrap').style.display = 'none';
      $('#pfMeta2').style.display = 'block'; $('#pfMeta2').value = item?.status || '';
      $('#pfImage').value = item?.image || '';
      $('#itineraryBuilderWrap').style.display = 'none';
      $('#pfFeaturedWrap').style.display = 'none';
    } else if (mode === 'destination') {
      $('#modalTitle').textContent = item ? 'Sửa Điểm Đến' : 'Thêm Điểm Đến';
      $('#pfTitle').value = item?.name || '';
      $('#pfMeta1').style.display = 'block'; $('#pfMeta1').placeholder = 'Mô tả ngắn'; $('#pfMeta1').value = item?.description || '';
      $('#pfTourLocation').style.display = 'none';
      $('#pfPriceBase').style.display = 'none'; $('#pfPriceBase').value = '0';
      $('#pfSurchargeMotorbike').style.display = 'none'; $('#pfDiscountSelfDrive').style.display = 'none'; $('#pfSurcharge7SeatWrap').style.display = 'none'; $('#pfSurchargeJeepWrap').style.display = 'none';
      $('#pfMeta2').style.display = 'none'; $('#pfMeta2').value = 'none';
      $('#pfImage').value = item?.image || '';
      $('#itineraryBuilderWrap').style.display = 'none';
      $('#pfFeaturedWrap').style.display = 'none';
    }
  }
  const closeModal = () => $('#productModal').classList.remove('active');
  const openOrderDetail = (order) => {
    $('#orderDetailBody').innerHTML = `<div class="panel" style="margin-top:0"><p><strong>Loại:</strong> ${order.kind}</p><p><strong>Khách hàng:</strong> ${order.name || 'Khách lẻ'}</p><p><strong>Sản phẩm:</strong> ${order.productName}</p><p><strong>Ngày:</strong> ${order.when}</p><p><strong>Tổng tiền:</strong> ${money(order.total || 0)}</p><p><strong>Trạng thái:</strong> ${order.status || 'Chờ xác nhận'}</p></div>`;
    $('#orderDetailModal').classList.add('active');
  };

  function bindModalActions() {
    $('#addTourBtn').addEventListener('click', () => openModal('tour'));
    $('#addBikeBtn').addEventListener('click', () => openModal('bike'));
    $('#addDestinationBtn').addEventListener('click', () => openModal('destination'));
    $('#addItineraryDayBtn').addEventListener('click', () => addItineraryInput(''));
    $('#closeModal').addEventListener('click', closeModal);
    $('#productModal').addEventListener('click', (e) => { if (e.target.id === 'productModal') closeModal(); });
    $('#orderDetailModal').addEventListener('click', (e) => { if (e.target.id === 'orderDetailModal') $('#orderDetailModal').classList.remove('active'); });
    $('#closeOrderDetail').addEventListener('click', () => $('#orderDetailModal').classList.remove('active'));

    // Format Price Input
    $('#pfPriceBase').addEventListener('input', function() {
      this.value = formatPriceInput(this.value);
    });
    $('#pfSurchargeMotorbike')?.addEventListener('input', function() {
      this.value = formatPriceInput(this.value);
    });
    $('#pfDiscountSelfDrive')?.addEventListener('input', function() {
      this.value = formatPriceInput(this.value);
    });
    ['1', '2', '3', '4'].forEach(num => {
      $(`#pfSurcharge7Seat_${num}`)?.addEventListener('input', function() {
        this.value = formatPriceInput(this.value);
      });
      $(`#pfSurchargeJeep_${num}`)?.addEventListener('input', function() {
        this.value = formatPriceInput(this.value);
      });
    });

    // Handle Uploads
    $('#pfImageUpload')?.addEventListener('change', (e) => handleFileUpload(e.target, '#pfImage'));
    $('#phImageUpload')?.addEventListener('change', (e) => handleFileUpload(e.target, '#phUrl'));
    $('#setHeroPosterUpload')?.addEventListener('change', (e) => handleFileUpload(e.target, '#setHeroPoster'));

    // Gallery Modal Bindings
    $('#addPhotoBtn').addEventListener('click', () => { 
      $('#photoForm').reset(); 
      delete $('#photoForm').dataset.editId;
      $('#photoModal').querySelector('h2').textContent = 'Thêm Ảnh Mới';
      $('#photoModal').classList.add('active'); 
    });
    $('#closePhotoModal').addEventListener('click', () => $('#photoModal').classList.remove('active'));
    $('#photoModal').addEventListener('click', (e) => { if (e.target.id === 'photoModal') $('#photoModal').classList.remove('active'); });

    $('#photoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const url = $('#phUrl').value.trim();
      const caption = $('#phCaption').value.trim();
      if (!url || !caption) return toast('Vui lòng nhập đủ thông tin');

      const editId = $('#photoForm').dataset.editId;
      if (editId) {
        const p = db.customer_gallery.find(x => x.id === Number(editId));
        if (p) {
          p.url = url;
          p.caption = caption;
        }
        toast('Đã cập nhật ảnh thành công');
      } else {
        db.customer_gallery.unshift({ id: Date.now(), url, caption });
        toast('Đã lưu ảnh thành công');
      }

      persist();
      $('#photoModal').classList.remove('active');
      refresh();
    });

    // Review Modal Bindings
    $('#btnAddReviewModal')?.addEventListener('click', () => { $('#adminReviewForm').reset(); $('#adminReviewModal').classList.add('active'); });
    $('#closeAdminReviewModal')?.addEventListener('click', () => $('#adminReviewModal').classList.remove('active'));
    $('#adminReviewModal')?.addEventListener('click', (e) => { if (e.target.id === 'adminReviewModal') $('#adminReviewModal').classList.remove('active'); });

    $('#adminReviewForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#arName').value.trim();
      const rating = Number($('#arRating').value);
      const tourType = $('#arTour').value.trim();
      const dateStr = $('#arDate').value.trim();
      const title = $('#arTitle').value.trim();
      const content = $('#arContent').value.trim();
      
      const newReview = {
        id: 'rev-' + Date.now(),
        name, rating, tourType, date: dateStr, title, content,
        avatarLetter: name.charAt(0).toUpperCase(),
        status: 'approved'
      };
      
      if (!db.reviews) db.reviews = [];
      db.reviews.unshift(newReview);
      persist(); refresh();
      $('#adminReviewModal').classList.remove('active');
      toast('Đã thêm đánh giá thủ công');
    });

    $('#productForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const meta1Val = editState.type === 'tour' ? $('#pfTourLocation').value : $('#pfMeta1').value.trim();
      const itineraryValues = [...$$('#itineraryBuilder .itinerary-day-input')].map(el => el.value.trim()).filter(Boolean);
      const payload = { title: $('#pfTitle').value.trim(), meta1: meta1Val, price: Number($('#pfPriceBase').value.replace(/\./g, '')) || 0, surcharge_motorbike: Number($('#pfSurchargeMotorbike').value.replace(/\./g, '')) || 0, discount_selfdrive: Number($('#pfDiscountSelfDrive').value.replace(/\./g, '')) || 0, surcharge_7seat: [Number($('#pfSurcharge7Seat_1').value.replace(/\./g, '')) || 0, Number($('#pfSurcharge7Seat_2').value.replace(/\./g, '')) || 0, Number($('#pfSurcharge7Seat_3').value.replace(/\./g, '')) || 0, Number($('#pfSurcharge7Seat_4').value.replace(/\./g, '')) || 0], surcharge_jeep: [Number($('#pfSurchargeJeep_1').value.replace(/\./g, '')) || 0, Number($('#pfSurchargeJeep_2').value.replace(/\./g, '')) || 0, Number($('#pfSurchargeJeep_3').value.replace(/\./g, '')) || 0, Number($('#pfSurchargeJeep_4').value.replace(/\./g, '')) || 0], meta2: $('#pfMeta2').value.trim(), image: $('#pfImage').value.trim(), itinerary: itineraryValues };
      
      if (editState.type === 'tour') {
        if (!payload.title || !payload.meta1 || !payload.price || !payload.meta2 || !payload.image) return toast('Vui lòng nhập đủ thông tin');
        const isFeatured = $('#pfFeatured').checked;
        const tourItinerary = payload.itinerary.length ? payload.itinerary : ['Ngày 1: Lịch trình đang cập nhật'];
        if (editState.id) { const found = db.tours.find(x => x.id === editState.id); if (found) { found.title = payload.title; found.location = payload.meta1; found.price_base = payload.price; found.surcharge_motorbike = payload.surcharge_motorbike; found.discount_selfdrive = payload.discount_selfdrive; found.surcharge_7seat = payload.surcharge_7seat; found.surcharge_jeep = payload.surcharge_jeep; found.duration = payload.meta2; found.image = payload.image; found.is_featured = isFeatured; found.itinerary = tourItinerary; if (!found.gallery || !found.gallery.includes(payload.image)) { found.gallery = [payload.image]; } } }
        else { db.tours.unshift({ id: `tour-${Date.now()}`, title: payload.title, location: payload.meta1, price_base: payload.price, surcharge_motorbike: payload.surcharge_motorbike, discount_selfdrive: payload.discount_selfdrive, surcharge_7seat: payload.surcharge_7seat, surcharge_jeep: payload.surcharge_jeep, duration: payload.meta2, image: payload.image, is_featured: isFeatured, style: 'Self-ride', itinerary: tourItinerary, gallery: [payload.image] }); }
      } else if (editState.type === 'bike') {
        if (!payload.title || !payload.meta1 || !payload.price || !payload.meta2 || !payload.image) return toast('Vui lòng nhập đủ thông tin');
        if (editState.id) { const found = db.bikes.find(x => x.id === editState.id); if (found) { found.name = payload.title; found.type = payload.meta1; found.price_per_day = payload.price; found.status = payload.meta2; found.image = payload.image; } }
        else { db.bikes.unshift({ id: `bike-${Date.now()}`, name: payload.title, type: payload.meta1, price_per_day: payload.price, status: payload.meta2, image: payload.image }); }
      } else if (editState.type === 'destination') {
        if (!payload.title || !payload.meta1 || !payload.image) return toast('Vui lòng nhập đủ thông tin');
        if (editState.id) { const found = db.destinations.find(x => x.id === editState.id); if (found) { found.name = payload.title; found.description = payload.meta1; found.image = payload.image; } }
        else { db.destinations.unshift({ id: `dest-${Date.now()}`, name: payload.title, description: payload.meta1, image: payload.image }); }
      }
      persist(); closeModal(); refresh(); toast('Đã lưu dữ liệu thành công');
    });
  }

  function confirmAndDelete(type, id) { if (!confirm(`Bạn có chắc muốn xóa mục này không?`)) return; if (type === 'tour') db.tours = db.tours.filter(x => x.id !== id); if (type === 'bike') db.bikes = db.bikes.filter(x => x.id !== id); if (type === 'destination') db.destinations = db.destinations.filter(x => x.id !== id); persist(); refresh(); toast('Đã xóa thành công'); }
  function handleProductAction(e) { const btn = e.target.closest('button[data-action]'); if (!btn) return; const row = e.target.closest('tr'); const id = row?.dataset.id; const action = btn.dataset.action; if (action === 'edit-tour') openModal('tour', db.tours.find(x => x.id === id)); if (action === 'edit-bike') openModal('bike', db.bikes.find(x => x.id === id)); if (action === 'edit-destination') openModal('destination', db.destinations.find(x => x.id === id)); if (action === 'delete-tour') confirmAndDelete('tour', id); if (action === 'delete-bike') confirmAndDelete('bike', id); if (action === 'delete-destination') confirmAndDelete('destination', id); }

  function renderProducts() {
    const q = ($('#productSearch').value || '').toLowerCase().trim();
    const match = (fields) => !q || fields.join(' ').toLowerCase().includes(q);
    const tourFilter = productScope === 'all' || productScope === 'tour';
    const bikeFilter = productScope === 'all' || productScope === 'bike';
    const destFilter = productScope === 'all' || productScope === 'destination';
    $('#tourTableBody').innerHTML = tourFilter ? db.tours.filter(t => match([t.title, t.location])).map(t => `<tr data-id="${t.id}"><td>${t.title}</td><td>${t.location}</td><td>${money(t.price_base)}</td><td>${t.duration}</td><td><button class="action-btn" data-action="edit-tour">Sửa</button><button class="action-btn" data-action="delete-tour">Xóa</button></td></tr>`).join('') : '';
    $('#bikeTableBody').innerHTML = bikeFilter ? db.bikes.filter(b => match([b.name, b.type, b.status])).map(b => `<tr data-id="${b.id}"><td>${b.name}</td><td>${b.type}</td><td>${money(b.price_per_day)}</td><td>${b.status}</td><td><button class="action-btn" data-action="edit-bike">Sửa</button><button class="action-btn" data-action="delete-bike">Xóa</button></td></tr>`).join('') : '';
    $('#destinationTableBody').innerHTML = destFilter ? (db.destinations || []).filter(d => match([d.name, d.description])).map(d => `<tr data-id="${d.id}"><td>${d.name}</td><td>${d.description}</td><td><img src="${d.image}" style="width:50px;border-radius:4px" /></td><td><button class="action-btn" data-action="edit-destination">Sửa</button><button class="action-btn" data-action="delete-destination">Xóa</button></td></tr>`).join('') : '';
    $('#tourTableBody').onclick = handleProductAction; $('#bikeTableBody').onclick = handleProductAction; $('#destinationTableBody').onclick = handleProductAction;
  }

  function renderOrders() {
    const q = ($('#orderSearch').value || '').toLowerCase().trim();
    const allOrders = ordersAll().map(o => ({ ...o, when: o.kind === 'Tour' ? (o.startDate || '-') : `${o.from || '-'} → ${o.to || '-'}` })).filter(o => (orderScope === 'all' || o.status === orderScope) && (!q || [o.name, o.productName, o.kind, o.status, o.when].join(' ').toLowerCase().includes(q)));
    $('#orderTableBody').innerHTML = allOrders.length ? allOrders.map(o => { const cls = statusClasses[o.status] || 'status-gray'; const nextAction = o.status === 'Chờ xác nhận' ? `<button class="action-btn" style="background:#10b981;color:#fff;border-color:#10b981" data-next="1" data-id="${o.id}" data-kind="${o.kind}">Duyệt</button>` : ''; return `<tr><td>${o.kind}</td><td>${o.name || 'Khách lẻ'}</td><td>${o.productName}</td><td>${o.when}</td><td>${money(o.total || 0)}</td><td><span class="badge-status ${cls}" data-id="${o.id}" data-kind="${o.kind}">${o.status || 'Chờ xác nhận'}</span></td><td style="display:flex;gap:8px;"><button class="action-btn" data-detail="1" data-id="${o.id}" data-kind="${o.kind}">Xem</button>${nextAction}<button class="action-btn" style="color:#ef4444;border-color:#ef4444" data-delete="1" data-id="${o.id}" data-kind="${o.kind}">Xóa</button></td></tr>`; }).join('') : '<tr><td colspan="7">Chưa có đơn hàng nào.</td></tr>';
    
    $$('.badge-status, button[data-next="1"]').forEach(el => el.addEventListener('click', (e) => { 
      const isBtn = e.target.tagName === 'BUTTON'; const cycle = ['Chờ xác nhận', 'Đã đặt cọc', 'Đang đi tour', 'Đã hoàn thành']; const kind = e.target.dataset.kind; const id = Number(e.target.dataset.id); const list = kind === 'Tour' ? db.bookings_tour : db.bookings_bike; const found = list.find(x => x.id === id); if (!found) return; 
      if(isBtn){ found.status = 'Đã đặt cọc'; } else { const idx = cycle.indexOf(found.status || 'Chờ xác nhận'); found.status = cycle[(idx + 1) % cycle.length]; } 
      
      if (found.status === 'Đã hoàn thành') {
        if (confirm('Đơn hàng đã hoàn thành! Bạn có muốn TỰ ĐỘNG XÓA đơn hàng này khỏi hệ thống luôn không? (Lưu ý: Xóa sẽ làm giảm con số ở Tổng Doanh Thu)')) {
          if (kind === 'Tour') db.bookings_tour = db.bookings_tour.filter(x => x.id !== id); else db.bookings_bike = db.bookings_bike.filter(x => x.id !== id);
          persist(); refresh(); toast('Đã tự động xóa đơn hàng hoàn thành'); return;
        }
      }
      persist(); refresh(); toast(isBtn ? 'Đã duyệt đơn hàng' : 'Đã đổi trạng thái đơn hàng'); 
    }));
    
    $$('button[data-detail="1"]').forEach(btn => btn.addEventListener('click', () => { const kind = btn.dataset.kind; const id = Number(btn.dataset.id); const order = ordersAll().find(o => o.id === id && o.kind === kind); if (order) openOrderDetail(order); }));
    
    $$('button[data-delete="1"]').forEach(btn => btn.addEventListener('click', () => {
      if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này? Xóa xong sẽ mất luôn doanh thu ghi nhận của đơn này!')) return;
      const kind = btn.dataset.kind; const id = Number(btn.dataset.id);
      if (kind === 'Tour') db.bookings_tour = db.bookings_tour.filter(x => x.id !== id); else db.bookings_bike = db.bookings_bike.filter(x => x.id !== id);
      persist(); refresh(); toast('Đã xóa đơn hàng');
    }));
  }

  function renderGallery() {
    if (!db.customer_gallery) db.customer_gallery = [];
    $('#galleryTableBody').innerHTML = db.customer_gallery.map(p => `<tr><td><img src="${p.url}" style="width:50px"></td><td>${p.caption}</td><td><button class="action-btn" onclick="editPhoto(${p.id})" style="background:#e0f2fe;color:#0284c7;margin-right:8px;">Sửa</button><button class="action-btn" onclick="delPhoto(${p.id})">Xóa</button></td></tr>`).join('');
  }
  window.delPhoto = (id) => { if(!confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return; db.customer_gallery = db.customer_gallery.filter(x => x.id !== id); persist(); refresh(); };
  window.editPhoto = (id) => {
    const p = db.customer_gallery.find(x => x.id === id);
    if (!p) return;
    $('#photoForm').dataset.editId = id;
    $('#phUrl').value = p.url;
    $('#phCaption').value = p.caption;
    $('#photoModal').querySelector('h2').textContent = 'Sửa Ảnh';
    $('#photoModal').classList.add('active');
  };

  let reviewScope = 'all';

  function renderReviews() {
    if (!db.reviews) db.reviews = [];
    const term = ($('#reviewSearch')?.value || '').toLowerCase();
    
    let list = db.reviews.filter(r => {
      if (reviewScope !== 'all' && r.status !== reviewScope) return false;
      return r.name.toLowerCase().includes(term) || r.title.toLowerCase().includes(term) || r.content.toLowerCase().includes(term);
    });

    const tbody = $('#reviewTableBody');
    if (tbody) {
      tbody.innerHTML = list.map(r => {
        let stLabel = 'Chờ duyệt', stClass = 'status-yellow';
        if (r.status === 'approved') { stLabel = 'Đã duyệt'; stClass = 'status-green'; }
        else if (r.status === 'hidden') { stLabel = 'Đã ẩn'; stClass = 'status-gray'; }

        return `<tr>
          <td><strong>${r.name}</strong><br><small>${r.date}</small></td>
          <td>${r.tourType}</td>
          <td>${r.rating} Sao</td>
          <td><div style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.title} - ${r.content}"><strong>${r.title}</strong>: ${r.content}</div></td>
          <td><span class="status-badge ${stClass}">${stLabel}</span></td>
          <td>
            <div style="display:flex;gap:6px;">
              ${r.status === 'approved' 
                ? `<button class="action-btn" style="background:#f1f5f9;color:#64748b;" onclick="updateReviewStatus('${r.id}', 'hidden')">Ẩn</button>` 
                : `<button class="action-btn" style="background:#dcfce3;color:#166534;" onclick="updateReviewStatus('${r.id}', 'approved')">Duyệt</button>`}
              <button class="action-btn" onclick="deleteReview('${r.id}')">Xóa</button>
            </div>
          </td>
        </tr>`;
      }).join('');
    }
  }

  window.updateReviewStatus = (id, status) => {
    const rev = db.reviews.find(r => r.id === id);
    if (rev) { rev.status = status; persist(); refresh(); toast('Đã cập nhật trạng thái đánh giá'); }
  };
  
  window.deleteReview = (id) => {
    if (confirm('Bạn có chắc chắn muốn xoá đánh giá này?')) {
      db.reviews = db.reviews.filter(r => r.id !== id); persist(); refresh(); toast('Đã xoá đánh giá');
    }
  };

  function renderSettings() {
    if (!db.settings) {
      db.settings = { 
        heroVideoUrl: '',
        heroPosterUrl: '' 
      };
    }
    $('#setHeroPoster').value = db.settings.heroPosterUrl || '';
  }

  function bindFilters() {
    $('#productSearch').addEventListener('input', renderProducts);
    $('#orderSearch').addEventListener('input', renderOrders);
    $('#reviewSearch')?.addEventListener('input', renderReviews);
    $$('.filter-chip[data-filter]').forEach(chip => chip.addEventListener('click', () => { $$('.filter-chip[data-filter]').forEach(c => c.classList.remove('active')); chip.classList.add('active'); productScope = chip.dataset.filter; renderProducts(); }));
    $$('.filter-chip[data-order-filter]').forEach(chip => chip.addEventListener('click', () => { $$('.filter-chip[data-order-filter]').forEach(c => c.classList.remove('active')); chip.classList.add('active'); orderScope = chip.dataset.orderFilter; renderOrders(); }));
    $$('.filter-chip[data-review-filter]').forEach(chip => chip.addEventListener('click', () => { $$('.filter-chip[data-review-filter]').forEach(c => c.classList.remove('active')); chip.classList.add('active'); reviewScope = chip.dataset.reviewFilter; renderReviews(); }));
  }

  function bindDataTools() {
    $('#exportDataBtn').addEventListener('click', () => window.VibeEast.downloadJSON('vibeeast-backup.json', window.VibeEast.loadDB()));
    $('#importDataInput').addEventListener('change', async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      try { const text = await file.text(); const parsed = JSON.parse(text); localStorage.setItem(window.VibeEast.STORAGE_KEY, JSON.stringify(parsed)); location.reload(); }
      catch { toast('File JSON không hợp lệ'); }
      e.target.value = '';
    });

    $('#settingsVideoForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!db.settings) db.settings = {};
      db.settings.heroPosterUrl = $('#setHeroPoster').value.trim();
      persist();
      toast('Đã lưu cấu hình ảnh trang chủ');
    });
  }

  $('#quickExit').addEventListener('click', () => location.href = 'index.html');
  
  const checkAuth = () => {
    // Auth handled by Firebase observer
  };

  $('#loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#loginForm button[type="submit"]');
    const oldText = btn.textContent;
    btn.textContent = 'Đang kiểm tra...'; btn.disabled = true;

    const email = $('#loginUser').value.trim();
    const pass = $('#loginPass').value.trim();

    try {
      await window.FirebaseAPI.auth.signInWithEmailAndPassword(email, pass);
      toast('Đăng nhập thành công!');
    } catch (err) {
      alert('Email hoặc mật khẩu không đúng! ' + err.message);
      btn.textContent = oldText; btn.disabled = false;
    }
  });

  window.FirebaseAPI.auth.onAuthStateChanged((user) => {
    const footer = document.querySelector('.site-footer');
    if (user) {
      $('#loginScreen').style.display = 'none';
      $('#adminApp').style.display = 'block';
      if (footer) footer.style.display = 'block';
      initTabs(); bindModalActions(); bindFilters(); bindDataTools(); refresh();
      if (!$('#logoutBtn')) {
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'admin-menu-item';
        logoutBtn.innerHTML = '<i>🚪</i><span>Đăng xuất</span>';
        logoutBtn.style.color = '#ff5252';
        logoutBtn.onclick = (e) => { e.preventDefault(); window.FirebaseAPI.auth.signOut(); location.reload(); };
        qs('.admin-sidebar nav').appendChild(logoutBtn);
      }
    } else {
      $('#loginScreen').style.display = 'flex';
      $('#adminApp').style.display = 'none';
      if (footer) footer.style.display = 'none';
    }
  });
})();