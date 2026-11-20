import { useState } from 'react';
import {
  ArrowRight,
  FolderOpen,
  FolderKanban,
  Files,
  HardDrive,
  Moon,
  Plus,
  Star,
  Sun,
  UserCog,
} from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_THEMES,
  DEFAULT_AVATAR_URL,
} from '../constants/categories';
import { formatFileSize, pluralizeEs } from '../utils/portfolioLogic';
import type { PortfolioStats } from '../utils/portfolioLogic';
import type {
  ActiveSection,
  CategoryId,
  PortfolioFile,
  PortfolioProfile,
  Project,
} from '../types/portfolio';
import { ProjectCard } from './ProjectCard';
import { FileTypeIcon } from './FileTypeIcon';
import { CategoryIcon } from './CategoryIcon';

interface HomeViewProps {
  profile: PortfolioProfile;
  stats: PortfolioStats;
  projects: Project[];
  recentFiles: PortfolioFile[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigateSection: (section: ActiveSection) => void;
  onOpenCategory: (categoryId: CategoryId) => void;
  onOpenProject: (project: Project) => void;
  onCreateProject: () => void;
  onToggleProjectFavorite: (project: Project) => void;
  onPreviewFile: (file: PortfolioFile) => void;
}

export function HomeView({
  profile,
  stats,
  projects,
  recentFiles,
  theme,
  onToggleTheme,
  onNavigateSection,
  onOpenCategory,
  onOpenProject,
  onCreateProject,
  onToggleProjectFavorite,
  onPreviewFile,
}: HomeViewProps) {
  const [heroImgError, setHeroImgError] = useState(false);

  const featuredProjects = projects.filter((p) => p.featured || p.favorite).slice(0, 3);
  const recentProjects = [...projects]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const heroIllustrationSrc = profile.avatarUrl || DEFAULT_AVATAR_URL;

  return (
    <div className="space-y-14">
      {/* Hero Section */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium text-[#666159] dark:text-[#A39E94]">
            {profile.ownerName}
            {profile.institution ? ` · ${profile.institution}` : ''}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-1.5 text-xs font-medium text-[#4A463F] transition-colors hover:bg-[#EFECE4] dark:border-[#2E2D2A] dark:bg-[#1C1B19] dark:text-[#D5D0C7] dark:hover:bg-[#262522]"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-[#CAB99E]" />
                  <span>Modo claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-[#716787]" />
                  <span>Modo oscuro</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection('administrar')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-3 py-1.5 text-xs font-medium text-[#4A463F] transition-colors hover:bg-[#EFECE4] dark:border-[#2E2D2A] dark:bg-[#1C1B19] dark:text-[#D5D0C7] dark:hover:bg-[#262522]"
            >
              <UserCog className="h-3.5 w-3.5 text-[#4E687A] dark:text-[#9DB6C8]" />
              <span>Editar perfil</span>
            </button>
          </div>
        </div>

        {/* Matte Editorial Hero Canvas */}
        <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-[#E2DDD2] bg-[#EFECE3]/80 p-6 sm:p-8 lg:grid-cols-12 lg:p-10 dark:border-[#2A2926] dark:bg-[#1A1A18]">
          <div className={profile.showAvatar ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <p className="text-xs font-medium tracking-wide text-[#4E687A] dark:text-[#9DB6C8]">
              Espacio académico y creativo
            </p>

            <h1 className="font-display mt-2 max-w-2xl text-balance text-3xl font-bold tracking-tight text-[#22211F] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] dark:text-[#F2EFE9]">
              {profile.portfolioName}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#45423D] sm:text-lg dark:text-[#D5D0C7]">
              {profile.welcomePhrase}
            </p>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#666159] dark:text-[#A39E94]">
              {profile.bio}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onCreateProject}
                className="inline-flex items-center gap-2 rounded-lg bg-[#4E687A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3F5666] focus-visible:outline-2 focus-visible:outline-[#4E687A] dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo proyecto</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection('archivos')}
                className="inline-flex items-center gap-2 rounded-lg border border-[#C7D5CB] bg-[#E9F0EB] px-4 py-2.5 text-sm font-medium text-[#344B3C] transition-colors hover:bg-[#DCE7DF] dark:border-[#314037] dark:bg-[#1E2721] dark:text-[#B4CEBD] dark:hover:bg-[#26322A]"
              >
                <FolderOpen className="h-4 w-4" />
                <span>Explorar archivos</span>
              </button>
            </div>
          </div>

          {profile.showAvatar && (
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#DCD5C7] bg-[#FDFCF9] shadow-xs dark:border-[#32302C] dark:bg-[#22211E]">
                {heroIllustrationSrc && !heroImgError ? (
                  <img
                    src={heroIllustrationSrc}
                    alt={`Ilustración editorial de ${profile.portfolioName}`}
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#E9EFF3] via-[#F4EFE5] to-[#EFEDF5] p-6 text-center dark:from-[#1D2429] dark:via-[#24211B] dark:to-[#221F2A]">
                    <FolderKanban className="h-9 w-9 text-[#4E687A] dark:text-[#9DB6C8]" />
                    <span className="font-display text-sm font-semibold text-[#3C3934] dark:text-[#E5E0D8]">
                      {profile.portfolioName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Full-width 4-column Statistics Strip with Soft Matte Accents */}
        <div
          aria-label="Estadísticas del portafolio"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          <div className="rounded-2xl border border-[#D4DFE6] bg-[#EEF3F6] p-4 sm:p-5 dark:border-[#2C373F] dark:bg-[#1B2227]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#465E6F] dark:text-[#A4BCCB]">
                Proyectos guardados
              </p>
              <FolderKanban className="h-4 w-4 text-[#4E687A] dark:text-[#89A5B8]" />
            </div>
            <p className="font-mono mt-2 text-2xl font-semibold text-[#22211F] tabular-nums dark:text-[#F2EFE9]">
              {stats.totalProjects}
            </p>
            <p className="mt-1 text-xs text-[#596975] dark:text-[#98A6B0]">
              {pluralizeEs(stats.completedProjects, 'terminado', 'terminados')} ·{' '}
              {stats.inProgressProjects} en proceso
            </p>
          </div>

          <div className="rounded-2xl border border-[#D3DFD6] bg-[#EEF3EF] p-4 sm:p-5 dark:border-[#2B382F] dark:bg-[#1B231E]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#3E5847] dark:text-[#A4BFAD]">
                Archivos totales
              </p>
              <Files className="h-4 w-4 text-[#5A7362] dark:text-[#8FB09A]" />
            </div>
            <p className="font-mono mt-2 text-2xl font-semibold text-[#22211F] tabular-nums dark:text-[#F2EFE9]">
              {stats.totalFiles}
            </p>
            <p className="mt-1 text-xs text-[#556B5C] dark:text-[#95AA9C]">
              En {pluralizeEs(stats.totalFolders, 'carpeta organizada', 'carpetas organizadas')}
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDD7E7] bg-[#F1EFF6] p-4 sm:p-5 dark:border-[#322E3D] dark:bg-[#201E26]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#53496B] dark:text-[#B9B0CE]">
                Elementos favoritos
              </p>
              <Star className="h-4 w-4 text-[#716787] dark:text-[#A69BBF]" />
            </div>
            <p className="font-mono mt-2 text-2xl font-semibold text-[#22211F] tabular-nums dark:text-[#F2EFE9]">
              {stats.favoriteCount}
            </p>
            <p className="mt-1 text-xs text-[#645C78] dark:text-[#A199B2]">
              Proyectos y archivos destacados
            </p>
          </div>

          <div className="rounded-2xl border border-[#E3D9C7] bg-[#F4EFE5] p-4 sm:p-5 dark:border-[#383127] dark:bg-[#242019]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#6B573C] dark:text-[#CAB99E]">
                Almacenamiento usado
              </p>
              <HardDrive className="h-4 w-4 text-[#866F50] dark:text-[#B9A487]" />
            </div>
            <p className="font-mono mt-2 text-2xl font-semibold text-[#22211F] tabular-nums dark:text-[#F2EFE9]">
              {formatFileSize(stats.totalBytes)}
            </p>
            <p className="mt-1 text-xs text-[#736450] dark:text-[#ABA08F]">
              7 categorías principales
            </p>
          </div>
        </div>
      </section>

      {/* Quick Access to Categories with Dedicated Matte Tints */}
      <section aria-labelledby="home-categories-heading">
        <div className="flex items-end justify-between gap-4 border-b border-[#E3DFD6] pb-3 dark:border-[#2A2926]">
          <div>
            <h2
              id="home-categories-heading"
              className="font-display text-xl font-semibold text-[#22211F] dark:text-[#F2EFE9]"
            >
              Acceso rápido por categoría
            </h2>
            <p className="mt-1 text-sm text-[#666159] dark:text-[#A39E94]">
              Explora trabajos, documentos y recursos clasificados con identidad cromática propia.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSection('categorias')}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#4E687A] hover:text-[#2F4452] whitespace-nowrap shrink-0 dark:text-[#9DB6C8] dark:hover:text-[#C4D6E3]"
          >
            <span>Ver todas</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category, idx) => {
            const catStat = stats.byCategory[category.id];
            const themeTokens = CATEGORY_THEMES[category.id];
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onOpenCategory(category.id)}
                className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#4E687A] ${themeTokens.cardSurface}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${themeTokens.iconBg}`}
                    >
                      <CategoryIcon categoryId={category.id} className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-xs text-[#78736A] tabular-nums dark:text-[#8E8980]">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="font-display mt-3 text-base font-semibold text-[#22211F] dark:text-[#F2EFE9]">
                    {category.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#5C5852] dark:text-[#A39E94]">
                    {category.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <p
                    className={`font-mono text-xs font-medium tabular-nums ${themeTokens.accentText}`}
                  >
                    {pluralizeEs(catStat.projectCount, 'proyecto', 'proyectos')} ·{' '}
                    {pluralizeEs(catStat.fileCount, 'archivo', 'archivos')}
                  </p>
                  <ArrowRight
                    className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${themeTokens.accentText}`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Trabajos Destacados */}
      <section aria-labelledby="home-featured-heading">
        <div className="flex items-end justify-between gap-4 border-b border-[#E3DFD6] pb-3 dark:border-[#2A2926]">
          <div>
            <h2
              id="home-featured-heading"
              className="font-display text-xl font-semibold text-[#22211F] dark:text-[#F2EFE9]"
            >
              Trabajos destacados
            </h2>
            <p className="mt-1 text-sm text-[#666159] dark:text-[#A39E94]">
              Selección principal de investigaciones, material visual y exposiciones.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSection('proyectos')}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#4E687A] hover:text-[#2F4452] whitespace-nowrap shrink-0 dark:text-[#9DB6C8] dark:hover:text-[#C4D6E3]"
          >
            <span>Todos los proyectos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {featuredProjects.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-8 text-center dark:border-[#2B2A27] dark:bg-[#1A1A18]">
            <p className="text-sm text-[#666159] dark:text-[#A39E94]">
              Aún no hay trabajos destacados. Marca cualquier proyecto como destacado o favorito para mostrarlo aquí.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            {featuredProjects.map((project) => (
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

      {/* Proyectos Recientes + Archivos Recientes */}
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex items-end justify-between gap-4 border-b border-[#E3DFD6] pb-3 dark:border-[#2A2926]">
            <h2 className="font-display text-xl font-semibold text-[#22211F] dark:text-[#F2EFE9]">
              Proyectos recientes
            </h2>
            <button
              type="button"
              onClick={() => onNavigateSection('proyectos')}
              className="text-xs font-medium text-[#4E687A] hover:text-[#2F4452] dark:text-[#9DB6C8]"
            >
              Gestionar
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-[#666159] dark:text-[#A39E94]">
                No hay proyectos registrados todavía.
              </p>
            ) : (
              recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode="list"
                  onOpen={onOpenProject}
                  onToggleFavorite={onToggleProjectFavorite}
                />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="flex items-end justify-between gap-4 border-b border-[#E3DFD6] pb-3 dark:border-[#2A2926]">
            <h2 className="font-display text-xl font-semibold text-[#22211F] dark:text-[#F2EFE9]">
              Archivos recientes
            </h2>
            <button
              type="button"
              onClick={() => onNavigateSection('archivos')}
              className="text-xs font-medium text-[#4E687A] hover:text-[#2F4452] dark:text-[#9DB6C8]"
            >
              Ver archivo
            </button>
          </div>

          <div className="mt-4 divide-y divide-[#E7E2D8] rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] dark:divide-[#2A2926] dark:border-[#2B2A27] dark:bg-[#1A1A18]">
            {recentFiles.length === 0 ? (
              <p className="p-5 text-sm text-[#666159] dark:text-[#A39E94]">
                No hay archivos subidos todavía.
              </p>
            ) : (
              recentFiles.slice(0, 5).map((file) => {
                const themeTokens = CATEGORY_THEMES[file.categoryId];
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => onPreviewFile(file)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F4F1EA] first:rounded-t-2xl last:rounded-b-2xl dark:hover:bg-[#22211E]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeTokens.iconBg}`}
                      >
                        <FileTypeIcon fileType={file.fileType} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#22211F] dark:text-[#F2EFE9]">
                          {file.name}
                        </p>
                        <p className="truncate text-xs text-[#666159] dark:text-[#A39E94]">
                          {file.course || 'Documento personal'}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#78736A] shrink-0 tabular-nums dark:text-[#9A948A]">
                      {formatFileSize(file.size)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
