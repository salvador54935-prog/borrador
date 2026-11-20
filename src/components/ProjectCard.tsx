import { useState } from 'react';
import { FolderKanban, Paperclip, Star } from 'lucide-react';
import { CATEGORY_MAP, CATEGORY_THEMES } from '../constants/categories';
import { formatDateEs } from '../utils/portfolioLogic';
import type { Project, ViewMode } from '../types/portfolio';
import { ProjectStatusLabel } from './ProjectStatusLabel';

interface ProjectCardProps {
  project: Project;
  viewMode?: ViewMode;
  onOpen: (project: Project) => void;
  onToggleFavorite: (project: Project) => void;
}

export function ProjectCard({
  project,
  viewMode = 'grid',
  onOpen,
  onToggleFavorite,
}: ProjectCardProps) {
  const [imgError, setImgError] = useState(false);
  const categoryName = CATEGORY_MAP[project.categoryId]?.shortName ?? project.categoryId;
  const themeTokens = CATEGORY_THEMES[project.categoryId];
  const hasCover = Boolean(project.coverImage) && !imgError;

  if (viewMode === 'list') {
    return (
      <article className="group flex flex-col gap-4 rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-4 transition-colors hover:border-[#C9C2B5] sm:flex-row sm:items-center sm:justify-between dark:border-[#2B2A27] dark:bg-[#1A1A18] dark:hover:border-[#3E3C37]">
        <div className="flex min-w-0 items-center gap-4">
          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-[#E2DDD2] bg-[#EFECE4] dark:border-[#2E2D29] dark:bg-[#23221F]">
            {hasCover ? (
              <img
                src={project.coverImage}
                alt={`Portada de ${project.title}`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#78736A] dark:text-[#9A948A]">
                <FolderKanban className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#666159] dark:text-[#A39E94]">
              <span className={`font-medium ${themeTokens.accentText}`}>
                {categoryName}
              </span>
              {project.course && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{project.course}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatDateEs(project.createdAt)}</span>
            </div>

            <button
              type="button"
              onClick={() => onOpen(project)}
              className="mt-1 block truncate text-left text-base font-semibold text-[#22211F] transition-colors hover:text-[#4E687A] focus-visible:outline-2 focus-visible:outline-[#4E687A] dark:text-[#F2EFE9] dark:hover:text-[#9DB6C8]"
            >
              {project.title}
            </button>

            <p className="mt-0.5 line-clamp-1 text-sm text-[#5C5852] dark:text-[#A39E94]">
              {project.description || 'Sin descripción registrada.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <ProjectStatusLabel status={project.status} />

          <span className="inline-flex items-center gap-1 font-mono text-xs text-[#666159] tabular-nums dark:text-[#A39E94]">
            <Paperclip className="h-3.5 w-3.5" />
            {project.relatedFileIds.length}
          </span>

          <button
            type="button"
            onClick={() => onToggleFavorite(project)}
            aria-label={
              project.favorite
                ? `Quitar ${project.title} de favoritos`
                : `Marcar ${project.title} como favorito`
            }
            className={`rounded-lg p-2 transition-colors ${
              project.favorite
                ? 'text-[#A6834B] hover:bg-[#F4EFE5] dark:text-[#D1B17B] dark:hover:bg-[#2A241C]'
                : 'text-[#8C867C] hover:bg-[#EFECE4] hover:text-[#4C4842] dark:hover:bg-[#262522] dark:hover:text-[#D5D0C7]'
            }`}
          >
            <Star className={`h-4 w-4 ${project.favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onOpen(project)}
            className="rounded-lg border border-[#DCD6CA] bg-[#F7F5F0] px-3 py-1.5 text-xs font-medium text-[#34322E] transition-colors hover:bg-[#EAE5DA] whitespace-nowrap shrink-0 dark:border-[#32302C] dark:bg-[#22211E] dark:text-[#E5E0D8] dark:hover:bg-[#2C2B27]"
          >
            Ver ficha
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] transition-colors hover:border-[#C9C2B5] dark:border-[#2B2A27] dark:bg-[#1A1A18] dark:hover:border-[#3E3C37]">
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`Abrir ficha del proyecto ${project.title}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFECE4] text-left focus-visible:outline-2 focus-visible:outline-[#4E687A] dark:bg-[#23221F]"
      >
        {hasCover ? (
          <img
            src={project.coverImage}
            alt={`Portada de ${project.title}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EFECE4] to-[#E5DFD2] p-6 text-[#666159] dark:from-[#23221F] dark:to-[#1B1A17] dark:text-[#A39E94]">
            <FolderKanban className="h-7 w-7 stroke-[1.5]" />
            <span className="text-center text-xs font-medium">{categoryName}</span>
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 truncate text-xs text-[#666159] dark:text-[#A39E94]">
            <span className={`truncate font-medium ${themeTokens.accentText}`}>
              {categoryName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono shrink-0 tabular-nums">
              {formatDateEs(project.createdAt)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(project)}
            aria-label={
              project.favorite
                ? `Quitar ${project.title} de favoritos`
                : `Marcar ${project.title} como favorito`
            }
            className={`-mr-1.5 rounded-lg p-1.5 transition-colors ${
              project.favorite
                ? 'text-[#A6834B] hover:bg-[#F4EFE5] dark:text-[#D1B17B] dark:hover:bg-[#2A241C]'
                : 'text-[#8C867C] hover:bg-[#EFECE4] hover:text-[#4C4842] dark:hover:bg-[#262522] dark:hover:text-[#D5D0C7]'
            }`}
          >
            <Star className={`h-4 w-4 ${project.favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onOpen(project)}
          className="font-display mt-1.5 text-left text-lg font-semibold leading-snug text-[#22211F] transition-colors hover:text-[#4E687A] focus-visible:outline-2 focus-visible:outline-[#4E687A] dark:text-[#F2EFE9] dark:hover:text-[#9DB6C8]"
        >
          {project.title}
        </button>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[#5C5852] dark:text-[#A39E94]">
          {project.description || 'Sin descripción registrada.'}
        </p>

        {project.tags.length > 0 && (
          <p className="mt-3 truncate text-xs text-[#78736A] dark:text-[#8E8980]">
            {project.tags.map((t) => `#${t}`).join(' · ')}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[#ECE8DF] pt-3.5 dark:border-[#2A2926]">
          <ProjectStatusLabel status={project.status} />

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 font-mono text-xs text-[#666159] tabular-nums dark:text-[#A39E94]">
              <Paperclip className="h-3.5 w-3.5" />
              {project.relatedFileIds.length}
            </span>
            <button
              type="button"
              onClick={() => onOpen(project)}
              className="text-xs font-medium text-[#4E687A] transition-colors hover:text-[#2F4452] dark:text-[#9DB6C8] dark:hover:text-[#C4D6E3]"
            >
              Ver ficha
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
