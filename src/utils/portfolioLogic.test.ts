import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectAllCourses,
  collectAllTags,
  computePortfolioStats,
  detectFileTypeGroup,
  filterFiles,
  filterProjects,
  formatDateEs,
  formatFileSize,
  getDescendantFolderIds,
  getFolderBreadcrumbs,
  pluralizeEs,
} from './portfolioLogic';
import type { FolderItem, PortfolioFile, Project } from '../types/portfolio';

test('pluralizeEs handles singular and plural counts cleanly', () => {
  assert.equal(pluralizeEs(0, 'proyecto', 'proyectos'), '0 proyectos');
  assert.equal(pluralizeEs(1, 'proyecto', 'proyectos'), '1 proyecto');
  assert.equal(pluralizeEs(2, 'archivo', 'archivos'), '2 archivos');
});

const sampleFolders: FolderItem[] = [
  { id: 'f1', name: 'Biología', categoryId: 'investigaciones', parentId: null, createdAt: '2026-10-01' },
  { id: 'f2', name: 'Microscopía', categoryId: 'investigaciones', parentId: 'f1', createdAt: '2026-10-02' },
  { id: 'f3', name: 'Lecturas', categoryId: 'investigaciones', parentId: 'f2', createdAt: '2026-10-03' },
  { id: 'f4', name: 'Filosofía', categoryId: 'trabajos-escolares', parentId: null, createdAt: '2026-10-04' },
];

const sampleFiles: PortfolioFile[] = [
  {
    id: 'file-1',
    name: 'Resumen de Óptica.pdf',
    originalName: 'Resumen de Óptica.pdf',
    mimeType: 'application/pdf',
    size: 2048,
    fileType: 'pdf',
    categoryId: 'investigaciones',
    folderId: 'f2',
    projectId: 'p1',
    description: 'Notas sobre refracción',
    course: 'Física II',
    tags: ['óptica', 'ciencia'],
    createdAt: '2026-11-10',
    favorite: true,
    storageName: 'file-1.pdf',
    url: '/api/files/file-1/content',
  },
  {
    id: 'file-2',
    name: 'Ensayo Kant.docx',
    originalName: 'Ensayo Kant.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 102400,
    fileType: 'word',
    categoryId: 'trabajos-escolares',
    folderId: null,
    projectId: 'p2',
    description: 'Trabajo final de ética',
    course: 'Filosofía Moderna',
    tags: ['filosofía', 'ética'],
    createdAt: '2026-10-20',
    favorite: false,
    storageName: 'file-2.docx',
    url: '/api/files/file-2/content',
  },
];

const sampleProjects: Project[] = [
  {
    id: 'p1',
    title: 'Investigación científica',
    coverImage: '',
    description: 'Recopilación de científicos',
    createdAt: '2026-11-15',
    categoryId: 'investigaciones',
    course: 'Física II',
    tags: ['ciencia', 'historia'],
    status: 'en_proceso',
    favorite: true,
    featured: true,
    relatedFileIds: ['file-1'],
  },
  {
    id: 'p2',
    title: 'Infografía de filosofía',
    coverImage: '',
    description: 'Filosofía contemporánea',
    createdAt: '2026-10-12',
    categoryId: 'trabajos-escolares',
    course: 'Filosofía Moderna',
    tags: ['filosofía'],
    status: 'terminado',
    favorite: false,
    featured: true,
    relatedFileIds: ['file-2'],
  },
];

test('detectFileTypeGroup classifies common academic and design extensions', () => {
  assert.equal(detectFileTypeGroup('informe.pdf', 'application/pdf'), 'pdf');
  assert.equal(detectFileTypeGroup('ensayo.docx', ''), 'word');
  assert.equal(detectFileTypeGroup('diapositivas.pptx', ''), 'powerpoint');
  assert.equal(detectFileTypeGroup('diagrama.png', 'image/png'), 'imagen');
  assert.equal(detectFileTypeGroup('notas.md', 'text/markdown'), 'texto');
  assert.equal(detectFileTypeGroup('archivo.zip', 'application/zip'), 'otro');
});

test('formatFileSize and formatDateEs format values cleanly', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(5 * 1024 * 1024), '5.0 MB');
  assert.equal(formatDateEs('2026-11-19'), '19 nov 2026');
});

test('folder breadcrumbs and descendant lookup handle nested folders safely', () => {
  const crumbs = getFolderBreadcrumbs(sampleFolders, 'f3');
  assert.deepEqual(
    crumbs.map((c) => c.name),
    ['Biología', 'Microscopía', 'Lecturas']
  );
  const descendants = getDescendantFolderIds(sampleFolders, 'f1');
  assert.deepEqual(descendants, ['f1', 'f2', 'f3']);
});

test('filterFiles filters by search, type, tag, category, favorites, and date range', () => {
  const bySearch = filterFiles(sampleFiles, {
    search: 'óptica',
    categoryId: 'all',
    fileType: 'all',
    tag: '',
    course: '',
    dateFrom: '',
    dateTo: '',
    onlyFavorites: false,
    sortBy: 'recent',
  });
  assert.equal(bySearch.length, 1);
  assert.equal(bySearch[0].id, 'file-1');

  const byWord = filterFiles(sampleFiles, {
    search: '',
    categoryId: 'trabajos-escolares',
    fileType: 'word',
    tag: 'ética',
    course: 'Filosofía Moderna',
    dateFrom: '2026-10-01',
    dateTo: '2026-10-31',
    onlyFavorites: false,
    sortBy: 'name',
  });
  assert.equal(byWord.length, 1);
  assert.equal(byWord[0].id, 'file-2');
});

test('filterProjects filters by status, category, and favorites', () => {
  const inProcess = filterProjects(sampleProjects, {
    search: '',
    categoryId: 'all',
    status: 'en_proceso',
    tag: '',
    onlyFavorites: true,
    sortBy: 'recent',
  });
  assert.equal(inProcess.length, 1);
  assert.equal(inProcess[0].id, 'p1');
});

test('computePortfolioStats, collectAllTags, and collectAllCourses aggregate accurately', () => {
  const stats = computePortfolioStats(sampleProjects, sampleFiles, sampleFolders);
  assert.equal(stats.totalProjects, 2);
  assert.equal(stats.completedProjects, 1);
  assert.equal(stats.inProgressProjects, 1);
  assert.equal(stats.totalFiles, 2);
  assert.equal(stats.totalFolders, 4);
  assert.equal(stats.favoriteCount, 2);
  assert.equal(stats.byCategory['investigaciones'].fileCount, 1);
  assert.equal(stats.byCategory['investigaciones'].folderCount, 3);

  const tags = collectAllTags(sampleProjects, sampleFiles);
  assert.deepEqual(tags, ['ciencia', 'ética', 'filosofía', 'historia', 'óptica']);

  const courses = collectAllCourses(sampleProjects, sampleFiles);
  assert.deepEqual(courses, ['Filosofía Moderna', 'Física II']);
});
