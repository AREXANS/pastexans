import { Icon } from "./Icon";
import { Toast as ToastType } from "@/types/script";

interface ToastProps {
  toast: ToastType;
}

export const ToastNotification = ({ toast }: ToastProps) => (
  <div className={`fixed bottom-6 right-6 px-5 py-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 z-[100] animate-slide-up ${
    toast.type === 'error'
      ? 'border-destructive/50 bg-destructive/20 text-destructive'
      : 'border-primary/50 bg-primary/20 text-primary'
  }`}>
    <div className={`p-1 rounded-full ${toast.type === 'error' ? 'bg-destructive/20' : 'bg-primary/20'}`}>
      <Icon name={toast.type === 'error' ? 'alert-triangle' : 'check'} size={18} />
    </div>
    <div>
      <h4 className="text-sm font-bold">{toast.type === 'error' ? 'System Alert' : 'Success'}</h4>
      <span className="text-xs opacity-80">{toast.msg}</span>
    </div>
  </div>
);
