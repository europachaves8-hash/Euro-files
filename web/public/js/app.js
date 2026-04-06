// ==========================================
// ECUMAP CLONE - Main JavaScript
// ==========================================

// Brand logo URLs — using multiple reliable sources
const CDN = 'https://www.carlogos.org/car-logos/';
const WIKI = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
const BRAND_LOGOS = {
  'Acura':              CDN + 'acura-logo.png',
  'Alfa Romeo':         CDN + 'alfa-romeo-logo.png',
  'Alpina':             CDN + 'alpina-logo.png',
  'Alpine':             CDN + 'alpine-logo.png',
  'Aston Martin':       CDN + 'aston-martin-logo.png',
  'Audi':               CDN + 'audi-logo.png',
  'Bentley':            CDN + 'bentley-logo.png',
  'BMW':                CDN + 'bmw-logo.png',
  'Buick':              CDN + 'buick-logo.png',
  'Cadillac':           CDN + 'cadillac-logo.png',
  'Case':               WIKI + '5/50/Case_IH_logo.svg/120px-Case_IH_logo.svg.png',
  'Caterpillar':        WIKI + '2/2b/Caterpillar_Inc._logo_%282022%29.svg/120px-Caterpillar_Inc._logo_%282022%29.svg.png',
  'Challenger':         WIKI + '8/81/Challenger_logo.svg/120px-Challenger_logo.svg.png',
  'Chevrolet':          CDN + 'chevrolet-logo.png',
  'Chrysler':           CDN + 'chrysler-logo.png',
  'Citroen':            CDN + 'citroen-logo.png',
  'Cupra':              WIKI + '5/58/Cupra_logo.svg/120px-Cupra_logo.svg.png',
  'Dacia':              CDN + 'dacia-logo.png',
  'Daewoo':             CDN + 'daewoo-logo.png',
  'DAF':                CDN + 'daf-logo.png',
  'Dallara':            WIKI + '2/2d/Dallara_logo.svg/120px-Dallara_logo.svg.png',
  'Deutz Fahr':         WIKI + 'a/a2/Deutz-Fahr_logo.svg/120px-Deutz-Fahr_logo.svg.png',
  'Dodge':              CDN + 'dodge-logo.png',
  'DS':                 CDN + 'ds-automobiles-logo.png',
  'Fendt':              WIKI + '1/14/Fendt_logo.svg/120px-Fendt_logo.svg.png',
  'Ferrari':            CDN + 'ferrari-logo.png',
  'Fiat':               CDN + 'fiat-logo.png',
  'Ford':               CDN + 'ford-logo.png',
  'Geely':              WIKI + '3/33/Geely_Auto_logo_%282019%29.svg/120px-Geely_Auto_logo_%282019%29.svg.png',
  'Genesis':            CDN + 'genesis-logo.png',
  'GMC':                CDN + 'gmc-logo.png',
  'Holden':             WIKI + '3/3e/Holden_logo.svg/120px-Holden_logo.svg.png',
  'Honda':              CDN + 'honda-logo.png',
  'Hyundai':            CDN + 'hyundai-logo.png',
  'Infiniti':           CDN + 'infiniti-logo.png',
  'Iveco':              CDN + 'iveco-logo.png',
  'Jaguar':             CDN + 'jaguar-logo.png',
  'JCB':                WIKI + 'f/f4/JCB_logo.svg/120px-JCB_logo.svg.png',
  'Jeep':               CDN + 'jeep-logo.png',
  'Kia':                CDN + 'kia-logo.png',
  'Krone':              WIKI + '6/64/Krone_Logo.svg/120px-Krone_Logo.svg.png',
  'Lamborghini':        CDN + 'lamborghini-logo.png',
  'Lancia':             CDN + 'lancia-logo.png',
  'Land Rover':         CDN + 'land-rover-logo.png',
  'Lexus':              CDN + 'lexus-logo.png',
  'Lincoln':            CDN + 'lincoln-logo.png',
  'Lindner':            WIKI + '5/53/Lindner_Traktoren_logo.svg/120px-Lindner_Traktoren_logo.svg.png',
  'Lotus':              CDN + 'lotus-logo.png',
  'Luxgen':             WIKI + '3/37/Luxgen_logo.svg/120px-Luxgen_logo.svg.png',
  'Lynk & Co':          WIKI + 'f/fb/Lynk_%26_Co_logo.svg/120px-Lynk_%26_Co_logo.svg.png',
  'Mack':               WIKI + '1/12/Mack_Trucks_logo.svg/120px-Mack_Trucks_logo.svg.png',
  'Mahindra':           CDN + 'mahindra-logo.png',
  'MAN':                CDN + 'man-logo.png',
  'Maserati':           CDN + 'maserati-logo.png',
  'Massey Ferguson':    WIKI + '4/4e/Massey_Ferguson_logo.svg/120px-Massey_Ferguson_logo.svg.png',
  'Mazda':              CDN + 'mazda-logo.png',
  'McCormick':          WIKI + 'f/fb/McCormick_Tractors_logo.svg/120px-McCormick_Tractors_logo.svg.png',
  'McLaren':            CDN + 'mclaren-logo.png',
  'Mercedes-Benz':      CDN + 'mercedes-benz-logo.png',
  'Mercedes-Benz Trucks': CDN + 'mercedes-benz-logo.png',
  'Mercury':            WIKI + '7/72/Mercury_%28automobile%29_logo.svg/120px-Mercury_%28automobile%29_logo.svg.png',
  'Mini':               CDN + 'mini-logo.png',
  'Mitsubishi':         CDN + 'mitsubishi-logo.png',
  'New Holland':        WIKI + '1/1f/New_Holland_logo.svg/120px-New_Holland_logo.svg.png',
  'Nissan':             CDN + 'nissan-logo.png',
  'Opel':               CDN + 'opel-logo.png',
  'Peugeot':            CDN + 'peugeot-logo.png',
  'Pontiac':            CDN + 'pontiac-logo.png',
  'Porsche':            CDN + 'porsche-logo.png',
  'RAM':                CDN + 'ram-logo.png',
  'Renault':            CDN + 'renault-logo.png',
  'Renault Trucks':     CDN + 'renault-logo.png',
  'Roewe':              WIKI + 'a/a8/Roewe_logo.svg/120px-Roewe_logo.svg.png',
  'Rolls Royce':        CDN + 'rolls-royce-logo.png',
  'Rover':              CDN + 'rover-logo.png',
  'Same':               WIKI + '8/84/Same_%28Tractor_Manufacturer%29_Logo.svg/120px-Same_%28Tractor_Manufacturer%29_Logo.svg.png',
  'Saturn':             CDN + 'saturn-logo.png',
  'Scania':             CDN + 'scania-logo.png',
  'Seat':               CDN + 'seat-logo.png',
  'Skoda':              CDN + 'skoda-logo.png',
  'Smart':              CDN + 'smart-logo.png',
  'Steyr':              WIKI + '3/3a/Steyr_Tractor_logo.svg/120px-Steyr_Tractor_logo.svg.png',
  'Subaru':             CDN + 'subaru-logo.png',
  'Suzuki':             CDN + 'suzuki-logo.png',
  'Tesla':              CDN + 'tesla-logo.png',
  'Toyota':             CDN + 'toyota-logo.png',
  'Vauxhall':           CDN + 'vauxhall-logo.png',
  'Volkswagen':         CDN + 'volkswagen-logo.png',
  'Volvo':              CDN + 'volvo-logo.png',
  'Volvo Trucks':       CDN + 'volvo-logo.png',
  'Wey':                WIKI + 'c/c8/Wey_%28marque%29_logo.svg/120px-Wey_%28marque%29_logo.svg.png',
};

