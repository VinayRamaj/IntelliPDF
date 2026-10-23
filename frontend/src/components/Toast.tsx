import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl backdrop-blur-md border transition-all duration-300 animate-slide-up ${
              isSuccess
                ? "bg-slate-900/95 border-emerald-500/40 text-emerald-200"
                : isError
                ? "bg-slate-900/95 border-rose-500/40 text-rose-200"
                : "bg-slate-900/95 border-indigo-500/40 text-indigo-200"
            }`}
          >
            <div className="mt-0.5 text-lg shrink-0">
              {isSuccess && <FaCheckCircle className="text-emerald-400" />}
              {isError && <FaExclamationCircle className="text-rose-400" />}
              {!isSuccess && !isError && <FaInfoCircle className="text-indigo-400" />}
            </div>

            <p className="text-sm font-medium flex-1 text-slate-100">{toast.message}</p>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5 transition-colors"
              aria-label="Close notification"
            >
              <FaTimes size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
