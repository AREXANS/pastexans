import { useState, useEffect } from "react";
import { Icon } from "../Icon";
import { CopyModal as CopyModalType, Script, UserPermissions, CopyExpiryOption } from "@/types/script";
import { calculateExpiryDate, getExpiryOptionLabel } from "@/lib/helpers";
import { DEFAULT_COPY_EXPIRY_OPTIONS } from "@/lib/constants";

interface CopyModalProps {
  copyModal: CopyModalType;
  onClose: () => void;
  onCopy: (durationOption: string, customVal: string) => void;
  isAdmin: boolean;
  isOwner: boolean;
  userPermissions: UserPermissions;
  script: Script;
}

const presetOptions = ['permanent', '1h', '1d', '1w'];

export const CopyModal = ({ 
  copyModal, 
  onClose, 
  onCopy, 
  isAdmin, 
  isOwner,
  userPermissions,
  script 
}: CopyModalProps) => {
  const [customInputVal, setCustomInputVal] = useState("");
  const [previewExpiry, setPreviewExpiry] = useState<Date | null>(null);

  useEffect(() => {
    if (customInputVal) {
      const date = calculateExpiryDate('custom', customInputVal);
      setPreviewExpiry(date);
    } else {
      setPreviewExpiry(null);
    }
  }, [customInputVal]);

  const scriptExpiryOptions = script.copyExpiryOptions || DEFAULT_COPY_EXPIRY_OPTIONS;
  const canUseCustom = isAdmin || (isOwner && userPermissions.allowCustomCopyExpiry);
  
  // Build available options
  const availableOptions: { value: string; label: string; icon: string; isCustom?: boolean }[] = [];
  
  if (isAdmin || isOwner) {
    // Admin and owner see all preset options + any custom options set
    availableOptions.push(
      { value: 'permanent', label: 'Tanpa Batas', icon: 'infinity' },
      { value: '1h', label: 'Sesi 1 Jam', icon: 'clock' },
      { value: '1d', label: 'Sesi 24 Jam', icon: 'clock' },
      { value: '1w', label: 'Sesi 1 Minggu', icon: 'clock' },
    );
    // Add custom options that owner has set
    scriptExpiryOptions.forEach(opt => {
      if (!presetOptions.includes(opt) && opt !== 'custom') {
        availableOptions.push({ 
          value: opt, 
          label: `Sesi ${getExpiryOptionLabel(opt)}`, 
          icon: 'clock',
          isCustom: true 
        });
      }
    });
  } else {
    // Other users only see what the owner has allowed
    scriptExpiryOptions.forEach(opt => {
      if (opt === 'permanent') {
        availableOptions.push({ value: 'permanent', label: 'Tanpa Batas', icon: 'infinity' });
      } else if (opt === '1h') {
        availableOptions.push({ value: '1h', label: 'Sesi 1 Jam', icon: 'clock' });
      } else if (opt === '1d') {
        availableOptions.push({ value: '1d', label: 'Sesi 24 Jam', icon: 'clock' });
      } else if (opt === '1w') {
        availableOptions.push({ value: '1w', label: 'Sesi 1 Minggu', icon: 'clock' });
      } else if (opt !== 'custom') {
        // Custom durations added by owner
        availableOptions.push({ 
          value: opt, 
          label: `Sesi ${getExpiryOptionLabel(opt)}`, 
          icon: 'clock',
          isCustom: true 
        });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel bg-brand-950 rounded-2xl w-full max-w-md animate-slide-up shadow-2xl">
        <div className="p-6 border-b border-brand-800">
          <h3 className="text-lg font-bold text-foreground font-display flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Icon name="clock" size={20}/>
            </div>
            Durasi Sesi
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Atur masa berlaku loadstring yang dihasilkan.</p>
          {!isAdmin && !isOwner && (
            <p className="text-xs text-accent mt-2 flex items-center gap-1">
              <Icon name="eye" size={12}/>
              Opsi dibatasi oleh pemilik file
            </p>
          )}
        </div>

        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          {availableOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onCopy(opt.value, '')}
              className={`w-full p-4 rounded-xl border hover:border-primary/50 hover:bg-primary/5 text-left flex items-center gap-4 transition-all group ${
                opt.isCustom ? 'border-purple/30 bg-purple/5' : 'border-brand-800'
              }`}
            >
              <div className={`p-2 rounded-lg ${opt.isCustom ? 'bg-purple/20 text-purple' : 'bg-brand-900 text-primary'} group-hover:bg-primary/20`}>
                <Icon name={opt.icon} size={18}/>
              </div>
              <div className="flex-1">
                <span className="font-bold text-foreground">{opt.label}</span>
                {opt.isCustom && (
                  <span className="ml-2 text-[10px] text-purple bg-purple/20 px-1.5 py-0.5 rounded">Custom</span>
                )}
              </div>
            </button>
          ))}

          {canUseCustom && (
            <div className="pt-2 border-t border-brand-800 mt-4">
              <label className="text-xs text-primary font-bold uppercase tracking-wide ml-1">Custom Duration</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  className="flex-1 bg-background/30 border border-brand-800 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-brand-700 focus:border-primary outline-none font-mono"
                  placeholder="contoh: 2d, 5h, 30min"
                  value={customInputVal}
                  onChange={e => setCustomInputVal(e.target.value)}
                />
                <button
                  onClick={() => onCopy('custom', customInputVal)}
                  disabled={!customInputVal}
                  className="px-4 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Go
                </button>
              </div>
              {previewExpiry && (
                <p className="text-xs text-accent mt-2 font-mono">Berakhir: {previewExpiry.toLocaleString()}</p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-brand-800">
          <button onClick={onClose} className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm">Batal</button>
        </div>
      </div>
    </div>
  );
};
