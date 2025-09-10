/*
  Rename TSV files in data/human and data/mouse from UBERON:*.tsv to
  tusco_{species}_{normalized-tissue}.tsv, where the tissue name is parsed
  from the first header line:
  # Gene IDs passing expressed in <tissue> (UBERON:xxxxx) filter
*/

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');

function normalizeTissueName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function renameDir(species) {
  const dir = path.join(dataDir, species);
  if (!fs.existsSync(dir)) {
    console.warn(`[SKIP] Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.endsWith('.tsv')) continue;
    if (!file.startsWith('UBERON:')) continue; // only rename UBERON sources

    const full = path.join(dir, file);
    let header = '';
    try {
      const content = fs.readFileSync(full, 'utf8');
      header = content.split(/\r?\n/)[0] || '';
    } catch (e) {
      console.warn(`[WARN] Failed reading: ${full} -> ${e.message}`);
      continue;
    }

    const m = header.match(/#\s*Gene IDs passing expressed in\s+(.+)\s+\(UBERON:[^)]+\)\s+filter/i);
    if (!m) {
      console.warn(`[WARN] Header not matched for ${file}: '${header}'`);
      continue;
    }

    const tissue = m[1].trim();
    const base = normalizeTissueName(tissue);
    const targetName = `tusco_${species}_${base}.tsv`;
    const targetPath = path.join(dir, targetName);

    if (targetName === file) {
      console.log(`[OK] Already renamed: ${file}`);
      continue;
    }

    if (fs.existsSync(targetPath)) {
      // If the target exists, skip to avoid overwriting unintentionally
      console.warn(`[SKIP] Target exists, not overwriting: ${targetName}`);
      continue;
    }

    try {
      fs.renameSync(full, targetPath);
      console.log(`[RENAMED] ${file} -> ${targetName}`);
    } catch (e) {
      console.error(`[ERROR] Failed to rename ${file}: ${e.message}`);
    }
  }
}

function main() {
  renameDir('human');
  renameDir('mouse');
}

main();


