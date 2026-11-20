import type { CategoryDefinition, CategoryId, FileTypeGroup, ProjectStatus } from '../types/portfolio';

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'trabajos-escolares',
    name: 'Trabajos escolares',
    shortName: 'Trabajos escolares',
    description: 'Tareas, ensayos, infografías, prácticas de clase y evaluaciones académicas.',
  },
  {
    id: 'proyectos-personales',
    name: 'Proyectos personales',
    shortName: 'Proyectos personales',
    description: 'Iniciativas independientes, prototipos, apuntes propios y desarrollos creativos.',
  },
  {
    id: 'investigaciones',
    name: 'Investigaciones',
    shortName: 'Investigaciones',
    description: 'Monografías, recopilaciones científicas, bitácoras y análisis bibliográficos.',
  },
  {
    id: 'exposiciones',
    name: 'Exposiciones y presentaciones',
    shortName: 'Exposiciones',
    description: 'Diapositivas, guiones de ponencia, material visual y presentaciones orales.',
  },
  {
    id: 'documentos-pdf',
    name: 'Documentos PDF',
    shortName: 'Documentos PDF',
    description: 'Lecturas digitales, artículos arbitrados, manuales y entregables finales en PDF.',
  },
  {
    id: 'imagenes-disenos',
    name: 'Imágenes y diseños',
    shortName: 'Imágenes y diseños',
    description: 'Láminas, diagramas, fotografías, bocetos y recursos gráficos.',
  },
  {
    id: 'otros-archivos',
    name: 'Otros archivos',
    shortName: 'Otros archivos',
    description: 'Hojas de datos, archivos comprimidos, notas de texto y formatos complementarios.',
  },
];

export interface CategoryTheme {
  cardSurface: string;
  iconBg: string;
  accentText: string;
  activeTab: string;
  colorName: string;
}

export const CATEGORY_THEMES: Record<CategoryId, CategoryTheme> = {
  'trabajos-escolares': {
    cardSurface:
      'bg-[#EDF2F5] border-[#D3DEE5] hover:border-[#B5C6D1] dark:bg-[#1B2227] dark:border-[#2C373F] dark:hover:border-[#3D4C57]',
    iconBg: 'bg-[#DCE6EC] text-[#3B5364] dark:bg-[#26333D] dark:text-[#9DB6C8]',
    accentText: 'text-[#3B5364] dark:text-[#9DB6C8]',
    activeTab: 'bg-[#4E687A] text-white dark:bg-[#5E7C91] dark:text-white',
    colorName: 'Azul grisáceo',
  },
  'proyectos-personales': {
    cardSurface:
      'bg-[#EEF3EF] border-[#D3DFD6] hover:border-[#B5C8BA] dark:bg-[#1B231E] dark:border-[#2B382F] dark:hover:border-[#3B4C41]',
    iconBg: 'bg-[#DCE7DF] text-[#3F5948] dark:bg-[#27352C] dark:text-[#A4BFAD]',
    accentText: 'text-[#3F5948] dark:text-[#A4BFAD]',
    activeTab: 'bg-[#5A7362] text-white dark:bg-[#6A8673] dark:text-white',
    colorName: 'Verde salvia',
  },
  investigaciones: {
    cardSurface:
      'bg-[#F1EFF6] border-[#DCD7E7] hover:border-[#C2BAD6] dark:bg-[#201E26] dark:border-[#322E3D] dark:hover:border-[#453F54]',
    iconBg: 'bg-[#E4E0EE] text-[#53496B] dark:bg-[#2E2A3A] dark:text-[#B9B0CE]',
    accentText: 'text-[#53496B] dark:text-[#B9B0CE]',
    activeTab: 'bg-[#716787] text-white dark:bg-[#827799] dark:text-white',
    colorName: 'Lavanda suave',
  },
  exposiciones: {
    cardSurface:
      'bg-[#F4EFE5] border-[#E3D9C7] hover:border-[#CCBEA5] dark:bg-[#242019] dark:border-[#383127] dark:hover:border-[#4B4235]',
    iconBg: 'bg-[#EAE0CF] text-[#6B573C] dark:bg-[#342D22] dark:text-[#CAB99E]',
    accentText: 'text-[#6B573C] dark:text-[#CAB99E]',
    activeTab: 'bg-[#866F50] text-white dark:bg-[#99805E] dark:text-white',
    colorName: 'Beige cálido',
  },
  'documentos-pdf': {
    cardSurface:
      'bg-[#F4ECEA] border-[#E3D2CE] hover:border-[#CCAFA9] dark:bg-[#251D1C] dark:border-[#3A2D2B] dark:hover:border-[#4E3D3A]',
    iconBg: 'bg-[#EADAD7] text-[#6E4742] dark:bg-[#362826] dark:text-[#CCA6A0]',
    accentText: 'text-[#6E4742] dark:text-[#CCA6A0]',
    activeTab: 'bg-[#8B5D57] text-white dark:bg-[#9D6D66] dark:text-white',
    colorName: 'Arcilla suave',
  },
  'imagenes-disenos': {
    cardSurface:
      'bg-[#ECF2F1] border-[#D1DFDD] hover:border-[#B1C8C5] dark:bg-[#1A2221] dark:border-[#2A3735] dark:hover:border-[#3B4C49]',
    iconBg: 'bg-[#DAE7E5] text-[#385754] dark:bg-[#253432] dark:text-[#9FC0BC]',
    accentText: 'text-[#385754] dark:text-[#9FC0BC]',
    activeTab: 'bg-[#4E706D] text-white dark:bg-[#5E8380] dark:text-white',
    colorName: 'Eucalipto',
  },
  'otros-archivos': {
    cardSurface:
      'bg-[#EFECE6] border-[#DDD8CE] hover:border-[#C4BDB0] dark:bg-[#1F1E1C] dark:border-[#32302C] dark:hover:border-[#45423C]',
    iconBg: 'bg-[#E2DDD4] text-[#524E46] dark:bg-[#2D2B27] dark:text-[#BAB4A9]',
    accentText: 'text-[#524E46] dark:text-[#BAB4A9]',
    activeTab: 'bg-[#676157] text-white dark:bg-[#7A7367] dark:text-white',
    colorName: 'Gris cálido',
  },
};

export const CATEGORY_MAP: Record<CategoryId, CategoryDefinition> = CATEGORIES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<CategoryId, CategoryDefinition>
);

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  terminado: 'Terminado',
};

export const FILE_TYPE_LABELS: Record<FileTypeGroup, string> = {
  pdf: 'PDF',
  word: 'Word',
  powerpoint: 'PowerPoint',
  imagen: 'Imagen',
  texto: 'Texto',
  otro: 'Otro',
};

export const DEFAULT_COVER_OPTIONS = [
  {
    label: 'Óptica e investigación',
    url: '/src/assets/images/cover_investigacion_cientifica_1795147690830.jpg',
  },
  {
    label: 'Estudio de filosofía',
    url: '/src/assets/images/cover_infografia_filosofia_1795147690861.jpg',
  },
  {
    label: 'Prisma y ciencias',
    url: '/src/assets/images/cover_presentacion_ciencias_1795147690583.jpg',
  },
];

export const DEFAULT_AVATAR_URL =
  '/src/assets/images/hero_portfolio_illustration_1795148460396.jpg';
