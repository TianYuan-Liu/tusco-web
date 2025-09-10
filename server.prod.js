const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Production-specific middleware
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

// Serve GTF files statically with proper headers
app.use('/data', express.static(path.join(__dirname, 'data'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.gtf')) {
      res.setHeader('Content-Type', 'text/plain');
    }
  }
}));

// API endpoint to list human GTF files
app.get('/api/files/human', (req, res) => {
  const humanDir = path.join(__dirname, 'data', 'human');
  
  fs.readdir(humanDir, (err, files) => {
    if (err) {
      console.error('Error reading human files:', err);
      return res.status(500).json({ error: 'Failed to read files' });
    }

    const gtfFiles = files
      .filter(file => file.endsWith('.gtf'))
      .map(file => {
        try {
          const stats = fs.statSync(path.join(humanDir, file));
          return {
            name: file,
            size: formatFileSize(stats.size),
            path: file,
            modified: stats.mtime
          };
        } catch (error) {
          console.error(`Error reading file ${file}:`, error);
          return null;
        }
      })
      .filter(Boolean);

    res.json(gtfFiles);
  });
});

// API endpoint to list mouse GTF files
app.get('/api/files/mouse', (req, res) => {
  const mouseDir = path.join(__dirname, 'data', 'mouse');
  
  fs.readdir(mouseDir, (err, files) => {
    if (err) {
      console.error('Error reading mouse files:', err);
      return res.status(500).json({ error: 'Failed to read files' });
    }

    const gtfFiles = files
      .filter(file => file.endsWith('.gtf'))
      .map(file => {
        try {
          const stats = fs.statSync(path.join(mouseDir, file));
          return {
            name: file,
            size: formatFileSize(stats.size),
            path: file,
            modified: stats.mtime
          };
        } catch (error) {
          console.error(`Error reading file ${file}:`, error);
          return null;
        }
      })
      .filter(Boolean);

    res.json(gtfFiles);
  });
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

// Helper function to format file sizes
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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