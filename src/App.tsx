import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  createFolder,
  createProject,
  deleteFile,
  deleteFolder,
  deleteProject,
  fetchPortfolio,
  updateFile,
  updateFolder,
  updateProfile,
  updateProject,
  uploadFiles,
  uploadProfileAvatar,
  uploadProjectCover,
  type ProjectPayload,
} from './services/api';
import { computePortfolioStats } from './utils/portfolioLogic';
import type {
  ActiveSection,
  CategoryId,
  FolderItem,
  PortfolioData,
  PortfolioFile,
  PortfolioProfile,
  Project,
  ProjectStatus,
  ViewMode,
} from './types/portfolio';
import { TopBar } from './components/TopBar';
import { HomeView } from './components/HomeView';
import { CategoriesView } from './components/CategoriesView';
import { FileManagerView } from './components/FileManagerView';
import { ProjectsView } from './components/ProjectsView';
import { AdminPanelView } from './components/AdminPanelView';
import { FileUploadModal } from './components/FileUploadModal';
import { FileEditModal } from './components/FileEditModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { ProjectModal } from './components/ProjectModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastContainer, type ToastMessage } from './components/ToastContainer';

type DeleteTarget =
  | { kind: 'file'; item: PortfolioFile }
  | { kind: 'folder'; item: FolderItem }
  | { kind: 'project'; item: Project }
  | null;

