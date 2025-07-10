const express = require('express');
const cors = require('cors');
const fs = require('fs');
const archiver = require('archiver');
const { Folder } = require('megajs');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('✅ MEGA ZIP API is running.');
});

app.get('/api/zip', async (req, res) => {
  const { url } = req.query;

  if (!url || !url.startsWith('https://mega.nz/folder/')) {
    return res.status(400).json({ error: 'Invalid or missing MEGA folder URL' });
  }

  console.log('➡️ Request for ZIP:', url);

  try {
    const folder = Folder.fromURL(url);
    await folder.loadAttributes();

    const zipId = crypto.randomBytes(4).toString('hex');
    const zipName = `mega_${zipId}.zip`;

    res.setHeader('Content-Disposition', `attachment; filename=${zipName}`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const file of folder.children) {
      if (!file.download) continue;

      console.log(`📦 Adding: ${file.name}`);
      const stream = file.download();
      archive.append(stream, { name: file.name });
    }

    archive.finalize();
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Failed to create ZIP from MEGA folder' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
