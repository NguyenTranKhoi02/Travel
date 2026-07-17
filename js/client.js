(async () => {
  const db = await window.VibeEast.loadDBAsync();
  const money = (value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ';
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];
  const getBookedCount = (tid) => db.bookings_tour.filter(b => b.tourId === tid && b.status !== 'Chờ xác nhận').reduce((sum, b) => sum + (b.people || 0), 0);

  function sendEmailJSNotification(orderType, data) {
    return new Promise((resolve) => {
      // BƯỚC 1: BẠN HÃY TẠO TÀI KHOẢN TẠI EMAILJS.COM VÀ ĐIỀN 3 MÃ CỦA BẠN VÀO ĐÂY:
      const SERVICE_ID = 'service_5u17dnp'; // Thay bằng Service ID của bạn
      const TEMPLATE_ID = 'template_mjffxvr'; // Thay bằng Template ID của bạn
      const PUBLIC_KEY = 'krvraVV2898MIJzkq'; // Thay bằng Public Key của bạn

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
          message = `Tên khách: ${data.name}\nEmail: ${data.email || 'Không có'}\nSĐT: ${data.phone}\nTour: ${data.tourName}\nNgày đi: ${data.startDate}\nSố người: ${data.people}\nLoại xe: ${data.mode}\nTổng tiền: ${new Intl.NumberFormat('vi-VN').format(data.total)} đ`;
        } else {
          message = `Tên khách: ${data.name}\nEmail: ${data.email || 'Không có'}\nSĐT: ${data.phone}\nXe: ${data.bikeName}\nTừ: ${data.from} Đến: ${data.to}\nNơi nhận: ${data.pickup}\nTổng tiền: ${new Intl.NumberFormat('vi-VN').format(data.total)} đ`;
        }

        emailjs.send(SERVICE_ID, TEMPLATE_ID, {
          message: message,
          name: data.name || 'Khách hàng',
          email: data.email || 'horsetravel23@gmail.com'
        }, PUBLIC_KEY)
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
      db.tours.forEach(tour => {
        tourCounts[tour.location] = (tourCounts[tour.location] || 0) + 1;
      });

      provinceGrid.innerHTML = (db.destinations || []).map(dest => {
        const count = tourCounts[dest.name] || 0;
        return `
      <a class="swiper-slide province-card" href="tours.html?location=${encodeURIComponent(dest.name)}">
        <img src="${dest.image}" alt="${dest.name}" />
        <div class="card-overlay"><span class="badge">${count} <span data-i18n="js_tours_available">${t('js_tours_available')}</span></span><h3 data-i18n="dest_${dest.id}_name">${t('dest_' + dest.id + '_name') !== ('dest_' + dest.id + '_name') ? t('dest_' + dest.id + '_name') : dest.name}</h3><p data-i18n="dest_${dest.id}_desc">${t('dest_' + dest.id + '_desc') !== ('dest_' + dest.id + '_desc') ? t('dest_' + dest.id + '_desc') : dest.description}</p></div>
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
      let fList = db.tours.filter(tour => tour.is_featured);
      if (fList.length === 0) fList = db.tours.slice(0, 6);
      featuredTours.innerHTML = fList.map(tour => {
        const booked = getBookedCount(tour.id);
        return `
      <article class="yen-tour-card">
        <div class="yen-tour-card-img-wrap">
          <img class="yen-tour-card-img" src="${tour.image}" alt="${tour.title}" loading="lazy" />
          <span class="yen-tour-card-badge">${tour.style || t('js_tour_style_default')}</span>
        </div>
        <div class="yen-tour-card-body">
          <h3 class="yen-tour-card-title" data-i18n="tour_${tour.id}_title">${t(`tour_${tour.id}_title`) !== `tour_${tour.id}_title` ? t(`tour_${tour.id}_title`) : tour.title}</h3>
          <div class="yen-tour-card-meta">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${tour.location}</span>
            <span>•</span>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${tour.duration}</span>
            ${booked > 0 ? `<span>• <strong style="color:var(--primary)">🔥 ${booked} ${t('js_people_joined')}</strong></span>` : ''}
          </div>
          <div class="yen-tour-card-footer">
            <span class="yen-tour-card-price">${money(tour.price_base)}</span>
            <a class="yen-tour-card-btn" href="tour-detail.html?id=${tour.id}" data-i18n="js_book_now">${t('js_book_now')}</a>
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
          <span class="yen-bike-status ${statusClass}" ${isAvailable ? 'data-i18n="js_ready"' : ''}>${isAvailable ? t('js_ready') : b.status}</span>
          <div class="yen-bike-card-specs">
            ${engineCC ? `<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> ${engineCC} Engine</span>` : ''}
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg> ${b.type}</span>
          </div>
          <div class="yen-bike-card-price">${money(b.price_per_day)} <small>${t('js_per_day')}</small></div>
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
      const filtered = db.tours.filter(tour =>
        (!locations.length || locations.some(l => (tour.location || '').toLowerCase().includes(l.toLowerCase()))) &&
        (!durations.length || durations.some(d => {
          const dNum = d.match(/\d+/)?.[0];
          const tNum = (tour.duration || '').match(/\d+/)?.[0];
          return dNum && tNum && dNum === tNum;
        }))
      );
      grid.innerHTML = filtered.map(tour => {
        const booked = getBookedCount(tour.id);
        return `
      <article class="yen-tour-card">
        <div class="yen-tour-card-img-wrap">
          <img class="yen-tour-card-img" src="${tour.image}" alt="${tour.title}" loading="lazy" />
          <span class="yen-tour-card-price-badge">${money(tour.price_base)}</span>
        </div>
        <div class="yen-tour-card-body">
          <h3 class="yen-tour-card-title" data-i18n="tour_${tour.id}_title">${t(`tour_${tour.id}_title`) !== `tour_${tour.id}_title` ? t(`tour_${tour.id}_title`) : tour.title}</h3>
          <div class="yen-tour-card-meta">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${tour.duration}</span>
            <span>•</span>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${tour.location}</span>
            ${booked > 0 ? `<span>• <strong style="color:var(--primary)">🔥 ${booked}</strong></span>` : ''}
          </div>
          <a class="yen-tour-card-book" href="tour-detail.html?id=${tour.id}" data-i18n="js_book_now">${t('js_book_now')}</a>
        </div>
      </article>`;
      }).join('') || `<p class="yen-no-result">${t('js_no_tour')}</p>`;
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
        tourSelect.innerHTML = db.tours.map(item => `<option value="${item.id}" ${item.id === tour.id ? 'selected' : ''}>${item.title}</option>`).join('');
        tourSelect.addEventListener('change', (e) => {
          tour = db.tours.find(t => t.id === e.target.value) || db.tours[0];
          updateTotalPrice();
        });
      }

      const updateTotalPrice = () => {
        let people = Number(qs('#peopleCount').value || 1);
        const peopleInput = qs('#peopleCount');

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
        const expWrap = qs('#experienceWrap');
        const carGroupWrap = qs('#carGroupSizeWrap');
        let carGroupSize = 1;

        if (vehicle && (vehicle.value === 'Ô tô 7 chỗ' || vehicle.value === 'Xe Jeep')) {
          if (expWrap) expWrap.style.display = 'none';
          if (carGroupWrap) {
            carGroupWrap.style.display = 'block';
            const selCarGroup = qs('input[name="carGroupSize"]:checked');
            if (selCarGroup) carGroupSize = parseInt(selCarGroup.value) || 1;
          }
          if (peopleInput) {
            peopleInput.value = carGroupSize;
            people = carGroupSize;
            peopleInput.readOnly = true;
            peopleInput.style.backgroundColor = '#f1f5f9';
            peopleInput.style.cursor = 'not-allowed';
          }
        } else {
          if (expWrap) expWrap.style.display = 'block';
          if (carGroupWrap) carGroupWrap.style.display = 'none';
          if (peopleInput) {
            peopleInput.readOnly = false;
            peopleInput.style.backgroundColor = '';
            peopleInput.style.cursor = '';
          }
        }

        const baseTourCost = tour.price_base || 0;

        let vehicleCost = 0;
        let discount = 0;
        let discountLabel = '';

        if (vehicle && vehicle.value === 'Xe máy') {
          vehicleCost = (tour.surcharge_motorbike || 0) * people;
        } else if (vehicle && vehicle.value === 'Ô tô 7 chỗ') {
          let s7 = tour.surcharge_7seat || [0, 0, 0, 0];
          if (typeof s7 === 'number') s7 = [s7, s7, s7, s7];
          vehicleCost = s7[carGroupSize - 1] || 0;
        } else if (vehicle && vehicle.value === 'Xe Jeep') {
          let sj = tour.surcharge_jeep || [0, 0, 0, 0];
          if (typeof sj === 'number') sj = [sj, sj, sj, sj];
          vehicleCost = sj[carGroupSize - 1] || 0;
        }

        let actualBaseTourCost = baseTourCost * people;
        if (vehicle && (vehicle.value === 'Ô tô 7 chỗ' || vehicle.value === 'Xe Jeep')) {
          actualBaseTourCost = 0;
        }

        qs('#sumTour').textContent = money(actualBaseTourCost);
        const isEn = (localStorage.getItem('lang') || 'vi') === 'en';
        const tourLabel = qs('#sumTour').previousElementSibling;
        if (tourLabel) tourLabel.textContent = isEn ? `Tour Price (${people} pax):` : `Giá Tour (${people} khách):`;

        if (isSelfDrive && tour.discount_selfdrive && (!vehicle || vehicle.value === 'Xe máy')) {
          discount = tour.discount_selfdrive * people;
          discountLabel = isEn ? 'Discount (Self-drive):' : 'Giảm giá (Tự lái):';
        }

        let targetTourCost = actualBaseTourCost + vehicleCost - discount;

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

        return { total, tourCost: actualBaseTourCost, vehicleCost, discount, accCost, pickupCost, returnCost };
      };
      ['input', 'change'].forEach(evt => form.addEventListener(evt, updateTotalPrice));
      updateTotalPrice();

      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setTimeout(updateTotalPrice, 50));
      });



      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          if (!form.checkValidity()) {
            alert(t('js_fill_required') || 'Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, Email, SĐT, Ngày khởi hành)!');
          }
        });
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.textContent = t('js_processing'); btn.disabled = true;

        const prices = updateTotalPrice();
        const orderData = {
          id: Date.now(),
          tourId: tour.id,
          name: qs('#tourName').value,
          email: qs('#tourEmail') ? qs('#tourEmail').value : '',
          phone: qs('#tourPhone').value,
          startDate: qs('#startDate').value,
          people: Number(qs('#peopleCount').value),
          vehicle: qs('input[name="vehicle"]:checked').value,
          experience: ['Ô tô 7 chỗ', 'Xe Jeep'].includes(qs('input[name="vehicle"]:checked').value) ? `Nhóm ${qs('input[name="carGroupSize"]:checked')?.value || 1} người/xe` : (qs('input[name="experience"]:checked')?.value || 'N/A'),
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
📧 Email: ${orderData.email || 'Không có'}
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

        orderData.tourName = tour.title;
        orderData.mode = orderData.vehicle;
        await sendEmailJSNotification('tour', orderData);

        location.href = 'index.html?booking=success';
      });

      // Khởi tạo PayPal Button nếu có div paypal-button-container
      const paypalContainer = document.getElementById('paypal-button-container');
      if (paypalContainer && window.paypal) {
        // Xóa nội dung cũ để tránh duplicate nút
        paypalContainer.innerHTML = '';
        window.paypal.Buttons({
          createOrder: function(data, actions) {
            // Lấy tổng tiền hiện tại từ form
            const prices = updateTotalPrice();
            let totalVND = prices.total;
            
            // Chuyển đổi VNĐ sang USD (tỷ giá tham khảo: 1 USD = 25000 VNĐ)
            let totalUSD = (totalVND / 25000).toFixed(2);
            
            if (totalUSD <= 0) {
                alert(t('js_fill_required') || 'Vui lòng chọn đầy đủ thông tin tour trước khi thanh toán.');
                return false; 
            }

            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: totalUSD
                },
                description: qs('#tourName') ? qs('#tourName').value : 'Thanh toán đặt tour'
              }]
            });
          },
          onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
              alert('Thanh toán thành công bởi ' + details.payer.name.given_name);
              
              // Tự động submit form
              const submitBtn = form.querySelector('button[type="submit"]');
              if (submitBtn) submitBtn.click();
            });
          },
          onError: function(err) {
            console.error('Lỗi thanh toán PayPal:', err);
            alert('Đã có lỗi xảy ra trong quá trình thanh toán PayPal.');
          }
        }).render('#paypal-button-container');
      }

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
      <div class="slider-controls"><span>${tour.location} • ${tour.duration} ${booked > 0 ? `• <strong style="color:var(--primary)">🔥 ${booked} ${t('js_people_participated')}</strong>` : ''}</span><strong>${money(tour.price_base)}</strong></div>
      <h2>${tour.title}</h2><p class="muted">${tour.style || t('js_tour_style_default')} • ${t('js_route_desc')}</p>
      <div class="hgl-tour-content-wrapper">
        <div class="hgl-tour-itinerary-section">
          <h3 class="title-tt" data-i18n="js_itinerary_title">${t('js_itinerary_title')}</h3>
          <div id="itineraryList" class="yen-itinerary-list"></div>
          
          <div class="yen-itinerary-list" id="detailedItineraryWrapper" style="margin-top: 16px;">
            <div class="yen-itinerary-item">
              <button class="yen-itinerary-toggle" type="button">
                <div class="yen-itinerary-toggle-left">
                  <div class="yen-itinerary-circle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div class="yen-itinerary-title-wrap">
                    <h3 class="yen-itinerary-title" data-i18n="js_detailed_itinerary">${t('js_detailed_itinerary') !== 'js_detailed_itinerary' ? t('js_detailed_itinerary') : 'Lịch trình chi tiết'}</h3>
                  </div>
                </div>
                <svg class="yen-itinerary-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div class="yen-itinerary-content">
                <div class="yen-itinerary-content-inner" id="detailedItineraryContent">
                  ${tour.detailedItinerary ? tour.detailedItinerary.replace(/\n/g, '<br>') : '<p data-i18n="js_detailed_itinerary_empty">' + (t('js_detailed_itinerary_empty') !== 'js_detailed_itinerary_empty' ? t('js_detailed_itinerary_empty') : 'Đang cập nhật lịch trình chi tiết...') + '</p>'}
                  ${(tour.detailedItineraryImg1 || tour.detailedItineraryImg2) ? `<div class="itinerary-images-grid" style="display:flex;gap:8px;margin-top:16px;">${tour.detailedItineraryImg1 ? `<img src="${tour.detailedItineraryImg1}" style="width:100%;max-width:300px;border-radius:8px;object-fit:cover;aspect-ratio:4/3;" alt="detailed itinerary image">` : ''}${tour.detailedItineraryImg2 ? `<img src="${tour.detailedItineraryImg2}" style="width:100%;max-width:300px;border-radius:8px;object-fit:cover;aspect-ratio:4/3;" alt="detailed itinerary image">` : ''}</div>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="includedSection" class="hgl-tour-included-section">
          <h3 class="title-tt hgl-hidden-title" data-i18n="js_included_title">${t('js_included_title') !== 'js_included_title' ? t('js_included_title') : 'Bao gồm / Không bao gồm'}</h3>
          <div class="hgl-included-grid">
            <div class="hgl-included-box">
               <h4 class="hgl-box-title" data-i18n="js_included_heading">${t('js_included_heading') !== 'js_included_heading' ? t('js_included_heading') : 'Bao gồm'}</h4>
               <ul class="hgl-included-list">
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> <span data-i18n="js_inc_1">${t('js_inc_1') !== 'js_inc_1' ? t('js_inc_1') : 'Hướng dẫn viên địa phương chuyên nghiệp (lái xe Easy Rider hoặc Jeep)'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> <span data-i18n="js_inc_2">${t('js_inc_2') !== 'js_inc_2' ? t('js_inc_2') : '3 đêm lưu trú (tại nhà dân/nhà nghỉ địa phương)'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> <span data-i18n="js_inc_3">${t('js_inc_3') !== 'js_inc_3' ? t('js_inc_3') : 'Các bữa ăn theo lịch trình: 4 bữa sáng, 4 bữa trưa, 3 bữa tối.'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> <span data-i18n="js_inc_4">${t('js_inc_4') !== 'js_inc_4' ? t('js_inc_4') : 'Mũ bảo hiểm và áo mưa chất lượng cao'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> <span data-i18n="js_inc_5">${t('js_inc_5') !== 'js_inc_5' ? t('js_inc_5') : 'Nhiên liệu cho toàn bộ hành trình'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> <span data-i18n="js_inc_6">${t('js_inc_6') !== 'js_inc_6' ? t('js_inc_6') : 'Nước đóng chai dùng trong suốt các chuyến đi'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> <span data-i18n="js_inc_7">${t('js_inc_7') !== 'js_inc_7' ? t('js_inc_7') : 'Tất cả phí vào cửa và giấy phép'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> <span data-i18n="js_inc_8">${t('js_inc_8') !== 'js_inc_8' ? t('js_inc_8') : 'Hỗ trợ 24/7 trong suốt chuyến lưu diễn.'}</span></li>
               </ul>
            </div>
            <div class="hgl-included-box excluded-box">
               <h4 class="hgl-box-title" data-i18n="js_excluded_heading">${t('js_excluded_heading') !== 'js_excluded_heading' ? t('js_excluded_heading') : 'Không bao gồm'}</h4>
               <ul class="hgl-included-list excluded-list">
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> <span data-i18n="js_exc_1">${t('js_exc_1') !== 'js_exc_1' ? t('js_exc_1') : 'Vé xe giường nằm tuyến Hà Nội ↔ Hà Giang (có thể sắp xếp)'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> <span data-i18n="js_exc_2">${t('js_exc_2') !== 'js_exc_2' ? t('js_exc_2') : 'Chi phí cá nhân và đồ ăn nhẹ'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> <span data-i18n="js_exc_3">${t('js_exc_3') !== 'js_exc_3' ? t('js_exc_3') : 'Bảo hiểm du lịch (khuyến nghị)'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> <span data-i18n="js_exc_4">${t('js_exc_4') !== 'js_exc_4' ? t('js_exc_4') : '(Rất cảm ơn những lời góp ý dành cho hướng dẫn viên)'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> <span data-i18n="js_exc_5">${t('js_exc_5') !== 'js_exc_5' ? t('js_exc_5') : 'Nâng cấp lên phòng đơn hoặc phòng riêng'}</span></li>
                 <li><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> <span data-i18n="js_exc_6">${t('js_exc_6') !== 'js_exc_6' ? t('js_exc_6') : 'Đồ uống có cồn'}</span></li>
               </ul>
            </div>
          </div>
          <div class="lt-note hgl-note-spacing">
            <p><strong data-i18n="js_note_title">${t('js_note_title') !== 'js_note_title' ? t('js_note_title') : 'Bạn có yêu cầu đặc biệt về chế độ ăn uống?'}</strong> <span data-i18n="js_note_content">${t('js_note_content') !== 'js_note_content' ? t('js_note_content') : 'Ăn chay, ăn thuần chay, hay bị dị ứng? Hãy cho chúng tôi biết khi đặt tour và chúng tôi sẽ đáp ứng theo yêu cầu của bạn.'}</span></p>
          </div>
        </div>
      </div>
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
    itineraryList.innerHTML = tour.itinerary.map((item, idx) => {
      let content = typeof item === 'string' ? item : (item.content || '');
      let images = (typeof item === 'object' && item.images) ? item.images : [];
      let imagesHtml = images.length ? `<div class="itinerary-images-grid" style="display:flex;gap:8px;margin-top:12px;">${images.map(img => `<img src="${img}" style="width:100%;max-width:200px;border-radius:8px;object-fit:cover;aspect-ratio:4/3;" alt="itinerary image">`).join('')}</div>` : '';
      
      return `
      <div class="yen-itinerary-item ${idx === 0 ? 'active' : ''}">
        <button class="yen-itinerary-toggle">
          <div class="yen-itinerary-toggle-left">
            <div class="yen-itinerary-circle">
              <span>${idx + 1}</span>
            </div>
            <div class="yen-itinerary-title-wrap">
              <h3 class="yen-itinerary-title"><span data-i18n="js_day">${t('js_day')}</span> ${idx + 1}</h3>
              <p class="yen-itinerary-subtitle">Day ${idx + 1}</p>
            </div>
          </div>
          <svg class="yen-itinerary-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="yen-itinerary-content">
          <div class="yen-itinerary-content-inner">
            <p data-i18n="tour_${tour.id}_itinerary_${idx}">${t(`tour_${tour.id}_itinerary_${idx}`) !== `tour_${tour.id}_itinerary_${idx}` ? t(`tour_${tour.id}_itinerary_${idx}`).replace(/\n/g, '<br>') : content.replace(/\n/g, '<br>')}</p>
            ${imagesHtml}
          </div>
        </div>
      </div>`;
    }).join('');

    qsa('.yen-itinerary-toggle', itineraryList).forEach((btn) => btn.addEventListener('click', () => {
      const parent = btn.closest('.yen-itinerary-item');
      const isActive = parent.classList.contains('active');
      qsa('.yen-itinerary-item', itineraryList).forEach(el => el.classList.remove('active'));
      if (!isActive) parent.classList.add('active');
    }));

    const detailedWrapper = qs('#detailedItineraryWrapper');
    if (detailedWrapper) {
      const toggleBtn = qs('.yen-itinerary-toggle', detailedWrapper);
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const parent = toggleBtn.closest('.yen-itinerary-item');
          parent.classList.toggle('active');
        });
      }
    }

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
          <button class="yen-tour-card-book book-bike-btn bike-book-btn" data-id="${b.id}">${t('js_book_bike')}</button>
        </div>
      </article>`;
      }).join('') || `<p class="yen-no-result">${t('js_no_bike')}</p>`;

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
      btn.textContent = t('js_processing'); btn.disabled = true;

      const { bike, days, total } = calc();
      const orderData = { id: Date.now(), bikeId: bike.id, name: qs('#bikeName').value, phone: qs('#bikePhone').value, from: qs('#rentFrom').value, to: qs('#rentTo').value, pickup: qs('#pickupPlace').value, days, total, status: 'Chờ xác nhận' };
      db.bookings_bike.push(orderData);
      window.VibeEast.saveDB(db);

      const msg = `🛵 <b>CÓ KHÁCH THUÊ XE!</b>\n👤 Tên: ${orderData.name}\n📞 SĐT: ${orderData.phone}\n🗓 Nhận: ${orderData.from} - Trả: ${orderData.to}\n📍 Giao xe tại: ${orderData.pickup}\n💰 Tổng: ${money(orderData.total)}\n🏷 Xe: ${bike.name}`;
      await window.VibeEast.sendTelegramNotification(msg);

      orderData.bikeName = bike.name;
      await sendEmailJSNotification('bike', orderData);

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
      <h2 style="margin-bottom: 12px; font-size: 1.5rem;">${t('js_success_title')}</h2>
      <p class="muted" style="margin-bottom: 24px;">${t('js_success_msg')}</p>
      <button class="btn btn-primary" style="width: 100%" onclick="this.closest('.modal').remove(); history.replaceState(null, '', location.pathname);">${t('js_close')}</button>
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

  function initWhatsAppFloat() {
    if (!document.querySelector('.whatsapp-float')) {
      const waLink = document.createElement('a');
      waLink.href = "https://wa.me/84357164502";
      waLink.className = "whatsapp-float";
      waLink.target = "_blank";
      waLink.setAttribute('aria-label', 'Chat with us on WhatsApp');
      waLink.innerHTML = '<svg class="wa-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"> <path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>';
      document.body.appendChild(waLink);
    }
  }

  function initReviewsSlider() {
    const slider = document.getElementById('ltReviewsSlider');
    if (!slider) return;
    const track = document.getElementById('ltReviewsTrack');

    if (db.reviews && track) {
      const approvedReviews = db.reviews.filter(r => r.status === 'approved' || !r.status);
      track.innerHTML = approvedReviews.map(r => {
        const prefix = r.id ? r.id.replace('-', '_') : '';
        const titleKey = prefix ? `${prefix}_title` : '';
        const bodyKey = prefix ? `${prefix}_body` : '';
        const dateKey = prefix ? `${prefix}_date` : '';
        const metaKey = prefix ? `${prefix}_meta` : '';

        const titleStr = titleKey && t(titleKey) !== titleKey ? t(titleKey) : r.title;
        const bodyStr = bodyKey && t(bodyKey) !== bodyKey ? t(bodyKey) : r.content;
        const dateStr = dateKey && t(dateKey) !== dateKey ? t(dateKey) : r.date;
        const metaStr = metaKey && t(metaKey) !== metaKey ? t(metaKey) : r.tourType;

        return `
            <div class="lt-slide">
                <article class="lt-review">
                    <header class="lt-review__head">
                        <span class="lt-review__stars" aria-label="${r.rating} out of 5 stars">${'●'.repeat(r.rating)}${'○'.repeat(5 - r.rating)}</span>
                        <span class="lt-review__date" ${dateKey ? `data-i18n="${dateKey}"` : ''}>${dateStr}</span>
                    </header>
                    <h3 class="lt-review__title" ${titleKey ? `data-i18n="${titleKey}"` : ''}>${titleStr}</h3>
                    <p class="lt-review__body" ${bodyKey ? `data-i18n="${bodyKey}"` : ''}>${bodyStr}</p>
                    <footer class="lt-review__foot">
                        <div class="lt-review__author">
                            <div class="lt-review__avatar">${r.avatarLetter || r.name.charAt(0).toUpperCase()}</div>
                            <div class="lt-review__author-info">
                                <p class="lt-review__author-name">${r.name}</p>
                                <span class="lt-review__author-meta" ${metaKey ? `data-i18n="${metaKey}"` : ''}>${metaStr}</span>
                            </div>
                        </div>
                    </footer>
                </article>
            </div>
        `}).join('');
    }

    const prevBtn = document.getElementById('ltReviewsPrev');
    const nextBtn = document.getElementById('ltReviewsNext');
    const dotsContainer = document.getElementById('ltReviewsDots');
    const slides = track.querySelectorAll('.lt-slide');
    const totalSlides = slides.length;
    let current = 0;

    function getPerView() {
      const w = window.innerWidth;
      if (w <= 640) return 1;
      if (w <= 992) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, totalSlides - getPerView());
    }

    function goTo(index) {
      if (totalSlides === 0) return;
      const max = getMaxIndex();
      if (index < 0) index = 0;
      if (index > max) index = max;
      current = index;
      const slideWidth = slides[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const offset = current * (slideWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
      updateDots();
      updateButtons();
    }

    function buildDots() {
      if (!dotsContainer || totalSlides === 0) return;
      dotsContainer.innerHTML = '';
      const totalDots = getMaxIndex() + 1;
      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'lt-slider__dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.setAttribute('data-index', i);
        dot.addEventListener('click', (e) => {
          goTo(parseInt(e.currentTarget.getAttribute('data-index'), 10));
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.lt-slider__dot');
      dots.forEach((d, i) => {
        if (i === current) d.classList.add('is-active');
        else d.classList.remove('is-active');
      });
    }

    function updateButtons() {
      if (!prevBtn || !nextBtn) return;
      const max = getMaxIndex();
      prevBtn.disabled = (current === 0);
      nextBtn.disabled = (current >= max);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    let touchStartX = 0;
    let touchEndX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goTo(current + 1);
        else goTo(current - 1);
      }
    }, { passive: true });

    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(current - 1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(current + 1);
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildDots();
        goTo(Math.min(current, getMaxIndex()));
      }, 150);
    });

    buildDots();
    goTo(0);
  }

  initCustomerGallery();
  initScrollAnimations();
  initWhatsAppFloat();
  initReviewsSlider();
})();