// Release-aware API shared by server.js (development) and server.prod.js (production).
//
// Releases are listed in data/releases.json. Every endpoint takes an optional
// ?release=<id> (default: the current release); ids are looked up in that file
// and never joined into a path directly.
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const SPECIES = new Set(['human', 'mouse']);

function registerApi(app, rootDir) {
  const dataDir = path.join(rootDir, 'data');

  const readReleases = () => JSON.parse(fs.readFileSync(path.join(dataDir, 'releases.json'), 'utf8'));

  // Resolve species + ?release= to the release's data directory, or answer with an error
  function resolve(req, res) {
    const { species } = req.params;
    if (!SPECIES.has(species)) {
      res.status(400).json({ error: 'Invalid species. Must be "human" or "mouse".' });
      return null;
    }
    const { current, releases } = readReleases();
    const id = req.query.release || current;
    const release = releases.find((r) => r.id === id);
    if (!release) {
      res.status(404).json({ error: `Unknown release "${id}"` });
      return null;
    }
    const rel = release.species[species].dir;
    return { species, release, dir: path.join(dataDir, rel), base: `/data/${rel}` };
  }

  // Tissue tables of a release: tusco_<species>_<slug>.tsv files with a "# Tissue:" header
  function tissueTables(dir, species) {
    const prefix = `tusco_${species}_`;
    return fs
      .readdirSync(dir)
      .filter((file) => file.startsWith(prefix) && file.endsWith('.tsv'))
      .map((file) => {
        const text = fs.readFileSync(path.join(dir, file), 'utf-8');
        const name = (text.match(/^# Tissue:\s*(.+)$/m) || [])[1];
        if (!name) return null; // statistics and exon-class tables
        const count = (text.match(/^# Gene Count:\s*(\d+)/m) || [])[1];
        const slug = file.slice(prefix.length, -4);
        const gtf = `${prefix}${slug}.gtf.gz`;
        return {
          file,
          slug,
          name: name.trim(),
          count: count ? parseInt(count, 10) : null,
          gtf: fs.existsSync(path.join(dir, gtf)) ? gtf : null,
          size: fs.statSync(path.join(dir, file)).size,
        };
      })
      .filter(Boolean);
  }

  app.get('/api/releases', (req, res) => {
    try {
      res.json(readReleases());
    } catch (err) {
      console.error('Error reading releases:', err);
      res.status(500).json({ error: 'Failed to read releases' });
    }
  });

  // Tissue list (same fields as before, plus the release and the file URLs)
  app.get('/api/tissues/:species', (req, res) => {
    const r = resolve(req, res);
    if (!r) return;
    try {
      res.json(
        tissueTables(r.dir, r.species).map((t) => ({
          tissueName: t.name,
          uberonId: `UBERON:${t.slug}`, // historical field: the file slug, not a real UBERON id
          filename: t.file,
          originalFile: t.file,
          size: `${Math.round(t.size / 1024)}KB`,
          release: r.release.id,
          url: `${r.base}/${t.file}`,
          gtfUrl: t.gtf ? `${r.base}/${t.gtf}` : null,
        }))
      );
    } catch (err) {
      console.error(`Error building ${r.species} tissue list:`, err);
      res.status(500).json({ error: 'Failed to read files' });
    }
  });

  // Genes per tissue as a TSV download
  app.get('/api/statistics/:species', (req, res) => {
    const r = resolve(req, res);
    if (!r) return;
    try {
      const stats = tissueTables(r.dir, r.species)
        .filter((t) => t.count !== null)
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
      const tsv =
        'Anatomical_Entity_Name\tNumber_of_TUSCO_Genes\n' + stats.map((t) => `${t.name}\t${t.count}\n`).join('');
      res.setHeader('Content-Type', 'text/tab-separated-values');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="tusco_${r.species}_${r.release.id}_tissue_statistics.tsv"`
      );
      res.send(tsv);
    } catch (err) {
      console.error('Error generating statistics:', err);
      res.status(500).json({ error: 'Failed to generate statistics' });
    }
  });

  // All tissue tables of a release as one ZIP (TSV, plus GTF where the release has them)
  app.get('/api/download/bulk/:species', (req, res) => {
    const r = resolve(req, res);
    if (!r) return;
    try {
      const tables = tissueTables(r.dir, r.species);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="tusco_${r.species}_${r.release.id}_all_tissues.zip"`
      );
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        res.destroy(err);
      });
      archive.pipe(res);
      for (const t of tables) {
        archive.file(path.join(r.dir, t.file), { name: `tsv/${t.file}` });
        if (t.gtf) archive.file(path.join(r.dir, t.gtf), { name: `gtf/${t.gtf}` });
      }
      archive.finalize();
      console.log(`Bulk download: ${r.species} ${r.release.id}, ${tables.length} tissues`);
    } catch (err) {
      console.error('Error creating bulk download:', err);
      res.status(500).json({ error: 'Failed to create download' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });
}

module.exports = registerApi;
