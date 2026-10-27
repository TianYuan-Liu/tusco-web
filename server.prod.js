const express = require('express');
const path = require('path');
const cors = require('cors');
const registerApi = require('./server/api');

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
// Hashed bundles are cached for a year; index.html names them, so it must be revalidated on every visit
// (a cached index.html would keep a returning visitor on an old, possibly deleted, bundle)
const noCacheIndex = (res, filePath) => {
  if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
};
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1y',
  etag: false,
  setHeaders: noCacheIndex,
}));

// Serve data files statically
app.use('/data', express.static(path.join(__dirname, 'data')));

// Releases, tissue lists, statistics and bulk downloads (see server/api.js)
registerApi(app, __dirname);

// Catch-all handler to serve the React app for any route not handled by API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'), { headers: { 'Cache-Control': 'no-cache' } });
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
