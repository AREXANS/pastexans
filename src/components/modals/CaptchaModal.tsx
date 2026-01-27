import { useState, useEffect } from "react";
import { Icon } from "../Icon";

interface CaptchaModalProps {
  onClose: () => void;
  onVerify: () => void;
}

export const CaptchaModal = ({ onClose, onVerify }: CaptchaModalProps) => {
  const [challenge, setChallenge] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    generateChallenge();
  }, []);

  const generateChallenge = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setChallenge(result);
    setInput("");
    setError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toUpperCase() === challenge) {
      onVerify();
    } else {
      setError(true);
      generateChallenge();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel bg-brand-950 rounded-2xl w-full max-w-sm animate-slide-up shadow-2xl p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-3 border border-indigo-500/30">
            <Icon name="bot" size={32}/>
          </div>
          <h2 className="text-xl font-bold text-foreground font-display">Verifikasi Manusia</h2>
          <p className="text-sm text-muted-foreground mt-1">Ketik kode di bawah untuk melanjutkan copy.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-background/50 border border-brand-800 rounded-xl p-4 flex flex-col items-center justify-center relative select-none">
            <div 
              className="text-3xl font-mono font-bold tracking-widest text-foreground opacity-80"
              style={{ 
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                transform: 'skew(-5deg)',
                letterSpacing: '0.5em'
              }}
            >
              {challenge}
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/5 to-transparent pointer-events-none"></div>
            <button 
              type="button" 
              onClick={generateChallenge} 
              className="absolute right-2 top-2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
              title="Refresh Code"
            >
              <Icon name="rotate-cw" size={14}/>
            </button>
          </div>

          <div>
             <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full bg-background/30 border rounded-xl px-4 py-3 text-center font-mono text-lg uppercase placeholder:text-muted-foreground/50 focus:outline-none transition-all ${
                error 
                  ? 'border-destructive text-destructive focus:border-destructive animate-shake' 
                  : 'border-brand-800 text-foreground focus:border-indigo-500'
              }`}
              placeholder="ENTER CODE"
              autoFocus
            />
            {error && <p className="text-xs text-destructive text-center mt-2 font-bold">Kode salah, coba lagi.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl text-sm font-bold border border-brand-800 text-muted-foreground hover:bg-brand-900 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!input}
              className="py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Verifikasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
