const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

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
      // Accept both old UBERON files and already-renamed tusco_* files
      return file.startsWith('UBERON:') || file.startsWith(`tusco_${species}_`);
    })
    .map((file) => {
      const stats = fs.statSync(path.join(dir, file));
      const filePath = path.join(dir, file);
      const firstLine = fs.readFileSync(filePath, 'utf-8').split('\n')[0];
      const match = firstLine.match(/# Gene IDs passing expressed in (.+) \((.+)\) filter/);
      if (match) {
        const tissueName = match[1];
        const uberonId = match[2];
        const friendly = `tusco_${species}_${tissueName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.tsv`;
        return {
          tissueName,
          uberonId,
          filename: friendly,
          originalFile: file.startsWith(`tusco_${species}_`) ? file : friendly,
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

// Catch-all handler to serve the React app for any route not handled by API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`React app is being served from the build directory`);
});