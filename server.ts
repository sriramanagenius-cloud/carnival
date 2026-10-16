import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { createInitialProjects, INITIAL_SETTINGS } from './src/initialData.ts';
import { Project, DashboardSettings } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOADS_DIR));

let inMemoryProjects: Project[] = [];
let inMemorySettings: DashboardSettings = { ...INITIAL_SETTINGS };

function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.projects) && data.projects.length >= 10 && data.projects[0]?.contentType !== undefined) {
        inMemoryProjects = data.projects;
        if (data.settings) {
          inMemorySettings = { ...INITIAL_SETTINGS, ...data.settings };
        }
        return;
      }
    }
  } catch (err) {
    console.error('Error loading database file, falling back to initial data:', err);
  }

  // Initialize with clean Project 01 - Project 50 empty slots
  inMemoryProjects = createInitialProjects();
  saveDatabase();
}

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(
        {
          projects: inMemoryProjects,
          settings: inMemorySettings,
          lastSaved: Date.now(),
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

loadDatabase();

// --- API Endpoints ---

// 1. Get all projects & current settings
app.get('/api/projects', (req, res) => {
  const count = inMemorySettings.projectCount || 15;
  const sliced = inMemoryProjects.slice(0, count);

  res.json({
    projects: sliced,
    totalConfigured: inMemoryProjects.length,
    totalActive: sliced.length,
    settings: inMemorySettings,
    serverTime: Date.now(),
  });
});

// 2. Get single project by ID
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const project = inMemoryProjects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ error: `Project ${id} not found.` });
  }

  res.json({
    project,
    settings: inMemorySettings,
    serverTime: Date.now(),
  });
});

// 3. Update project content (HTML, Python, Browser link, custom heading)
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const index = inMemoryProjects.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Project ${id} not found.` });
  }

  const updates = req.body;
  const current = inMemoryProjects[index];

  inMemoryProjects[index] = {
    ...current,
    name: updates.name || current.name,
    customHeading: updates.customHeading !== undefined ? updates.customHeading : current.customHeading,
    category: updates.category || current.category,
    contentType: updates.contentType || current.contentType,
    contentData: updates.contentData !== undefined ? updates.contentData : current.contentData,
    pythonOutput: updates.pythonOutput !== undefined ? updates.pythonOutput : current.pythonOutput,
    imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : current.imageUrl,
    uploadedImages: updates.uploadedImages !== undefined ? updates.uploadedImages : current.uploadedImages,
    lastUpdated: Date.now(),
  };

  saveDatabase();

  res.json({
    success: true,
    project: inMemoryProjects[index],
  });
});

// 4. Image Upload Endpoint (supports Base64 data URL)
app.post('/api/upload', (req, res) => {
  const { filename, data } = req.body;
  if (!data || typeof data !== 'string') {
    return res.status(400).json({ error: 'No image data provided' });
  }

  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    let buffer: Buffer;
    let ext = '.png';

    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1].toLowerCase();
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
      else if (mime.includes('png')) ext = '.png';
      else if (mime.includes('svg')) ext = '.svg';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('gif')) ext = '.gif';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(data, 'base64');
    }

    const cleanBase = filename
      ? path.parse(filename).name.replace(/[^a-zA-Z0-9_-]/g, '_')
      : 'sustainability_image';
    const safeName = `${Date.now()}_${cleanBase}${ext}`;
    const filePath = path.resolve(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: safeName,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to process image upload' });
  }
});

// 5. Get List of Uploaded Images
app.get('/api/images', (req, res) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return res.json({ images: [] });
    }
    const files = fs.readdirSync(UPLOADS_DIR);
    const images = files
      .filter((f) => /\.(png|jpe?g|svg|webp|gif)$/i.test(f))
      .map((f) => ({
        filename: f,
        url: `/uploads/${f}`,
        uploadedAt: fs.statSync(path.resolve(UPLOADS_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.uploadedAt - a.uploadedAt);

    res.json({ images });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Run Python Script Endpoint
app.post('/api/run-python', (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'No Python code provided' });
  }

  const tempFilePath = path.resolve(DATA_DIR, `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);

  try {
    fs.writeFileSync(tempFilePath, code, 'utf-8');

    // Execute with a 7 second timeout
    exec(`python3 "${tempFilePath}"`, { timeout: 7000 }, (error, stdout, stderr) => {
      // Clean up temp file
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      } catch (e) {}

      if (error) {
        return res.json({
          success: false,
          output: stderr || error.message,
          error: error.message,
        });
      }

      return res.json({
        success: true,
        output: stdout || '(Code executed successfully with no output)',
      });
    });
  } catch (err: any) {
    try {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    } catch (e) {}
    res.status(500).json({ error: err.message });
  }
});

// 5. Update settings (project count 10-50)
app.get('/api/settings', (req, res) => {
  res.json({
    settings: inMemorySettings,
    totalConfigured: inMemoryProjects.length,
  });
});

app.post('/api/settings', (req, res) => {
  const updates = req.body;

  if (updates.projectCount !== undefined) {
    const val = parseInt(updates.projectCount, 10);
    if (!isNaN(val) && val >= 10 && val <= 50) {
      inMemorySettings.projectCount = val;
    }
  }

  saveDatabase();

  res.json({
    success: true,
    settings: inMemorySettings,
  });
});

// 6. Reset database
app.post('/api/reset', (req, res) => {
  inMemoryProjects = createInitialProjects();
  inMemorySettings = { ...INITIAL_SETTINGS };
  saveDatabase();
  res.json({ success: true, message: 'All widgets reset to empty slots' });
});

// Launch server with Vite middleware in dev, static files in production
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Explicit SPA fallback for deep links (e.g. /widget/:projectId)
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Command Center server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
