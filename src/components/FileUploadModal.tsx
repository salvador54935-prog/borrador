import { useEffect, useState, useRef } from 'react';
import { Upload, X, FilePlus2 } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import { formatFileSize } from '../utils/portfolioLogic';
import type { CategoryId, FolderItem, Project } from '../types/portfolio';

interface FileUploadModalProps {
  open: boolean;
  folders: FolderItem[];
  projects: Project[];
  defaultCategoryId?: CategoryId;
  defaultFolderId?: string | null;
  defaultProjectId?: string | null;
  onClose: () => void;
  onUpload: (payload: {
    files: File[];
    categoryId: CategoryId;
    folderId: string | null;
    projectId: string | null;
    description: string;
    course: string;
    tags: string[];
    createdAt: string;
  }) => Promise<void>;
}

export function FileUploadModal({
  open,
  folders,
  projects,
  defaultCategoryId = 'trabajos-escolares',
  defaultFolderId = null,
  defaultProjectId = null,
  onClose,
  onUpload,
}: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [categoryId, setCategoryId] = useState<CategoryId>(defaultCategoryId);
  const [folderId, setFolderId] = useState<string>(defaultFolderId ?? '');
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? '');
  const [course, setCourse] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [description, setDescription] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().slice(0, 10));
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setCategoryId(defaultCategoryId);
      setFolderId(defaultFolderId ?? '');
      setProjectId(defaultProjectId ?? '');
      setErrorMsg('');
    }
  }, [open, defaultCategoryId, defaultFolderId, defaultProjectId]);

  if (!open) return null;

  const availableFolders = folders.filter((f) => f.categoryId === categoryId);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    setSelectedFiles((prev) => [...prev, ...incoming]);
    setErrorMsg('');
  };

  const removeFileAt = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setErrorMsg('Selecciona al menos un archivo para subir.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onUpload({
        files: selectedFiles,
        categoryId,
        folderId: folderId || null,
        projectId: projectId || null,
        description: description.trim(),
        course: course.trim(),
        tags,
        createdAt,
      });
      setSelectedFiles([]);
      setDescription('');
      setTagsText('');
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al subir los archivos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#181715]/50 p-4 backdrop-blur-xs"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-6 shadow-xl dark:border-[#2B2A27] dark:bg-[#1A1A18]">
        <div className="flex items-center justify-between gap-4 border-b border-[#EBE7DD] pb-4 dark:border-[#2A2926]">
          <div>
            <h2
              id="upload-modal-title"
              className="font-display text-lg font-semibold text-[#22211F] dark:text-[#F2EFE9]"
            >
              Subir archivos al portafolio
            </h2>
            <p className="mt-0.5 text-xs text-[#666159] dark:text-[#A39E94]">
              Compatible con PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), imágenes y documentos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de subida"
            className="rounded-lg p-2 text-[#78736A] hover:bg-[#EFECE4] hover:text-[#22211F] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFilesSelected(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              isDragging
                ? 'border-[#4E687A] bg-[#EEF3F6] dark:border-[#6A8BA1] dark:bg-[#1B2227]'
                : 'border-[#D5CFC2] bg-[#F6F4EF] hover:border-[#B8B0A0] dark:border-[#32302C] dark:bg-[#141413] dark:hover:border-[#494640]'
            }`}
          >
            <Upload className="h-7 w-7 text-[#4E687A] dark:text-[#9DB6C8]" />
            <p className="mt-2 text-sm font-medium text-[#22211F] dark:text-[#F2EFE9]">
              Arrastra tus archivos aquí o selecciónalos desde tu dispositivo
            </p>
            <p className="mt-1 text-xs text-[#666159] dark:text-[#A39E94]">
              PDF, Word, PowerPoint, PNG, JPG, SVG, TXT, Markdown y más (máx. 50 MB por archivo)
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.svg,.txt,.md,.csv,.json,.zip"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="sr-only"
              id="file-upload-input"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-4 py-2 text-xs font-medium text-[#3C3934] transition-colors hover:bg-[#EFECE4] dark:border-[#32302C] dark:bg-[#22211E] dark:text-[#E5E0D8] dark:hover:bg-[#2B2A27]"
            >
              <FilePlus2 className="h-4 w-4 text-[#4E687A] dark:text-[#9DB6C8]" />
              <span>Elegir archivos</span>
            </button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2 rounded-xl border border-[#E2DDD2] bg-[#F6F4EF] p-3 dark:border-[#2B2A27] dark:bg-[#141413]">
              <p className="text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]">
                Archivos listos para subir ({selectedFiles.length})
              </p>
              <ul className="max-h-36 space-y-1.5 overflow-y-auto">
                {selectedFiles.map((file, idx) => (
                  <li
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-[#FDFCF9] px-3 py-1.5 text-xs dark:bg-[#1A1A18]"
                  >
                    <span className="truncate font-medium text-[#22211F] dark:text-[#F2EFE9]">
                      {file.name}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[#78736A] tabular-nums dark:text-[#9A948A]">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFileAt(idx)}
                        aria-label={`Quitar ${file.name}`}
                        className="text-[#78736A] hover:text-[#8E4943] dark:hover:text-[#CC8A83]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="upload-category"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Categoría
              </label>
              <select
                id="upload-category"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value as CategoryId);
                  setFolderId('');
                }}
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="upload-folder"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Carpeta (opcional)
              </label>
              <select
                id="upload-folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              >
                <option value="">Raíz de la categoría</option>
                {availableFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="upload-project"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Vincular a proyecto (opcional)
              </label>
              <select
                id="upload-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              >
                <option value="">Sin proyecto asociado</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="upload-date"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Fecha
              </label>
              <input
                id="upload-date"
                type="date"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>

            <div>
              <label
                htmlFor="upload-course"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Curso o materia
              </label>
              <input
                id="upload-course"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Ej. Biología Molecular, Historia..."
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] placeholder:text-[#8D877D] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>

            <div>
              <label
                htmlFor="upload-tags"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Etiquetas (separadas por coma)
              </label>
              <input
                id="upload-tags"
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Ej. ensayo, lectura, parcial"
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] placeholder:text-[#8D877D] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="upload-description"
              className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
            >
              Descripción
            </label>
            <textarea
              id="upload-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agrega una breve nota sobre el contenido de estos archivos..."
              className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] placeholder:text-[#8D877D] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            />
          </div>

          {errorMsg && (
            <p role="alert" className="text-xs font-medium text-[#8E4943] dark:text-[#CC8A83]">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-[#EBE7DD] pt-4 dark:border-[#2A2926]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-[#DCD6CA] px-4 py-2 text-sm font-medium text-[#4A463F] hover:bg-[#EFECE4] dark:border-[#32302C] dark:text-[#D5D0C7] dark:hover:bg-[#262522]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#4E687A] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3F5666] disabled:opacity-50 dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
            >
              {submitting ? 'Subiendo...' : 'Guardar archivos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
