import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#181715]/50 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#E2DDD2] bg-[#FDFCF9] p-6 shadow-xl dark:border-[#2B2A27] dark:bg-[#1A1A18]">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4E6E4] text-[#8E4943] dark:bg-[#2D201F] dark:text-[#CC8A83]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id="confirm-dialog-title"
              className="text-base font-semibold text-[#22211F] dark:text-[#F2EFE9]"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#666159] dark:text-[#A39E94]">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] px-4 py-2 text-sm font-medium text-[#4A463F] transition-colors hover:bg-[#EFECE4] disabled:opacity-50 dark:border-[#32302C] dark:bg-[#22211E] dark:text-[#E5E0D8] dark:hover:bg-[#2B2A27]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-[#9B514B] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#82423D] disabled:opacity-50 dark:bg-[#A65952] dark:hover:bg-[#8E4943]"
          >
            {busy ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
