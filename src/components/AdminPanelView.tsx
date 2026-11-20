import { useEffect, useRef, useState } from 'react';
import {
  Download,
  ImagePlus,
  Moon,
  Pencil,
  RotateCcw,
  Save,
  Sun,
  Trash2,
} from 'lucide-react';
import {
  CATEGORY_MAP,
  CATEGORY_THEMES,
  DEFAULT_AVATAR_URL,
  PROJECT_STATUS_LABELS,
} from '../constants/categories';
import { formatDateEs, formatFileSize } from '../utils/portfolioLogic';
import type {
  PortfolioFile,
  PortfolioProfile,
  Project,
  ProjectStatus,
} from '../types/portfolio';

interface AdminPanelViewProps {
  profile: PortfolioProfile;
  projects: Project[];
  files: PortfolioFile[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSaveProfile: (payload: Partial<PortfolioProfile>) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onOpenProject: (project: Project) => void;
  onChangeProjectStatus: (project: Project, status: ProjectStatus) => Promise<void>;
  onDeleteProject: (project: Project) => void;
  onEditFile: (file: PortfolioFile) => void;
  onDeleteFile: (file: PortfolioFile) => void;
}

export function AdminPanelView({
  profile,
  projects,
  files,
  theme,
  onToggleTheme,
  onSaveProfile,
  onUploadAvatar,
  onOpenProject,
  onChangeProjectStatus,
  onDeleteProject,
  onEditFile,
  onDeleteFile,
}: AdminPanelViewProps) {
  const [portfolioName, setPortfolioName] = useState(profile.portfolioName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [institution, setInstitution] = useState(profile.institution);
  const [welcomePhrase, setWelcomePhrase] = useState(profile.welcomePhrase);
  const [bio, setBio] = useState(profile.bio);
  const [showAvatar, setShowAvatar] = useState(profile.showAvatar);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPortfolioName(profile.portfolioName);
    setOwnerName(profile.ownerName);
    setInstitution(profile.institution);
    setWelcomePhrase(profile.welcomePhrase);
    setBio(profile.bio);
    setShowAvatar(profile.showAvatar);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile({
        portfolioName: portfolioName.trim() || profile.portfolioName,
        ownerName: ownerName.trim() || profile.ownerName,
        institution: institution.trim(),
        welcomePhrase: welcomePhrase.trim() || profile.welcomePhrase,
        bio: bio.trim(),
        showAvatar,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await onUploadAvatar(file);
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#22211F] sm:text-3xl dark:text-[#F2EFE9]">
            Panel de administración personal
          </h1>
          <p className="mt-1.5 text-sm text-[#666159] dark:text-[#A39E94]">
            Edita tu perfil, personaliza la apariencia y administra tus proyectos y archivos guardados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-2 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3.5 py-2 text-xs font-medium text-[#4A463F] hover:bg-[#EFECE4] dark:border-[#2E2D2A] dark:bg-[#1A1A18] dark:text-[#D5D0C7] dark:hover:bg-[#242320]"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-[#CAB99E]" />
                <span>Cambiar a modo claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[#716787]" />
                <span>Cambiar a modo oscuro</span>
              </>
            )}
          </button>

          <a
            href="/api/export"
            download="portafolio-respaldo.json"
            className="inline-flex items-center gap-2 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3.5 py-2 text-xs font-medium text-[#4A463F] hover:bg-[#EFECE4] dark:border-[#2E2D2A] dark:bg-[#1A1A18] dark:text-[#D5D0C7] dark:hover:bg-[#242320]"
          >
            <Download className="h-4 w-4 text-[#4E687A] dark:text-[#9DB6C8]" />
            <span>Exportar respaldo JSON</span>
          </a>
        </div>
      </div>

      {/* Profile Editor */}
      <section className="rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-6 dark:border-[#2B2A27] dark:bg-[#1A1A18]">
        <h2 className="font-display text-lg font-semibold text-[#22211F] dark:text-[#F2EFE9]">
          Perfil y presentación del portafolio
        </h2>
        <p className="mt-1 text-xs text-[#666159] dark:text-[#A39E94]">
          Los cambios se reflejan en la página principal y se guardan de forma permanente.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-5 border-b border-[#EBE7DD] pb-5 dark:border-[#2A2926]">
          <div className="aspect-[4/3] w-28 overflow-hidden rounded-xl border border-[#DCD6CA] bg-[#EFECE3] dark:border-[#32302C] dark:bg-[#22211E]">
            <img
              src={profile.avatarUrl || DEFAULT_AVATAR_URL}
              alt={`Ilustración de ${profile.portfolioName}`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-1.5 text-xs font-medium text-[#3C3934] hover:bg-[#EFECE4] dark:border-[#32302C] dark:bg-[#22211E] dark:text-[#E5E0D8] dark:hover:bg-[#2B2A27]"
              >
                <ImagePlus className="h-3.5 w-3.5 text-[#4E687A] dark:text-[#9DB6C8]" />
                <span>{uploadingAvatar ? 'Subiendo...' : 'Cambiar imagen'}</span>
              </button>

              {profile.avatarUrl !== DEFAULT_AVATAR_URL && (
                <button
                  type="button"
                  onClick={() => onSaveProfile({ avatarUrl: DEFAULT_AVATAR_URL })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] px-3 py-1.5 text-xs font-medium text-[#666159] hover:bg-[#EFECE4] dark:border-[#32302C] dark:text-[#A39E94] dark:hover:bg-[#262522]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restaurar ilustración</span>
                </button>
              )}
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-[#666159] dark:text-[#A39E94]">
              <input
                type="checkbox"
                checked={showAvatar}
                onChange={(e) => setShowAvatar(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#CFC8B9] accent-[#4E687A]"
              />
              <span>Mostrar ilustración principal en la página de inicio</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="admin-portfolio-name"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Nombre del portafolio
              </label>
              <input
                id="admin-portfolio-name"
                type="text"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-owner-name"
                className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
              >
                Nombre del propietario
              </label>
              <input
                id="admin-owner-name"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-institution"
              className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
            >
              Institución, grado o especialidad
            </label>
            <input
              id="admin-institution"
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            />
          </div>

          <div>
            <label
              htmlFor="admin-welcome"
              className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
            >
              Frase de bienvenida
            </label>
            <input
              id="admin-welcome"
              type="text"
              value={welcomePhrase}
              onChange={(e) => setWelcomePhrase(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            />
          </div>

          <div>
            <label
              htmlFor="admin-bio"
              className="block text-xs font-medium text-[#4A463F] dark:text-[#D5D0C7]"
            >
              Presentación breve
            </label>
            <textarea
              id="admin-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-2 text-sm text-[#22211F] focus:border-[#4E687A] focus:outline-none dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4E687A] px-5 py-2 text-sm font-medium text-white hover:bg-[#3F5666] disabled:opacity-50 dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Guardando...' : 'Guardar perfil'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Projects Quick Management Table */}
      <section className="rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-6 dark:border-[#2B2A27] dark:bg-[#1A1A18]">
        <h2 className="font-display text-lg font-semibold text-[#22211F] dark:text-[#F2EFE9]">
          Gestión rápida de proyectos ({projects.length})
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2DDD2] text-xs text-[#666159] dark:border-[#2A2926] dark:text-[#A39E94]">
                <th className="py-2.5 pr-4 font-medium">Proyecto</th>
                <th className="py-2.5 pr-4 font-medium">Categoría</th>
                <th className="py-2.5 pr-4 font-medium">Fecha</th>
                <th className="py-2.5 pr-4 font-medium">Estado</th>
                <th className="py-2.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE7DD] dark:divide-[#2A2926]">
              {projects.map((p) => {
                const catTheme = CATEGORY_THEMES[p.categoryId];
                return (
                  <tr key={p.id} className="hover:bg-[#F5F2EB] dark:hover:bg-[#22211E]">
                    <td className="py-3 pr-4 font-medium text-[#22211F] dark:text-[#F2EFE9]">
                      <button
                        type="button"
                        onClick={() => onOpenProject(p)}
                        className="text-left hover:text-[#4E687A] dark:hover:text-[#9DB6C8]"
                      >
                        {p.title}
                      </button>
                    </td>
                    <td className={`py-3 pr-4 text-xs font-medium ${catTheme.accentText}`}>
                      {CATEGORY_MAP[p.categoryId]?.shortName}
                    </td>
                    <td className="font-mono py-3 pr-4 text-xs text-[#78736A] tabular-nums dark:text-[#9A948A]">
                      {formatDateEs(p.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        aria-label={`Estado de ${p.title}`}
                        value={p.status}
                        onChange={(e) =>
                          onChangeProjectStatus(p, e.target.value as ProjectStatus)
                        }
                        className="rounded-md border border-[#DCD6CA] bg-[#FDFCF9] px-2 py-1 text-xs text-[#22211F] dark:border-[#32302C] dark:bg-[#141413] dark:text-[#F2EFE9]"
                      >
                        {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((st) => (
                          <option key={st} value={st}>
                            {PROJECT_STATUS_LABELS[st]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenProject(p)}
                          aria-label={`Editar ${p.title}`}
                          className="rounded-lg p-1.5 text-[#78736A] hover:bg-[#EAE6DC] hover:text-[#22211F] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProject(p)}
                          aria-label={`Eliminar ${p.title}`}
                          className="rounded-lg p-1.5 text-[#78736A] hover:bg-[#F4E6E4] hover:text-[#8E4943] dark:hover:bg-[#2D201F] dark:hover:text-[#CC8A83]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Files Quick Management Table */}
      <section className="rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-6 dark:border-[#2B2A27] dark:bg-[#1A1A18]">
        <h2 className="font-display text-lg font-semibold text-[#22211F] dark:text-[#F2EFE9]">
          Gestión rápida de archivos ({files.length})
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2DDD2] text-xs text-[#666159] dark:border-[#2A2926] dark:text-[#A39E94]">
                <th className="py-2.5 pr-4 font-medium">Archivo</th>
                <th className="py-2.5 pr-4 font-medium">Categoría</th>
                <th className="py-2.5 pr-4 font-medium">Tamaño</th>
                <th className="py-2.5 pr-4 font-medium">Fecha</th>
                <th className="py-2.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE7DD] dark:divide-[#2A2926]">
              {files.map((f) => {
                const catTheme = CATEGORY_THEMES[f.categoryId];
                return (
                  <tr key={f.id} className="hover:bg-[#F5F2EB] dark:hover:bg-[#22211E]">
                    <td className="max-w-[240px] truncate py-3 pr-4 font-medium text-[#22211F] dark:text-[#F2EFE9]">
                      {f.name}
                    </td>
                    <td className={`py-3 pr-4 text-xs font-medium ${catTheme.accentText}`}>
                      {CATEGORY_MAP[f.categoryId]?.shortName}
                    </td>
                    <td className="font-mono py-3 pr-4 text-xs text-[#78736A] tabular-nums dark:text-[#9A948A]">
                      {formatFileSize(f.size)}
                    </td>
                    <td className="font-mono py-3 pr-4 text-xs text-[#78736A] tabular-nums dark:text-[#9A948A]">
                      {formatDateEs(f.createdAt)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditFile(f)}
                          aria-label={`Editar ${f.name}`}
                          className="rounded-lg p-1.5 text-[#78736A] hover:bg-[#EAE6DC] hover:text-[#22211F] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteFile(f)}
                          aria-label={`Eliminar ${f.name}`}
                          className="rounded-lg p-1.5 text-[#78736A] hover:bg-[#F4E6E4] hover:text-[#8E4943] dark:hover:bg-[#2D201F] dark:hover:text-[#CC8A83]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
