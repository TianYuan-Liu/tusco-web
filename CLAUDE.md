# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TUSCO Web is a React/TypeScript application for bioinformatics gene selection and benchmarking. It provides a web interface for analyzing GTF files from human and mouse datasets, featuring a gene selection pipeline and dual-faceted benchmarking capabilities.

## Development Commands

### Start Development
```bash
npm run dev          # Start both server and client concurrently
npm run client       # Start React development server only (port 3000)
npm run server       # Start Express server only (port 3001)
```

### Production Build
```bash
npm run build        # Build React app for production
npm start            # Run production server
```

### Testing
```bash
npm test             # Run React test suite in watch mode
```

## Architecture

See README.md for pages, data layout and API. In short:

- `data/releases.json` lists gene set releases; the paper release keeps its files in `data/human` and `data/mouse`
  (stable public URLs, identical to the files SQANTI3 bundles), later releases live in `data/releases/<id>/<species>/`.
- `scripts/build-catalog.js` turns each release's files into `data/catalog/<id>/<species>.json`, which the pages read.
  Rerun it whenever data changes.
- `server/api.js` holds the release-aware API shared by `server.js` (dev) and `server.prod.js` (production);
  release ids are looked up in `data/releases.json`, never joined into paths.
- Front end: `src/theme.ts` (light/dark tokens, chart colours), `src/data/catalog.ts` (types and loaders),
  `src/context/ReleaseContext.tsx` (selected release in `?release=`), pages in `src/pages`, charts and tables in
  `src/components`. `AnatomyMap` + `utils/svgTextLinker.ts` link the body-map SVG labels to tissue sets.
- Charts: single-series bars in the brand teal (`tokens.*.series`, validated for both themes), grey for
  de-emphasis, and a table view next to every chart.
- Genome browser: `src/pages/GenomeBrowser.tsx` (lazy-loaded) embeds `@jbrowse/react-linear-genome-view2`, which needs
  React 19.2 and MUI 7 (one shared copy). Tracks come from `data/jbrowse/` (`scripts/build_jbrowse_tracks.py`).

## Technology Stack

### Core Dependencies
- **React 18** with TypeScript
- **Material-UI (MUI) 5** for UI components with custom theme
- **React Router 6** for navigation
- **Framer Motion** for animations
- **Chart.js + react-chartjs-2** for data visualization
- **Express.js** for backend API

### Development Tools
- **Create React App** (CRA) configuration
- **Concurrently** for running client/server simultaneously
- **Nodemon** for server hot-reload

## Code Conventions

- Functional components with TypeScript interfaces; MUI `sx` for styling; colours from `src/theme.ts` tokens.
- Typography: the system font stack (San Francisco on Apple devices) for all text, `ui-monospace`/SF Mono for identifiers; no web fonts.
- Logo: `src/components/Logo.tsx`, inline SVG generated from `public/2025-4_Logos_AnaConesa_V3_tusco.svg`; favicons are SVG with PNG/ICO fallbacks.
- Build and test on Drago (no local builds): node_modules prepared off-cluster, Node from the `nodejs-wheel-binaries` wheel.
