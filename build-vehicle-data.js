/**
 * Processa ecumap_detalhes.json e gera um JSON compacto
 * com apenas os dados necessarios para o frontend.
 *
 * Suporta dois formatos de entrada:
 *   - Novo: entry.power, entry.torque, entry.details (objetos diretos)
 *   - Antigo: entry.tabelas, entry.textoCompleto (scrape bruto)
 *
 * Formato de saida compacto: [make, model, engine, {detalhes}?]
 * Executar: node build-vehicle-data.js
 */
const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync('ecumap_detalhes.json', 'utf8'));
const output = [];

for (const entry of raw) {
  const item = [entry.make, entry.model, entry.engine];
  const d = {};

  // --- Formato novo (power/torque/details como objetos) ---
  if (entry.details) {
    const det = entry.details;
    if (det.engine_type && det.engine_type !== 'Undefined' && det.engine_type !== 'undefined') d.et = det.engine_type;
    if (det.engine_size && det.engine_size !== 'undefined') d.es = det.engine_size;
    if (det.ecu_type && det.ecu_type !== 'undefined') d.ec = det.ecu_type;
    if (det.original_power && det.original_power !== '0HP (0kW)') d.op = det.original_power;
    if (det.original_torque && det.original_torque !== '0Nm (0ft-lb)') d.ot = det.original_torque;
  }

  if (entry.power && entry.power.original && entry.power.original.hp > 0) {
    const p = entry.power;
    d.p = [p.original.hp, p.original.kw, p.stage1.hp, p.stage1.kw, p.gain_hp, p.gain_kw];
  }

  if (entry.torque && entry.torque.original && entry.torque.original.nm > 0) {
    const t = entry.torque;
    d.t = [t.original.nm, t.original.ftlb, t.stage1.nm, t.stage1.ftlb, t.gain_nm, t.gain_ftlb];
  }

  // --- Formato antigo (tabelas + textoCompleto) ---
  if (entry.tabelas && !entry.details) {
    const rows = entry.tabelas[0]?.rows || [];
    for (const row of rows) {
      if (row.length === 2) {
        const key = row[0].trim().toLowerCase().replace(/\s+/g, '_');
        const val = row[1].trim();
        if (val && val !== 'Undefined' && val !== 'undefined') {
          if (key === 'engine_type') d.et = val;
          if (key === 'engine_size') d.es = val;
          if (key === 'ecu_type') d.ec = val;
          if (key === 'original_power' && val !== '0HP (0kW)') d.op = val;
          if (key === 'original_torque' && val !== '0Nm (0ft-lb)') d.ot = val;
        }
      }
    }

    const text = entry.textoCompleto || '';
    const pm = text.match(/Power\s+Original\s+(\d+)HP\s+(\d+)kW\s+Stage\s+1\s+(\d+)HP\s+(\d+)kW\s+or\s+\+\s+(\d+)HP\s+(\d+)kW/);
    if (pm && parseInt(pm[1]) > 0) {
      d.p = [parseInt(pm[1]), parseInt(pm[2]), parseInt(pm[3]), parseInt(pm[4]), parseInt(pm[5]), parseInt(pm[6])];
    }
    const tm = text.match(/Torque\s+Original\s+(\d+)Nm\s+(\d+)ft-lb\s+Stage\s+1\s+(\d+)Nm\s+(\d+)ft-lb\s+or\s+\+\s+(\d+)Nm\s+(\d+)ft-lb/);
    if (tm && parseInt(tm[1]) > 0) {
      d.t = [parseInt(tm[1]), parseInt(tm[2]), parseInt(tm[3]), parseInt(tm[4]), parseInt(tm[5]), parseInt(tm[6])];
    }
  }

  if (Object.keys(d).length > 0) {
    item.push(d);
  }

  output.push(item);
}

const jsContent = 'const VEHICLE_DETAILS=' + JSON.stringify(output) + ';';
const outputPath = path.join('site', 'js', 'vehicle-details-data.js');
fs.writeFileSync(outputPath, jsContent, 'utf8');

const sizeKB = (Buffer.byteLength(jsContent) / 1024).toFixed(0);
const withDetails = output.filter(v => v[3]).length;
const withPower = output.filter(v => v[3]?.p).length;

console.log(`Processados: ${output.length} veiculos`);
console.log(`Com dados detalhados: ${withDetails}`);
console.log(`Com dados de power/torque: ${withPower}`);
console.log(`Arquivo: ${outputPath} (${sizeKB}KB)`);
