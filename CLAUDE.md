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

### Full-Stack Structure
- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Express.js server serving GTF files and React build
- **Data**: GTF files stored in `data/human/` and `data/mouse/` directories

### Key Directories
```
src/
├── components/          # Reusable React components
│   ├── GTFFileList.tsx     # File listing component
│   ├── GeneSelectionPipeline.tsx  # Main pipeline interface
│   └── Navbar.tsx          # Navigation component
├── pages/              # Route-based page components
│   ├── Home.tsx           # Landing page
│   ├── HumanData.tsx      # Human GTF data page
│   ├── MouseData.tsx      # Mouse GTF data page
│   └── PipelinePage.tsx   # Pipeline workflow page
data/
├── human/             # Human GTF files
└── mouse/             # Mouse GTF files
```

### React Router Structure
- `/` - Home page with feature overview
- `/human` - Human tissue data browser with downloadable TSV files
- `/mouse` - Mouse tissue data browser with downloadable TSV files  
- `/pipeline` - Gene selection pipeline interface

### Backend API Endpoints
- `GET /api/tissues/human` - Get human tissue data with TSV file mappings
- `GET /api/tissues/mouse` - Get mouse tissue data with TSV file mappings
- `GET /data/*` - Static file serving for TSV data files

### Data Structure
TSV files are organized by UBERON tissue ontology IDs and served with friendly tissue names. Each file contains TUSCO gene annotations for tissue-specific expression filtering.

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

### Styling & Theme
- Custom Material-UI theme with primary color `#2a9d8f` (teal)
- Consistent use of `borderRadius: 16px` for modern appearance
- Framer Motion animations for enhanced UX
- Typography uses Inter font family

### Component Patterns
- Functional components with TypeScript interfaces
- Material-UI's `sx` prop for styling
- Consistent error handling in API calls
- Page-based routing with dedicated components

### File Organization
- Components are self-contained with embedded styles
- Pages handle route-specific logic and data fetching
- Server-side file serving for GTF data access

## Development Notes

### Server Configuration
The Express server runs on port 3001 and serves both the API and static React build. During development, the React dev server proxies API calls to the Express server.

### Data Structure
GTF files are organized by species (human/mouse) and served statically through Express middleware. The API endpoints provide file metadata including name, size, and path.

### Build Process
Uses Create React App's standard build process. The server serves the built React app from the `build/` directory in production.