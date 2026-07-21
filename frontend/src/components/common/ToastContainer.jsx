import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const typeConfig = {
  success: { icon: CheckCircle, color: "#10b981" },
  error: { icon: XCircle, color: "#dc2626" },
  info: { icon: Info, color: "#0097b2" },
};

const ToastItem = ({ toast, removeToast, duration }) => {
  const [progress, setProgress] = useState(100);
  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div
      className="relative flex items-start gap-3 p-4 pr-8 rounded-2xl overflow-hidden pointer-events-auto"
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: `3px solid ${config.color}`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02)`,
        animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      <div
        className="p-1.5 rounded-lg shrink-0"
        style={{ background: `${config.color}1A` }}
      >
        <Icon size={16} style={{ color: config.color }} />
      </div>

      <p className="text-sm font-semibold text-white flex-1 leading-snug pt-0.5">
        {toast.message}
      </p>

      <button
        onClick={() => removeToast(toast.id)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5"
        style={{
          width: `${progress}%`,
          background: config.color,
          transition: "width 0.05s linear",
        }}
      />
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast, duration = 3500 }) => {
  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(30px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            removeToast={removeToast}
            duration={duration}
          />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;
