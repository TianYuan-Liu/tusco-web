const express = require('express');
const path = require('path');
const cors = require('cors');
const registerApi = require('./server/api');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve data files statically
app.use('/data', express.static(path.join(__dirname, 'data')));

// Releases, tissue lists, statistics and bulk downloads (see server/api.js)
registerApi(app, __dirname);

// Catch-all handler to serve the React app for any route not handled by API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`React app is being served from the build directory`);
});