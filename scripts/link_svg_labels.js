/*
  Wrap SVG text labels with <a xlink:href> linking to renamed TSV files.
  For each SVG (human and mouse):
   - Load the SVG
   - For every <text>, extract its textContent, normalize, and find matching TSV in data/{species}
   - Wrap the <text> in <a xlink:href="/data/{species}/{filename}" xlink:title="Download {tissue}"> ...
*/

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function buildMap(species) {
  const dir = path.join(root, 'data', species);
  const files = fs.readdirSync(dir);
  const map = new Map(); // normalized tissue name -> filename

  for (const file of files) {
    if (!file.endsWith('.tsv')) continue;
    // accept renamed tusco_* files
    if (!file.startsWith(`tusco_${species}_`)) continue;
    const full = path.join(dir, file);
    const first = (fs.readFileSync(full, 'utf8').split(/\r?\n/)[0] || '').trim();
    const m = first.match(/#\s*Gene IDs passing expressed in\s+(.+)\s+\(UBERON:[^)]+\)\s+filter/i);
    if (!m) continue;
    const tissue = m[1];
    const key = normalize(tissue);
    if (!map.has(key)) map.set(key, file);
  }
  return map;
}

function wrapLabels(svgPath, species) {
  const svgText = fs.readFileSync(svgPath, 'utf8');
  const $ = cheerio.load(svgText, { xmlMode: true });

  const tissueMap = buildMap(species);

  $('text').each((_, el) => {
    const label = normalize($(el).text());
    if (!label) return;

    // Try direct and relaxed matching
    let file = tissueMap.get(label);
    if (!file) {
      for (const [k, v] of tissueMap) {
        if (k.includes(label) || label.includes(k)) {
          file = v; break;
        }
      }
    }
    if (!file) return;

    const a = $('<a></a>');
    a.attr('xlink:href', `/data/${species}/${file}`);
    a.attr('xlink:title', `Download ${$(el).text().trim()}`);

    const parent = $(el).parent();
    $(el).replaceWith(a.append($(el)));
    // Ensure xlink namespace exists
    const svg = $('svg').first();
    if (svg && !svg.attr('xmlns:xlink')) {
      svg.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }
  });

  fs.writeFileSync(svgPath, $.xml());
  console.log(`[UPDATED] ${svgPath}`);
}

function main() {
  const humanSvg = path.join(root, 'data', 'human_body_map.svg');
  const mouseSvg = path.join(root, 'data', 'mouse_boday_map.svg');

  if (!fs.existsSync(humanSvg)) {
    console.warn(`[WARN] Missing: ${humanSvg}`);
  } else {
    wrapLabels(humanSvg, 'human');
  }

  if (!fs.existsSync(mouseSvg)) {
    console.warn(`[WARN] Missing: ${mouseSvg}`);
  } else {
    wrapLabels(mouseSvg, 'mouse');
  }
}

main();


