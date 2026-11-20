import { useEffect, useRef, useState } from 'react';
import {
  Download,
  Eye,
  ImagePlus,
  Paperclip,
  Pencil,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_MAP,
  DEFAULT_COVER_OPTIONS,
  PROJECT_STATUS_LABELS,
} from '../constants/categories';
import { formatDateEs, formatFileSize } from '../utils/portfolioLogic';
import type {
  CategoryId,
  PortfolioFile,
  Project,
  ProjectStatus,
} from '../types/portfolio';
import type { ProjectPayload } from '../services/api';
import { ProjectStatusLabel } from './ProjectStatusLabel';
import { FileTypeIcon } from './FileTypeIcon';

interface ProjectModalProps {
  open: boolean;
  project: Project | null; // null = create mode
  initialEditMode?: boolean;
  defaultCategoryId?: CategoryId;
  allFiles: PortfolioFile[];
  onClose: () => void;
  onSave: (id: string | null, payload: ProjectPayload) => Promise<Project>;
  onUploadCover: (projectId: string, file: File) => Promise<Project>;
  onDelete: (project: Project) => void;
  onPreviewFile: (file: PortfolioFile) => void;
  onUploadFileToProject: (projectId: string, categoryId: CategoryId, files: File[]) => Promise<void>;
}

