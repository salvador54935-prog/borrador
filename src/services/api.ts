import type {
  CategoryId,
  FolderItem,
  PortfolioData,
  PortfolioFile,
  PortfolioProfile,
  Project,
  ProjectStatus,
} from '../types/portfolio';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = 'Error en la solicitud al servidor.';
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      // Ignore parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function fetchPortfolio(): Promise<PortfolioData> {
  const res = await fetch('/api/portfolio');
  return handleResponse<PortfolioData>(res);
}

export async function updateProfile(
  payload: Partial<PortfolioProfile>
): Promise<PortfolioProfile> {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<PortfolioProfile>(res);
}

export async function uploadProfileAvatar(file: File): Promise<PortfolioProfile> {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch('/api/profile/avatar', {
    method: 'POST',
    body: formData,
  });
  return handleResponse<PortfolioProfile>(res);
}

export interface ProjectPayload {
  title: string;
  coverImage?: string;
  description?: string;
  createdAt?: string;
  categoryId: CategoryId;
  course?: string;
  tags?: string[];
  status: ProjectStatus;
  favorite?: boolean;
  featured?: boolean;
  relatedFileIds?: string[];
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Project>(res);
}

export async function updateProject(
  id: string,
  payload: Partial<ProjectPayload>
): Promise<Project> {
  const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Project>(res);
}

export async function uploadProjectCover(
  projectId: string,
  file: File
): Promise<Project> {
  const formData = new FormData();
  formData.append('cover', file);
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/cover`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<Project>(res);
}

export async function deleteProject(id: string): Promise<{ deletedId: string }> {
  const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return handleResponse<{ deletedId: string }>(res);
}

export async function createFolder(payload: {
  name: string;
  categoryId: CategoryId;
  parentId: string | null;
}): Promise<FolderItem> {
  const res = await fetch('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<FolderItem>(res);
}

export async function updateFolder(
  id: string,
  payload: Partial<{ name: string; categoryId: CategoryId; parentId: string | null }>
): Promise<FolderItem> {
  const res = await fetch(`/api/folders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<FolderItem>(res);
}

export async function deleteFolder(
  id: string
): Promise<{ deletedFolderIds: string[]; deletedFileIds: string[] }> {
  const res = await fetch(`/api/folders/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return handleResponse<{ deletedFolderIds: string[]; deletedFileIds: string[] }>(res);
}

export async function uploadFiles(payload: {
  files: File[];
  categoryId: CategoryId;
  folderId?: string | null;
  projectId?: string | null;
  description?: string;
  course?: string;
  tags?: string[];
  createdAt?: string;
}): Promise<PortfolioFile[]> {
  const formData = new FormData();
  for (const file of payload.files) {
    formData.append('files', file);
  }
  formData.append('categoryId', payload.categoryId);
  if (payload.folderId) formData.append('folderId', payload.folderId);
  if (payload.projectId) formData.append('projectId', payload.projectId);
  if (payload.description) formData.append('description', payload.description);
  if (payload.course) formData.append('course', payload.course);
  if (payload.tags && payload.tags.length > 0) {
    formData.append('tags', payload.tags.join(','));
  }
  if (payload.createdAt) formData.append('createdAt', payload.createdAt);

  const res = await fetch('/api/files', {
    method: 'POST',
    body: formData,
  });
  return handleResponse<PortfolioFile[]>(res);
}

export async function updateFile(
  id: string,
  payload: Partial<{
    name: string;
    categoryId: CategoryId;
    folderId: string | null;
    projectId: string | null;
    description: string;
    course: string;
    tags: string[];
    createdAt: string;
    favorite: boolean;
  }>
): Promise<PortfolioFile> {
  const res = await fetch(`/api/files/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<PortfolioFile>(res);
}

export async function deleteFile(id: string): Promise<{ deletedId: string }> {
  const res = await fetch(`/api/files/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return handleResponse<{ deletedId: string }>(res);
}
