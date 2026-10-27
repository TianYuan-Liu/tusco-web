#!/usr/bin/env node
/*
 * Build data/catalog/<release>/<species>.json from the files of each release
 * listed in data/releases.json. The web app reads these catalogs to show the
 * gene tables, tissue charts and release changes without parsing every TSV.
 *
 * usage: node scripts/build-catalog.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DATA = path.join(__dirname, '..', 'data');
const SPECIES = ['human', 'mouse'];

function dataRows(text) {
  return text
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('Gene_ID'))
    .map((l) => l.split('\t'));
}

function readGeneTable(file) {
  const genes = [];
  for (const f of dataRows(fs.readFileSync(file, 'utf8'))) {
    genes.push({
      id: f[0].split('.')[0],
      transcript: f[1] || '',
      symbol: f[2] || '',
      entrez: f[3] || '',
      refseqMrna: f[4] || '',
      refseqProtein: f[5] || '',
    });
  }
  return genes;
}

// gene_id -> {chrom, start, end, strand, exons} from the transcript and exon records of a GTF
function readGtfLoci(file) {
  if (!fs.existsSync(file)) return {};
  let text = fs.readFileSync(file);
  if (file.endsWith('.gz')) text = zlib.gunzipSync(text);
  const loci = {};
  for (const line of text.toString('utf8').split('\n')) {
    const f = line.split('\t');
    if (f.length < 9 || (f[2] !== 'transcript' && f[2] !== 'exon')) continue;
    const m = f[8].match(/gene_id "([^".]+)/);
    if (!m) continue;
    const locus = (loci[m[1]] = loci[m[1]] || { chrom: f[0], start: +f[3], end: +f[4], strand: f[6], exons: 0 });
    if (f[2] === 'transcript') Object.assign(locus, { start: +f[3], end: +f[4] });
    else locus.exons += 1;
  }
  return loci;
}

function readTissues(dir, species) {
  const prefix = `tusco_${species}_`;
  const tissues = [];
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.startsWith(prefix) || !file.endsWith('.tsv')) continue;
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    const name = (text.match(/^# Tissue:\s*(.+)$/m) || [])[1];
    if (!name) continue; // statistics and exon-class tables have no tissue header
    const slug = file.slice(prefix.length, -4);
    const gtf = `${prefix}${slug}.gtf.gz`;
    tissues.push({
      name: name.trim(),
      slug,
      tsv: file,
      gtf: fs.existsSync(path.join(dir, gtf)) ? gtf : null,
      genes: dataRows(text).map((f) => f[0].split('.')[0]),
    });
  }
  return tissues;
}

function readChanges(file) {
  if (!file || !fs.existsSync(file)) return null;
  const [header, ...rows] = fs.readFileSync(file, 'utf8').trim().split('\n').map((l) => l.split('\t'));
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] || ''])));
}

function existing(dir, names) {
  return names.filter((n) => fs.existsSync(path.join(dir, n)));
}

function buildSpecies(release, species, previousCatalog) {
  const meta = release.species[species];
  const dir = path.join(DATA, meta.dir);
  const universal = readGeneTable(path.join(dir, `tusco_${species}.tsv`));
  const loci = readGtfLoci(path.join(dir, `tusco_${species}.gtf`));
  const tissues = readTissues(dir, species);
  const changes = readChanges(meta.changes && path.join(dir, meta.changes));
  const status = Object.fromEntries((changes || []).map((c) => [c.gene_id, c.status]));
  const tissueCount = {};
  for (const t of tissues) for (const g of t.genes) tissueCount[g] = (tissueCount[g] || 0) + 1;
  const previousCounts = Object.fromEntries((previousCatalog?.tissues || []).map((t) => [t.name, t.n]));

  return {
    release: release.id,
    species,
    universal: universal.map((g) => {
      const locus = loci[g.id];
      return {
        ...g,
        chrom: locus?.chrom || '',
        start: locus?.start || null,
        end: locus?.end || null,
        strand: locus?.strand || '',
        exons: locus?.exons || null,
        tissues: tissueCount[g.id] || 0,
        status: status[g.id] || null,
      };
    }),
    added: (changes || [])
      .filter((c) => c.status === 'new')
      .map((c) => ({ id: c.gene_id, symbol: c.gene_symbol, note: c.note })),
    dropped: (changes || [])
      .filter((c) => c.status === 'dropped')
      .map((c) => ({ id: c.gene_id, symbol: c.gene_symbol, note: c.note })),
    tissues: tissues
      .map((t) => ({
        name: t.name,
        slug: t.slug,
        n: t.genes.length,
        previous: previousCatalog ? previousCounts[t.name] ?? 0 : null,
        tsv: t.tsv,
        gtf: t.gtf,
      }))
      .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)),
    removedTissues: previousCatalog
      ? previousCatalog.tissues.filter((t) => !tissues.some((x) => x.name === t.name)).map((t) => t.name)
      : [],
    files: existing(dir, [
      `tusco_${species}.tsv`,
      `tusco_${species}.gtf`,
      `tusco_${species}_tissue_statistics.tsv`,
      meta.changes,
      'run_parameters.json',
      'gene_filter_log.tsv',
    ].filter(Boolean)),
    base: `/data/${meta.dir}`,
  };
}

function main() {
  const { releases } = JSON.parse(fs.readFileSync(path.join(DATA, 'releases.json'), 'utf8'));
  const built = {};
  // Oldest first, so each release can be compared with the one before it
  for (const release of [...releases].reverse()) {
    for (const species of SPECIES) {
      const previous = release.previous ? built[`${release.previous}/${species}`] : null;
      const catalog = buildSpecies(release, species, previous);
      built[`${release.id}/${species}`] = catalog;
      const out = path.join(DATA, 'catalog', release.id, `${species}.json`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, JSON.stringify(catalog));
      console.log(
        `${release.id} ${species}: ${catalog.universal.length} universal genes, ` +
          `${catalog.tissues.length} tissues, ${catalog.dropped.length} dropped -> ${path.relative(process.cwd(), out)}`
      );
    }
  }
}

main();
