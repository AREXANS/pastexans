import { useState } from "react";
import { Icon } from "../Icon";
import { Script } from "@/types/script";

interface UnlockModalProps {
  script: Script;
  onClose: () => void;
  onUnlock: (script: Script, key: string) => void;
  showToast: (msg: string, type: 'info' | 'error' | 'success') => void;
}

export const UnlockModal = ({ script, onClose, onUnlock, showToast }: UnlockModalProps) => {
  const [accessKey, setAccessKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (script.accessKey === accessKey) {
      onUnlock(script, accessKey);
      setAccessKey("");
    } else {
      showToast("Access Denied: Invalid Key", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel bg-brand-950 p-8 rounded-2xl w-full max-w-sm text-center animate-slide-up border-amber/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
        <div className="mx-auto w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mb-6 text-amber border border-amber/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Icon name="lock" size={32}/>
        </div>
        <h3 className="text-xl text-foreground font-bold mb-2 font-display">Restricted Access</h3>
        <p className="text-amber/60 text-sm mb-6">Enter authorization key to decrypt content.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            autoFocus
            className="w-full bg-background/50 border border-amber/30 rounded-xl px-4 py-3 text-center text-foreground mb-4 outline-none focus:border-amber transition-all font-mono tracking-widest"
            placeholder="••••••••"
            value={accessKey}
            onChange={e => setAccessKey(e.target.value)}
          />
          <button type="submit" className="w-full bg-amber hover:bg-amber/90 text-amber-foreground font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            <Icon name="unlock" size={18}/> Decrypt
          </button>
        </form>
        <button onClick={onClose} className="mt-4 text-muted-foreground hover:text-foreground text-sm transition-colors">Cancel</button>
      </div>
    </div>
  );
};
