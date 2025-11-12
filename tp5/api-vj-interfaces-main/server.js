const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

app.get('/api', async (req, res) => {
  try {
    // read games.json
    const data = await fs.promises.readFile('games.json', 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v2', async (req, res) => {
  try {
    // read games.json
    const data = await fs.promises.readFile('games_v2.1.json', 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
