// scripts/filter.js
// Node 18+ (has built-in fetch)

import fs from "node:fs";

// Online source for the Heisse Preise dataset
const SOURCE = "https://heisse-preise.io/data/latest-canonical.json";
const OUTPUT = "public/organic-vienna.json";

// keep only your stores
const STORES = new Set(["hofer", "spar", "billa"]);

// keywords to keep (German)
const KEEP = [
  "apfel","banane","birne","orange","zitrone","traube","erdbeere","beere",
  "tomate","kartoffel","zwiebel","gurke","paprika","zucchini","karotte",
  "kohl","spinat","salat","broccoli","blumenkohl","aubergine","champignon","pilz",
  "milch","butter","käse","yoghurt","joghurt","rahm","quark","topfen","kefir","schokolade",
  "huhn","hähnchen","rind","schweine","puten","truthahn","lachs","forelle","thunfisch",
  "fisch","rindfleisch","schnitzel",
  "ei","eier","linse","bohne","erbse","kichererbse","hummus",
  "reis","hafer","mais","polenta","quinoa","buchweizen"
];

const EXCLUDE = [
  "brot","bröt","weckerl","baguette","keks","kuchen","torte",
  "bier","wein","sekt","prosecco","schnaps",
  "chips","cola","limonade","zucker","süßigkeiten",
  "sauce","dressing","fertiggericht","pizza","lasagne",
  "pudding","dessert","eis","marmelade"
];

const MAX_ITEMS = 2000;

function includesAny(str, words) {
  return words.some((w) => str.includes(w));
}

const keepItem = (p) => {
  if (!p.bio) return false;
  if (!STORES.has(p.store)) return false;
  const name = (p.name || "").toLowerCase();
  if (!includesAny(name, KEEP)) return false;
  if (includesAny(name, EXCLUDE)) return false;
  return true;
};

async function main() {
  console.log("Downloading latest dataset...");
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`);
  const data = await res.json();

  console.log("Filtering...");
  const filtered = data.filter(keepItem).slice(0, MAX_ITEMS).map((p) => ({
    name: p.name,
    store: p.store,
    price: p.price,
    unit: p.unit,
    quantity: p.quantity,
    priceHistory: Array.isArray(p.priceHistory)
      ? p.priceHistory.slice(0, 3)
      : [],
  }));

  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: filtered.length,
        stores: [...new Set(filtered.map((p) => p.store))],
        items: filtered,
      },
      null,
      2
    )
  );

  console.log(`✅ Done. Saved ${filtered.length} items to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
