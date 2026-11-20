import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type {
  CategoryId,
  FolderItem,
  PortfolioData,
  PortfolioFile,
  PortfolioProfile,
  Project,
} from './src/types/portfolio';
import {
  detectFileTypeGroup,
  getDescendantFolderIds,
} from './src/utils/portfolioLogic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_PATH = path.resolve(DATA_DIR, 'portfolio.json');

function ensureStorageDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function buildMinimalPdfBuffer(title: string, lines: string[]): Buffer {
  const safeText = (s: string) =>
    s
      .replace(/[^\x20-\x7E]/g, (ch) => {
        const map: Record<string, string> = {
          á: 'a',
          é: 'e',
          í: 'i',
          ó: 'o',
          ú: 'u',
          Á: 'A',
          É: 'E',
          Í: 'I',
          Ó: 'O',
          Ú: 'U',
          ñ: 'n',
          Ñ: 'N',
          ü: 'u',
        };
        return map[ch] || ' ';
      })
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

  const streamCommands = [
    'BT',
    '/F1 18 Tf',
    '54 740 Td',
    `(${safeText(title)}) Tj`,
    '/F1 11 Tf',
    '0 -28 Td',
    ...lines.flatMap((line) => [`(${safeText(line)}) Tj`, '0 -18 Td']),
    'ET',
  ].join('\n');

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamCommands, 'utf8')} >>\nstream\n${streamCommands}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

