export type CategoryId =
  | 'trabajos-escolares'
  | 'proyectos-personales'
  | 'investigaciones'
  | 'exposiciones'
  | 'documentos-pdf'
  | 'imagenes-disenos'
  | 'otros-archivos';

export type ProjectStatus = 'pendiente' | 'en_proceso' | 'terminado';

export type FileTypeGroup =
  | 'pdf'
  | 'word'
  | 'powerpoint'
  | 'imagen'
  | 'texto'
  | 'otro';

export type ViewMode = 'grid' | 'list';

export type ActiveSection =
  | 'inicio'
  | 'categorias'
  | 'archivos'
  | 'proyectos'
  | 'administrar';

export interface CategoryDefinition {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
}

export interface PortfolioProfile {
  portfolioName: string;
  ownerName: string;
  institution: string;
  bio: string;
  welcomePhrase: string;
  avatarUrl: string;
  showAvatar: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  categoryId: CategoryId;
  parentId: string | null;
  createdAt: string;
}

export interface PortfolioFile {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  fileType: FileTypeGroup;
  categoryId: CategoryId;
  folderId: string | null;
  projectId: string | null;
  description: string;
  course: string;
  tags: string[];
  createdAt: string;
  favorite: boolean;
  storageName: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  coverImage: string;
  description: string;
  createdAt: string;
  categoryId: CategoryId;
  course: string;
  tags: string[];
  status: ProjectStatus;
  favorite: boolean;
  featured: boolean;
  relatedFileIds: string[];
}

export interface PortfolioData {
  profile: PortfolioProfile;
  projects: Project[];
  folders: FolderItem[];
  files: PortfolioFile[];
}

export interface FileFilterCriteria {
  search: string;
  categoryId: CategoryId | 'all';
  folderId?: string | null;
  fileType: FileTypeGroup | 'all';
  tag: string;
  course: string;
  dateFrom: string;
  dateTo: string;
  onlyFavorites: boolean;
  sortBy: 'recent' | 'oldest' | 'name' | 'size';
}

export interface ProjectFilterCriteria {
  search: string;
  categoryId: CategoryId | 'all';
  status: ProjectStatus | 'all';
  tag: string;
  onlyFavorites: boolean;
  sortBy: 'recent' | 'oldest' | 'title';
}
