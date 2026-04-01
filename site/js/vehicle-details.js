// ==========================================
// Vehicle Details Page - Renderizacao
// Formato: [make, model, engine, {detalhes}?]
// Detalhes: et=engine_type, es=engine_size, ec=ecu_type,
//           op=orig_power, ot=orig_torque,
//           p=[orig_hp, orig_kw, stage1_hp, stage1_kw, gain_hp, gain_kw]
//           t=[orig_nm, orig_ftlb, stage1_nm, stage1_ftlb, gain_nm, gain_ftlb]
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  if (typeof VEHICLE_DETAILS === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const make = params.get('make');
  const model = params.get('model');
  const engine = params.get('engine');

  if (!make) {
    showNotFound();
    return;
  }

  const vehicle = findVehicle(make, model, engine);

  if (!vehicle) {
    showNotFound();
    return;
  }

  renderVehicle(vehicle, make, model, engine);
});

function findVehicle(make, model, engine) {
  let result = VEHICLE_DETAILS.find(v =>
    v[0] === make && v[1] === model && v[2] === engine
  );
  if (result) return result;

  if (model) {
    result = VEHICLE_DETAILS.find(v => v[0] === make && v[1] === model);
    if (result) return result;
  }

  result = VEHICLE_DETAILS.find(v => v[0] === make);
  return result || null;
}

function showNotFound() {
  document.getElementById('detail-loading').style.display = 'none';
  document.getElementById('detail-notfound').style.display = 'block';
}

// Gera escala numerica: 0, step, step*2, ..., max
function buildScale(max) {
  const steps = 5;
  const stepSize = Math.ceil(max / steps / 10) * 10;
  const ticks = [];
  for (let i = 0; i <= steps; i++) {
    ticks.push(i * stepSize);
  }
  return ticks;
}

function renderScale(containerId, maxVal) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const ticks = buildScale(maxVal);
  el.innerHTML = ticks.map(t => '<span>' + t + '</span>').join('');
  return ticks[ticks.length - 1]; // retorna o max da escala
}

function renderVehicle(v, make, model, engine) {
  const details = v[3] || {};
  const titulo = make + ' ' + (model || '') + ' ' + (engine || '');

  // Header
  document.getElementById('detail-title').textContent = titulo;
  document.getElementById('breadcrumb-vehicle').textContent = make + (model ? ' ' + model : '');
  document.title = titulo + ' - Euro Files';

  // Specs
  setText('spec-engine-type', details.et || '--');
  setText('spec-engine-size', details.es || '--');
  setText('spec-ecu-type', details.ec || '--');
  setText('spec-orig-power', details.op || '--');
  setText('spec-orig-torque', details.ot || '--');

  // Power
  if (details.p) {
    var p = details.p;
    var scaleMax = renderScale('scale-power', Math.max(p[0], p[2]) * 1.2);

    setText('val-power-orig-hp', p[0] + 'HP');
    setText('val-power-orig-kw', p[1] + 'kW');
    setText('val-power-stage1-hp', p[2] + 'HP');
    setText('val-power-stage1-kw', p[3] + 'kW');
    document.getElementById('gain-power').textContent = '+ ' + p[4] + 'HP ' + p[5] + 'kW';

    setTimeout(function() {
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

  // Torque
  if (details.t) {
    var t = details.t;
    var tScaleMax = renderScale('scale-torque', Math.max(t[0], t[2]) * 1.2);

    setText('val-torque-orig-nm', t[0] + 'NM');
    setText('val-torque-orig-ftlb', t[1] + 'FT-LB');
    setText('val-torque-stage1-nm', t[2] + 'NM');
    setText('val-torque-stage1-ftlb', t[3] + 'FT-LB');
    document.getElementById('gain-torque').textContent = '+ ' + t[4] + 'NM ' + t[5] + 'FT-LB';

    setTimeout(function() {
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

  // Description
  document.getElementById('detail-desc-text').textContent =
    'EUROFILES offers individual ECU tuning files for ' + titulo +
    '. All tuning files are custom made and developed with data logs and real world tests. ' +
    'The software is tested on dyno bench and optimized for best performance and efficiency. ' +
    'Stage 1 chiptuning provides more power, smoother torque, less fuel consumption and better throttle response.';

  // Mostrar conteudo
  document.getElementById('detail-loading').style.display = 'none';
  document.getElementById('detail-content').style.display = 'block';
}

function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}
