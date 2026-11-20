import { CATEGORIES } from '../constants/categories';
import type {
  CategoryId,
  FileFilterCriteria,
  FileTypeGroup,
  FolderItem,
  PortfolioFile,
  Project,
  ProjectFilterCriteria,
} from '../types/portfolio';

export function pluralizeEs(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function detectFileTypeGroup(filename: string, mimeType = ''): FileTypeGroup {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mime = mimeType.toLowerCase();

  if (ext === 'pdf' || mime === 'application/pdf') {
    return 'pdf';
  }
  if (
    ['doc', 'docx', 'odt', 'rtf'].includes(ext) ||
    mime.includes('wordprocessingml') ||
    mime === 'application/msword'
  ) {
    return 'word';
  }
  if (
    ['ppt', 'pptx', 'odp', 'key'].includes(ext) ||
    mime.includes('presentationml') ||
    mime === 'application/vnd.ms-powerpoint'
  ) {
    return 'powerpoint';
  }
  if (
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'avif'].includes(ext) ||
    mime.startsWith('image/')
  ) {
    return 'imagen';
  }
  if (
    ['txt', 'md', 'markdown', 'csv', 'json', 'ts', 'tsx', 'js', 'html', 'css'].includes(ext) ||
    mime.startsWith('text/')
  ) {
    return 'texto';
  }
  return 'otro';
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

const MONTHS_ES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export function formatDateEs(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.slice(0, 10).split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  if (!year || monthIdx < 0 || monthIdx > 11 || !day) return isoDate;
  return `${day} ${MONTHS_ES[monthIdx]} ${year}`;
}

export function getFolderBreadcrumbs(
  folders: FolderItem[],
  folderId: string | null
): FolderItem[] {
  if (!folderId) return [];
  const byId = new Map(folders.map((f) => [f.id, f]));
  const chain: FolderItem[] = [];
  const visited = new Set<string>();
  let currentId: string | null = folderId;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const folder = byId.get(currentId);
    if (!folder) break;
    chain.unshift(folder);
    currentId = folder.parentId;
  }

  return chain;
}

export function getDescendantFolderIds(
  folders: FolderItem[],
  rootFolderId: string
): string[] {
  const result: string[] = [rootFolderId];
  const queue: string[] = [rootFolderId];
  const seen = new Set<string>([rootFolderId]);

  while (queue.length > 0) {
    const parentId = queue.shift()!;
    for (const folder of folders) {
      if (folder.parentId === parentId && !seen.has(folder.id)) {
        seen.add(folder.id);
        result.push(folder.id);
        queue.push(folder.id);
      }
    }
  }

  return result;
}

export function filterFiles(
  files: PortfolioFile[],
  criteria: FileFilterCriteria
): PortfolioFile[] {
  const q = criteria.search.trim().toLowerCase();

  const filtered = files.filter((file) => {
    if (criteria.categoryId !== 'all' && file.categoryId !== criteria.categoryId) {
      return false;
    }
    if (criteria.folderId !== undefined) {
      if (criteria.folderId === null && file.folderId !== null) return false;
      if (criteria.folderId !== null && file.folderId !== criteria.folderId) return false;
    }
    if (criteria.fileType !== 'all' && file.fileType !== criteria.fileType) {
      return false;
    }
    if (criteria.tag && !file.tags.some((t) => t.toLowerCase() === criteria.tag.toLowerCase())) {
      return false;
    }
    if (criteria.course && file.course.toLowerCase() !== criteria.course.toLowerCase()) {
      return false;
    }
    if (criteria.dateFrom && file.createdAt < criteria.dateFrom) {
      return false;
    }
    if (criteria.dateTo && file.createdAt > criteria.dateTo) {
      return false;
    }
    if (criteria.onlyFavorites && !file.favorite) {
      return false;
    }
    if (q) {
      const haystack = [
        file.name,
        file.description,
        file.course,
        ...file.tags,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (criteria.sortBy) {
      case 'oldest':
        return a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name, 'es');
      case 'name':
        return a.name.localeCompare(b.name, 'es');
      case 'size':
        return b.size - a.size;
      case 'recent':
      default:
        return b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name, 'es');
    }
  });
}

