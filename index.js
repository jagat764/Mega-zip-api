const express = require('express');
const cors = require('cors');
const mega = require('megajs');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

app.get('/api/zip', async (req, res) => {
  const { url } = req.query;

  if (!url || !url.includes('#')) {
    return res.status(400).json({ error: 'Missing or invalid MEGA URL (must include decryption key)' });
  }

  try {
    const file = mega.File.fromURL(url);
    await new Promise((resolve, reject) => file.load(err => (err ? reject(err) : resolve())));

    if (!file.children || file.children.length === 0) {
      return res.status(404).json({ error: 'No files found in folder' });
    }

    res.setHeader('Content-Disposition', 'attachment; filename=mega-folder.zip');
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const child of file.children) {
      const stream = child.download();
      archive.append(stream, { name: child.name });
    }

    archive.finalize();
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ error: 'Failed to create ZIP from MEGA folder' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ MEGA ZIP API is running. Use /api/zip?url=https://mega.nz/folder/xxx#yyy');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
