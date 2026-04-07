// ==========================================
// Vehicle Details Page - Rendering
// Format: [make, model, engine, {details}?]
// Details: et=engine_type, es=engine_size, ec=ecu_type,
//          op=orig_power, ot=orig_torque,
//          p=[orig_hp, orig_kw, stage1_hp, stage1_kw, gain_hp, gain_kw]
//          t=[orig_nm, orig_ftlb, stage1_nm, stage1_ftlb, gain_nm, gain_ftlb]
// ==========================================

var currentVehicle = null;
var currentStage = 1;

document.addEventListener('DOMContentLoaded', function () {
  if (typeof VEHICLE_DETAILS === 'undefined') return;

  var params = new URLSearchParams(window.location.search);
  var make = params.get('make');
  var model = params.get('model');
  var engine = params.get('engine');

  if (!make) { showNotFound(); return; }

  var vehicle = findVehicle(make, model, engine);
  if (!vehicle) { showNotFound(); return; }

  currentVehicle = vehicle;
  renderVehicle(vehicle, make, model, engine);
  setupStageToggle();
});

function findVehicle(make, model, engine) {
  var result = VEHICLE_DETAILS.find(function (v) {
    return v[0] === make && v[1] === model && v[2] === engine;
  });
  if (result) return result;
  if (model) {
    result = VEHICLE_DETAILS.find(function (v) { return v[0] === make && v[1] === model; });
    if (result) return result;
  }
  return VEHICLE_DETAILS.find(function (v) { return v[0] === make; }) || null;
}

function showNotFound() {
  document.getElementById('detail-loading').style.display = 'none';
  document.getElementById('detail-notfound').style.display = 'block';
}

function buildScale(max) {
  var steps = 5;
  var stepSize = Math.ceil(max / steps / 10) * 10;
  var ticks = [];
  for (var i = 0; i <= steps; i++) ticks.push(i * stepSize);
  return ticks;
}

function renderScale(containerId, maxVal) {
  var el = document.getElementById(containerId);
  if (!el) return maxVal;
  var ticks = buildScale(maxVal);
  el.innerHTML = ticks.map(function (t) { return '<span>' + t + '</span>'; }).join('');
  return ticks[ticks.length - 1];
}

function setupStageToggle() {
  // Create toggle buttons if they don't exist yet
  var powerCard = document.querySelector('.detail-card:first-child h3') ||
                  document.getElementById('bar-power-orig')?.closest('.detail-card')?.querySelector('h3');

  // Insert toggle buttons after "Power" heading
  var headings = document.querySelectorAll('.detail-card h3');
  headings.forEach(function (h) {
    if (h.textContent.trim() === 'Power') {
      // Add toggle next to heading
      var toggle = document.createElement('div');
      toggle.id = 'stage-toggle';
      toggle.style.cssText = 'display:inline-flex;gap:4px;margin-left:12px;vertical-align:middle;';
      toggle.innerHTML =
        '<button class="stage-btn active" data-stage="1" style="padding:4px 14px;font-size:12px;font-weight:700;border:2px solid #d41920;background:#d41920;color:#fff;cursor:pointer;transition:all .2s;">Stage 1</button>' +
        '<button class="stage-btn" data-stage="2" style="padding:4px 14px;font-size:12px;font-weight:700;border:2px solid #e2e8f0;background:white;color:#718096;cursor:pointer;transition:all .2s;">Stage 2</button>';
      h.appendChild(toggle);

      toggle.querySelectorAll('.stage-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var stage = parseInt(btn.dataset.stage);
          currentStage = stage;
          toggle.querySelectorAll('.stage-btn').forEach(function (b) {
            if (parseInt(b.dataset.stage) === stage) {
              b.style.background = '#d41920';
              b.style.borderColor = '#d41920';
              b.style.color = '#fff';
              b.classList.add('active');
            } else {
              b.style.background = 'white';
              b.style.borderColor = '#e2e8f0';
              b.style.color = '#718096';
              b.classList.remove('active');
            }
          });
          updateStageValues();
        });
      });
    }
  });
}

