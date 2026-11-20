import { useState } from 'react';
import {
  Download,
  ExternalLink,
  Eye,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';
import {
  CATEGORY_MAP,
  CATEGORY_THEMES,
  FILE_TYPE_LABELS,
} from '../constants/categories';
import { formatDateEs, formatFileSize } from '../utils/portfolioLogic';
import type { PortfolioFile, ViewMode } from '../types/portfolio';
import { FileTypeIcon } from './FileTypeIcon';

interface FileItemViewProps {
  file: PortfolioFile;
  viewMode: ViewMode;
  onPreview: (file: PortfolioFile) => void;
  onEdit: (file: PortfolioFile) => void;
  onDelete: (file: PortfolioFile) => void;
  onToggleFavorite: (file: PortfolioFile) => void;
}

export function FileItemView({
  file,
  viewMode,
  onPreview,
  onEdit,
  onDelete,
  onToggleFavorite,
}: FileItemViewProps) {
  const [thumbError, setThumbError] = useState(false);
  const categoryName = CATEGORY_MAP[file.categoryId]?.shortName ?? file.categoryId;
  const themeTokens = CATEGORY_THEMES[file.categoryId];
  const typeLabel = FILE_TYPE_LABELS[file.fileType];

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-[#E2DDD2] bg-[#FDFCF9] px-4 py-3 transition-colors hover:border-[#C9C2B5] sm:flex-row sm:items-center sm:justify-between dark:border-[#2B2A27] dark:bg-[#1A1A18] dark:hover:border-[#3E3C37]">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E2DDD2] dark:border-[#2E2D29] ${
              file.fileType === 'imagen' && !thumbError ? 'bg-[#EFECE4]' : themeTokens.iconBg
            }`}
          >
            {file.fileType === 'imagen' && !thumbError ? (
              <img
                src={file.url}
                alt={file.name}
                referrerPolicy="no-referrer"
                onError={() => setThumbError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <FileTypeIcon fileType={file.fileType} className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onPreview(file)}
              className="block max-w-full truncate text-left text-sm font-semibold text-[#22211F] hover:text-[#4E687A] focus-visible:outline-2 focus-visible:outline-[#4E687A] dark:text-[#F2EFE9] dark:hover:text-[#9DB6C8]"
            >
              {file.name}
            </button>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#666159] dark:text-[#A39E94]">
              <span>{typeLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatFileSize(file.size)}</span>
              <span aria-hidden="true">·</span>
              <span className={`font-medium ${themeTokens.accentText}`}>{categoryName}</span>
              {file.course && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{file.course}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatDateEs(file.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleFavorite(file)}
            aria-label={
              file.favorite
                ? `Quitar ${file.name} de favoritos`
                : `Marcar ${file.name} como favorito`
            }
            className={`rounded-lg p-2 transition-colors ${
              file.favorite
                ? 'text-[#A6834B] hover:bg-[#F4EFE5] dark:text-[#D1B17B] dark:hover:bg-[#2A241C]'
                : 'text-[#8C867C] hover:bg-[#EFECE4] hover:text-[#4C4842] dark:hover:bg-[#262522] dark:hover:text-[#D5D0C7]'
            }`}
          >
            <Star className={`h-4 w-4 ${file.favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onPreview(file)}
            aria-label={`Visualizar ${file.name}`}
            title="Visualizar"
            className="rounded-lg p-2 text-[#666159] transition-colors hover:bg-[#EFECE4] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <Eye className="h-4 w-4" />
          </button>

          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${file.name} en nueva pestaña`}
            title="Abrir en nueva pestaña"
            className="rounded-lg p-2 text-[#666159] transition-colors hover:bg-[#EFECE4] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          <a
            href={`${file.url}?download=1`}
            download={file.name}
            aria-label={`Descargar ${file.name}`}
            title="Descargar"
            className="rounded-lg p-2 text-[#666159] transition-colors hover:bg-[#EFECE4] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <Download className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => onEdit(file)}
            aria-label={`Editar o mover ${file.name}`}
            title="Editar / Renombrar / Mover"
            className="rounded-lg p-2 text-[#666159] transition-colors hover:bg-[#EFECE4] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(file)}
            aria-label={`Eliminar ${file.name}`}
            title="Eliminar"
            className="rounded-lg p-2 text-[#666159] transition-colors hover:bg-[#F4ECEA] hover:text-[#8B5D57] dark:text-[#A39E94] dark:hover:bg-[#2E211F] dark:hover:text-[#CCA6A0]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-4 transition-colors hover:border-[#C9C2B5] dark:border-[#2B2A27] dark:bg-[#1A1A18] dark:hover:border-[#3E3C37]">
      <div>
        <button
          type="button"
          onClick={() => onPreview(file)}
          aria-label={`Visualizar ${file.name}`}
          className={`relative mb-3.5 flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-[#E6E1D7] transition-colors dark:border-[#2C2B28] ${
            file.fileType === 'imagen' && !thumbError
              ? 'bg-[#EFECE4]'
              : `${themeTokens.cardSurface}`
          }`}
        >
          {file.fileType === 'imagen' && !thumbError ? (
            <img
              src={file.url}
              alt={file.name}
              referrerPolicy="no-referrer"
              onError={() => setThumbError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <FileTypeIcon fileType={file.fileType} className="h-8 w-8" />
              <span className="font-mono text-[11px] font-medium text-[#5C5852] dark:text-[#A39E94]">
                {typeLabel}
              </span>
            </div>
          )}
        </button>

        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onPreview(file)}
            className="line-clamp-1 text-left text-sm font-semibold text-[#22211F] hover:text-[#4E687A] dark:text-[#F2EFE9] dark:hover:text-[#9DB6C8]"
          >
            {file.name}
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite(file)}
            aria-label={
              file.favorite
                ? `Quitar ${file.name} de favoritos`
                : `Marcar ${file.name} como favorito`
            }
            className={`-mr-1 shrink-0 rounded-md p-1 transition-colors ${
              file.favorite
                ? 'text-[#A6834B] dark:text-[#D1B17B]'
                : 'text-[#8C867C] hover:text-[#4C4842] dark:hover:text-[#D5D0C7]'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${file.favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#5C5852] dark:text-[#A39E94]">
          {file.description || 'Sin descripción.'}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#666159] dark:text-[#A39E94]">
          <span className={`font-medium ${themeTokens.accentText}`}>{categoryName}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formatFileSize(file.size)}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formatDateEs(file.createdAt)}</span>
        </div>

        {file.tags.length > 0 && (
          <p className="mt-1.5 truncate text-[11px] text-[#78736A] dark:text-[#8E8980]">
            {file.tags.map((t) => `#${t}`).join(' · ')}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#ECE8DF] pt-3 dark:border-[#2A2926]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPreview(file)}
            aria-label={`Visualizar ${file.name}`}
            title="Visualizar"
            className="rounded-lg p-1.5 text-[#666159] hover:bg-[#EFECE4] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <Eye className="h-4 w-4" />
          </button>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${file.name}`}
            title="Abrir en nueva pestaña"
            className="rounded-lg p-1.5 text-[#666159] hover:bg-[#EFECE4] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href={`${file.url}?download=1`}
            download={file.name}
            aria-label={`Descargar ${file.name}`}
            title="Descargar"
            className="rounded-lg p-1.5 text-[#666159] hover:bg-[#EFECE4] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(file)}
            aria-label={`Editar ${file.name}`}
            title="Renombrar / Editar / Mover"
            className="rounded-lg p-1.5 text-[#666159] hover:bg-[#EFECE4] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(file)}
            aria-label={`Eliminar ${file.name}`}
            title="Eliminar"
            className="rounded-lg p-1.5 text-[#666159] hover:bg-[#F4ECEA] hover:text-[#8B5D57] dark:text-[#A39E94] dark:hover:bg-[#2E211F] dark:hover:text-[#CCA6A0]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
