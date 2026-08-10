import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastState = {
  type: "success" | "error";
  message: string;
};

export function AuthToast({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) {
  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(92vw,360px)] rounded-2xl border border-black/5 bg-white/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 rounded-full p-1.5",
            isSuccess
              ? "bg-emerald-100 text-emerald-600"
              : "bg-rose-100 text-rose-600",
          )}
        >
          {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#1A1330]">
            {isSuccess ? "Success" : "Notice"}
          </p>
          <p className="mt-1 text-sm leading-5 text-[#5A5470]">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[#8D86A8] transition hover:bg-[#F4F3F8] hover:text-[#1A1330]"
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export type { ToastState };