function updateStageValues() {
  if (!currentVehicle) return;
  var details = currentVehicle[3] || {};
  var multiplier = currentStage === 2 ? 1.5 : 1;
  var stageLabel = 'Stage ' + currentStage;
  var estimated = currentStage === 2;

  // Update power
  if (details.p) {
    var p = details.p;
    var stageHp = currentStage === 2 ? Math.round(p[0] + p[4] * multiplier) : p[2];
    var stageKw = currentStage === 2 ? Math.round(p[1] + p[5] * multiplier) : p[3];
    var gainHp = stageHp - p[0];
    var gainKw = stageKw - p[1];

    var scaleMax = renderScale('scale-power', Math.max(p[0], stageHp) * 1.2);

    setText('val-power-stage1-hp', stageHp + 'HP');
    setText('val-power-stage1-kw', stageKw + 'kW');

    var gainEl = document.getElementById('gain-power');
    if (gainEl) {
      gainEl.textContent = '+ ' + gainHp + 'HP ' + gainKw + 'kW';
      if (estimated) gainEl.title = 'Estimated values for Stage 2';
    }

    // Update stage label
    var stageLabels = document.querySelectorAll('.stage-label');
    stageLabels.forEach(function (el) { el.textContent = stageLabel; });

    setTimeout(function () {
      document.getElementById('bar-power-orig').style.width = ((p[0] / scaleMax) * 100) + '%';
      document.getElementById('bar-power-stage1').style.width = ((stageHp / scaleMax) * 100) + '%';
    }, 50);
  }

  // Update torque
  if (details.t) {
    var t = details.t;
    var stageNm = currentStage === 2 ? Math.round(t[0] + t[4] * multiplier) : t[2];
    var stageFtlb = currentStage === 2 ? Math.round(t[1] + t[5] * multiplier) : t[3];
    var gainNm = stageNm - t[0];
    var gainFtlb = stageFtlb - t[1];

    var tScaleMax = renderScale('scale-torque', Math.max(t[0], stageNm) * 1.2);

    setText('val-torque-stage1-nm', stageNm + 'NM');
    setText('val-torque-stage1-ftlb', stageFtlb + 'FT-LB');

    var gainTEl = document.getElementById('gain-torque');
    if (gainTEl) {
      gainTEl.textContent = '+ ' + gainNm + 'NM ' + gainFtlb + 'FT-LB';
      if (estimated) gainTEl.title = 'Estimated values for Stage 2';
    }

    setTimeout(function () {
      document.getElementById('bar-torque-orig').style.width = ((t[0] / tScaleMax) * 100) + '%';
      document.getElementById('bar-torque-stage1').style.width = ((stageNm / tScaleMax) * 100) + '%';
    }, 50);
  }

  // Update description
  var descEl = document.getElementById('detail-desc-text');
  if (descEl && currentVehicle) {
    var titulo = currentVehicle[0] + ' ' + (currentVehicle[1] || '') + ' ' + (currentVehicle[2] || '');
    descEl.textContent =
      'EUROFILES offers individual ECU tuning files for ' + titulo +
      '. All tuning files are custom made and developed with data logs and real world tests. ' +
      'The software is tested on dyno bench and optimized for best performance and efficiency. ' +
      stageLabel + ' chiptuning provides more power, smoother torque, less fuel consumption and better throttle response.' +
      (estimated ? ' Stage 2 values are estimated and may vary depending on hardware modifications.' : '');
  }
}

function renderVehicle(v, make, model, engine) {
  var details = v[3] || {};
  var titulo = make + ' ' + (model || '') + ' ' + (engine || '');

  document.getElementById('detail-title').textContent = titulo;
  document.getElementById('breadcrumb-vehicle').textContent = make + (model ? ' ' + model : '');
  document.title = titulo + ' - Euro Files';

  setText('spec-engine-type', details.et || '--');
  setText('spec-engine-size', details.es || '--');
  setText('spec-ecu-type', details.ec || '--');
  setText('spec-orig-power', details.op || '--');
  setText('spec-orig-torque', details.ot || '--');

  if (details.p) {
    var p = details.p;
    var scaleMax = renderScale('scale-power', Math.max(p[0], p[2]) * 1.2);

    setText('val-power-orig-hp', p[0] + 'HP');
    setText('val-power-orig-kw', p[1] + 'kW');
    setText('val-power-stage1-hp', p[2] + 'HP');
    setText('val-power-stage1-kw', p[3] + 'kW');
    document.getElementById('gain-power').textContent = '+ ' + p[4] + 'HP ' + p[5] + 'kW';

    setTimeout(function () {
      document.getElementById('bar-power-orig').style.width = ((p[0] / scaleMax) * 100) + '%';
      document.getElementById('bar-power-stage1').style.width = ((p[2] / scaleMax) * 100) + '%';
    }, 150);
  } else {
    setText('val-power-orig-hp', '--');
    setText('val-power-orig-kw', '');
    setText('val-power-stage1-hp', 'N/A');
    setText('val-power-stage1-kw', '');
    var gpEl = document.getElementById('gain-power');
    if (gpEl) { gpEl.textContent = 'No stage data'; gpEl.style.background = 'var(--bg-gray)'; gpEl.style.color = 'var(--text-light)'; }
    renderScale('scale-power', 100);
  }

  if (details.t) {
    var t = details.t;
    var tScaleMax = renderScale('scale-torque', Math.max(t[0], t[2]) * 1.2);

    setText('val-torque-orig-nm', t[0] + 'NM');
    setText('val-torque-orig-ftlb', t[1] + 'FT-LB');
    setText('val-torque-stage1-nm', t[2] + 'NM');
    setText('val-torque-stage1-ftlb', t[3] + 'FT-LB');
    document.getElementById('gain-torque').textContent = '+ ' + t[4] + 'NM ' + t[5] + 'FT-LB';

    setTimeout(function () {
      document.getElementById('bar-torque-orig').style.width = ((t[0] / tScaleMax) * 100) + '%';
      document.getElementById('bar-torque-stage1').style.width = ((t[2] / tScaleMax) * 100) + '%';
    }, 150);
  } else {
    setText('val-torque-orig-nm', '--');
    setText('val-torque-orig-ftlb', '');
    setText('val-torque-stage1-nm', 'N/A');
    setText('val-torque-stage1-ftlb', '');
    var gtEl = document.getElementById('gain-torque');
    if (gtEl) { gtEl.textContent = 'No stage data'; gtEl.style.background = 'var(--bg-gray)'; gtEl.style.color = 'var(--text-light)'; }
    renderScale('scale-torque', 100);
  }

  document.getElementById('detail-desc-text').textContent =
    'EUROFILES offers individual ECU tuning files for ' + titulo +
    '. All tuning files are custom made and developed with data logs and real world tests. ' +
    'The software is tested on dyno bench and optimized for best performance and efficiency. ' +
    'Stage 1 chiptuning provides more power, smoother torque, less fuel consumption and better throttle response.';

  document.getElementById('detail-loading').style.display = 'none';
  document.getElementById('detail-content').style.display = 'block';
}

function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}