export default function App() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [activeSection, setActiveSection] = useState<ActiveSection>('inicio');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('trabajos-escolares');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('portfolio-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Modals state
  const [uploadModal, setUploadModal] = useState<{
    open: boolean;
    categoryId: CategoryId;
    folderId: string | null;
  }>({ open: false, categoryId: 'trabajos-escolares', folderId: null });

  const [editingFile, setEditingFile] = useState<PortfolioFile | null>(null);
  const [previewFile, setPreviewFile] = useState<PortfolioFile | null>(null);
  const [projectModal, setProjectModal] = useState<{
    open: boolean;
    project: Project | null;
    editMode: boolean;
    defaultCategoryId?: CategoryId;
  }>({ open: false, project: null, editMode: false });

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [deleting, setDeleting] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const portfolio = await fetchPortfolio();
      setData(portfolio);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'No se pudo cargar el portafolio.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    if (!data) return null;
    return computePortfolioStats(data.projects, data.files, data.folders);
  }, [data]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Profile handlers
  const handleSaveProfile = async (payload: Partial<PortfolioProfile>) => {
    const updated = await updateProfile(payload);
    setData((prev) => (prev ? { ...prev, profile: updated } : prev));
    addToast('Perfil actualizado correctamente.');
  };

  const handleUploadAvatar = async (file: File) => {
    const updated = await uploadProfileAvatar(file);
    setData((prev) => (prev ? { ...prev, profile: updated } : prev));
    addToast('Fotografía de perfil actualizada.');
  };

  // Project handlers
  const handleSaveProject = async (
    id: string | null,
    payload: ProjectPayload
  ): Promise<Project> => {
    if (id === null) {
      const created = await createProject(payload);
      setData((prev) =>
        prev ? { ...prev, projects: [created, ...prev.projects] } : prev
      );
      addToast('Proyecto creado correctamente.');
      return created;
    } else {
      const updated = await updateProject(id, payload);
      setData((prev) =>
        prev
          ? {
              ...prev,
              projects: prev.projects.map((p) => (p.id === id ? updated : p)),
            }
          : prev
      );
      setProjectModal((prev) =>
        prev.project?.id === id ? { ...prev, project: updated } : prev
      );
      addToast('Proyecto actualizado.');
      return updated;
    }
  };

  const handleUploadProjectCover = async (
    projectId: string,
    file: File
  ): Promise<Project> => {
    const updated = await uploadProjectCover(projectId, file);
    setData((prev) =>
      prev
        ? {
            ...prev,
            projects: prev.projects.map((p) => (p.id === projectId ? updated : p)),
          }
        : prev
    );
    setProjectModal((prev) =>
      prev.project?.id === projectId ? { ...prev, project: updated } : prev
    );
    addToast('Portada del proyecto actualizada.');
    return updated;
  };

  const handleToggleProjectFavorite = async (project: Project) => {
    const updated = await updateProject(project.id, { favorite: !project.favorite });
    setData((prev) =>
      prev
        ? {
            ...prev,
            projects: prev.projects.map((p) => (p.id === project.id ? updated : p)),
          }
        : prev
    );
    addToast(
      updated.favorite
        ? `"${updated.title}" añadido a favoritos.`
        : `"${updated.title}" quitado de favoritos.`
    );
  };

  const handleChangeProjectStatus = async (
    project: Project,
    status: ProjectStatus
  ) => {
    const updated = await updateProject(project.id, { status });
    setData((prev) =>
      prev
        ? {
            ...prev,
            projects: prev.projects.map((p) => (p.id === project.id ? updated : p)),
          }
        : prev
    );
    addToast(`Estado de "${updated.title}" actualizado.`);
  };

  // Folder handlers
  const handleCreateFolder = async (
    name: string,
    categoryId: CategoryId,
    parentId: string | null
  ) => {
    const created = await createFolder({ name, categoryId, parentId });
    setData((prev) =>
      prev ? { ...prev, folders: [...prev.folders, created] } : prev
    );
    addToast(`Carpeta "${created.name}" creada.`);
  };

  const handleRenameFolder = async (folder: FolderItem, newName: string) => {
    const updated = await updateFolder(folder.id, { name: newName });
    setData((prev) =>
      prev
        ? {
            ...prev,
            folders: prev.folders.map((f) => (f.id === folder.id ? updated : f)),
          }
        : prev
    );
    addToast(`Carpeta renombrada a "${updated.name}".`);
  };

  // File handlers
  const handleUploadFiles = async (payload: {
    files: File[];
    categoryId: CategoryId;
    folderId: string | null;
    projectId: string | null;
    description: string;
    course: string;
    tags: string[];
    createdAt: string;
  }) => {
    const created = await uploadFiles(payload);
    setData((prev) => {
      if (!prev) return prev;
      const addedIds = created.map((f) => f.id);
      return {
        ...prev,
        files: [...created, ...prev.files],
        projects: payload.projectId
          ? prev.projects.map((p) =>
              p.id === payload.projectId
                ? {
                    ...p,
                    relatedFileIds: Array.from(
                      new Set([...p.relatedFileIds, ...addedIds])
                    ),
                  }
                : p
            )
          : prev.projects,
      };
    });
    if (payload.projectId) {
      setProjectModal((prev) => {
        if (!prev.project || prev.project.id !== payload.projectId) return prev;
        const addedIds = created.map((f) => f.id);
        return {
          ...prev,
          project: {
            ...prev.project,
            relatedFileIds: Array.from(
              new Set([...prev.project.relatedFileIds, ...addedIds])
            ),
          },
        };
      });
    }
    addToast(
      created.length === 1
        ? `Archivo "${created[0].name}" guardado.`
        : `${created.length} archivos guardados correctamente.`
    );
  };

  const handleEditFileSave = async (
    id: string,
    payload: {
      name: string;
      categoryId: CategoryId;
      folderId: string | null;
      projectId: string | null;
      description: string;
      course: string;
      tags: string[];
      createdAt: string;
    }
  ) => {
    const updated = await updateFile(id, payload);
    const refreshed = await fetchPortfolio();
    setData(refreshed);
    addToast(`Archivo "${updated.name}" actualizado.`);
  };

  const handleToggleFileFavorite = async (file: PortfolioFile) => {
    const updated = await updateFile(file.id, { favorite: !file.favorite });
    setData((prev) =>
      prev
        ? {
            ...prev,
            files: prev.files.map((f) => (f.id === file.id ? updated : f)),
          }
        : prev
    );
    addToast(
      updated.favorite
        ? `"${updated.name}" marcado como favorito.`
        : `"${updated.name}" quitado de favoritos.`
    );
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === 'file') {
        await deleteFile(deleteTarget.item.id);
        const refreshed = await fetchPortfolio();
        setData(refreshed);
        addToast(`Archivo "${deleteTarget.item.name}" eliminado.`);
      } else if (deleteTarget.kind === 'folder') {
        await deleteFolder(deleteTarget.item.id);
        const refreshed = await fetchPortfolio();
        setData(refreshed);
        addToast(`Carpeta "${deleteTarget.item.name}" eliminada.`);
      } else if (deleteTarget.kind === 'project') {
        await deleteProject(deleteTarget.item.id);
        const refreshed = await fetchPortfolio();
        setData(refreshed);
        if (projectModal.project?.id === deleteTarget.item.id) {
          setProjectModal({ open: false, project: null, editMode: false });
        }
        addToast(`Proyecto "${deleteTarget.item.title}" eliminado.`);
      }
      setDeleteTarget(null);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'No se pudo completar la eliminación.',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F4EF] px-4 dark:bg-[#131312]">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#D8D3C9] border-t-[#4E687A] dark:border-[#302E2A] dark:border-t-[#89A5B8]" />
          <p className="text-sm text-[#666159] dark:text-[#A39E94]">
            Cargando portafolio personal...
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !data || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F4EF] px-4 dark:bg-[#131312]">
        <div className="max-w-md rounded-2xl border border-[#E2DDD3] bg-[#FDFCF9] p-6 text-center dark:border-[#2C2B28] dark:bg-[#1A1A18]">
          <h1 className="font-display text-lg font-semibold text-[#22211F] dark:text-[#F2EFE9]">
            No se pudo conectar con el archivo
          </h1>
          <p className="mt-2 text-sm text-[#666159] dark:text-[#A39E94]">
            {loadError || 'Error inesperado al leer los datos del portafolio.'}
          </p>
          <button
            type="button"
            onClick={loadData}
            className="mt-5 rounded-lg bg-[#4E687A] px-4 py-2 text-sm font-medium text-white hover:bg-[#3F5666] dark:bg-[#5E7C91]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const deleteDialogTitle =
    deleteTarget?.kind === 'file'
      ? '¿Eliminar archivo?'
      : deleteTarget?.kind === 'folder'
        ? '¿Eliminar carpeta?'
        : '¿Eliminar proyecto?';

  const deleteDialogMessage =
    deleteTarget?.kind === 'file'
      ? `Se eliminará permanentemente "${deleteTarget.item.name}" de tu almacenamiento.`
      : deleteTarget?.kind === 'folder'
        ? `Se eliminará la carpeta "${deleteTarget.item.name}", sus subcarpetas y los archivos que contenga.`
        : deleteTarget?.kind === 'project'
          ? `Se eliminará la ficha del proyecto "${deleteTarget.item.title}". Los archivos vinculados permanecerán en tu archivo.`
          : '';

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F4EF] text-[#22211F] dark:bg-[#131312] dark:text-[#F2EFE9]">
      <TopBar
        portfolioName={data.profile.portfolioName}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onOpenUpload={() =>
          setUploadModal({
            open: true,
            categoryId:
              activeSection === 'categorias' ? selectedCategory : 'trabajos-escolares',
            folderId: null,
          })
        }
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeSection === 'inicio' && (
              <HomeView
                profile={data.profile}
                stats={stats}
                projects={data.projects}
                recentFiles={data.files}
                theme={theme}
                onToggleTheme={toggleTheme}
                onNavigateSection={setActiveSection}
                onOpenCategory={(catId) => {
                  setSelectedCategory(catId);
                  setActiveSection('categorias');
                }}
                onOpenProject={(proj) =>
                  setProjectModal({ open: true, project: proj, editMode: false })
                }
                onCreateProject={() =>
                  setProjectModal({ open: true, project: null, editMode: true })
                }
                onToggleProjectFavorite={handleToggleProjectFavorite}
                onPreviewFile={setPreviewFile}
              />
            )}

            {activeSection === 'categorias' && (
              <CategoriesView
                selectedCategory={selectedCategory}
                folders={data.folders}
                files={data.files}
                projects={data.projects}
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
                onSelectCategory={setSelectedCategory}
                onOpenUpload={(categoryId, folderId) =>
                  setUploadModal({ open: true, categoryId, folderId })
                }
                onCreateProjectInCategory={(categoryId) =>
                  setProjectModal({
                    open: true,
                    project: null,
                    editMode: true,
                    defaultCategoryId: categoryId,
                  })
                }
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={(folder) =>
                  setDeleteTarget({ kind: 'folder', item: folder })
                }
                onPreviewFile={setPreviewFile}
                onEditFile={setEditingFile}
                onDeleteFile={(file) => setDeleteTarget({ kind: 'file', item: file })}
                onToggleFileFavorite={handleToggleFileFavorite}
                onOpenProject={(proj) =>
                  setProjectModal({ open: true, project: proj, editMode: false })
                }
                onToggleProjectFavorite={handleToggleProjectFavorite}
              />
            )}

            {activeSection === 'archivos' && (
              <FileManagerView
                files={data.files}
                projects={data.projects}
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
                onOpenUpload={() =>
                  setUploadModal({
                    open: true,
                    categoryId: 'documentos-pdf',
                    folderId: null,
                  })
                }
                onPreviewFile={setPreviewFile}
                onEditFile={setEditingFile}
                onDeleteFile={(file) => setDeleteTarget({ kind: 'file', item: file })}
                onToggleFavorite={handleToggleFileFavorite}
              />
            )}

            {activeSection === 'proyectos' && (
              <ProjectsView
                projects={data.projects}
                files={data.files}
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
                onCreateProject={() =>
                  setProjectModal({ open: true, project: null, editMode: true })
                }
                onOpenProject={(proj) =>
                  setProjectModal({ open: true, project: proj, editMode: false })
                }
                onToggleFavorite={handleToggleProjectFavorite}
              />
            )}

            {activeSection === 'administrar' && (
              <AdminPanelView
                profile={data.profile}
                projects={data.projects}
                files={data.files}
                theme={theme}
                onToggleTheme={toggleTheme}
                onSaveProfile={handleSaveProfile}
                onUploadAvatar={handleUploadAvatar}
                onOpenProject={(proj) =>
                  setProjectModal({ open: true, project: proj, editMode: false })
                }
                onChangeProjectStatus={handleChangeProjectStatus}
                onDeleteProject={(proj) =>
                  setDeleteTarget({ kind: 'project', item: proj })
                }
                onEditFile={setEditingFile}
                onDeleteFile={(file) => setDeleteTarget({ kind: 'file', item: file })}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-[#E3DFD6] bg-[#EFECE4]/50 py-6 dark:border-[#2A2926] dark:bg-[#171715]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-4 text-xs text-[#666159] sm:flex-row sm:px-6 lg:px-8 dark:text-[#A39E94]">
          <p>
            {data.profile.portfolioName} · {data.profile.ownerName}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveSection('categorias')}
              className="hover:text-[#22211F] dark:hover:text-[#F2EFE9]"
            >
              Categorías
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('archivos')}
              className="hover:text-[#22211F] dark:hover:text-[#F2EFE9]"
            >
              Archivo
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('administrar')}
              className="hover:text-[#22211F] dark:hover:text-[#F2EFE9]"
            >
              Administración
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FileUploadModal
        open={uploadModal.open}
        folders={data.folders}
        projects={data.projects}
        defaultCategoryId={uploadModal.categoryId}
        defaultFolderId={uploadModal.folderId}
        onClose={() => setUploadModal((prev) => ({ ...prev, open: false }))}
        onUpload={handleUploadFiles}
      />

      <FileEditModal
        file={editingFile}
        folders={data.folders}
        projects={data.projects}
        onClose={() => setEditingFile(null)}
        onSave={handleEditFileSave}
      />

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <ProjectModal
        open={projectModal.open}
        project={projectModal.project}
        initialEditMode={projectModal.editMode}
        defaultCategoryId={projectModal.defaultCategoryId}
        allFiles={data.files}
        onClose={() => setProjectModal({ open: false, project: null, editMode: false })}
        onSave={handleSaveProject}
        onUploadCover={handleUploadProjectCover}
        onDelete={(proj) => setDeleteTarget({ kind: 'project', item: proj })}
        onPreviewFile={setPreviewFile}
        onUploadFileToProject={async (projectId, categoryId, files) => {
          await handleUploadFiles({
            files,
            categoryId,
            folderId: null,
            projectId,
            description: '',
            course: projectModal.project?.course || '',
            tags: [],
            createdAt: new Date().toISOString().slice(0, 10),
          });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteDialogTitle}
        message={deleteDialogMessage}
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
