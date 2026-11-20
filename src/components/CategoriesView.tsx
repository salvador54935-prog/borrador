import { useState } from 'react';
import {
  Check,
  ChevronRight,
  Folder,
  FolderPlus,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { CATEGORIES, CATEGORY_MAP, CATEGORY_THEMES } from '../constants/categories';
import { getFolderBreadcrumbs, pluralizeEs } from '../utils/portfolioLogic';
import type {
  CategoryId,
  FolderItem,
  PortfolioFile,
  Project,
  ViewMode,
} from '../types/portfolio';
import { CategoryIcon } from './CategoryIcon';
import { FileItemView } from './FileItemView';
import { ProjectCard } from './ProjectCard';

interface CategoriesViewProps {
  selectedCategory: CategoryId;
  folders: FolderItem[];
  files: PortfolioFile[];
  projects: Project[];
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onSelectCategory: (categoryId: CategoryId) => void;
  onOpenUpload: (categoryId: CategoryId, folderId: string | null) => void;
  onCreateProjectInCategory: (categoryId: CategoryId) => void;
  onCreateFolder: (name: string, categoryId: CategoryId, parentId: string | null) => Promise<void>;
  onRenameFolder: (folder: FolderItem, newName: string) => Promise<void>;
  onDeleteFolder: (folder: FolderItem) => void;
  onPreviewFile: (file: PortfolioFile) => void;
  onEditFile: (file: PortfolioFile) => void;
  onDeleteFile: (file: PortfolioFile) => void;
  onToggleFileFavorite: (file: PortfolioFile) => void;
  onOpenProject: (project: Project) => void;
  onToggleProjectFavorite: (project: Project) => void;
}

export function CategoriesView({
  selectedCategory,
  folders,
  files,
  projects,
  viewMode,
  onChangeViewMode,
  onSelectCategory,
  onOpenUpload,
  onCreateProjectInCategory,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onPreviewFile,
  onEditFile,
  onDeleteFile,
  onToggleFileFavorite,
  onOpenProject,
  onToggleProjectFavorite,
}: CategoriesViewProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const activeCategoryDef = CATEGORY_MAP[selectedCategory];
  const activeTheme = CATEGORY_THEMES[selectedCategory];
  const categoryFolders = folders.filter((f) => f.categoryId === selectedCategory);
  const breadcrumbs = getFolderBreadcrumbs(categoryFolders, currentFolderId);

  const visibleFolders = categoryFolders.filter(
    (f) => f.parentId === currentFolderId
  );

  const visibleFiles = files.filter(
    (f) => f.categoryId === selectedCategory && f.folderId === currentFolderId
  );

  const categoryProjects = projects.filter(
    (p) => p.categoryId === selectedCategory
  );

  const handleCategorySwitch = (catId: CategoryId) => {
    onSelectCategory(catId);
    setCurrentFolderId(null);
    setCreatingFolder(false);
    setEditingFolderId(null);
  };

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await onCreateFolder(newFolderName.trim(), selectedCategory, currentFolderId);
    setNewFolderName('');
    setCreatingFolder(false);
  };

  const handleRenameSubmit = async (folder: FolderItem) => {
    if (editingFolderName.trim() && editingFolderName.trim() !== folder.name) {
      await onRenameFolder(folder, editingFolderName.trim());
    }
    setEditingFolderId(null);
  };

  return (
    <div className="space-y-8">
      {/* Category Selector Tabs */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#22211F] sm:text-3xl dark:text-[#F2EFE9]">
          Categorías del portafolio
        </h1>
        <p className="mt-1.5 text-sm text-[#666159] dark:text-[#A39E94]">
          Organiza carpetas, subcarpetas, archivos y proyectos dentro de cada área temática.
        </p>

        <div
          role="tablist"
          aria-label="Categorías principales"
          className="mt-5 flex flex-wrap gap-2"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedCategory;
            const catTheme = CATEGORY_THEMES[cat.id];
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleCategorySwitch(cat.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 sm:text-sm ${
                  isSelected
                    ? catTheme.activeTab
                    : 'border border-[#DCD6CA] bg-[#FDFCF9] text-[#4A463F] hover:bg-[#EFECE4] dark:border-[#2E2D2A] dark:bg-[#1A1A18] dark:text-[#D5D0C7] dark:hover:bg-[#242320]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Workspace Header */}
      <div
        className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${activeTheme.cardSurface}`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeTheme.iconBg}`}
          >
            <CategoryIcon categoryId={selectedCategory} className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-[#22211F] dark:text-[#F2EFE9]">
              {activeCategoryDef.name}
            </h2>
            <p className="mt-1 text-sm text-[#5C5852] dark:text-[#A39E94]">
              {activeCategoryDef.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCreatingFolder(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-xs font-medium text-[#3C3934] hover:bg-[#EFECE4] dark:border-[#32302C] dark:bg-[#22211E] dark:text-[#E5E0D8] dark:hover:bg-[#2B2A27]"
          >
            <FolderPlus className="h-4 w-4 text-[#4E687A] dark:text-[#9DB6C8]" />
            <span>Nueva carpeta</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenUpload(selectedCategory, currentFolderId)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E687A] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#3F5666] dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
          >
            <Upload className="h-4 w-4" />
            <span>Subir aquí</span>
          </button>

          <button
            type="button"
            onClick={() => onCreateProjectInCategory(selectedCategory)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-xs font-medium text-[#3C3934] hover:bg-[#EFECE4] dark:border-[#32302C] dark:bg-[#22211E] dark:text-[#E5E0D8] dark:hover:bg-[#2B2A27]"
          >
            <Plus className="h-4 w-4 text-[#5A7362] dark:text-[#A4BFAD]" />
            <span>Nuevo proyecto</span>
          </button>
        </div>
      </div>

      {/* Folder Breadcrumbs & Inline Folder Creator */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Ruta de carpetas" className="flex flex-wrap items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => setCurrentFolderId(null)}
              className={`rounded-md px-2 py-1 font-medium transition-colors ${
                currentFolderId === null
                  ? 'text-[#22211F] dark:text-[#F2EFE9]'
                  : 'text-[#78736A] hover:bg-[#EAE6DC] hover:text-[#22211F] dark:text-[#9A948A] dark:hover:bg-[#242320] dark:hover:text-[#F2EFE9]'
              }`}
            >
              {activeCategoryDef.shortName}
            </button>

            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={crumb.id} className="flex items-center gap-1">
                  <ChevronRight className="h-4 w-4 text-[#8D877D]" />
                  <button
                    type="button"
                    onClick={() => setCurrentFolderId(crumb.id)}
                    className={`rounded-md px-2 py-1 font-medium transition-colors ${
                      isLast
                        ? 'text-[#22211F] dark:text-[#F2EFE9]'
                        : 'text-[#78736A] hover:bg-[#EAE6DC] hover:text-[#22211F] dark:text-[#9A948A] dark:hover:bg-[#242320] dark:hover:text-[#F2EFE9]'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] p-1 dark:border-[#2B2A27] dark:bg-[#1A1A18]">
            <button
              type="button"
              onClick={() => onChangeViewMode('grid')}
              aria-label="Vista en cuadrícula"
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#4E687A] text-white dark:bg-[#5E7C91]'
                  : 'text-[#78736A] hover:text-[#22211F] dark:text-[#9A948A] dark:hover:text-[#F2EFE9]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('list')}
              aria-label="Vista en lista"
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#4E687A] text-white dark:bg-[#5E7C91]'
                  : 'text-[#78736A] hover:text-[#22211F] dark:text-[#9A948A] dark:hover:text-[#F2EFE9]'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {creatingFolder && (
          <form
            onSubmit={handleCreateFolderSubmit}
            className="flex flex-wrap items-center gap-2 rounded-xl border border-[#C8D5DE] bg-[#EEF3F6] p-3 dark:border-[#2C373F] dark:bg-[#1B2227]"
          >
            <FolderPlus className="h-4 w-4 text-[#4E687A] dark:text-[#9DB6C8]" />
            <input
              type="text"
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={
                currentFolderId ? 'Nombre de la subcarpeta...' : 'Nombre de la carpeta...'
              }
              className="min-w-[200px] flex-1 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-1.5 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#4E687A] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#3F5666] dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
            >
              Crear
            </button>
            <button
              type="button"
              onClick={() => {
                setCreatingFolder(false);
                setNewFolderName('');
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#666159] hover:bg-[#E4DFD5] dark:text-[#A39E94] dark:hover:bg-[#262522]"
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Folders Grid */}
        {visibleFolders.length > 0 && (
          <div>
            <h3 className="mb-2.5 text-xs font-medium text-[#666159] dark:text-[#A39E94]">
              Carpetas ({visibleFolders.length})
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {visibleFolders.map((folder) => {
                const subCount = categoryFolders.filter((f) => f.parentId === folder.id).length;
                const fileCount = files.filter((f) => f.folderId === folder.id).length;
                const isEditing = editingFolderId === folder.id;

                return (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#E2DDD2] bg-[#FDFCF9] px-3.5 py-3 transition-colors hover:border-[#C7C0B2] dark:border-[#2B2A27] dark:bg-[#1A1A18] dark:hover:border-[#3D3B36]"
                  >
                    {isEditing ? (
                      <div className="flex flex-1 items-center gap-1.5">
                        <input
                          type="text"
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit(folder);
                            if (e.key === 'Escape') setEditingFolderId(null);
                          }}
                          className="w-full rounded border border-[#CFC8B9] bg-[#FDFCF9] px-2 py-1 text-xs text-[#22211F] dark:border-[#3A3833] dark:bg-[#141413] dark:text-[#F2EFE9]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameSubmit(folder)}
                          aria-label="Guardar nombre de carpeta"
                          className="rounded p-1 text-[#3F5E4B] hover:bg-[#E4EDE7] dark:text-[#8FB09A] dark:hover:bg-[#222D26]"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFolderId(null)}
                          aria-label="Cancelar edición"
                          className="rounded p-1 text-[#78736A] hover:bg-[#EAE6DC] dark:hover:bg-[#262522]"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setCurrentFolderId(folder.id)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <Folder className={`h-5 w-5 shrink-0 ${activeTheme.accentText}`} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#22211F] dark:text-[#F2EFE9]">
                              {folder.name}
                            </p>
                            <p className="font-mono text-[11px] text-[#78736A] tabular-nums dark:text-[#9A948A]">
                              {pluralizeEs(fileCount, 'archivo', 'archivos')} ·{' '}
                              {pluralizeEs(subCount, 'subcarpeta', 'subcarpetas')}
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFolderId(folder.id);
                              setEditingFolderName(folder.name);
                            }}
                            aria-label={`Renombrar carpeta ${folder.name}`}
                            className="rounded-md p-1.5 text-[#78736A] hover:bg-[#EFECE4] hover:text-[#22211F] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteFolder(folder)}
                            aria-label={`Eliminar carpeta ${folder.name}`}
                            className="rounded-md p-1.5 text-[#78736A] hover:bg-[#F4E6E4] hover:text-[#8E4943] dark:hover:bg-[#2D201F] dark:hover:text-[#CC8A83]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Files in current folder */}
        <div>
          <h3 className="mb-3 text-xs font-medium text-[#666159] dark:text-[#A39E94]">
            Archivos en esta ubicación ({visibleFiles.length})
          </h3>

          {visibleFiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DCD6CA] bg-[#FDFCF9]/70 p-8 text-center dark:border-[#2B2A27] dark:bg-[#1A1A18]/60">
              <p className="text-sm text-[#666159] dark:text-[#A39E94]">
                No hay archivos en esta {currentFolderId ? 'carpeta' : 'categoría'} todavía.
              </p>
              <button
                type="button"
                onClick={() => onOpenUpload(selectedCategory, currentFolderId)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3.5 py-2 text-xs font-medium text-[#3C3934] hover:bg-[#EFECE4] dark:border-[#32302C] dark:bg-[#22211E] dark:text-[#E5E0D8] dark:hover:bg-[#2B2A27]"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Subir primer archivo aquí</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleFiles.map((file) => (
                <FileItemView
                  key={file.id}
                  file={file}
                  viewMode="grid"
                  onPreview={onPreviewFile}
                  onEdit={onEditFile}
                  onDelete={onDeleteFile}
                  onToggleFavorite={onToggleFileFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {visibleFiles.map((file) => (
                <FileItemView
                  key={file.id}
                  file={file}
                  viewMode="list"
                  onPreview={onPreviewFile}
                  onEdit={onEditFile}
                  onDelete={onDeleteFile}
                  onToggleFavorite={onToggleFileFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Projects (shown at root of category) */}
      {currentFolderId === null && (
        <section className="border-t border-[#E3DFD6] pt-8 dark:border-[#2A2926]">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-lg font-semibold text-[#22211F] dark:text-[#F2EFE9]">
              Proyectos en {activeCategoryDef.shortName} ({categoryProjects.length})
            </h3>
            <button
              type="button"
              onClick={() => onCreateProjectInCategory(selectedCategory)}
              className="text-xs font-medium text-[#4E687A] hover:text-[#2F4452] dark:text-[#9DB6C8]"
            >
              + Añadir proyecto
            </button>
          </div>

          {categoryProjects.length === 0 ? (
            <p className="mt-3 text-sm text-[#78736A] dark:text-[#A39E94]">
              No hay proyectos asociados a esta categoría todavía.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
              {categoryProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode="grid"
                  onOpen={onOpenProject}
                  onToggleFavorite={onToggleProjectFavorite}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
