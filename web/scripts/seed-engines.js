// Script to generate SQL for seeding vehicle_engines from ENGINE_DATA
// Run: node web/scripts/seed-engines.js > web/sql/06_seed_engines.sql

const fs = require("fs");
const path = require("path");

// Load engine data
const engineFile = fs.readFileSync(
  path.join(__dirname, "..", "public", "js", "engine-data.js"),
  "utf-8"
);

// Extract the ENGINE_DATA object
const match = engineFile.match(/const ENGINE_DATA = (\{[\s\S]*\});?/);
if (!match) {
  console.error("Could not parse ENGINE_DATA");
  process.exit(1);
}

let ENGINE_DATA;
eval("ENGINE_DATA = " + match[1]);

let sql = `-- Auto-generated: Seed vehicle_engines from engine-data.js\n`;
sql += `-- Run this in the Supabase SQL Editor\n\n`;

// We need to match brand name -> vehicle_brands.id and model name -> vehicle_models.id
// Since we don't know the UUIDs, we'll use subqueries

let count = 0;

for (const [brandName, models] of Object.entries(ENGINE_DATA)) {
  for (const [modelName, engines] of Object.entries(models)) {
    for (const engineStr of engines) {
      // Parse engine string like "2.0 TDI 150hp (110kW) 320Nm"
      const hpMatch = engineStr.match(/(\d+)\s*hp/i);
      const dispMatch = engineStr.match(/^([\d.]+)/);
      const fuelGuess = engineStr.toLowerCase().includes("jtd") ||
        engineStr.toLowerCase().includes("tdi") ||
        engineStr.toLowerCase().includes("cdti") ||
        engineStr.toLowerCase().includes("hdi") ||
        engineStr.toLowerCase().includes("dci") ||
        engineStr.toLowerCase().includes("d4d") ||
        engineStr.toLowerCase().includes("crdi") ||
        engineStr.toLowerCase().includes("bluehdi") ||
        engineStr.toLowerCase().includes("diesel")
        ? "Diesel"
        : engineStr.toLowerCase().includes("hybrid")
        ? "Hybrid"
        : engineStr.toLowerCase().includes("electric")
        ? "Electric"
        : "Petrol";

      const powerHp = hpMatch ? parseInt(hpMatch[1]) : null;
      const displacement = dispMatch ? dispMatch[1] : null;
      const escapedName = engineStr.replace(/'/g, "''");
      const escapedModel = modelName.replace(/'/g, "''");
      const escapedBrand = brandName.replace(/'/g, "''");

      sql += `INSERT INTO vehicle_engines (model_id, name, fuel_type, displacement, power_hp)
SELECT vm.id, '${escapedName}', '${fuelGuess}', '${displacement || ""}', ${powerHp || "NULL"}
FROM vehicle_models vm
JOIN vehicle_brands vb ON vm.brand_id = vb.id
WHERE vb.name = '${escapedBrand}' AND vm.name = '${escapedModel}'
ON CONFLICT DO NOTHING;\n`;
      count++;
    }
  }
}

console.log(sql);
console.error(`Generated ${count} engine inserts`);
