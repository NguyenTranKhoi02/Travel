(async () => {
  const db = await window.VibeEast.loadDBAsync();
  const money = (value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ';
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];
  const getBookedCount = (tid) => db.bookings_tour.filter(b => b.tourId === tid && b.status !== 'Chờ xác nhận').reduce((sum, b) => sum + (b.people || 0), 0);

  function sendEmailJSNotification(orderType, data) {
    return new Promise((resolve) => {
      // BƯỚC 1: BẠN HÃY TẠO TÀI KHOẢN TẠI EMAILJS.COM VÀ ĐIỀN 3 MÃ CỦA BẠN VÀO ĐÂY:
      const SERVICE_ID = 'YOUR_SERVICE_ID'; // Thay bằng Service ID của bạn
      const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Thay bằng Template ID của bạn
      const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Thay bằng Public Key của bạn

      if (SERVICE_ID === 'YOUR_SERVICE_ID') {
        console.warn('EmailJS chưa được cấu hình. Đang bỏ qua gửi email...');
        return resolve();
      }

      if (typeof emailjs === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = () => { emailjs.init({ publicKey: PUBLIC_KEY }); triggerSend(); };
        script.onerror = resolve;
        document.head.appendChild(script);
      } else {
        triggerSend();
      }

      function triggerSend() {
        let message = '';
        if (orderType === 'tour') {
          message = `Tên khách: ${data.name}\nSĐT: ${data.phone}\nTour: ${data.tourName}\nNgày đi: ${data.startDate}\nSố người: ${data.people}\nLoại xe: ${data.mode}\nTổng tiền: ${new Intl.NumberFormat('vi-VN').format(data.total)} đ`;
        } else {
          message = `Tên khách: ${data.name}\nSĐT: ${data.phone}\nXe: ${data.bikeName}\nTừ: ${data.from} Đến: ${data.to}\nNơi nhận: ${data.pickup}\nTổng tiền: ${new Intl.NumberFormat('vi-VN').format(data.total)} đ`;
        }

        emailjs.send(SERVICE_ID, TEMPLATE_ID, { message: message })
          .then(() => resolve())
          .catch((err) => { console.error('Lỗi gửi email:', err); resolve(); });
      }
    });
  }

  function setupMobileNav() {
    const toggle = qs('#navToggle');
    const nav = qs('#mainNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    qsa('#mainNav a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  function renderHome() {
    const heroImageEl = qs('#heroImageEl');
    if (heroImageEl && db.settings) {
      if (db.settings.heroPosterUrl) {
        heroImageEl.src = db.settings.heroPosterUrl;
      }
    }

    const homeDest = qs('#homeDestination');
    if (homeDest) {
      homeDest.innerHTML = `<option value="all">Chọn điểm đến</option>` + (db.destinations || []).map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    }

    const provinceGrid = qs('#provinceGrid');
    if (provinceGrid) {
      const tourCounts = {};
      db.tours.forEach(t => {
        tourCounts[t.location] = (tourCounts[t.location] || 0) + 1;
      });

      provinceGrid.innerHTML = (db.destinations || []).map(dest => {
        const count = tourCounts[dest.name] || 0;
        return `
      <a class="swiper-slide province-card" href="tours.html?location=${encodeURIComponent(dest.name)}">
        <img src="${dest.image}" alt="${dest.name}" />
        <div class="card-overlay"><span class="badge">${count} tour đang có</span><h3>${dest.name}</h3><p>${dest.description}</p></div>
      </a>`;
      }).join('');

      if (window.Swiper) {
        new window.Swiper('.province-swiper', {
          slidesPerView: 'auto',
          spaceBetween: 24,
          grabCursor: true,
          freeMode: true,
          pagination: {
            el: '.province-swiper .swiper-pagination',
            clickable: true,
            dynamicBullets: true,
          },
          navigation: {
            nextEl: '.province-swiper .swiper-button-next',
            prevEl: '.province-swiper .swiper-button-prev',
          },
        });
      }
    }

    const featuredTours = qs('#featuredTours');
    if (featuredTours) {
      let fList = db.tours.filter(t => t.is_featured);
      if (fList.length === 0) fList = db.tours.slice(0, 6);
      featuredTours.innerHTML = fList.map(t => {
        const booked = getBookedCount(t.id);
        return `
      <article class="yen-tour-card">
        <div class="yen-tour-card-img-wrap">
          <img class="yen-tour-card-img" src="${t.image}" alt="${t.title}" loading="lazy" />
          <span class="yen-tour-card-badge">${t.style || 'Tour Hot'}</span>
        </div>
        <div class="yen-tour-card-body">
          <h3 class="yen-tour-card-title">${t.title}</h3>
          <div class="yen-tour-card-meta">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${t.location}</span>
            <span>•</span>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${t.duration}</span>
            ${booked > 0 ? `<span>• <strong style="color:var(--orange)">🔥 ${booked} người đã đi</strong></span>` : ''}
          </div>
          <div class="yen-tour-card-footer">
            <span class="yen-tour-card-price">${money(t.price_base)}</span>
            <a class="yen-tour-card-btn" href="tour-detail.html?id=${t.id}">ĐẶT NGAY</a>
          </div>
        </div>
      </article>`;
      }).join('');
    }

    const bikePreview = qs('#bikePreview');
    if (bikePreview) {
      bikePreview.innerHTML = db.bikes.slice(0, 6).map(b => {
        const isAvailable = b.status === 'Sẵn sàng';
        const statusClass = isAvailable ? 'available' : 'rented';
        const cc = b.name.match(/(\d+)\s*cc/i);
        const engineCC = cc ? cc[1] + 'CC' : '';
        return `
      <article class="yen-bike-card" onclick="location.href='rental.html'" style="cursor:pointer">
        <div class="yen-bike-card-img-wrap">
          <img class="yen-bike-card-img" src="${b.image}" alt="${b.name}" loading="lazy" />
        </div>
        <div class="yen-bike-card-body">
          <h3 class="yen-bike-card-title">${b.name}</h3>
          <span class="yen-bike-status ${statusClass}">${b.status}</span>
          <div class="yen-bike-card-specs">
            ${engineCC ? `<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> ${engineCC} Engine</span>` : ''}
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg> ${b.type}</span>
          </div>
          <div class="yen-bike-card-price">${money(b.price_per_day)} <small>/ ngày</small></div>
        </div>
      </article>`;
      }).join('');
    }

    const searchBtn = qs('#searchVibeBtn');
    if (searchBtn) searchBtn.addEventListener('click', () => {
      const loc = qs('#homeDestination').value;
      const service = qs('#homeService').value;
      const params = new URLSearchParams();
      if (loc !== 'all') params.set('location', loc);
      if (service !== 'all') params.set('service', service);
      location.href = service === 'bike' ? `rental.html?${params}` : `tours.html?${params}`;
    });
  }

  function renderToursPage() {
    const grid = qs('#tourGrid');
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    const preLocation = params.get('location');
    const locationFilters = qsa('input[name="location"]');
    if (preLocation) locationFilters.forEach(i => { if (i.value === preLocation) i.checked = true; });

    const render = () => {
      const locations = qsa('input[name="location"]:checked').map(i => i.value);
      const durations = qsa('input[name="duration"]:checked').map(i => i.value);
      const filtered = db.tours.filter(t =>
        (!locations.length || locations.some(l => (t.location || '').toLowerCase().includes(l.toLowerCase()))) &&
        (!durations.length || durations.some(d => {
          const dNum = d.match(/\d+/)?.[0];
          const tNum = (t.duration || '').match(/\d+/)?.[0];
          return dNum && tNum && dNum === tNum;
        }))
      );
      grid.innerHTML = filtered.map(t => {
        const booked = getBookedCount(t.id);
        return `
      <article class="yen-tour-card">
        <div class="yen-tour-card-img-wrap">
          <img class="yen-tour-card-img" src="${t.image}" alt="${t.title}" loading="lazy" />
          <span class="yen-tour-card-price-badge">${money(t.price_base)}</span>
        </div>
        <div class="yen-tour-card-body">
          <h3 class="yen-tour-card-title">${t.title}</h3>
          <div class="yen-tour-card-meta">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${t.duration}</span>
            <span>•</span>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${t.location}</span>
            ${booked > 0 ? `<span>• <strong style="color:var(--orange)">🔥 ${booked}</strong></span>` : ''}
          </div>
          <a class="yen-tour-card-book" href="tour-detail.html?id=${t.id}">ĐẶT NGAY</a>
        </div>
      </article>`;
      }).join('') || '<p class="yen-no-result">Không có tour phù hợp bộ lọc.</p>';
    };

    [...locationFilters, ...qsa('input[name="duration"]')].forEach(el => el.addEventListener('input', render));
    render();

    // Clear filters
    const clearBtn = qs('#clearFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        qsa('input[name="location"], input[name="duration"]').forEach(i => i.checked = false);
        render();
      });
    }

    // Mobile filter toggle
    const filterToggle = qs('#filterToggle');
    const sidebar = qs('#toursSidebar');
    const sidebarClose = qs('#sidebarClose');
    if (filterToggle && sidebar) {
      filterToggle.addEventListener('click', () => sidebar.classList.add('open'));
      if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
      sidebar.addEventListener('click', (e) => { if (e.target === sidebar) sidebar.classList.remove('open'); });
    }
  }

  function renderTourDetail() {
    const id = new URLSearchParams(location.search).get('id') || db.tours[0].id;
    let tour = db.tours.find(t => t.id === id) || db.tours[0];

    const form = qs('#tourBookingForm');
    if (form) {
      const tourSelect = qs('#tourSelect');
      if (tourSelect) {
        tourSelect.innerHTML = db.tours.map(t => `<option value="${t.id}" ${t.id === tour.id ? 'selected' : ''}>${t.title}</option>`).join('');
        tourSelect.addEventListener('change', (e) => {
          tour = db.tours.find(t => t.id === e.target.value) || db.tours[0];
          updateTotalPrice();
        });
      }

      const updateTotalPrice = () => {
        const people = Number(qs('#peopleCount').value || 1);

        let days = 3;
        if (tour.duration) {
          const dMatch = tour.duration.match(/(\d+)\s*(ngày|day)/i);
          if (dMatch) days = parseInt(dMatch[1]);
        } else if (tour.itinerary) {
          days = tour.itinerary.length;
        }

        const vehicle = qs('input[name="vehicle"]:checked');
        const exp = qs('input[name="experience"]:checked');
        const isSelfDrive = exp && exp.value === 'Tự lái';

        const baseTourCost = tour.price_base || 0;
        qs('#sumTour').textContent = money(baseTourCost * people);
        const isEn = (localStorage.getItem('lang') || 'vi') === 'en';
        const tourLabel = qs('#sumTour').previousElementSibling;
        if (tourLabel) tourLabel.textContent = isEn ? `Tour Price (${people} pax):` : `Giá Tour (${people} khách):`;

        let vehicleCost = 0;
        let discount = 0;
        let discountLabel = '';

        if (vehicle && vehicle.value === 'Xe máy') {
          vehicleCost = (tour.surcharge_motorbike || 0) * people;
        } else if (vehicle && vehicle.value === 'Ô tô 7 chỗ') {
          vehicleCost = tour.surcharge_7seat || 0;
        } else if (vehicle && vehicle.value === 'Xe Jeep') {
          vehicleCost = tour.surcharge_jeep || 0;
        }

        if (isSelfDrive && tour.discount_selfdrive) {
          discount = tour.discount_selfdrive * people;
          discountLabel = isEn ? 'Discount (Self-drive):' : 'Giảm giá (Tự lái):';
        }

        let targetTourCost = (baseTourCost * people) + vehicleCost - discount;

        const discountRow = qs('#discountRow');
        if (discount > 0) {
          if (discountRow) {
            discountRow.style.display = 'flex';
            qs('#discountRow .hgl-summary-label').textContent = discountLabel;
          }
          qs('#sumDiscount').textContent = '-' + money(discount);
        } else {
          if (discountRow) discountRow.style.display = 'none';
        }

        const sumVehicleRow = qs('#sumVehicle').closest('.hgl-summary-row');
        if (sumVehicleRow) {
          sumVehicleRow.style.display = 'flex';
          qs('#sumVehicle').textContent = vehicleCost === 0 ? '0 đ' : money(vehicleCost);
          const vehicleLabel = qs('#sumVehicle').previousElementSibling;
          let vName = vehicle ? vehicle.value : '';
          if (isEn) {
            if (vName === 'Xe máy') vName = 'Motorbike';
            else if (vName === 'Xe Jeep') vName = 'Jeep';
            else if (vName === 'Ô tô 7 chỗ') vName = '7-Seat Car';
          }
          if (vehicleLabel) vehicleLabel.textContent = isEn ? `Vehicle Price (${vName}):` : `Giá xe (${vName}):`;
        }

        const accOpt = qs('#accommodation').options[qs('#accommodation').selectedIndex];
        const accCost = Number(accOpt.dataset.price || 0) * people;
        qs('#sumAccommodation').textContent = money(accCost);

        const pickupOpt = qs('#pickupBus').options[qs('#pickupBus').selectedIndex];
        const pickupCost = Number(pickupOpt.dataset.price || 0) * people;
        qs('#sumPickup').textContent = money(pickupCost);

        const returnOpt = qs('#returnBus').options[qs('#returnBus').selectedIndex];
        const returnCost = Number(returnOpt.dataset.price || 0) * people;
        qs('#sumReturn').textContent = money(returnCost);

        const total = targetTourCost + accCost + pickupCost + returnCost;
        qs('#tourTotal').textContent = money(total);

        return { total, tourCost: baseTourCost, vehicleCost, discount, accCost, pickupCost, returnCost };
      };
      ['input', 'change'].forEach(evt => form.addEventListener(evt, updateTotalPrice));
      updateTotalPrice();

      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setTimeout(updateTotalPrice, 50));
      });



      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.textContent = 'Đang xử lý...'; btn.disabled = true;

        const prices = updateTotalPrice();
        const orderData = {
          id: Date.now(),
          tourId: tour.id,
          name: qs('#tourName').value,
          phone: qs('#tourPhone').value,
          startDate: qs('#startDate').value,
          people: Number(qs('#peopleCount').value),
          vehicle: qs('input[name="vehicle"]:checked').value,
          experience: qs('input[name="experience"]:checked').value,
          accommodation: qs('#accommodation').options[qs('#accommodation').selectedIndex].text,
          pickupBus: qs('#pickupBus').options[qs('#pickupBus').selectedIndex].text,
          returnBus: qs('#returnBus').options[qs('#returnBus').selectedIndex].text,
          specialRequest: qs('#specialRequest').value,
          discount: prices.discount || 0,
          total: prices.total,
          status: 'Chờ xác nhận'
        };

        db.bookings_tour.push(orderData);
        window.VibeEast.saveDB(db);

        const msg = `🚨 <b>CÓ KHÁCH ĐẶT TOUR MỚI!</b>
👤 Tên: ${orderData.name}
📞 SĐT: ${orderData.phone}
🗓 Ngày đi: ${orderData.startDate}
👥 Số lượng: ${orderData.people} người
🏷 Tour: ${tour.title}
🛵 Phương tiện: ${orderData.vehicle} ${orderData.experience !== 'N/A' ? '(' + orderData.experience + ')' : ''}
🏠 Chỗ ở: ${orderData.accommodation}
🚌 Bus đi: ${orderData.pickupBus}
🚌 Bus về: ${orderData.returnBus}
📝 Yêu cầu: ${orderData.specialRequest || 'Không có'}
🎁 Giảm giá: ${orderData.discount > 0 ? '-' + money(orderData.discount) : '0 đ'}
💰 Tổng: ${money(orderData.total)}`;

        await window.VibeEast.sendTelegramNotification(msg);

        location.href = 'index.html?booking=success';
      });
    }

    const detailHeroBg = qs('#detailHeroBg');
    const detailHeroTitle = qs('#detailHeroTitle');
    if (detailHeroBg) detailHeroBg.src = tour.image;
    if (detailHeroTitle) detailHeroTitle.textContent = tour.title;

    const mount = qs('#tourDetailMount');
    if (!mount) return;
    const booked = getBookedCount(tour.id);
    mount.innerHTML = `
    <div class="panel detail-pan">
      <div class="slider" id="tourSlider">${(() => { let imgs = tour.gallery && tour.gallery.length ? [...tour.gallery] : []; if (!imgs.includes(tour.image)) imgs.unshift(tour.image); if (imgs.length === 0) imgs = [tour.image]; return imgs.map((img, idx) => `<img src="${img}" class="${idx === 0 ? 'active' : ''}" alt="${tour.title}">`).join(''); })()}</div>
      <div class="slider-controls"><span>${tour.location} • ${tour.duration} ${booked > 0 ? `• <strong style="color:var(--orange)">🔥 ${booked} người đã tham gia</strong>` : ''}</span><strong>${money(tour.price_base)}</strong></div>
      <h2>${tour.title}</h2><p class="muted">${tour.style || 'Tour Hot'} • Lộ trình đèo núi dành cho người mê trải nghiệm.</p>
      <div style="margin-top: 24px;"><h3>Lịch trình tương tác</h3><div id="itineraryList" class="yen-itinerary-list"></div></div>
    </div>`;

    const sliderImgs = qsa('#tourSlider img', mount);
    if (sliderImgs.length > 1) {
      let curIdx = 0;
      setInterval(() => {
        sliderImgs[curIdx].classList.remove('active');
        curIdx = (curIdx + 1) % sliderImgs.length;
        sliderImgs[curIdx].classList.add('active');
      }, 3500);
    }

    const itineraryList = qs('#itineraryList');
    itineraryList.innerHTML = tour.itinerary.map((item, idx) => `
      <div class="yen-itinerary-item ${idx === 0 ? 'active' : ''}">
        <button class="yen-itinerary-toggle">
          <div class="yen-itinerary-toggle-left">
            <div class="yen-itinerary-circle">
              <span>${idx + 1}</span>
            </div>
            <div class="yen-itinerary-title-wrap">
              <h3 class="yen-itinerary-title">Ngày ${idx + 1}</h3>
              <p class="yen-itinerary-subtitle">Day ${idx + 1}</p>
            </div>
          </div>
          <svg class="yen-itinerary-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="yen-itinerary-content">
          <div class="yen-itinerary-content-inner">
            <p>${item.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      </div>`).join('');

    qsa('.yen-itinerary-toggle', itineraryList).forEach((btn) => btn.addEventListener('click', () => {
      const parent = btn.closest('.yen-itinerary-item');
      const isActive = parent.classList.contains('active');
      qsa('.yen-itinerary-item', itineraryList).forEach(el => el.classList.remove('active'));
      if (!isActive) parent.classList.add('active');
    }));

  }

  function renderRentalPage() {
    const grid = qs('#bikeGrid');
    if (!grid) return;

    // Filters logic
    const params = new URLSearchParams(location.search);
    const typeFilters = qsa('input[name="bike_type"]');

    const render = () => {
      const types = qsa('input[name="bike_type"]:checked').map(i => i.value);
      const filtered = db.bikes.filter(b =>
        !types.length || types.some(t => (b.type || '').toLowerCase().includes(t.toLowerCase()))
      );

      grid.innerHTML = filtered.map(b => {
        const isAvailable = b.status === 'Sẵn sàng';
        const statusClass = isAvailable ? 'bike-status-available' : 'bike-status-unavailable';
        return `
      <article class="yen-tour-card bike-rental-card">
        <div class="yen-tour-card-img-wrap bike-rental-img-wrap">
          <img class="yen-tour-card-img" src="${b.image}" alt="${b.name}" loading="lazy" />
          <span class="yen-tour-card-price-badge">${money(b.price_per_day)}/ngày</span>
        </div>
        <div class="yen-tour-card-body">
          <h3 class="yen-tour-card-title">${b.name}</h3>
          <div class="yen-tour-card-meta">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> ${b.type}</span>
            <span>•</span>
            <span class="${statusClass}">${b.status}</span>
          </div>
          <button class="yen-tour-card-book book-bike-btn bike-book-btn" data-id="${b.id}">ĐẶT XE</button>
        </div>
      </article>`;
      }).join('') || '<p class="yen-no-result">Không có xe phù hợp bộ lọc.</p>';

      // Bind book buttons
      qsa('.book-bike-btn', grid).forEach(btn => btn.addEventListener('click', () => {
        const bikeId = btn.dataset.id;
        qs('#bikeSelect').value = bikeId;
        qs('#bikeBookingModal').classList.add('active');
        calc(); // recalculate total
      }));
    };

    typeFilters.forEach(el => el.addEventListener('input', render));
    render();

    // Clear filters
    const clearBtn = qs('#clearBikeFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        typeFilters.forEach(i => i.checked = false);
        render();
      });
    }

    // Mobile filter toggle
    const filterToggle = qs('#bikeFilterToggle');
    const sidebar = qs('#bikesSidebar');
    const sidebarClose = qs('#bikeSidebarClose');
    if (filterToggle && sidebar) {
      filterToggle.addEventListener('click', () => sidebar.classList.add('open'));
      if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
      sidebar.addEventListener('click', (e) => { if (e.target === sidebar) sidebar.classList.remove('open'); });
    }

    const form = qs('#bikeBookingForm');
    if (!form) return;
    const calc = () => { const from = new Date(qs('#rentFrom').value); const to = new Date(qs('#rentTo').value); const bike = db.bikes.find(b => b.id === qs('#bikeSelect').value) || db.bikes[0]; const days = Math.max(1, Math.ceil((to - from) / 86400000) || 1); const total = days * bike.price_per_day; qs('#bikeTotal').textContent = money(total); return { bike, days, total }; };
    qs('#bikeSelect').innerHTML = db.bikes.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    ['input', 'change'].forEach(evt => form.addEventListener(evt, calc));
    calc();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Đang xử lý...'; btn.disabled = true;

      const { bike, days, total } = calc();
      const orderData = { id: Date.now(), bikeId: bike.id, name: qs('#bikeName').value, phone: qs('#bikePhone').value, from: qs('#rentFrom').value, to: qs('#rentTo').value, pickup: qs('#pickupPlace').value, days, total, status: 'Chờ xác nhận' };
      db.bookings_bike.push(orderData);
      window.VibeEast.saveDB(db);

      const msg = `🛵 <b>CÓ KHÁCH THUÊ XE!</b>\n👤 Tên: ${orderData.name}\n📞 SĐT: ${orderData.phone}\n🗓 Nhận: ${orderData.from} - Trả: ${orderData.to}\n📍 Giao xe tại: ${orderData.pickup}\n💰 Tổng: ${money(orderData.total)}\n🏷 Xe: ${bike.name}`;
      await window.VibeEast.sendTelegramNotification(msg);

      location.href = 'index.html?booking=success';
    });
  }

  function initFaqAccordion() {
    const faqItems = qsa('.yen-faq-item');
    faqItems.forEach(item => {
      const btn = qs('.yen-faq-question', item);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(i => i.classList.remove('active'));
        // Toggle current
        if (!isActive) item.classList.add('active');
      });
    });
  }

  setupMobileNav();
  renderHome();
  renderToursPage();
  renderTourDetail();
  renderRentalPage();
  initFaqAccordion();

  if (location.search.includes('booking=success')) {
    const popup = document.createElement('div');
    popup.className = 'modal active';
    popup.style.zIndex = '9999';
    popup.innerHTML = `
    <div class="modal-box" style="max-width: 400px; text-align: center; padding: 40px 24px;">
      <div style="width: 64px; height: 64px; background: #dcfce7; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px;">✓</div>
      <h2 style="margin-bottom: 12px; font-size: 1.5rem;">Đặt thành công!</h2>
      <p class="muted" style="margin-bottom: 24px;">Cảm ơn bạn đã tin tưởng VibeEast. Đội ngũ của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận.</p>
      <button class="btn btn-primary" style="width: 100%" onclick="this.closest('.modal').remove(); history.replaceState(null, '', location.pathname);">Đóng</button>
    </div>
  `;
    document.body.appendChild(popup);
  }

  function initCustomerGallery() {
    const galleryMount = document.querySelector('#customerGallery');
    if (galleryMount && db.customer_gallery) {
      galleryMount.innerHTML = db.customer_gallery.map(img => `
      <div class="gallery-item">
        <img src="${img.url}" alt="${img.caption}" loading="lazy" />
        <div class="gallery-caption">${img.caption}</div>
      </div>
    `).join('');

      // Lightbox Popup Logic
      let lbOverlay = document.getElementById('lbOverlay');
      if (!lbOverlay) {
        lbOverlay = document.createElement('div');
        lbOverlay.id = 'lbOverlay';
        lbOverlay.className = 'lb-overlay';
        lbOverlay.innerHTML = `
        <img id="lbImg" class="lb-img" src="" />
        <p id="lbCaption" class="lb-caption"></p>
        <div class="lb-close">&times;</div>
      `;
        document.body.appendChild(lbOverlay);
      }

      const lbImg = document.getElementById('lbImg');
      const lbCaption = document.getElementById('lbCaption');

      document.querySelectorAll('#customerGallery .gallery-item').forEach(item => {
        item.addEventListener('click', () => {
          const img = item.querySelector('img');
          const cap = item.querySelector('.gallery-caption').textContent;
          lbImg.src = img.src;
          lbCaption.textContent = cap;
          lbOverlay.style.display = 'flex';
          // Trigger reflow for animation
          lbOverlay.offsetHeight;
          lbOverlay.style.opacity = '1';
          lbImg.style.transform = 'scale(1)';
        });
      });

      lbOverlay.addEventListener('click', () => {
        lbOverlay.style.opacity = '0';
        lbImg.style.transform = 'scale(0.95)';
        setTimeout(() => lbOverlay.style.display = 'none', 300);
      });
    }
  }

  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
    // Force immediate reveal for the hero card just in case
    setTimeout(() => { document.querySelector('.about-hero-glass')?.closest('.animate-up')?.classList.add('in-view'); }, 100);
  }

  initCustomerGallery();
  initScrollAnimations();
})();