function createInitialSeed(): PortfolioData {
  ensureStorageDirs();

  // Write real sample files to disk so preview & download work immediately
  const pdfStorageName = 'seed-cronologia-cientificos.pdf';
  const pdfBuffer = buildMinimalPdfBuffer('Investigacion Cientifica: Cronologia', [
    'Archivo de muestra - Portafolio Virtual Personal',
    ' ',
    '1. Isaac Newton (1687) - Leyes del movimiento y gravitacion universal.',
    '2. Marie Curie (1898) - Descubrimiento del polonio y el radio.',
    '3. Rosalind Franklin (1952) - Difraccion de rayos X y estructura del ADN.',
    '4. Emmy Noether (1918) - Teorema de simetria y leyes de conservacion.',
    ' ',
    'Estado del proyecto: En proceso. Incluye notas de laboratorio y bibliografia.',
  ]);
  fs.writeFileSync(path.join(UPLOADS_DIR, pdfStorageName), pdfBuffer);

  const mdStorageName = 'seed-bitacora-investigacion.md';
  fs.writeFileSync(
    path.join(UPLOADS_DIR, mdStorageName),
    `# Bitácora de Investigación Científica\n\n## Objetivo\nRecopilar descubrimientos clave en física, química y biología moderna con fuentes primarias verificadas.\n\n## Avances actuales\n- Revisión bibliográfica de óptica clásica y moderna.\n- Fichas biográficas de 8 científicos fundamentales.\n- Pendiente: completar sección de metodología experimental.\n`,
    'utf8'
  );

  const svgStorageName = 'seed-infografia-filosofia.svg';
  fs.writeFileSync(
    path.join(UPLOADS_DIR, svgStorageName),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#f8f7f4"/>
  <rect x="40" y="40" width="720" height="420" fill="#ffffff" stroke="#d4d4d8" stroke-width="1.5" rx="12"/>
  <text x="80" y="105" font-family="sans-serif" font-size="28" font-weight="700" fill="#18181b">Filosofía Contemporánea</text>
  <text x="80" y="138" font-family="sans-serif" font-size="15" fill="#52525b">Mapa conceptual de corrientes del siglo XX y XXI</text>
  <line x1="80" y1="165" x2="720" y2="165" stroke="#e4e4e7" stroke-width="1"/>
  <rect x="80" y="195" width="190" height="190" rx="8" fill="#f4f4f5" stroke="#e4e4e7"/>
  <text x="100" y="232" font-family="sans-serif" font-size="16" font-weight="600" fill="#18181b">Fenomenología</text>
  <text x="100" y="262" font-family="sans-serif" font-size="13" fill="#52525b">Husserl, Heidegger</text>
  <text x="100" y="285" font-family="sans-serif" font-size="13" fill="#52525b">Experiencia vivida</text>
  <rect x="305" y="195" width="190" height="190" rx="8" fill="#f4f4f5" stroke="#e4e4e7"/>
  <text x="325" y="232" font-family="sans-serif" font-size="16" font-weight="600" fill="#18181b">Filosofía Analítica</text>
  <text x="325" y="262" font-family="sans-serif" font-size="13" fill="#52525b">Wittgenstein, Russell</text>
  <text x="325" y="285" font-family="sans-serif" font-size="13" fill="#52525b">Lenguaje y lógica</text>
  <rect x="530" y="195" width="190" height="190" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="550" y="232" font-family="sans-serif" font-size="16" font-weight="600" fill="#1d4ed8">Teoría Crítica</text>
  <text x="550" y="262" font-family="sans-serif" font-size="13" fill="#3f3f46">Adorno, Habermas</text>
  <text x="550" y="285" font-family="sans-serif" font-size="13" fill="#3f3f46">Sociedad y razón</text>
</svg>`,
    'utf8'
  );

  const scriptStorageName = 'seed-guion-presentacion-ciencias.txt';
  fs.writeFileSync(
    path.join(UPLOADS_DIR, scriptStorageName),
    `PRESENTACIÓN DE CIENCIAS: ÓPTICA Y DISPERSIÓN DE LA LUZ\n=======================================================\n\nDiapositiva 1: Introducción al espectro electromagnético.\nDiapositiva 2: Experimento del prisma de Newton y refracción.\nDiapositiva 3: Aplicaciones contemporáneas en espectroscopía.\nDiapositiva 4: Conclusiones y referencias académicas.\n`,
    'utf8'
  );

  const folders: FolderItem[] = [
    {
      id: 'folder-inv-1',
      name: 'Fuentes y Cronologías',
      categoryId: 'investigaciones',
      parentId: null,
      createdAt: '2026-10-15',
    },
    {
      id: 'folder-inv-2',
      name: 'Notas de Campo',
      categoryId: 'investigaciones',
      parentId: 'folder-inv-1',
      createdAt: '2026-10-18',
    },
    {
      id: 'folder-esc-1',
      name: 'Filosofía y Humanidades',
      categoryId: 'trabajos-escolares',
      parentId: null,
      createdAt: '2026-09-28',
    },
    {
      id: 'folder-exp-1',
      name: 'Ponencias 2026',
      categoryId: 'exposiciones',
      parentId: null,
      createdAt: '2026-11-02',
    },
  ];

  const files: PortfolioFile[] = [
    {
      id: 'file-seed-1',
      name: 'Cronología de Científicos.pdf',
      originalName: 'Cronología de Científicos.pdf',
      mimeType: 'application/pdf',
      size: pdfBuffer.length,
      fileType: 'pdf',
      categoryId: 'investigaciones',
      folderId: 'folder-inv-1',
      projectId: 'proj-1',
      description: 'Resumen documental con hitos históricos y descubrimientos científicos.',
      course: 'Metodología de la Investigación',
      tags: ['ciencia', 'historia', 'pdf'],
      createdAt: '2026-11-12',
      favorite: true,
      storageName: pdfStorageName,
      url: '/api/files/file-seed-1/content',
    },
    {
      id: 'file-seed-2',
      name: 'Bitácora de Investigación.md',
      originalName: 'Bitácora de Investigación.md',
      mimeType: 'text/markdown',
      size: fs.statSync(path.join(UPLOADS_DIR, mdStorageName)).size,
      fileType: 'texto',
      categoryId: 'investigaciones',
      folderId: 'folder-inv-2',
      projectId: 'proj-1',
      description: 'Registro de avances, hipótesis y referencias bibliográficas.',
      course: 'Metodología de la Investigación',
      tags: ['bitácora', 'ciencia'],
      createdAt: '2026-11-14',
      favorite: false,
      storageName: mdStorageName,
      url: '/api/files/file-seed-2/content',
    },
    {
      id: 'file-seed-3',
      name: 'Esquema Filosofía Contemporánea.svg',
      originalName: 'Esquema Filosofía Contemporánea.svg',
      mimeType: 'image/svg+xml',
      size: fs.statSync(path.join(UPLOADS_DIR, svgStorageName)).size,
      fileType: 'imagen',
      categoryId: 'imagenes-disenos',
      folderId: null,
      projectId: 'proj-2',
      description: 'Lámina visual comparativa entre fenomenología, analítica y teoría crítica.',
      course: 'Filosofía Contemporánea',
      tags: ['filosofía', 'infografía', 'diseño'],
      createdAt: '2026-10-25',
      favorite: true,
      storageName: svgStorageName,
      url: '/api/files/file-seed-3/content',
    },
    {
      id: 'file-seed-4',
      name: 'Guion Presentación de Ciencias.txt',
      originalName: 'Guion Presentación de Ciencias.txt',
      mimeType: 'text/plain',
      size: fs.statSync(path.join(UPLOADS_DIR, scriptStorageName)).size,
      fileType: 'texto',
      categoryId: 'exposiciones',
      folderId: 'folder-exp-1',
      projectId: 'proj-3',
      description: 'Estructura por diapositivas y notas de exposición oral sobre óptica.',
      course: 'Ciencias Naturales',
      tags: ['exposición', 'óptica', 'ciencias'],
      createdAt: '2026-11-05',
      favorite: false,
      storageName: scriptStorageName,
      url: '/api/files/file-seed-4/content',
    },
  ];

  const projects: Project[] = [
    {
      id: 'proj-1',
      title: 'Investigación científica',
      coverImage: '/src/assets/images/cover_investigacion_cientifica_1795147690830.jpg',
      description: 'Recopilación de información sobre científicos y sus descubrimientos.',
      createdAt: '2026-11-12',
      categoryId: 'investigaciones',
      course: 'Metodología de la Investigación',
      tags: ['ciencia', 'historia', 'investigación'],
      status: 'en_proceso',
      favorite: true,
      featured: true,
      relatedFileIds: ['file-seed-1', 'file-seed-2'],
    },
    {
      id: 'proj-2',
      title: 'Infografía de filosofía',
      coverImage: '/src/assets/images/cover_infografia_filosofia_1795147690861.jpg',
      description: 'Material visual sobre filosofía contemporánea.',
      createdAt: '2026-10-25',
      categoryId: 'trabajos-escolares',
      course: 'Filosofía Contemporánea',
      tags: ['filosofía', 'infografía', 'humanidades'],
      status: 'terminado',
      favorite: true,
      featured: true,
      relatedFileIds: ['file-seed-3'],
    },
    {
      id: 'proj-3',
      title: 'Presentación de ciencias',
      coverImage: '/src/assets/images/cover_presentacion_ciencias_1795147690583.jpg',
      description: 'Presentación académica con imágenes y explicaciones.',
      createdAt: '2026-11-05',
      categoryId: 'exposiciones',
      course: 'Ciencias Naturales',
      tags: ['exposición', 'óptica', 'ciencias'],
      status: 'terminado',
      favorite: false,
      featured: true,
      relatedFileIds: ['file-seed-4'],
    },
  ];

  const profile: PortfolioProfile = {
    portfolioName: 'Archivo & Portafolio Personal',
    ownerName: 'Sofía Mendoza',
    institution: 'Facultad de Ciencias y Humanidades',
    bio: 'Estudiante e investigadora enfocada en ciencias naturales, filosofía contemporánea y diseño de material académico visual.',
    welcomePhrase:
      'Bienvenido a mi espacio personal: trabajos escolares, investigaciones, presentaciones y documentos organizados con claridad.',
    avatarUrl: '/src/assets/images/hero_portfolio_illustration_1795148460396.jpg',
    showAvatar: true,
  };

  return { profile, projects, folders, files };
}

const OLD_DEFAULT_AVATAR =
  '/src/assets/images/avatar_portfolio_owner_1795147689850.jpg';
const NEW_DEFAULT_HERO_IMAGE =
  '/src/assets/images/hero_portfolio_illustration_1795148460396.jpg';

function readDb(): PortfolioData {
  ensureStorageDirs();
  if (!fs.existsSync(DB_PATH)) {
    const seed = createInitialSeed();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const parsed = JSON.parse(raw) as PortfolioData;
  if (parsed.profile?.avatarUrl === OLD_DEFAULT_AVATAR) {
    parsed.profile.avatarUrl = NEW_DEFAULT_HERO_IMAGE;
    fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf8');
  }
  return parsed;
}

function writeDb(data: PortfolioData) {
  ensureStorageDirs();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function safeUnlinkUpload(storageName: string) {
  if (!storageName) return;
  const target = path.resolve(UPLOADS_DIR, path.basename(storageName));
  if (target.startsWith(UPLOADS_DIR) && fs.existsSync(target)) {
    try {
      fs.unlinkSync(target);
    } catch {
      // Ignore cleanup error
    }
  }
}

function parseTagsInput(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureStorageDirs();
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = crypto.randomUUID();
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

async function startServer() {
  ensureStorageDirs();
  readDb(); // Ensure seed exists on startup

  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/portfolio', (_req, res) => {
    const data = readDb();
    res.json(data);
  });

  app.put('/api/profile', (req, res) => {
    const data = readDb();
    const body = req.body as Partial<PortfolioProfile>;
    data.profile = {
      ...data.profile,
      portfolioName:
        typeof body.portfolioName === 'string' && body.portfolioName.trim()
          ? body.portfolioName.trim()
          : data.profile.portfolioName,
      ownerName:
        typeof body.ownerName === 'string' && body.ownerName.trim()
          ? body.ownerName.trim()
          : data.profile.ownerName,
      institution:
        typeof body.institution === 'string'
          ? body.institution.trim()
          : data.profile.institution,
      bio: typeof body.bio === 'string' ? body.bio.trim() : data.profile.bio,
      welcomePhrase:
        typeof body.welcomePhrase === 'string' && body.welcomePhrase.trim()
          ? body.welcomePhrase.trim()
          : data.profile.welcomePhrase,
      avatarUrl:
        typeof body.avatarUrl === 'string'
          ? body.avatarUrl
          : data.profile.avatarUrl,
      showAvatar:
        typeof body.showAvatar === 'boolean'
          ? body.showAvatar
          : data.profile.showAvatar,
    };
    writeDb(data);
    res.json(data.profile);
  });

  app.post('/api/profile/avatar', upload.single('avatar'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No se recibió ninguna imagen.' });
      return;
    }
    const data = readDb();
    data.profile.avatarUrl = `/api/uploads/${encodeURIComponent(req.file.filename)}`;
    data.profile.showAvatar = true;
    writeDb(data);
    res.json(data.profile);
  });

  app.get('/api/uploads/:filename', (req, res) => {
    const safeName = path.basename(req.params.filename);
    const fullPath = path.resolve(UPLOADS_DIR, safeName);
    if (!fullPath.startsWith(UPLOADS_DIR) || !fs.existsSync(fullPath)) {
      res.status(404).send('Archivo no encontrado');
      return;
    }
    res.sendFile(fullPath);
  });

  // Projects CRUD
  app.post('/api/projects', (req, res) => {
    const body = req.body as Partial<Project>;
    if (!body.title || !body.title.trim()) {
      res.status(400).json({ error: 'El título del proyecto es obligatorio.' });
      return;
    }
    const data = readDb();
    const project: Project = {
      id: `proj-${crypto.randomUUID().slice(0, 8)}`,
      title: body.title.trim(),
      coverImage: typeof body.coverImage === 'string' ? body.coverImage.trim() : '',
      description: typeof body.description === 'string' ? body.description.trim() : '',
      createdAt:
        typeof body.createdAt === 'string' && body.createdAt
          ? body.createdAt.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      categoryId: (body.categoryId as CategoryId) || 'proyectos-personales',
      course: typeof body.course === 'string' ? body.course.trim() : '',
      tags: parseTagsInput(body.tags),
      status: body.status || 'pendiente',
      favorite: Boolean(body.favorite),
      featured: Boolean(body.featured),
      relatedFileIds: Array.isArray(body.relatedFileIds) ? body.relatedFileIds : [],
    };
    data.projects.unshift(project);
    writeDb(data);
    res.status(201).json(project);
  });

  app.patch('/api/projects/:id', (req, res) => {
    const data = readDb();
    const idx = data.projects.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Proyecto no encontrado.' });
      return;
    }
    const current = data.projects[idx];
    const body = req.body as Partial<Project>;
    const updated: Project = {
      ...current,
      title:
        typeof body.title === 'string' && body.title.trim()
          ? body.title.trim()
          : current.title,
      coverImage:
        typeof body.coverImage === 'string' ? body.coverImage.trim() : current.coverImage,
      description:
        typeof body.description === 'string' ? body.description.trim() : current.description,
      createdAt:
        typeof body.createdAt === 'string' && body.createdAt
          ? body.createdAt.slice(0, 10)
          : current.createdAt,
      categoryId: (body.categoryId as CategoryId) || current.categoryId,
      course: typeof body.course === 'string' ? body.course.trim() : current.course,
      tags: body.tags !== undefined ? parseTagsInput(body.tags) : current.tags,
      status: body.status || current.status,
      favorite: typeof body.favorite === 'boolean' ? body.favorite : current.favorite,
      featured: typeof body.featured === 'boolean' ? body.featured : current.featured,
      relatedFileIds: Array.isArray(body.relatedFileIds)
        ? body.relatedFileIds
        : current.relatedFileIds,
    };
    data.projects[idx] = updated;
    writeDb(data);
    res.json(updated);
  });

  app.post('/api/projects/:id/cover', upload.single('cover'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No se recibió ninguna imagen de portada.' });
      return;
    }
    const data = readDb();
    const project = data.projects.find((p) => p.id === req.params.id);
    if (!project) {
      safeUnlinkUpload(req.file.filename);
      res.status(404).json({ error: 'Proyecto no encontrado.' });
      return;
    }
    project.coverImage = `/api/uploads/${encodeURIComponent(req.file.filename)}`;
    writeDb(data);
    res.json(project);
  });

  app.delete('/api/projects/:id', (req, res) => {
    const data = readDb();
    const exists = data.projects.some((p) => p.id === req.params.id);
    if (!exists) {
      res.status(404).json({ error: 'Proyecto no encontrado.' });
      return;
    }
    data.projects = data.projects.filter((p) => p.id !== req.params.id);
    data.files = data.files.map((f) =>
      f.projectId === req.params.id ? { ...f, projectId: null } : f
    );
    writeDb(data);
    res.json({ deletedId: req.params.id });
  });

  // Folders CRUD
  app.post('/api/folders', (req, res) => {
    const body = req.body as Partial<FolderItem>;
    if (!body.name || !body.name.trim()) {
      res.status(400).json({ error: 'El nombre de la carpeta es obligatorio.' });
      return;
    }
    const data = readDb();
    const folder: FolderItem = {
      id: `folder-${crypto.randomUUID().slice(0, 8)}`,
      name: body.name.trim(),
      categoryId: (body.categoryId as CategoryId) || 'otros-archivos',
      parentId: body.parentId || null,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    data.folders.push(folder);
    writeDb(data);
    res.status(201).json(folder);
  });

  app.patch('/api/folders/:id', (req, res) => {
    const data = readDb();
    const folder = data.folders.find((f) => f.id === req.params.id);
    if (!folder) {
      res.status(404).json({ error: 'Carpeta no encontrada.' });
      return;
    }
    const body = req.body as Partial<FolderItem>;
    if (typeof body.name === 'string' && body.name.trim()) {
      folder.name = body.name.trim();
    }
    if (body.categoryId) {
      folder.categoryId = body.categoryId;
    }
    if (body.parentId !== undefined && body.parentId !== folder.id) {
      folder.parentId = body.parentId;
    }
    writeDb(data);
    res.json(folder);
  });

  app.delete('/api/folders/:id', (req, res) => {
    const data = readDb();
    const target = data.folders.find((f) => f.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Carpeta no encontrada.' });
      return;
    }
    const idsToRemove = new Set(getDescendantFolderIds(data.folders, target.id));
    data.folders = data.folders.filter((f) => !idsToRemove.has(f.id));

    const removedFileIds = new Set<string>();
    data.files = data.files.filter((file) => {
      if (file.folderId && idsToRemove.has(file.folderId)) {
        removedFileIds.add(file.id);
        safeUnlinkUpload(file.storageName);
        return false;
      }
      return true;
    });

    data.projects = data.projects.map((p) => ({
      ...p,
      relatedFileIds: p.relatedFileIds.filter((fid) => !removedFileIds.has(fid)),
    }));

    writeDb(data);
    res.json({ deletedFolderIds: Array.from(idsToRemove), deletedFileIds: Array.from(removedFileIds) });
  });

  // Files CRUD
  app.post('/api/files', upload.array('files', 15), (req, res) => {
    const uploaded = (req.files as Express.Multer.File[]) || [];
    if (uploaded.length === 0) {
      res.status(400).json({ error: 'Debes seleccionar al menos un archivo.' });
      return;
    }

    const data = readDb();
    const categoryId = (req.body.categoryId as CategoryId) || 'otros-archivos';
    const folderId = req.body.folderId ? String(req.body.folderId) : null;
    const projectId = req.body.projectId ? String(req.body.projectId) : null;
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const course = typeof req.body.course === 'string' ? req.body.course.trim() : '';
    const tags = parseTagsInput(req.body.tags);
    const createdAt =
      typeof req.body.createdAt === 'string' && req.body.createdAt
        ? req.body.createdAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10);

    const createdFiles: PortfolioFile[] = uploaded.map((item) => {
      const id = `file-${crypto.randomUUID().slice(0, 8)}`;
      const decodedName = Buffer.from(item.originalname, 'latin1').toString('utf8');
      const displayName = decodedName.includes('\uFFFD') ? item.originalname : decodedName;
      return {
        id,
        name: displayName,
        originalName: displayName,
        mimeType: item.mimetype || 'application/octet-stream',
        size: item.size,
        fileType: detectFileTypeGroup(displayName, item.mimetype),
        categoryId,
        folderId,
        projectId,
        description,
        course,
        tags,
        createdAt,
        favorite: false,
        storageName: item.filename,
        url: `/api/files/${id}/content`,
      };
    });

    data.files.unshift(...createdFiles);

    if (projectId) {
      const project = data.projects.find((p) => p.id === projectId);
      if (project) {
        const addedIds = createdFiles.map((f) => f.id);
        project.relatedFileIds = Array.from(new Set([...project.relatedFileIds, ...addedIds]));
      }
    }

    writeDb(data);
    res.status(201).json(createdFiles);
  });

  app.patch('/api/files/:id', (req, res) => {
    const data = readDb();
    const idx = data.files.findIndex((f) => f.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Archivo no encontrado.' });
      return;
    }
    const current = data.files[idx];
    const body = req.body as Partial<PortfolioFile>;

    const nextName =
      typeof body.name === 'string' && body.name.trim() ? body.name.trim() : current.name;
    const nextProjectId =
      body.projectId !== undefined ? body.projectId : current.projectId;

    const updated: PortfolioFile = {
      ...current,
      name: nextName,
      fileType: detectFileTypeGroup(nextName, current.mimeType),
      categoryId: (body.categoryId as CategoryId) || current.categoryId,
      folderId: body.folderId !== undefined ? body.folderId : current.folderId,
      projectId: nextProjectId,
      description:
        typeof body.description === 'string' ? body.description.trim() : current.description,
      course: typeof body.course === 'string' ? body.course.trim() : current.course,
      tags: body.tags !== undefined ? parseTagsInput(body.tags) : current.tags,
      createdAt:
        typeof body.createdAt === 'string' && body.createdAt
          ? body.createdAt.slice(0, 10)
          : current.createdAt,
      favorite: typeof body.favorite === 'boolean' ? body.favorite : current.favorite,
    };

    data.files[idx] = updated;

    if (body.projectId !== undefined && body.projectId !== current.projectId) {
      if (current.projectId) {
        const prevProj = data.projects.find((p) => p.id === current.projectId);
        if (prevProj) {
          prevProj.relatedFileIds = prevProj.relatedFileIds.filter((id) => id !== current.id);
        }
      }
      if (nextProjectId) {
        const nextProj = data.projects.find((p) => p.id === nextProjectId);
        if (nextProj && !nextProj.relatedFileIds.includes(current.id)) {
          nextProj.relatedFileIds.push(current.id);
        }
      }
    }

    writeDb(data);
    res.json(updated);
  });

  app.delete('/api/files/:id', (req, res) => {
    const data = readDb();
    const target = data.files.find((f) => f.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Archivo no encontrado.' });
      return;
    }
    safeUnlinkUpload(target.storageName);
    data.files = data.files.filter((f) => f.id !== req.params.id);
    data.projects = data.projects.map((p) => ({
      ...p,
      relatedFileIds: p.relatedFileIds.filter((id) => id !== req.params.id),
    }));
    writeDb(data);
    res.json({ deletedId: req.params.id });
  });

  app.get('/api/files/:id/content', (req, res) => {
    const data = readDb();
    const target = data.files.find((f) => f.id === req.params.id);
    if (!target) {
      res.status(404).send('Archivo no encontrado');
      return;
    }
    const safeName = path.basename(target.storageName);
    const fullPath = path.resolve(UPLOADS_DIR, safeName);
    if (!fullPath.startsWith(UPLOADS_DIR) || !fs.existsSync(fullPath)) {
      res.status(404).send('Contenido de archivo no disponible');
      return;
    }
    const isDownload = req.query.download === '1';
    const disposition = isDownload ? 'attachment' : 'inline';
    const encodedFilename = encodeURIComponent(target.name);
    res.setHeader('Content-Type', target.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename*=UTF-8''${encodedFilename}`
    );
    res.sendFile(fullPath);
  });

  app.get('/api/export', (_req, res) => {
    const data = readDb();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="portafolio-respaldo.json"'
    );
    res.send(JSON.stringify(data, null, 2));
  });

  // Vite dev middleware or production static assets
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Portfolio server running at http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
