// ==========================================
// ECUMAP CLONE - Main JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initAnimations();
  initBrandSearch();
  initBrandFilter();
  initVehicleSelector();
  initStepsCarousel();
  initScrollVideo();
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
