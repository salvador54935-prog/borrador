import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import type { CategoryId, FolderItem, PortfolioFile, Project } from '../types/portfolio';

interface FileEditModalProps {
  file: PortfolioFile | null;
  folders: FolderItem[];
  projects: Project[];
  onClose: () => void;
  onSave: (
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
  ) => Promise<void>;
}

export function FileEditModal({
  file,
  folders,
  projects,
  onClose,
  onSave,
}: FileEditModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('otros-archivos');
  const [folderId, setFolderId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [course, setCourse] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (file) {
      setName(file.name);
      setCategoryId(file.categoryId);
      setFolderId(file.folderId ?? '');
      setProjectId(file.projectId ?? '');
      setCourse(file.course);
      setCreatedAt(file.createdAt);
      setTagsText(file.tags.join(', '));
      setDescription(file.description);
      setErrorMsg('');
    }
  }, [file]);

  if (!file) return null;

  const availableFolders = folders.filter((f) => f.categoryId === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre del archivo no puede estar vacío.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onSave(file.id, {
        name: name.trim(),
        categoryId,
        folderId: folderId || null,
        projectId: projectId || null,
        description: description.trim(),
        course: course.trim(),
        tags,
        createdAt,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo actualizar el archivo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-edit-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#181715]/50 p-4 backdrop-blur-xs"
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-6 shadow-xl dark:border-[#2B2A27] dark:bg-[#1A1A18]">
        <div className="flex items-center justify-between gap-4 border-b border-[#EBE7DD] pb-4 dark:border-[#2A2926]">
          <h2
            id="file-edit-title"
            className="font-display text-lg font-semibold text-[#22211F] dark:text-[#F2EFE9]"
          >
            Editar o mover archivo
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar editor de archivo"
            className="rounded-lg p-2 text-[#78736A] hover:bg-[#EFECE4] hover:text-[#22211F] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="edit-file-name"
              className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
            >
              Nombre del archivo
            </label>
            <input
              id="edit-file-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-file-category"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Mover a categoría
              </label>
              <select
                id="edit-file-category"
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
                htmlFor="edit-file-folder"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Carpeta
              </label>
              <select
                id="edit-file-folder"
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
                htmlFor="edit-file-project"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Proyecto relacionado
              </label>
              <select
                id="edit-file-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              >
                <option value="">Ninguno</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-file-date"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Fecha
              </label>
              <input
                id="edit-file-date"
                type="date"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>

            <div>
              <label
                htmlFor="edit-file-course"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Curso o materia
              </label>
              <input
                id="edit-file-course"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>

            <div>
              <label
                htmlFor="edit-file-tags"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Etiquetas (separadas por coma)
              </label>
              <input
                id="edit-file-tags"
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-file-description"
              className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
            >
              Descripción
            </label>
            <textarea
              id="edit-file-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
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
              disabled={saving}
              className="rounded-lg border border-[#DCD6CA] px-4 py-2 text-sm font-medium text-[#4A463F] hover:bg-[#EFECE4] dark:border-[#32302C] dark:text-[#D5D0C7] dark:hover:bg-[#262522]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#4E687A] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3F5666] disabled:opacity-50 dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
