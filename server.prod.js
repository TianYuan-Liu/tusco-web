const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 3001;

// Production-specific CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://tusco.uv.es', 'https://www.tusco.uv.es']
    : '*'
}));

app.use(express.json({ limit: '50mb' }));

// Security headers for production
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1y',
  etag: false
}));

// Serve data files statically
app.use('/data', express.static(path.join(__dirname, 'data')));

// Helper to build tissue list for a species directory
function buildTissueList(dir, species) {
  const files = fs.readdirSync(dir);
  return files
    .filter((file) => {
      if (!file.endsWith('.tsv')) return false;
      // Exclude summary or aggregate files
      if (file === `tusco_${species}.tsv`) return false;
      if (file.includes('statistics') || file.includes('comprehensive')) return false;
      // Accept files with tusco_{species}_ prefix
      return file.startsWith(`tusco_${species}_`);
    })
    .map((file) => {
      const stats = fs.statSync(path.join(dir, file));
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Parse the new header format: "# Tissue: tissue name"
      let tissueName = null;
      for (const line of lines) {
        const match = line.match(/^# Tissue:\s*(.+)$/);
        if (match) {
          tissueName = match[1].trim();
          break;
        }
      }

      if (tissueName) {
        // Extract slug from filename for UBERON ID (fallback)
        const slug = file.replace(`tusco_${species}_`, '').replace('.tsv', '');
        const uberonId = `UBERON:${slug}`; // Fallback UBERON ID based on slug

        return {
          tissueName,
          uberonId,
          filename: file,
          originalFile: file,
          size: `${Math.round(stats.size / 1024)}KB`,
        };
      }
      return null;
    })
    .filter(Boolean);
}

// API endpoint to get human tissue data
app.get('/api/tissues/human', (req, res) => {
  const humanDir = path.join(__dirname, 'data', 'human');
  try {
    const tissueFiles = buildTissueList(humanDir, 'human');
    res.json(tissueFiles);
  } catch (err) {
    console.error('Error building human tissue list:', err);
    res.status(500).json({ error: 'Failed to read files' });
  }
});

// API endpoint to get mouse tissue data
app.get('/api/tissues/mouse', (req, res) => {
  const mouseDir = path.join(__dirname, 'data', 'mouse');
  try {
    const tissueFiles = buildTissueList(mouseDir, 'mouse');
    res.json(tissueFiles);
  } catch (err) {
    console.error('Error building mouse tissue list:', err);
    res.status(500).json({ error: 'Failed to read files' });
  }
});

// API endpoint to generate and download tissue statistics
app.get('/api/statistics/:species', (req, res) => {
  const { species } = req.params;

  if (species !== 'human' && species !== 'mouse') {
    return res.status(400).json({ error: 'Invalid species. Must be "human" or "mouse".' });
  }

  const dataDir = path.join(__dirname, 'data', species);
  const statsFilename = `tusco_${species}_tissue_statistics.tsv`;

  try {
    // Get all TSV files
    const files = fs.readdirSync(dataDir);
    const tsvFiles = files.filter((file) => {
      if (!file.endsWith('.tsv')) return false;
      // Exclude aggregate/statistics files
      if (file === `tusco_${species}.tsv`) return false;
      if (file.includes('statistics') || file.includes('comprehensive')) return false;
      // Include only tissue-specific files
      return file.startsWith(`tusco_${species}_`);
    });

    // Extract tissue name and gene count from each file
    const tissueStats = [];
    for (const file of tsvFiles) {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      let tissueName = null;
      let geneCount = null;

      // Parse header comments
      for (const line of lines) {
        if (line.startsWith('# Tissue:')) {
          tissueName = line.replace('# Tissue:', '').trim();
        } else if (line.startsWith('# Gene Count:')) {
          geneCount = parseInt(line.replace('# Gene Count:', '').trim(), 10);
        }
        // Stop reading after data starts
        if (!line.startsWith('#') && line.trim() !== '') break;
      }

      if (tissueName && geneCount) {
        tissueStats.push({ tissueName, geneCount });
      }
    }

    // Sort by gene count descending
    tissueStats.sort((a, b) => b.geneCount - a.geneCount);

    // Generate TSV content
    let tsvContent = 'Anatomical_Entity_Name\tNumber_of_TUSCO_Genes\n';
    for (const stat of tissueStats) {
      tsvContent += `${stat.tissueName}\t${stat.geneCount}\n`;
    }

    // Set response headers for TSV download
    res.setHeader('Content-Type', 'text/tab-separated-values');
    res.setHeader('Content-Disposition', `attachment; filename="${statsFilename}"`);
    res.send(tsvContent);

    console.log(`Statistics generated for ${species}: ${tissueStats.length} tissues`);
  } catch (err) {
    console.error('Error generating statistics:', err);
    res.status(500).json({ error: 'Failed to generate statistics' });
  }
});

// API endpoint to download all tissue files as ZIP
app.get('/api/download/bulk/:species', (req, res) => {
  const { species } = req.params;

  if (species !== 'human' && species !== 'mouse') {
    return res.status(400).json({ error: 'Invalid species. Must be "human" or "mouse".' });
  }

  const dataDir = path.join(__dirname, 'data', species);
  const zipFilename = `tusco_${species}_all_tissues.zip`;

  try {
    // Set response headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

    // Create archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle archiver errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({ error: 'Failed to create archive' });
    });

    // Pipe archive to response
    archive.pipe(res);

    // Get all TSV files
    const files = fs.readdirSync(dataDir);
    const tsvFiles = files.filter((file) => {
      if (!file.endsWith('.tsv')) return false;
      // Exclude aggregate/statistics files from bulk download
      if (file === `tusco_${species}.tsv`) return false;
      if (file.includes('statistics') || file.includes('comprehensive')) return false;
      // Include only tissue-specific files
      return file.startsWith(`tusco_${species}_`);
    });

    // Add each file to the archive
    tsvFiles.forEach((file) => {
      const filePath = path.join(dataDir, file);
      archive.file(filePath, { name: file });
    });

    // Finalize the archive
    archive.finalize();

    console.log(`Bulk download initiated: ${zipFilename} with ${tsvFiles.length} files`);
  } catch (err) {
    console.error('Error creating bulk download:', err);
    res.status(500).json({ error: 'Failed to create download' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all handler to serve the React app for any route not handled by API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`TUSCO Web Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`React app served from: ${path.join(__dirname, 'build')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
