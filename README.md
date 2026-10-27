# TUSCO website

Source of [tusco.uv.es](https://tusco.uv.es), the browser and download site for the TUSCO gene sets
(Liu et al., *Nature Communications* 17, 5654 (2026), [doi:10.1038/s41467-026-72089-1](https://doi.org/10.1038/s41467-026-72089-1)).
The gene sets are built with `tusco_selector` from [ConesaLab/tusco-paper](https://github.com/ConesaLab/tusco-paper).

React 18 + TypeScript + MUI 5 front end (Create React App), Express server (`server.prod.js`) for the API and the data files.

## Pages

| Route | Content |
|---|---|
| `/` | Overview, gene counts, selection funnel, changes since the previous release |
| `/explore/human`, `/explore/mouse` | Universal gene table; tissue sets as chart, table or body map (the selected tissue is highlighted on the map), with each tissue's genes |
| `/browser/human`, `/browser/mouse` | JBrowse 2 linear genome view of the TUSCO genes (`?gene=<Ensembl id or symbol>`), loaded on demand |
| `/downloads` | Universal TSV/GTF, all tissue sets as ZIP, provenance files, all releases (`/downloads/human` and `/downloads/mouse` still work) |
| `/method` | Selection steps, genes left after each step, settings changed since the previous release (`/pipeline` redirects here) |
| `/releases` | Release list and gene-level comparison of the current release with the previous one |
| `/cite` | Reference and BibTeX |

Every page takes `?release=<id>`; without it the current release is shown.

## Data and releases

- `data/releases.json` lists the releases (annotation versions, funnel counts, changed settings) and names the current one.
- The paper release (2025.10) keeps its files in `data/human/` and `data/mouse/`, so links such as
  `https://tusco.uv.es/data/human/tusco_human.tsv` keep serving the published sets. These are the same files SQANTI3 bundles for `--tusco`.
- Later releases live in `data/releases/<id>/{human,mouse}/`: `tusco_<species>.tsv/.gtf`, one `tusco_<species>_<tissue>.tsv/.gtf.gz`
  per tissue, `changes_vs_published.tsv`, `run_parameters.json` and `gene_filter_log.tsv` from the `tusco_selector` run.
- `data/catalog/<id>/<species>.json` is generated from those files and is what the pages read. Rebuild it after adding or changing data:

```bash
node scripts/build-catalog.js
```

- `data/jbrowse/<id>/<species>/` holds the genome browser tracks: `chrom.sizes` (no sequence is served),
  `tusco_universal.gff3`, `tusco_tissues.gff3` and `gencode.gff3.gz` (+ `.tbi`), the GENCODE genes within 50 kb of a
  TUSCO gene of the release or of the previous one. Build them with `scripts/build_jbrowse_tracks.py` (needs `pysam`),
  giving it the GENCODE GTF and GFF3 of the release and the RefSeq assembly report; see the script's docstring.

To add a release: copy the selector outputs to `data/releases/<id>/<species>/`, add an entry to `data/releases.json`
(set `previous` and, to make it the default, `current`), run the catalog script and the track script, build and deploy.

## API

All endpoints take an optional `?release=<id>` (default: current release).

- `GET /api/releases`: contents of `data/releases.json`
- `GET /api/tissues/:species`: tissue tables with file URLs
- `GET /api/statistics/:species`: genes per tissue as TSV
- `GET /api/download/bulk/:species`: all tissue tables (TSV, plus GTF where available) as ZIP
- `GET /api/health`

## Development

```bash
npm ci
npm run dev      # Express on :3001 and the React dev server on :3000
npm run build    # production build into build/
npm test
```

Deployment on the server (`./deploy.sh`) pulls `master`, installs, builds into `build.next` (the live `build/` is replaced
only when the build succeeds), installs the Apache config and restarts the PM2 process; see `DEPLOYMENT.md`. The genome
browser needs `data:` in the CSP `connect-src` of `apache-config/tusco-web.conf`: JBrowse loads its gzip decoder as an
inline WebAssembly module.

`index.html` is served with `Cache-Control: no-cache`; the hashed bundles are cached for a year. Until 2026-10 the server
also cached `index.html` for a year, so browsers that visited the old site may still load its page, which asks for
`/static/js/main.3403a7ca.js`. That bundle is kept in `public/static/js/` so those visitors do not get a blank page;
it can be deleted after November 2027.