export function filterProjects(
  projects: Project[],
  criteria: ProjectFilterCriteria
): Project[] {
  const q = criteria.search.trim().toLowerCase();

  const filtered = projects.filter((project) => {
    if (criteria.categoryId !== 'all' && project.categoryId !== criteria.categoryId) {
      return false;
    }
    if (criteria.status !== 'all' && project.status !== criteria.status) {
      return false;
    }
    if (criteria.tag && !project.tags.some((t) => t.toLowerCase() === criteria.tag.toLowerCase())) {
      return false;
    }
    if (criteria.onlyFavorites && !project.favorite) {
      return false;
    }
    if (q) {
      const haystack = [
        project.title,
        project.description,
        project.course,
        ...project.tags,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (criteria.sortBy) {
      case 'oldest':
        return a.createdAt.localeCompare(b.createdAt) || a.title.localeCompare(b.title, 'es');
      case 'title':
        return a.title.localeCompare(b.title, 'es');
      case 'recent':
      default:
        return b.createdAt.localeCompare(a.createdAt) || a.title.localeCompare(b.title, 'es');
    }
  });
}

export interface CategoryStats {
  categoryId: CategoryId;
  projectCount: number;
  fileCount: number;
  folderCount: number;
}

export interface PortfolioStats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  totalFiles: number;
  totalFolders: number;
  favoriteCount: number;
  totalBytes: number;
  byCategory: Record<CategoryId, CategoryStats>;
}

export function computePortfolioStats(
  projects: Project[],
  files: PortfolioFile[],
  folders: FolderItem[]
): PortfolioStats {
  const byCategory = {} as Record<CategoryId, CategoryStats>;
  for (const cat of CATEGORIES) {
    byCategory[cat.id] = {
      categoryId: cat.id,
      projectCount: 0,
      fileCount: 0,
      folderCount: 0,
    };
  }

  let completedProjects = 0;
  let inProgressProjects = 0;
  let favoriteCount = 0;

  for (const p of projects) {
    if (byCategory[p.categoryId]) {
      byCategory[p.categoryId].projectCount += 1;
    }
    if (p.status === 'terminado') completedProjects += 1;
    if (p.status === 'en_proceso') inProgressProjects += 1;
    if (p.favorite) favoriteCount += 1;
  }

  let totalBytes = 0;
  for (const f of files) {
    if (byCategory[f.categoryId]) {
      byCategory[f.categoryId].fileCount += 1;
    }
    totalBytes += f.size || 0;
    if (f.favorite) favoriteCount += 1;
  }

  for (const folder of folders) {
    if (byCategory[folder.categoryId]) {
      byCategory[folder.categoryId].folderCount += 1;
    }
  }

  return {
    totalProjects: projects.length,
    completedProjects,
    inProgressProjects,
    totalFiles: files.length,
    totalFolders: folders.length,
    favoriteCount,
    totalBytes,
    byCategory,
  };
}

export function collectAllTags(projects: Project[], files: PortfolioFile[]): string[] {
  const set = new Set<string>();
  for (const p of projects) {
    for (const tag of p.tags) {
      const clean = tag.trim();
      if (clean) set.add(clean);
    }
  }
  for (const f of files) {
    for (const tag of f.tags) {
      const clean = tag.trim();
      if (clean) set.add(clean);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}

export function collectAllCourses(projects: Project[], files: PortfolioFile[]): string[] {
  const set = new Set<string>();
  for (const p of projects) {
    const clean = p.course.trim();
    if (clean) set.add(clean);
  }
  for (const f of files) {
    const clean = f.course.trim();
    if (clean) set.add(clean);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}