export function ProjectModal({
  open,
  project,
  initialEditMode = false,
  defaultCategoryId = 'trabajos-escolares',
  allFiles,
  onClose,
  onSave,
  onUploadCover,
  onDelete,
  onPreviewFile,
  onUploadFileToProject,
}: ProjectModalProps) {
  const isNew = !project;
  const [editing, setEditing] = useState(isNew || initialEditMode);
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState<CategoryId>('trabajos-escolares');
  const [course, setCourse] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('en_proceso');
  const [favorite, setFavorite] = useState(false);
  const [featured, setFeatured] = useState(true);
  const [relatedFileIds, setRelatedFileIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const attachInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    if (project) {
      setTitle(project.title);
      setCoverImage(project.coverImage);
      setDescription(project.description);
      setCreatedAt(project.createdAt);
      setCategoryId(project.categoryId);
      setCourse(project.course);
      setTagsText(project.tags.join(', '));
      setStatus(project.status);
      setFavorite(project.favorite);
      setFeatured(project.featured);
      setRelatedFileIds(project.relatedFileIds);
      setEditing(initialEditMode);
    } else {
      setTitle('');
      setCoverImage(DEFAULT_COVER_OPTIONS[0].url);
      setDescription('');
      setCreatedAt(new Date().toISOString().slice(0, 10));
      setCategoryId(defaultCategoryId);
      setCourse('');
      setTagsText('');
      setStatus('en_proceso');
      setFavorite(false);
      setFeatured(true);
      setRelatedFileIds([]);
      setEditing(true);
    }
    setErrorMsg('');
  }, [open, project, initialEditMode, defaultCategoryId]);

  if (!open) return null;

  const linkedFiles = allFiles.filter((f) => relatedFileIds.includes(f.id));
  const unlinkedFiles = allFiles.filter((f) => !relatedFileIds.includes(f.id));

  const toggleLinkedFile = (fileId: string) => {
    setRelatedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('El título del proyecto es obligatorio.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onSave(project?.id ?? null, {
        title: title.trim(),
        coverImage: coverImage.trim(),
        description: description.trim(),
        createdAt,
        categoryId,
        course: course.trim(),
        tags,
        status,
        favorite,
        featured,
        relatedFileIds,
      });
      if (isNew) {
        onClose();
      } else {
        setEditing(false);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo guardar el proyecto.');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    setUploadingCover(true);
    try {
      const updated = await onUploadCover(project.id, file);
      setCoverImage(updated.coverImage);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !project) return;
    setUploadingFiles(true);
    try {
      await onUploadFileToProject(project.id, categoryId, Array.from(fileList));
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#181715]/55 p-4 backdrop-blur-xs"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] shadow-2xl dark:border-[#2B2A27] dark:bg-[#1A1A18]">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#E2DDD2] bg-[#FDFCF9]/95 px-6 py-4 backdrop-blur-md dark:border-[#2A2926] dark:bg-[#1A1A18]/95">
          <div className="min-w-0">
            <h2
              id="project-modal-title"
              className="font-display truncate text-lg font-semibold text-[#22211F] dark:text-[#F2EFE9]"
            >
              {isNew ? 'Nuevo proyecto' : editing ? 'Editar proyecto' : project.title}
            </h2>
            {!isNew && !editing && (
              <p className="mt-0.5 text-xs text-[#666159] dark:text-[#A39E94]">
                {CATEGORY_MAP[project.categoryId]?.name} · {formatDateEs(project.createdAt)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isNew && !editing && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] px-3 py-1.5 text-xs font-medium text-[#3C3934] hover:bg-[#EFECE4] dark:border-[#32302C] dark:text-[#E5E0D8] dark:hover:bg-[#262522]"
                >
                  <Pencil className="h-3.5 w-3.5 text-[#4E687A] dark:text-[#9DB6C8]" />
                  <span>Editar ficha</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(project)}
                  aria-label={`Eliminar proyecto ${project.title}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFC4C1] px-3 py-1.5 text-xs font-medium text-[#8E4943] hover:bg-[#F4E6E4] dark:border-[#492F2D] dark:text-[#CC8A83] dark:hover:bg-[#2D201F]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Eliminar</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ficha de proyecto"
              className="rounded-lg p-1.5 text-[#78736A] hover:bg-[#EFECE4] hover:text-[#22211F] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div>
              <label
                htmlFor="proj-title"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Título del proyecto
              </label>
              <input
                id="proj-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Investigación sobre energías renovables"
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="proj-category"
                  className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
                >
                  Categoría
                </label>
                <select
                  id="proj-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value as CategoryId)}
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
                  htmlFor="proj-status"
                  className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
                >
                  Estado del proyecto
                </label>
                <select
                  id="proj-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
                >
                  {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {PROJECT_STATUS_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="proj-date"
                  className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
                >
                  Fecha de creación
                </label>
                <input
                  id="proj-date"
                  type="date"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
                />
              </div>

              <div>
                <label
                  htmlFor="proj-course"
                  className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
                >
                  Curso o materia
                </label>
                <input
                  id="proj-course"
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Ej. Filosofía Contemporánea"
                  className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="proj-description"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Descripción
              </label>
              <textarea
                id="proj-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el objetivo, enfoque y contenido del proyecto..."
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>

            <div>
              <label
                htmlFor="proj-tags"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Etiquetas (separadas por coma)
              </label>
              <input
                id="proj-tags"
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Ej. ciencia, investigación, exposición"
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>

            {/* Cover image selector / uploader */}
            <div className="rounded-xl border border-[#E2DDD2] p-4 dark:border-[#2B2A27]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]">
                  Imagen de portada
                </span>
                {!isNew && (
                  <div>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFile}
                      className="sr-only"
                    />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] px-3 py-1.5 text-xs font-medium text-[#3C3934] hover:bg-[#EFECE4] dark:border-[#32302C] dark:text-[#E5E0D8] dark:hover:bg-[#262522]"
                    >
                      <ImagePlus className="h-3.5 w-3.5 text-[#4E687A] dark:text-[#9DB6C8]" />
                      <span>{uploadingCover ? 'Subiendo...' : 'Subir portada propia'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {DEFAULT_COVER_OPTIONS.map((opt) => (
                  <button
                    key={opt.url}
                    type="button"
                    onClick={() => setCoverImage(opt.url)}
                    className={`overflow-hidden rounded-lg border text-left transition-all ${
                      coverImage === opt.url
                        ? 'border-[#4E687A] ring-2 ring-[#4E687A]/25'
                        : 'border-[#DCD6CA] hover:border-[#B8B0A0] dark:border-[#32302C]'
                    }`}
                  >
                    <img
                      src={opt.url}
                      alt={opt.label}
                      referrerPolicy="no-referrer"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <span className="block truncate px-2 py-1 text-[11px] text-[#666159] dark:text-[#A39E94]">
                      {opt.label}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className={`flex aspect-[4/3] items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                    coverImage === ''
                      ? 'border-[#4E687A] bg-[#EEF3F6] text-[#3B5364] dark:bg-[#1B2227] dark:text-[#9DB6C8]'
                      : 'border-[#DCD6CA] text-[#666159] hover:bg-[#EFECE4] dark:border-[#32302C] dark:text-[#A39E94] dark:hover:bg-[#262522]'
                  }`}
                >
                  Sin portada
                </button>
              </div>
            </div>

            {/* Related files checklist */}
            <div className="rounded-xl border border-[#E2DDD2] p-4 dark:border-[#2B2A27]">
              <p className="text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]">
                Archivos relacionados ({relatedFileIds.length})
              </p>
              {allFiles.length === 0 ? (
                <p className="mt-2 text-xs text-[#78736A]">
                  Aún no hay archivos en el portafolio.
                </p>
              ) : (
                <div className="mt-2.5 grid max-h-40 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
                  {allFiles.map((file) => {
                    const checked = relatedFileIds.includes(file.id);
                    return (
                      <label
                        key={file.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#EBE7DD] px-2.5 py-1.5 text-xs hover:bg-[#F5F2EB] dark:border-[#2A2926] dark:hover:bg-[#22211E]"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLinkedFile(file.id)}
                          className="h-3.5 w-3.5 rounded border-[#CFC8B9] accent-[#4E687A]"
                        />
                        <span className="truncate text-[#22211F] dark:text-[#F2EFE9]">
                          {file.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#4A463F] dark:text-[#D5D0C7]">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(e) => setFavorite(e.target.checked)}
                  className="h-4 w-4 rounded border-[#CFC8B9] accent-[#4E687A]"
                />
                <span>Marcar como favorito</span>
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#4A463F] dark:text-[#D5D0C7]">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-[#CFC8B9] accent-[#4E687A]"
                />
                <span>Mostrar en Trabajos destacados</span>
              </label>
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-medium text-[#8E4943] dark:text-[#CC8A83]">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-[#EBE7DD] pt-4 dark:border-[#2A2926]">
              <button
                type="button"
                onClick={() => (isNew ? onClose() : setEditing(false))}
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
                {saving ? 'Guardando...' : isNew ? 'Crear proyecto' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 p-6">
            {project?.coverImage && (
              <div className="overflow-hidden rounded-xl border border-[#E2DDD2] dark:border-[#2B2A27]">
                <img
                  src={project.coverImage}
                  alt={`Portada de ${project.title}`}
                  referrerPolicy="no-referrer"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBE7DD] pb-4 dark:border-[#2A2926]">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#666159] dark:text-[#A39E94]">
                <ProjectStatusLabel status={project!.status} />
                <span aria-hidden="true">·</span>
                <span>{CATEGORY_MAP[project!.categoryId]?.name}</span>
                {project!.course && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Curso: {project!.course}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {formatDateEs(project!.createdAt)}
                </span>
              </div>

              {project!.favorite && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#A6834B] dark:text-[#CAB07A]">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>Favorito</span>
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xs font-medium text-[#666159] dark:text-[#A39E94]">
                Descripción
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#22211F] dark:text-[#E5E0D8]">
                {project!.description || 'Sin descripción registrada.'}
              </p>
              {project!.tags.length > 0 && (
                <p className="mt-3 text-xs text-[#78736A] dark:text-[#9A948A]">
                  Etiquetas: {project!.tags.map((t) => `#${t}`).join(' · ')}
                </p>
              )}
            </div>

            {/* Related files section */}
            <div className="border-t border-[#EBE7DD] pt-5 dark:border-[#2A2926]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[#22211F] dark:text-[#F2EFE9]">
                  <Paperclip className="h-4 w-4 text-[#4E687A] dark:text-[#9DB6C8]" />
                  <span>Archivos relacionados ({linkedFiles.length})</span>
                </h3>

                <div>
                  <input
                    ref={attachInputRef}
                    type="file"
                    multiple
                    onChange={handleDirectFileUpload}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => attachInputRef.current?.click()}
                    disabled={uploadingFiles}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] px-3 py-1.5 text-xs font-medium text-[#3C3934] hover:bg-[#EFECE4] dark:border-[#32302C] dark:text-[#E5E0D8] dark:hover:bg-[#262522]"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#4E687A] dark:text-[#9DB6C8]" />
                    <span>{uploadingFiles ? 'Subiendo...' : 'Subir archivo al proyecto'}</span>
                  </button>
                </div>
              </div>

              {linkedFiles.length === 0 ? (
                <p className="mt-3 text-sm text-[#666159] dark:text-[#A39E94]">
                  No hay archivos vinculados todavía. Sube uno o edita la ficha para asociar archivos existentes.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {linkedFiles.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#E2DDD2] bg-[#F6F4EF]/60 px-3.5 py-2.5 dark:border-[#2B2A27] dark:bg-[#141413]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileTypeIcon fileType={file.fileType} className="h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#22211F] dark:text-[#F2EFE9]">
                            {file.name}
                          </p>
                          <p className="font-mono text-xs text-[#78736A] tabular-nums dark:text-[#9A948A]">
                            {formatFileSize(file.size)} · {formatDateEs(file.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onPreviewFile(file)}
                          aria-label={`Visualizar ${file.name}`}
                          className="rounded-lg p-1.5 text-[#78736A] hover:bg-[#EAE6DC] hover:text-[#22211F] dark:text-[#9A948A] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <a
                          href={`${file.url}?download=1`}
                          download={file.name}
                          aria-label={`Descargar ${file.name}`}
                          className="rounded-lg p-1.5 text-[#78736A] hover:bg-[#EAE6DC] hover:text-[#22211F] dark:text-[#9A948A] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {unlinkedFiles.length > 0 && (
                <p className="mt-3 text-xs text-[#78736A] dark:text-[#9A948A]">
                  Puedes vincular más archivos existentes haciendo clic en “Editar ficha”.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