// Brands whose logos are too dark for the dark mega menu background
const DARK_LOGO_BRANDS = ['Audi', 'Toyota', 'Nissan', 'Jaguar', 'Volkswagen', 'Mercedes-Benz', 'Volvo', 'Mini', 'Mazda'];

// Top brands shown in the mega menu
const MEGA_MENU_BRANDS = [
  'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen',
  'Ford', 'Toyota', 'Honda', 'Porsche',
  'Ferrari', 'Lamborghini', 'Tesla', 'Nissan',
  'Hyundai', 'Kia', 'Volvo', 'Jaguar',
  'Land Rover', 'Peugeot', 'Renault', 'Fiat',
  'Chevrolet', 'Jeep', 'Mazda', 'Mini'
];

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initMegaMenu();
  initBrandLogos();
  initAnimations();
  initBrandSearch();
  initBrandFilter();
  initVehicleSelector();
  initStepsCarousel();
  initScrollVideo();
  initPriceCalculator();
});

// ---------- Navbar Scroll Effect ----------
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Set active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ---------- Mobile Navigation ----------
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.mobile-nav .close-btn');

  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => mobileNav.classList.add('open'));

  if (closeBtn) {
    closeBtn.addEventListener('click', () => mobileNav.classList.remove('open'));
  }

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileNav.classList.remove('open'));
  });
}

