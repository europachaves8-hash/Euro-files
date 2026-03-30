/**
 * Processa ecumap_detalhes.json e gera um JSON compacto
 * com apenas os dados necessarios para o frontend.
 *
 * Formato compacto: chaves curtas, sem campos vazios.
 * Executar: node build-vehicle-data.js
 */
const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync('ecumap_detalhes.json', 'utf8'));
const output = [];

for (const entry of raw) {
  // m=make, d=model, e=engine (lookup keys — sempre presentes)
  const item = [entry.make, entry.model, entry.engine];

  // Extrair detalhes do veiculo da tabelas[0]
  const detailsTable = entry.tabelas?.[0]?.rows || [];
  const details = {};
  for (const row of detailsTable) {
    if (row.length === 2) {
      const key = row[0].trim().toLowerCase().replace(/\s+/g, '_');
      const val = row[1].trim();
      if (val && val !== 'Undefined' && val !== 'undefined') {
        details[key] = val;
      }
    }
  }

  // Extrair dados de Stage 1 do textoCompleto
  const text = entry.textoCompleto || '';

  const powerMatch = text.match(
    /Power\s+Original\s+(\d+)HP\s+(\d+)kW\s+Stage\s+1\s+(\d+)HP\s+(\d+)kW\s+or\s+\+\s+(\d+)HP\s+(\d+)kW/
  );
  const torqueMatch = text.match(
    /Torque\s+Original\s+(\d+)Nm\s+(\d+)ft-lb\s+Stage\s+1\s+(\d+)Nm\s+(\d+)ft-lb\s+or\s+\+\s+(\d+)Nm\s+(\d+)ft-lb/
  );

  // 4o elemento: objeto com detalhes (so se tiver dados reais)
  const hasDetails = Object.keys(details).length > 0;
  const hasPower = powerMatch && parseInt(powerMatch[1]) > 0;
  const hasTorque = torqueMatch && parseInt(torqueMatch[1]) > 0;

  if (hasDetails || hasPower || hasTorque) {
    const d = {};
    if (details.engine_type) d.et = details.engine_type;
    if (details.engine_size) d.es = details.engine_size;
    if (details.ecu_type) d.ec = details.ecu_type;
    if (details.original_power && details.original_power !== '0HP (0kW)') d.op = details.original_power;
    if (details.original_torque && details.original_torque !== '0Nm (0ft-lb)') d.ot = details.original_torque;

    if (hasPower) {
      d.p = [
        parseInt(powerMatch[1]), parseInt(powerMatch[2]),
        parseInt(powerMatch[3]), parseInt(powerMatch[4]),
        parseInt(powerMatch[5]), parseInt(powerMatch[6]),
      ];
    }
    if (hasTorque) {
      d.t = [
        parseInt(torqueMatch[1]), parseInt(torqueMatch[2]),
        parseInt(torqueMatch[3]), parseInt(torqueMatch[4]),
        parseInt(torqueMatch[5]), parseInt(torqueMatch[6]),
      ];
    }

    if (Object.keys(d).length > 0) {
      item.push(d);
    }
  }

  output.push(item);
}

// Escrever como JS para carregamento direto via <script>
const jsContent = 'const VEHICLE_DETAILS=' + JSON.stringify(output) + ';';
const outputPath = path.join('site', 'js', 'vehicle-details-data.js');
fs.writeFileSync(outputPath, jsContent, 'utf8');

const sizeKB = (Buffer.byteLength(jsContent) / 1024).toFixed(0);
console.log(`Processados: ${output.length} veiculos`);
console.log(`Arquivo gerado: ${outputPath} (${sizeKB}KB)`);

const withDetails = output.filter(v => v[3]).length;
console.log(`Com dados detalhados: ${withDetails}`);
