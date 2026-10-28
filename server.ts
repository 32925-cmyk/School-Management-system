/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Data persistence directory
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const ZIP_FILE = path.join(PUBLIC_DIR, 'aurelian-heights-academy.zip');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

async function startServer() {
  const app = express();

  // Increase payload limit for full JSON database sync & bulk student imports
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static assets from /public (e.g. ZIP file, static uploads)
  app.use(express.static(PUBLIC_DIR));

  // ─────────────────────────────────────────────────────────────
  // BACKEND API ROUTES
  // ─────────────────────────────────────────────────────────────

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      institution: 'Aurelian Heights Academy',
      version: '2.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      databaseConnected: fs.existsSync(DB_FILE),
    });
  });

  // Get current database state
  app.get('/api/db', (_req: Request, res: Response) => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        return res.json(parsed);
      }
      return res.status(404).json({ message: 'No server database found. Initializing client seed.' });
    } catch (err: any) {
      console.error('Error reading server database:', err);
      return res.status(500).json({ error: 'Failed to read server database', details: err.message });
    }
  });

  // Persist updated database state
  app.post('/api/db', (req: Request, res: Response) => {
    try {
      const dbData = req.body;
      if (!dbData || typeof dbData !== 'object') {
        return res.status(400).json({ error: 'Invalid database payload' });
      }

      // Write atomically using temporary file
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(dbData, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);

      return res.json({
        success: true,
        message: 'Database persisted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error writing server database:', err);
      return res.status(500).json({ error: 'Failed to save server database', details: err.message });
    }
  });

  // Reset database state
  app.post('/api/db/reset', (_req: Request, res: Response) => {
    try {
      if (fs.existsSync(DB_FILE)) {
        fs.unlinkSync(DB_FILE);
      }
      return res.json({ success: true, message: 'Server database reset to clean state' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Reset failed', details: err.message });
    }
  });

  // Download project zip archive
  app.get('/api/download-zip', (_req: Request, res: Response) => {
    if (fs.existsSync(ZIP_FILE)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="aurelian-heights-academy.zip"');
      return res.sendFile(ZIP_FILE);
    }
    return res.status(404).json({ error: 'Archive not generated yet. Please wait or trigger pack script.' });
  });

  // Download project tar.gz archive
  app.get('/api/download-tar', (_req: Request, res: Response) => {
    const tarFile = path.join(PUBLIC_DIR, 'aurelian-heights-academy.tar.gz');
    if (fs.existsSync(tarFile)) {
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', 'attachment; filename="aurelian-heights-academy.tar.gz"');
      return res.sendFile(tarFile);
    }
    return res.status(404).json({ error: 'TAR.GZ archive not found.' });
  });

  // ─────────────────────────────────────────────────────────────
  // FRONTEND INTEGRATION (Vite dev middlewares or static production)
  // ─────────────────────────────────────────────────────────────

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aurelian Heights SMS] Server listening on port ${PORT} (isProd: ${isProd})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