// ---------- Scroll Animations ----------
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  // Add stagger delays to tuning items
  document.querySelectorAll('.tuning-item[data-animate]').forEach((el, i) => {
    el.style.animationDelay = (i * 0.04) + 's';
  });

  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });
}

// ---------- Brand Logos (inject into brand cards) ----------
function initBrandLogos() {
  document.querySelectorAll('.brand-card').forEach(card => {
    const nameEl = card.querySelector('.brand-name');
    if (!nameEl) return;
    const name = nameEl.textContent.trim();

    const icon = document.createElement('div');
    icon.className = 'brand-logo-icon';

    if (BRAND_LOGOS[name]) {
      const img = document.createElement('img');
      img.src = BRAND_LOGOS[name];
      img.alt = name;
      img.loading = 'lazy';
      img.onerror = function() {
        this.remove();
        icon.textContent = name.charAt(0).toUpperCase();
      };
      icon.appendChild(img);
    } else {
      icon.textContent = name.charAt(0).toUpperCase();
    }

    card.insertBefore(icon, nameEl);
  });
}

// ---------- Mega Menu ----------
function initMegaMenu() {
  const vehicleLink = document.querySelector('.nav-links a[href*="vehicles"]');
  if (!vehicleLink) return;

  // Wrap link in dropdown container
  const dropdown = document.createElement('div');
  dropdown.className = 'nav-dropdown';
  vehicleLink.parentNode.insertBefore(dropdown, vehicleLink);
  dropdown.appendChild(vehicleLink);

  // Add dropdown arrow
  const arrow = document.createElement('span');
  arrow.className = 'dropdown-arrow';
  arrow.innerHTML = '&#9660;';
  vehicleLink.appendChild(arrow);

  // Build mega menu
  const mega = document.createElement('div');
  mega.className = 'mega-menu';

  const title = document.createElement('div');
  title.className = 'mega-menu-title';
  title.textContent = 'Popular Brands';
  mega.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'mega-menu-grid';

  MEGA_MENU_BRANDS.forEach(brand => {
    const a = document.createElement('a');
    a.className = 'mega-brand';
    a.href = 'vehicles.html';

    const icon = document.createElement('span');
    icon.className = 'mega-brand-icon';

    if (BRAND_LOGOS[brand]) {
      const img = document.createElement('img');
      img.src = BRAND_LOGOS[brand];
      img.alt = brand;
      img.loading = 'lazy';
      if (DARK_LOGO_BRANDS.includes(brand)) {
        img.classList.add('invert-dark');
      }
      img.onerror = function() {
        this.remove();
        icon.textContent = brand.charAt(0);
      };
      icon.appendChild(img);
    } else {
      icon.textContent = brand.charAt(0);
    }

    const span = document.createElement('span');
    span.textContent = brand;

    a.appendChild(icon);
    a.appendChild(span);
    grid.appendChild(a);
  });

  mega.appendChild(grid);

  const footer = document.createElement('div');
  footer.className = 'mega-menu-footer';
  footer.innerHTML = '<a href="vehicles.html">View All 100+ Brands &rarr;</a>';
  mega.appendChild(footer);

  dropdown.appendChild(mega);
}

// ---------- Brand Search ----------
function initBrandSearch() {
  const searchInput = document.getElementById('brand-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.brand-card').forEach(card => {
      const name = card.querySelector('.brand-name').textContent.toLowerCase();
      card.style.display = name.includes(query) ? '' : 'none';
    });
  });
}

