// ==========================================
// Brand Details Page
// ==========================================

(function () {
  const params = new URLSearchParams(window.location.search);
  const brand = params.get('brand');

  if (!brand) {
    showNotFound();
    return;
  }

  const models = typeof VEHICLE_DATA !== 'undefined' ? VEHICLE_DATA[brand] : null;
  const engines = typeof ENGINE_DATA !== 'undefined' ? ENGINE_DATA[brand] : null;
  const logoUrl = typeof BRAND_LOGOS !== 'undefined' ? BRAND_LOGOS[brand] : null;

  if (!models) {
    showNotFound();
    return;
  }

  // --- Page title ---
  document.title = brand + ' Tuning Files | EUROFILES';

  // --- Breadcrumb ---
  const breadcrumbEl = document.getElementById('breadcrumb-brand');
  if (breadcrumbEl) breadcrumbEl.textContent = brand;

  // --- Brand logo ---
  const logoEl = document.getElementById('brand-logo');
  const logoWrapper = document.getElementById('brand-logo-wrapper');
  if (logoEl && logoWrapper && logoUrl) {
    logoEl.src = logoUrl;
    logoEl.alt = brand + ' logo';
    logoWrapper.style.display = 'flex';
    logoEl.onerror = function () { logoWrapper.style.display = 'none'; };
  }

  // --- Brand name ---
  const nameEl = document.getElementById('brand-name');
  if (nameEl) nameEl.textContent = brand;

  // --- Description ---
  const descEl = document.getElementById('brand-description');
  if (descEl) {
    descEl.textContent = 'Professional ECU tuning files for ' + brand +
      '. We offer Stage 1, Stage 2, DPF OFF, EGR OFF and more for all ' + brand + ' models.';
  }

  // --- Badge & heading ---
  const badgeEl = document.getElementById('models-badge');
  if (badgeEl) badgeEl.textContent = models.length + ' Models';

  const headingEl = document.getElementById('models-heading');
  if (headingEl) headingEl.textContent = brand + ' Models';

  // --- Render models ---
  var container = document.getElementById('models-container');
  if (!container) return;

  var html = '';
  for (var i = 0; i < models.length; i++) {
    var model = models[i];
    var modelEngines = engines && engines[model] ? engines[model] : [];
    var countLabel = modelEngines.length === 1 ? '1 engine' : modelEngines.length + ' engines';

    html += '<div class="model-card">';
    html += '<div class="model-card-header" onclick="toggleModel(this)">';
    html += '<h3>' + escapeHtml(model) + '</h3>';
    html += '<span class="engine-count">' + countLabel + '</span>';
    html += '<span class="expand-icon">&rsaquo;</span>';
    html += '</div>';
    html += '<div class="model-card-engines" style="display:none">';

    for (var j = 0; j < modelEngines.length; j++) {
      var eng = modelEngines[j];
      var href = 'vehicle-details.html?make=' + encodeURIComponent(brand) +
        '&model=' + encodeURIComponent(model) +
        '&engine=' + encodeURIComponent(eng);
      html += '<a href="' + href + '" class="engine-link">' + escapeHtml(eng) + '</a>';
    }

    if (modelEngines.length === 0) {
      html += '<span class="engine-link" style="color:#888;cursor:default;">No engine data available</span>';
    }

    html += '</div>';
    html += '</div>';
  }

  container.innerHTML = html;

  // --- Helper: escape HTML ---
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- Not found ---
  function showNotFound() {
    document.title = 'Brand Not Found | EUROFILES';

    var nameEl = document.getElementById('brand-name');
    if (nameEl) nameEl.textContent = 'Brand Not Found';

    var breadcrumbEl = document.getElementById('breadcrumb-brand');
    if (breadcrumbEl) breadcrumbEl.textContent = 'Not Found';

    var descEl = document.getElementById('brand-description');
    if (descEl) descEl.textContent = '';

    var heroEl = document.getElementById('brand-hero');
    if (heroEl) heroEl.style.display = 'none';

    var container = document.getElementById('models-container');
    if (container) {
      container.innerHTML =
        '<div class="brand-not-found">' +
        '<h2>Brand Not Found</h2>' +
        '<p>The brand you are looking for does not exist or is not yet supported.</p>' +
        '<a href="vehicles.html" class="btn btn-primary">Back to Vehicle List</a>' +
        '</div>';
    }

    var badgeEl = document.getElementById('models-badge');
    if (badgeEl) badgeEl.style.display = 'none';

    var headingEl = document.getElementById('models-heading');
    if (headingEl) headingEl.style.display = 'none';
  }
})();

// --- Global toggle function ---
function toggleModel(headerEl) {
  var card = headerEl.parentElement;
  var enginesDiv = card.querySelector('.model-card-engines');
  if (!enginesDiv) return;

  var isOpen = card.classList.contains('open');
  if (isOpen) {
    card.classList.remove('open');
    enginesDiv.style.display = 'none';
  } else {
    card.classList.add('open');
    enginesDiv.style.display = 'flex';
  }
}
