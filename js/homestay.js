document.addEventListener('DOMContentLoaded', async () => {
  if (!window.VibeEast || !window.VibeEast.loadDBAsync) return;
  const db = await window.VibeEast.loadDBAsync();

  // Render Slides
  const slidesContainer = document.getElementById('dynamicSlides');
  if (slidesContainer && db.homestay_slides && db.homestay_slides.length > 0) {
    slidesContainer.innerHTML = db.homestay_slides.map(s => `
      <div class="swiper-slide" data-text="${s.text.replace(/"/g, '&quot;')}">
        <img src="${s.image}" alt="Homestay Slide" />
      </div>
    `).join('');
  }

  const formatPrice = (val) => {
    if (!val || String(val).toLowerCase().includes('no fee') || String(val).toLowerCase() === 'miễn phí') return val;
    let cleanVal = String(val).replace(/\D/g, '');
    if (cleanVal) {
      return cleanVal.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'VND';
    }
    return val;
  };

  // Render Rooms
  const roomsContainer = document.getElementById('dynamicRooms');
  if (roomsContainer && db.homestay_rooms && db.homestay_rooms.length > 0) {
    roomsContainer.innerHTML = db.homestay_rooms.map(r => `
      <div class="hs-room-card">
        <img src="${r.image}" alt="${r.title.replace(/"/g, '&quot;')}" class="hs-room-img" />
        <div class="hs-room-body">
          <a href="#" class="hs-room-title">${r.title}</a>
          <div class="hs-room-pricing">
            <div class="hs-price-row">
              <span class="hs-price-label">Room Rates:</span>
              <span class="hs-price-value">${formatPrice(r.rates)}</span>
            </div>
            <div class="hs-price-row">
              <span class="hs-price-label">Price according to tour:</span>
              <span class="hs-price-value highlight">${formatPrice(r.tour_price)}</span>
            </div>
          </div>
          <div class="hs-room-desc">
            ${r.desc}
          </div>
          <a href="#bookingSection" class="hs-btn-book">Book Now</a>
        </div>
      </div>
    `).join('');
  }

  // Render Buses
  const busesContainer = document.getElementById('dynamicBuses');
  if (busesContainer && db.homestay_buses && db.homestay_buses.length > 0) {
    busesContainer.innerHTML = db.homestay_buses.map(r => `
      <div class="hs-room-card">
        <img src="${r.image}" alt="${r.title.replace(/"/g, '&quot;')}" class="hs-room-img" />
        <div class="hs-room-body">
          <a href="#" class="hs-room-title">${r.title}</a>
          <div class="hs-room-pricing">
            <div class="hs-price-row">
              <span class="hs-price-label">Rates:</span>
              <span class="hs-price-value">${formatPrice(r.rates)}</span>
            </div>
            <div class="hs-price-row">
              <span class="hs-price-label">Price according to tour:</span>
              <span class="hs-price-value highlight">${formatPrice(r.tour_price)}</span>
            </div>
          </div>
          <div class="hs-room-desc">
            ${r.desc}
          </div>
          <a href="#bookingSection" class="hs-btn-book">Book Now</a>
        </div>
      </div>
    `).join('');
  }

  // Set initial text for slider
  const textContainer = document.getElementById('hsSlideText');
  if (textContainer && db.homestay_slides && db.homestay_slides.length > 0) {
    textContainer.textContent = db.homestay_slides[0].text;
    textContainer.style.transition = 'opacity 0.3s ease';
  }

  // Initialize Swiper for Homestay Intro Section
  if (document.querySelector('.hs-swiper') && typeof Swiper !== 'undefined') {
    const homestaySwiper = new Swiper('.hs-swiper', {
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '.hs-nav-next',
        prevEl: '.hs-nav-prev',
      },
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      on: {
        slideChangeTransitionStart: function () {
          // Update the info card text based on the active slide
          const activeSlide = this.slides?.[this.activeIndex];
          const slideText = activeSlide ? activeSlide.getAttribute('data-text') : null;
          const textCont = document.getElementById('hsSlideText');
          if (textCont && slideText) {
            textCont.style.opacity = 0;
            setTimeout(() => {
              textCont.textContent = slideText;
              textCont.style.opacity = 1;
            }, 300);
          }
        }
      }
    });
  }
});