// ---------- Brand Category Filter ----------
function initBrandFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category;
      document.querySelectorAll('.brand-card').forEach(card => {
        if (category === 'all') {
          card.style.display = '';
        } else {
          card.style.display = card.dataset.category === category ? '' : 'none';
        }
      });
    });
  });
}

// ---------- Vehicle Selector ----------
function initVehicleSelector() {
  const makeSelect = document.getElementById('sel-make');
  const modelSelect = document.getElementById('sel-model');
  const engineSelect = document.getElementById('sel-engine');

  if (!makeSelect || !modelSelect || !engineSelect) return;
  if (typeof VEHICLE_DATA === 'undefined') return;

  makeSelect.addEventListener('change', () => {
    const make = makeSelect.value;
    modelSelect.innerHTML = '<option value="">Select</option>';
    engineSelect.innerHTML = '<option value="">Select</option>';
    engineSelect.disabled = true;

    if (make && VEHICLE_DATA[make]) {
      VEHICLE_DATA[make].forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        modelSelect.appendChild(opt);
      });
      modelSelect.disabled = false;
    } else {
      modelSelect.disabled = true;
    }
  });

  modelSelect.addEventListener('change', () => {
    engineSelect.innerHTML = '<option value="">Select</option>';
    if (modelSelect.value) {
      const make = makeSelect.value;
      const model = modelSelect.value;
      let hasEngines = false;

      if (typeof ENGINE_DATA !== 'undefined' && ENGINE_DATA[make] && ENGINE_DATA[make][model]) {
        ENGINE_DATA[make][model].forEach(eng => {
          const opt = document.createElement('option');
          opt.value = eng;
          opt.textContent = eng;
          engineSelect.appendChild(opt);
          hasEngines = true;
        });
      }

      if (!hasEngines) {
        engineSelect.innerHTML += '<option value="all">All Engines</option>';
      }
      engineSelect.disabled = false;
    } else {
      engineSelect.disabled = true;
    }
  });

  // Botao Find a File -> navegar para pagina de detalhes
  const findBtn = document.getElementById('btn-find-file');
  if (findBtn) {
    findBtn.addEventListener('click', () => {
      const make = makeSelect.value;
      const model = modelSelect.value;
      const engine = engineSelect.value;

      if (!make) {
        makeSelect.style.borderColor = 'var(--primary)';
        makeSelect.focus();
        return;
      }

      const params = new URLSearchParams();
      params.set('make', make);
      if (model) params.set('model', model);
      if (engine && engine !== 'all') params.set('engine', engine);

      window.location.href = 'vehicle-details?' + params.toString();
    });
  }
}

// ---------- Steps Carousel ----------
function initStepsCarousel() {
  const tabs = document.querySelectorAll('.step-tab');
  const panels = document.querySelectorAll('.step-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const step = tab.dataset.step;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      panels.forEach(p => {
        p.classList.remove('active');
        if (p.dataset.panel === step) {
          p.classList.add('active');
        }
      });
    });
  });
}

