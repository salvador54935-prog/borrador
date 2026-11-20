import { useMemo, useState } from 'react';
import {
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  Star,
  Upload,
} from 'lucide-react';
import { CATEGORIES, FILE_TYPE_LABELS } from '../constants/categories';
import {
  collectAllCourses,
  collectAllTags,
  filterFiles,
} from '../utils/portfolioLogic';
import type {
  CategoryId,
  FileFilterCriteria,
  FileTypeGroup,
  PortfolioFile,
  Project,
  ViewMode,
} from '../types/portfolio';
import { FileItemView } from './FileItemView';

interface FileManagerViewProps {
  files: PortfolioFile[];
  projects: Project[];
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenUpload: () => void;
  onPreviewFile: (file: PortfolioFile) => void;
  onEditFile: (file: PortfolioFile) => void;
  onDeleteFile: (file: PortfolioFile) => void;
  onToggleFavorite: (file: PortfolioFile) => void;
}

const DEFAULT_FILTER: FileFilterCriteria = {
  search: '',
  categoryId: 'all',
  fileType: 'all',
  tag: '',
  course: '',
  dateFrom: '',
  dateTo: '',
  onlyFavorites: false,
  sortBy: 'recent',
};

export function FileManagerView({
  files,
  projects,
  viewMode,
  onChangeViewMode,
  onOpenUpload,
  onPreviewFile,
  onEditFile,
  onDeleteFile,
  onToggleFavorite,
}: FileManagerViewProps) {
  const [criteria, setCriteria] = useState<FileFilterCriteria>(DEFAULT_FILTER);

  const availableTags = useMemo(() => collectAllTags(projects, files), [projects, files]);
  const availableCourses = useMemo(
    () => collectAllCourses(projects, files),
    [projects, files]
  );

  const filtered = useMemo(() => filterFiles(files, criteria), [files, criteria]);

  const hasActiveFilters =
    criteria.search !== '' ||
    criteria.categoryId !== 'all' ||
    criteria.fileType !== 'all' ||
    criteria.tag !== '' ||
    criteria.course !== '' ||
    criteria.dateFrom !== '' ||
    criteria.dateTo !== '' ||
    criteria.onlyFavorites;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#22211F] sm:text-3xl dark:text-[#F2EFE9]">
            Buscador y archivo general
          </h1>
          <p className="mt-1.5 text-sm text-[#666159] dark:text-[#A39E94]">
            Encuentra documentos por nombre, categoría, fecha, tipo de archivo, curso o etiquetas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4E687A] px-4 py-2 text-xs font-medium text-white hover:bg-[#3F5666] sm:text-sm dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
          >
            <Upload className="h-4 w-4" />
            <span>Subir archivo</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Panel */}
      <section
        aria-label="Buscador y filtros de archivos"
        className="space-y-4 rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-4 sm:p-5 dark:border-[#2B2A27] dark:bg-[#1A1A18]"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D877D]" />
            <input
              type="search"
              aria-label="Buscar archivos por nombre"
              value={criteria.search}
              onChange={(e) =>
                setCriteria((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Buscar por nombre, descripción o materia..."
              className="w-full rounded-lg border border-[#DCD6CA] bg-[#F6F4EF] py-2 pl-9 pr-3 text-sm text-[#22211F] placeholder:text-[#8D877D] focus:border-[#4E687A] focus:bg-[#FDFCF9] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9] dark:focus:border-[#6A8BA1]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filtrar por categoría"
              value={criteria.categoryId}
              onChange={(e) =>
                setCriteria((prev) => ({
                  ...prev,
                  categoryId: e.target.value as CategoryId | 'all',
                }))
              }
              className="w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            >
              <option value="all">Todas las categorías</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filtrar por tipo de archivo"
              value={criteria.fileType}
              onChange={(e) =>
                setCriteria((prev) => ({
                  ...prev,
                  fileType: e.target.value as FileTypeGroup | 'all',
                }))
              }
              className="w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            >
              <option value="all">Todos los tipos</option>
              {(Object.keys(FILE_TYPE_LABELS) as FileTypeGroup[]).map((type) => (
                <option key={type} value={type}>
                  {FILE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Ordenar archivos"
              value={criteria.sortBy}
              onChange={(e) =>
                setCriteria((prev) => ({
                  ...prev,
                  sortBy: e.target.value as FileFilterCriteria['sortBy'],
                }))
              }
              className="w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="name">Nombre (A-Z)</option>
              <option value="size">Mayor tamaño</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-[#EBE7DD] pt-3 sm:grid-cols-2 lg:grid-cols-5 dark:border-[#2A2926]">
          <div>
            <label
              htmlFor="filter-tag"
              className="block text-[11px] font-medium text-[#666159] dark:text-[#A39E94]"
            >
              Etiqueta
            </label>
            <select
              id="filter-tag"
              value={criteria.tag}
              onChange={(e) =>
                setCriteria((prev) => ({ ...prev, tag: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-2.5 py-1.5 text-xs text-[#22211F] dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            >
              <option value="">Todas las etiquetas</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-course"
              className="block text-[11px] font-medium text-[#666159] dark:text-[#A39E94]"
            >
              Curso o materia
            </label>
            <select
              id="filter-course"
              value={criteria.course}
              onChange={(e) =>
                setCriteria((prev) => ({ ...prev, course: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-2.5 py-1.5 text-xs text-[#22211F] dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            >
              <option value="">Todos los cursos</option>
              {availableCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-date-from"
              className="block text-[11px] font-medium text-[#666159] dark:text-[#A39E94]"
            >
              Fecha desde
            </label>
            <input
              id="filter-date-from"
              type="date"
              value={criteria.dateFrom}
              onChange={(e) =>
                setCriteria((prev) => ({ ...prev, dateFrom: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-2.5 py-1.5 text-xs text-[#22211F] dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            />
          </div>

          <div>
            <label
              htmlFor="filter-date-to"
              className="block text-[11px] font-medium text-[#666159] dark:text-[#A39E94]"
            >
              Fecha hasta
            </label>
            <input
              id="filter-date-to"
              type="date"
              value={criteria.dateTo}
              onChange={(e) =>
                setCriteria((prev) => ({ ...prev, dateTo: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-2.5 py-1.5 text-xs text-[#22211F] dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            />
          </div>

          <div className="flex items-end justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                setCriteria((prev) => ({ ...prev, onlyFavorites: !prev.onlyFavorites }))
              }
              aria-pressed={criteria.onlyFavorites}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                criteria.onlyFavorites
                  ? 'border-[#D5C3A1] bg-[#F4EFE5] text-[#6B573C] dark:border-[#4B4235] dark:bg-[#242019] dark:text-[#CAB99E]'
                  : 'border-[#DCD6CA] bg-[#FDFCF9] text-[#4A463F] hover:bg-[#EFECE4] dark:border-[#32302C] dark:bg-[#22211E] dark:text-[#D5D0C7] dark:hover:bg-[#2B2A27]'
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${criteria.onlyFavorites ? 'fill-current text-[#A6834B]' : ''}`}
              />
              <span>Favoritos</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setCriteria(DEFAULT_FILTER)}
                aria-label="Limpiar filtros"
                title="Restablecer filtros"
                className="rounded-lg border border-[#DCD6CA] p-1.5 text-[#78736A] hover:bg-[#EFECE4] hover:text-[#22211F] dark:border-[#32302C] dark:text-[#9A948A] dark:hover:bg-[#262522]"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-[#78736A] dark:text-[#9A948A]">
        <span className="font-mono tabular-nums">
          Mostrando {filtered.length} de {files.length} archivos
        </span>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCD6CA] bg-[#FDFCF9] p-10 text-center dark:border-[#2B2A27] dark:bg-[#1A1A18]/60">
          <p className="text-sm font-medium text-[#22211F] dark:text-[#F2EFE9]">
            No se encontraron archivos con los criterios seleccionados.
          </p>
          <p className="mt-1 text-xs text-[#666159] dark:text-[#A39E94]">
            Prueba ajustando los filtros o sube un nuevo documento desde tu dispositivo.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setCriteria(DEFAULT_FILTER)}
                className="rounded-lg border border-[#DCD6CA] px-3.5 py-2 text-xs font-medium text-[#4A463F] hover:bg-[#EFECE4] dark:border-[#32302C] dark:text-[#D5D0C7] dark:hover:bg-[#262522]"
              >
                Restablecer filtros
              </button>
            )}
            <button
              type="button"
              onClick={onOpenUpload}
              className="rounded-lg bg-[#4E687A] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#3F5666] dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
            >
              Subir archivo
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((file) => (
            <FileItemView
              key={file.id}
              file={file}
              viewMode="grid"
              onPreview={onPreviewFile}
              onEdit={onEditFile}
              onDelete={onDeleteFile}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((file) => (
            <FileItemView
              key={file.id}
              file={file}
              viewMode="list"
              onPreview={onPreviewFile}
              onEdit={onEditFile}
              onDelete={onDeleteFile}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
