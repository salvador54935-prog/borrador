import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  text: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg transition-all duration-200 ${
            toast.type === 'success'
              ? 'border-[#D3DFD6] bg-[#FDFCF9] text-[#22211F] dark:border-[#2B382F] dark:bg-[#1A1A18] dark:text-[#F2EFE9]'
              : 'border-[#E3D2CE] bg-[#F8EFEF] text-[#6E3C38] dark:border-[#492F2D] dark:bg-[#251D1C] dark:text-[#E5B8B4]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5A7362] dark:text-[#8FB09A]" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-[#8E4943] dark:text-[#CC8A83]" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificación"
            className="rounded-md p-1 text-[#78736A] hover:bg-[#EFECE4] hover:text-[#22211F] dark:hover:bg-[#262522] dark:hover:text-[#F2EFE9]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
