// Insert engines into Supabase via JS client
// Run: node web/scripts/insert-engines.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://uybvxwjidliyvraaqeop.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YnZ4d2ppZGxpeXZyYWFxZW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0Njg3MTQsImV4cCI6MjA5MDA0NDcxNH0.CguMy1N1R5DDZu2YL1qaOFiiiXXj8zv2S2jq21AYc-M";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load ENGINE_DATA
const engineFile = fs.readFileSync(
  path.join(__dirname, "..", "public", "js", "engine-data.js"),
  "utf-8"
);
const match = engineFile.match(/const ENGINE_DATA = (\{[\s\S]*\});?/);
let ENGINE_DATA;
eval("ENGINE_DATA = " + match[1]);

async function main() {
  // Fetch all brands
  const { data: brands } = await supabase.from("vehicle_brands").select("id, name");
  const brandMap = {};
  brands.forEach((b) => (brandMap[b.name] = b.id));

  // Fetch all models
  const { data: models } = await supabase.from("vehicle_models").select("id, name, brand_id");
  const modelMap = {};
  models.forEach((m) => {
    const key = `${m.brand_id}_${m.name}`;
    modelMap[key] = m.id;
  });

  console.log(`Brands: ${brands.length}, Models: ${models.length}`);

  let total = 0;
  let inserted = 0;
  let skipped = 0;
  const batch = [];

  for (const [brandName, modelsObj] of Object.entries(ENGINE_DATA)) {
    const brandId = brandMap[brandName];
    if (!brandId) { skipped++; continue; }

    for (const [modelName, engines] of Object.entries(modelsObj)) {
      const modelId = modelMap[`${brandId}_${modelName}`];
      if (!modelId) { skipped += engines.length; continue; }

      for (const engineStr of engines) {
        const hpMatch = engineStr.match(/(\d+)\s*hp/i);
        const dispMatch = engineStr.match(/^([\d.]+)/);
        const isD = /jtd|tdi|cdti|hdi|dci|d4d|crdi|bluehdi|diesel/i.test(engineStr);
        const isH = /hybrid/i.test(engineStr);
        const isE = /electric/i.test(engineStr);

        batch.push({
          model_id: modelId,
          name: engineStr,
          fuel_type: isD ? "diesel" : isH ? "hybrid" : isE ? "electric" : "petrol",
          displacement: dispMatch ? dispMatch[1] : null,
          power_hp: hpMatch ? parseInt(hpMatch[1]) : null,
        });

        total++;

        // Insert in batches of 200
        if (batch.length >= 200) {
          const { error } = await supabase.from("vehicle_engines").insert(batch);
          if (error) {
            console.error(`Batch error at ${total}:`, error.message);
          } else {
            inserted += batch.length;
          }
          batch.length = 0;
          process.stdout.write(`\r  Inserted: ${inserted}/${total}`);
        }
      }
    }
  }

  // Final batch
  if (batch.length > 0) {
    const { error } = await supabase.from("vehicle_engines").insert(batch);
    if (error) console.error("Final batch error:", error.message);
    else inserted += batch.length;
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}, Total: ${total}`);
}

main().catch(console.error);
