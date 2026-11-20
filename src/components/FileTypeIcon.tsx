import {
  File,
  FileCode2,
  FileImage,
  FileText,
  Presentation,
} from 'lucide-react';
import type { FileTypeGroup } from '../types/portfolio';

interface FileTypeIconProps {
  fileType: FileTypeGroup;
  className?: string;
}

export function FileTypeIcon({ fileType, className = 'h-5 w-5' }: FileTypeIconProps) {
  switch (fileType) {
    case 'pdf':
      return <FileText className={`${className} text-[#8F5B56] dark:text-[#CFA09B]`} />;
    case 'word':
      return <FileText className={`${className} text-[#4E687A] dark:text-[#96B2C5]`} />;
    case 'powerpoint':
      return <Presentation className={`${className} text-[#8E734E] dark:text-[#CCB492]`} />;
    case 'imagen':
      return <FileImage className={`${className} text-[#527263] dark:text-[#9DC0AF]`} />;
    case 'texto':
      return <FileCode2 className={`${className} text-[#6D6285] dark:text-[#B9AFCE]`} />;
    case 'otro':
    default:
      return <File className={`${className} text-[#6D675E] dark:text-[#AFA99E]`} />;
  }
}
