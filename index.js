const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 10000;

app.use(cors());

app.get('/api/zip', (req, res) => {
  const { folder, key } = req.query;

  if (!folder || !key) {
    return res.status(400).json({ error: 'Missing folder or decryption key' });
  }

  const zipUrl = `https://mega.nz/zip/${folder}#${key}`;
  return res.json({ zipUrl });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