// ---------- Scroll-Driven Video (Canvas Frame Extraction) ----------
function initScrollVideo() {
  const wrapper = document.querySelector('.hero-scroll-wrapper');
  const canvas = document.getElementById('heroCanvas');
  const video = document.getElementById('heroVideo');
  if (!wrapper || !canvas || !video) return;

  const ctx = canvas.getContext('2d');
  const frames = [];
  let totalFrames = 0;
  let extracting = false;
  let ready = false;
  let currentFrame = -1;

  // Resize canvas to fill hero
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Redraw current frame after resize
    if (ready && currentFrame >= 0 && frames[currentFrame]) {
      drawFrame(currentFrame);
    }
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Draw a frame onto canvas with cover-fit
  function drawFrame(index) {
    const img = frames[index];
    if (!img) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.width;
    const ih = img.height;

    // object-fit: cover math
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
    currentFrame = index;
  }

  // Extract all frames from video into ImageBitmap array
  function extractFrames() {
    if (extracting) return;
    extracting = true;

    const fps = 24; // assumed fps
    const duration = video.duration;
    totalFrames = Math.floor(duration * fps);
    let extracted = 0;

    // Show first frame ASAP
    video.currentTime = 0;

    function seekNext() {
      if (extracted >= totalFrames) {
        ready = true;
        updateScrollFrame();
        return;
      }

      const time = (extracted / totalFrames) * duration;
      video.currentTime = time;
    }

    video.addEventListener('seeked', function onSeeked() {
      // Capture frame to ImageBitmap (fast, off-main-thread)
      createImageBitmap(video).then(bitmap => {
        frames[extracted] = bitmap;

        // Draw first frame immediately
        if (extracted === 0) {
          drawFrame(0);
        }

        extracted++;

        // If enough frames extracted, allow scroll interaction early
        if (extracted === 10 && !ready) {
          ready = true;
          updateScrollFrame();
        }

        seekNext();
      }).catch(() => {
        // Skip failed frame
        extracted++;
        seekNext();
      });
    });

    seekNext();
  }

  // On scroll, pick the right frame and draw it
  // Video plays over 150vh, content fades by 135vh, hero unpins at 140vh
  const videoRunway = 150 * window.innerHeight / 100; // 150vh in px
  const fadeStartVh = 75;  // content starts fading at 75vh
  const fadeEndVh = 135;   // content fully gone at 135vh

  function updateScrollFrame() {
    if (!frames.length) return;

    const rect = wrapper.getBoundingClientRect();
    const scrolled = Math.max(-rect.top, 0);

    // Video progress mapped to 150vh (continues even after hero unpins)
    const videoProgress = Math.min(scrolled / videoRunway, 1);
    const maxFrame = frames.length - 1;
    const targetFrame = Math.round(videoProgress * maxFrame);

    if (targetFrame !== currentFrame && frames[targetFrame]) {
      drawFrame(targetFrame);
    }

    // Content fade mapped to absolute vh values
    const fadeStartPx = fadeStartVh * window.innerHeight / 100;
    const fadeEndPx = fadeEndVh * window.innerHeight / 100;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      if (scrolled > fadeStartPx) {
        const fadeProgress = Math.min((scrolled - fadeStartPx) / (fadeEndPx - fadeStartPx), 1);
        heroContent.style.opacity = Math.max(1 - fadeProgress, 0);
        heroContent.style.transform = 'translateY(' + (-fadeProgress * 40) + 'px)';
      } else {
        heroContent.style.opacity = 1;
        heroContent.style.transform = 'translateY(0)';
      }
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateScrollFrame();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Start extraction when video is ready
  video.addEventListener('loadeddata', () => {
    extractFrames();
  });

  // If video already loaded
  if (video.readyState >= 2) {
    extractFrames();
  }
}

// ---------- Price Calculator ----------
function initPriceCalculator() {
  const vehicle = document.getElementById('calc-vehicle');
  const service = document.getElementById('calc-service');
  const priceEl = document.getElementById('calc-price');
  const hintEl = document.getElementById('calc-hint');
  if (!vehicle || !service || !priceEl) return;

  const prices = {
    car:   { stage1: [30,50], stage2: [40,60], dpf: [20,40], egr: [20,40], dtc: [20,40], adblue: [25,45], popbang: [30,50] },
    truck: { stage1: [50,80], stage2: [60,90], dpf: [40,70], egr: [40,70], dtc: [30,50], adblue: [40,70], popbang: [40,60] },
    agri:  { stage1: [50,100], stage2: [60,110], dpf: [40,80], egr: [40,80], dtc: [30,60], adblue: [40,80], popbang: [40,70] },
    moto:  { stage1: [30,50], stage2: [40,60], dpf: [25,45], egr: [25,45], dtc: [20,40], adblue: [25,45], popbang: [30,50] },
  };

  function update() {
    const v = vehicle.value;
    const s = service.value;
    if (v && s && prices[v] && prices[v][s]) {
      const [min, max] = prices[v][s];
      priceEl.textContent = min + ' - ' + max + ' €';
      hintEl.textContent = 'Final price depends on vehicle model and ECU type';
    } else {
      priceEl.innerHTML = '&mdash;';
      hintEl.textContent = 'Select vehicle and service to calculate';
    }
  }

  vehicle.addEventListener('change', update);
  service.addEventListener('change', update);
}

// ---------- Simple Form Validation ----------
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'var(--primary)';
      valid = false;
    } else {
      input.style.borderColor = 'var(--border)';
    }
  });

  if (valid) {
    alert('Message sent successfully! We will get back to you shortly.');
  }

  return false;
}
