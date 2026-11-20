import { useEffect, useState } from 'react';
import { Download, ExternalLink, X } from 'lucide-react';
import { CATEGORY_MAP, FILE_TYPE_LABELS } from '../constants/categories';
import { formatDateEs, formatFileSize } from '../utils/portfolioLogic';
import type { PortfolioFile } from '../types/portfolio';
import { FileTypeIcon } from './FileTypeIcon';

interface FilePreviewModalProps {
  file: PortfolioFile | null;
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (!file || file.fileType !== 'texto') {
      setTextContent(null);
      return;
    }

    let cancelled = false;
    setLoadingText(true);
    fetch(file.url)
      .then((res) => res.text())
      .then((content) => {
        if (!cancelled) setTextContent(content);
      })
      .catch(() => {
        if (!cancelled) setTextContent('No se pudo cargar la vista previa de texto.');
      })
      .finally(() => {
        if (!cancelled) setLoadingText(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  if (!file) return null;

  const categoryName = CATEGORY_MAP[file.categoryId]?.name ?? file.categoryId;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#181715]/60 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] shadow-2xl dark:border-[#2B2A27] dark:bg-[#1A1A18]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DDD2] px-5 py-4 dark:border-[#2A2926]">
          <div className="min-w-0 flex-1">
            <h2
              id="preview-modal-title"
              className="font-display truncate text-base font-semibold text-[#22211F] dark:text-[#F2EFE9]"
            >
              {file.name}
            </h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#666159] dark:text-[#A39E94]">
              <span>{FILE_TYPE_LABELS[file.fileType]}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatFileSize(file.size)}</span>
              <span aria-hidden="true">·</span>
              <span>{categoryName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatDateEs(file.createdAt)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-1.5 text-xs font-medium text-[#3C3934] hover:bg-[#EFECE4] dark:border-[#32302C] dark:bg-[#22211E] dark:text-[#E5E0D8] dark:hover:bg-[#2B2A27]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Abrir</span>
            </a>
            <a
              href={`${file.url}?download=1`}
              download={file.name}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E687A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3F5666] dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar vista previa"
              className="rounded-lg p-1.5 text-[#78736A] hover:bg-[#EFECE4] hover:text-[#22211F] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-[#F6F4EF] p-5 dark:bg-[#131312]">
          {file.fileType === 'imagen' && (
            <div className="flex min-h-[320px] items-center justify-center">
              <img
                src={file.url}
                alt={file.name}
                referrerPolicy="no-referrer"
                className="max-h-[68vh] max-w-full rounded-xl border border-[#E2DDD2] bg-[#FDFCF9] object-contain dark:border-[#2B2A27] dark:bg-[#1A1A18]"
              />
            </div>
          )}

          {file.fileType === 'pdf' && (
            <object
              data={file.url}
              type="application/pdf"
              aria-label={`Vista previa de ${file.name}`}
              className="h-[68vh] w-full rounded-xl border border-[#E2DDD2] bg-[#FDFCF9] dark:border-[#2B2A27]"
            >
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <FileTypeIcon fileType="pdf" className="h-12 w-12" />
                <p className="mt-4 text-sm font-medium text-[#22211F] dark:text-[#F2EFE9]">
                  Vista previa PDF integrada no disponible en este navegador.
                </p>
                <a
                  href={`${file.url}?download=1`}
                  download={file.name}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#4E687A] px-4 py-2 text-xs font-medium text-white hover:bg-[#3F5666] dark:bg-[#5E7C91]"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar PDF</span>
                </a>
              </div>
            </object>
          )}

          {file.fileType === 'texto' && (
            <div className="rounded-xl border border-[#E2DDD2] bg-[#FDFCF9] p-5 dark:border-[#2B2A27] dark:bg-[#1A1A18]">
              {loadingText ? (
                <p className="text-sm text-[#78736A]">Cargando documento...</p>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#22211F] dark:text-[#F2EFE9]">
                  {textContent}
                </pre>
              )}
            </div>
          )}

          {(file.fileType === 'word' ||
            file.fileType === 'powerpoint' ||
            file.fileType === 'otro') && (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-[#E2DDD2] bg-[#FDFCF9] p-8 text-center dark:border-[#2B2A27] dark:bg-[#1A1A18]">
              <FileTypeIcon fileType={file.fileType} className="h-12 w-12" />
              <h3 className="mt-4 text-base font-semibold text-[#22211F] dark:text-[#F2EFE9]">
                {file.name}
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-[#666159] dark:text-[#A39E94]">
                Los archivos en formato {FILE_TYPE_LABELS[file.fileType]} no se previsualizan directamente en el navegador. Puedes descargarlo o abrirlo con tu aplicación compatible.
              </p>
              {file.description && (
                <p className="mt-3 max-w-md text-xs text-[#78736A] dark:text-[#9A948A]">
                  {file.description}
                </p>
              )}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={`${file.url}?download=1`}
                  download={file.name}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#4E687A] px-4 py-2 text-sm font-medium text-white hover:bg-[#3F5666] dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar archivo</span>
                </a>
              </div>
            </div>
          )}

          {file.description && (file.fileType === 'imagen' || file.fileType === 'pdf' || file.fileType === 'texto') && (
            <div className="mt-4 rounded-xl border border-[#E2DDD2] bg-[#FDFCF9] px-4 py-3 text-sm text-[#666159] dark:border-[#2B2A27] dark:bg-[#1A1A18] dark:text-[#D5D0C7]">
              <span className="font-medium text-[#22211F] dark:text-[#F2EFE9]">Descripción: </span>
              {file.description}
              {file.course && (
                <span className="ml-2 text-xs text-[#78736A] dark:text-[#9A948A]">
                  · Curso: {file.course}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
