import {
  Compass,
  FileText,
  FolderArchive,
  GraduationCap,
  Microscope,
  Palette,
  Presentation,
} from 'lucide-react';
import type { CategoryId } from '../types/portfolio';

interface CategoryIconProps {
  categoryId: CategoryId;
  className?: string;
}

export function CategoryIcon({
  categoryId,
  className = 'h-4 w-4',
}: CategoryIconProps) {
  switch (categoryId) {
    case 'trabajos-escolares':
      return <GraduationCap className={className} />;
    case 'proyectos-personales':
      return <Compass className={className} />;
    case 'investigaciones':
      return <Microscope className={className} />;
    case 'exposiciones':
      return <Presentation className={className} />;
    case 'documentos-pdf':
      return <FileText className={className} />;
    case 'imagenes-disenos':
      return <Palette className={className} />;
    case 'otros-archivos':
    default:
      return <FolderArchive className={className} />;
  }
}
