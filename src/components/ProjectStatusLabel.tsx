import { CheckCircle2, Clock, CircleDot } from 'lucide-react';
import { PROJECT_STATUS_LABELS } from '../constants/categories';
import type { ProjectStatus } from '../types/portfolio';

interface ProjectStatusLabelProps {
  status: ProjectStatus;
}

export function ProjectStatusLabel({ status }: ProjectStatusLabelProps) {
  const label = PROJECT_STATUS_LABELS[status];

  if (status === 'terminado') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[#3F5E4B] dark:text-[#9FC0AC]">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }

  if (status === 'en_proceso') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[#6B5A7E] dark:text-[#BEB2CE]">
        <CircleDot className="h-3.5 w-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[#756C5C] dark:text-[#C2B7A3]">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
