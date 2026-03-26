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
