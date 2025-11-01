// filter.js
// Run with: node filter.js

import fs from 'node:fs';

const SOURCE = 'data/latest-canonical.json';
const OUTPUT = 'data/organic-vienna.json';

// keep only your stores
const STORES = new Set(['hofer', 'spar', 'billa']);

// keywords to keep (German)
const KEEP = [
  // fruits & vegetables
  'apfel','banane','birne','orange','zitrone','traube','erdbeere','beere', 'blaubeere', 
  'tomate','kartoffel','zwiebel','gurke','paprika','zucchini','karotte',
  'kohl','spinat','salat','broccoli','blumenkohl','aubergine','champignon','pilz',

  // dairy
  'milch','butter','käse','yoghurt','joghurt','rahm','quark','topfen','kefir','schokolade',

  // meat & fish
  'huhn','hähnchen','rind','schweine','puten','truthahn','lachs','forelle','thunfisch',
  'fisch','rindfleisch','schnitzel',

  // eggs & legumes
  'ei','eier','linse','bohne','erbse','kichererbse','hummus',

  // grains & basics
  'reis','hafer','mais','polenta','quinoa','buchweizen'
];

// words to exclude
const EXCLUDE = [
  'brot','bröt','weckerl','baguette','keks','kuchen','torte',
  'bier','wein','sekt','prosecco','schnaps',
  'chips','cola','limonade','zucker','süßigkeiten',
  'sauce','dressing','fertiggericht','pizza','lasagne',
  'pudding','dessert','eis','marmelade'
];

const MAX_ITEMS = 2000; // limit for smaller file

console.log('Reading', SOURCE);
const raw = fs.readFileSync(SOURCE, 'utf8');
const data = JSON.parse(raw);

function includesAny(str, words) {
  return words.some(w => str.includes(w));
}

const filtered = data.filter(p => {
  if (!p.bio) return false;
  if (!STORES.has(p.store)) return false;
  const name = (p.name || '').toLowerCase();
  if (!includesAny(name, KEEP)) return false;
  if (includesAny(name, EXCLUDE)) return false;
  return true;
}).slice(0, MAX_ITEMS)
  .map(p => ({
    name: p.name,
    store: p.store,
    price: p.price,
    unit: p.unit,
    quantity: p.quantity,
    priceHistory: Array.isArray(p.priceHistory)
      ? p.priceHistory.slice(0, 3)
      : []
  }));

fs.writeFileSync(OUTPUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  count: filtered.length,
  stores: [...new Set(filtered.map(p => p.store))],
  items: filtered
}, null, 2), 'utf8');

console.log(`Done. Saved ${filtered.length} items to ${OUTPUT}`);
