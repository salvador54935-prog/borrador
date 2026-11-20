import { useMemo, useState } from 'react';
import { LayoutGrid, List, Plus, Search, Star } from 'lucide-react';
import { CATEGORIES, PROJECT_STATUS_LABELS } from '../constants/categories';
import { collectAllTags, filterProjects } from '../utils/portfolioLogic';
import type {
  CategoryId,
  PortfolioFile,
  Project,
  ProjectFilterCriteria,
  ProjectStatus,
  ViewMode,
} from '../types/portfolio';
import { ProjectCard } from './ProjectCard';

interface ProjectsViewProps {
  projects: Project[];
  files: PortfolioFile[];
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onCreateProject: () => void;
  onOpenProject: (project: Project) => void;
  onToggleFavorite: (project: Project) => void;
}

export function ProjectsView({
  projects,
  files,
  viewMode,
  onChangeViewMode,
  onCreateProject,
  onOpenProject,
  onToggleFavorite,
}: ProjectsViewProps) {
  const [criteria, setCriteria] = useState<ProjectFilterCriteria>({
    search: '',
    categoryId: 'all',
    status: 'all',
    tag: '',
    onlyFavorites: false,
    sortBy: 'recent',
  });

  const tags = useMemo(() => collectAllTags(projects, files), [projects, files]);
  const filtered = useMemo(
    () => filterProjects(projects, criteria),
    [projects, criteria]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#22211F] sm:text-3xl dark:text-[#F2EFE9]">
            Proyectos y trabajos
          </h1>
          <p className="mt-1.5 text-sm text-[#666159] dark:text-[#A39E94]">
            Fichas individuales con portada, descripción, archivos vinculados y estado de avance.
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
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4E687A] px-4 py-2 text-xs font-medium text-white hover:bg-[#3F5666] sm:text-sm dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo proyecto</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="space-y-3 rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-4 dark:border-[#2B2A27] dark:bg-[#1A1A18]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status segmented control */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#EFECE3] p-1 dark:bg-[#242320]">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'pendiente', label: PROJECT_STATUS_LABELS.pendiente },
                { id: 'en_proceso', label: PROJECT_STATUS_LABELS.en_proceso },
                { id: 'terminado', label: PROJECT_STATUS_LABELS.terminado },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setCriteria((prev) => ({
                    ...prev,
                    status: opt.id as ProjectStatus | 'all',
                  }))
                }
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  criteria.status === opt.id
                    ? 'bg-[#FDFCF9] text-[#22211F] shadow-xs dark:bg-[#32302C] dark:text-[#F2EFE9]'
                    : 'text-[#666159] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:text-[#F2EFE9]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setCriteria((prev) => ({ ...prev, onlyFavorites: !prev.onlyFavorites }))
            }
            aria-pressed={criteria.onlyFavorites}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              criteria.onlyFavorites
                ? 'border-[#D5C3A1] bg-[#F4EFE5] text-[#6B573C] dark:border-[#4B4235] dark:bg-[#242019] dark:text-[#CAB99E]'
                : 'border-[#DCD6CA] bg-[#FDFCF9] text-[#4A463F] hover:bg-[#EFECE4] dark:border-[#32302C] dark:bg-[#22211E] dark:text-[#D5D0C7] dark:hover:bg-[#2B2A27]'
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${criteria.onlyFavorites ? 'fill-current text-[#A6834B]' : ''}`}
            />
            <span>Solo favoritos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="relative sm:col-span-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D877D]" />
            <input
              type="search"
              aria-label="Buscar proyectos"
              value={criteria.search}
              onChange={(e) =>
                setCriteria((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Buscar proyecto por título, curso o descripción..."
              className="w-full rounded-lg border border-[#DCD6CA] bg-[#F6F4EF] py-2 pl-9 pr-3 text-sm text-[#22211F] placeholder:text-[#8D877D] focus:border-[#4E687A] focus:bg-[#FDFCF9] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              aria-label="Filtrar proyectos por categoría"
              value={criteria.categoryId}
              onChange={(e) =>
                setCriteria((prev) => ({
                  ...prev,
                  categoryId: e.target.value as CategoryId | 'all',
                }))
              }
              className="w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            >
              <option value="all">Todas las categorías</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              aria-label="Filtrar proyectos por etiqueta"
              value={criteria.tag}
              onChange={(e) =>
                setCriteria((prev) => ({ ...prev, tag: e.target.value }))
              }
              className="w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            >
              <option value="">Etiquetas</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              aria-label="Ordenar proyectos"
              value={criteria.sortBy}
              onChange={(e) =>
                setCriteria((prev) => ({
                  ...prev,
                  sortBy: e.target.value as ProjectFilterCriteria['sortBy'],
                }))
              }
              className="w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="title">Título (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCD6CA] bg-[#FDFCF9] p-10 text-center dark:border-[#2B2A27] dark:bg-[#1A1A18]/60">
          <p className="text-sm font-medium text-[#22211F] dark:text-[#F2EFE9]">
            No hay proyectos que coincidan con estos filtros.
          </p>
          <button
            type="button"
            onClick={onCreateProject}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#4E687A] px-4 py-2 text-xs font-medium text-white hover:bg-[#3F5666] dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
          >
            <Plus className="h-4 w-4" />
            <span>Crear nuevo proyecto</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode="grid"
              onOpen={onOpenProject}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode="list"
              onOpen={onOpenProject}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
