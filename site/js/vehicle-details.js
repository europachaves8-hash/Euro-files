// ==========================================
// Vehicle Details Page - Renderizacao
// Formato dos dados: [make, model, engine, {detalhes}?]
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

  // Buscar o veiculo na base
  const vehicle = findVehicle(make, model, engine);

  if (!vehicle) {
    showNotFound();
    return;
  }

  renderVehicle(vehicle, make, model, engine);
});

function findVehicle(make, model, engine) {
  // Busca exata
  let result = VEHICLE_DETAILS.find(v =>
    v[0] === make && v[1] === model && v[2] === engine
  );
  if (result) return result;

  // Busca parcial: make + model (sem engine especifico)
  if (model) {
    result = VEHICLE_DETAILS.find(v => v[0] === make && v[1] === model);
    if (result) return result;
  }

  // Busca so por make (retorna primeiro resultado)
  result = VEHICLE_DETAILS.find(v => v[0] === make);
  return result || null;
}

function showNotFound() {
  document.getElementById('detail-loading').style.display = 'none';
  document.getElementById('detail-notfound').style.display = 'block';
}

function renderVehicle(v, make, model, engine) {
  const details = v[3] || {};
  const titulo = make + ' ' + (model || '') + ' ' + (engine || '');

  // Atualizar header
  document.getElementById('detail-title').textContent = titulo;
  document.getElementById('breadcrumb-vehicle').textContent = make + (model ? ' ' + model : '');
  document.title = titulo + ' - Euro Files';

  // Specs table
  setText('spec-engine-type', details.et || '--');
  setText('spec-engine-size', details.es || '--');
  setText('spec-ecu-type', details.ec || '--');
  setText('spec-orig-power', details.op || '--');
  setText('spec-orig-torque', details.ot || '--');

  // Power bars
  if (details.p) {
    const p = details.p;
    const maxPower = Math.max(p[2], p[0]) * 1.15; // stage1 + margem

    setText('val-power-orig', p[0] + 'HP (' + p[1] + 'kW)');
    setText('val-power-stage1', p[2] + 'HP (' + p[3] + 'kW)');
    document.getElementById('gain-power').textContent = '+ ' + p[4] + 'HP (+ ' + p[5] + 'kW)';

    // Animar barras com delay
    setTimeout(() => {
      document.getElementById('bar-power-orig').style.width = ((p[0] / maxPower) * 100) + '%';
      document.getElementById('bar-power-stage1').style.width = ((p[2] / maxPower) * 100) + '%';
    }, 100);
  } else {
    setText('val-power-orig', details.op || '--');
    setText('val-power-stage1', 'N/A');
    document.getElementById('gain-power').textContent = 'Stage 1 data not available';
    document.getElementById('gain-power').style.color = 'var(--text-light)';
  }

  // Torque bars
  if (details.t) {
    const t = details.t;
    const maxTorque = Math.max(t[2], t[0]) * 1.15;

    setText('val-torque-orig', t[0] + 'Nm (' + t[1] + 'ft-lb)');
    setText('val-torque-stage1', t[2] + 'Nm (' + t[3] + 'ft-lb)');
    document.getElementById('gain-torque').textContent = '+ ' + t[4] + 'Nm (+ ' + t[5] + 'ft-lb)';

    setTimeout(() => {
      document.getElementById('bar-torque-orig').style.width = ((t[0] / maxTorque) * 100) + '%';
      document.getElementById('bar-torque-stage1').style.width = ((t[2] / maxTorque) * 100) + '%';
    }, 100);
  } else {
    setText('val-torque-orig', details.ot || '--');
    setText('val-torque-stage1', 'N/A');
    document.getElementById('gain-torque').textContent = 'Stage 1 data not available';
    document.getElementById('gain-torque').style.color = 'var(--text-light)';
  }

  // Description
  document.getElementById('detail-desc-text').textContent =
    'EUROFILES offers individual ECU tuning files for ' + titulo +
    '. All tuning files are custom made and developed with data logs and real world tests. ' +
    'The software is tested on dyno bench and optimized for best performance and efficiency. ' +
    'Stage 1 chiptuning provides more power, smoother torque, less fuel consumption and better throttle response.';

  // Trocar estados de visibilidade
  document.getElementById('detail-loading').style.display = 'none';
  document.getElementById('detail-content').style.display = 'block';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
