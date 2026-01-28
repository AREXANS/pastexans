import { useState } from "react";
import { Icon } from "../Icon";
import { Script, CopyExpiryOption, UserPermissions } from "@/types/script";
import { DEFAULT_COPY_EXPIRY_OPTIONS } from "@/lib/constants";
import { getExpiryOptionLabel } from "@/lib/helpers";

interface ScriptSettingsModalProps {
  script: Script;
  isAdmin: boolean;
  isOwner: boolean;
  userPermissions: UserPermissions;
  onClose: () => void;
  onSave: (settings: { allowGlobalCopy: boolean; copyExpiryOptions: CopyExpiryOption[] }) => void;
}

const presetExpiryOptions: { value: CopyExpiryOption; label: string; icon: string }[] = [
  { value: 'permanent', label: 'Permanent', icon: 'infinity' },
  { value: '1h', label: '1 Jam', icon: 'clock' },
  { value: '1d', label: '1 Hari', icon: 'clock' },
  { value: '1w', label: '1 Minggu', icon: 'clock' },
];

export const ScriptSettingsModal = ({
  script,
  isAdmin,
  isOwner,
  userPermissions,
  onClose,
  onSave
}: ScriptSettingsModalProps) => {
  const [allowGlobalCopy, setAllowGlobalCopy] = useState(script.allowGlobalCopy !== false);
  const [copyExpiryOptions, setCopyExpiryOptions] = useState<CopyExpiryOption[]>(
    script.copyExpiryOptions || DEFAULT_COPY_EXPIRY_OPTIONS
  );
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const canEditSettings = isAdmin || (isOwner && userPermissions.allowCustomCopyExpiry);

  const toggleOption = (option: CopyExpiryOption) => {
    if (copyExpiryOptions.includes(option)) {
      if (copyExpiryOptions.length <= 1) return;
      setCopyExpiryOptions(copyExpiryOptions.filter(o => o !== option));
    } else {
      setCopyExpiryOptions([...copyExpiryOptions, option]);
    }
  };

  const addCustomOption = () => {
    if (!customInput.trim()) return;
    const customVal = customInput.trim().toLowerCase();
    // Validate format (e.g., 2h, 3d, 30min, etc.)
    const validPattern = /^(\d+)(h|d|w|m|min|y)$/;
    if (!validPattern.test(customVal)) {
      return;
    }
    if (!copyExpiryOptions.includes(customVal as CopyExpiryOption)) {
      setCopyExpiryOptions([...copyExpiryOptions, customVal as CopyExpiryOption]);
    }
    setCustomInput("");
    setShowCustomInput(false);
  };

  const removeCustomOption = (option: CopyExpiryOption) => {
    if (copyExpiryOptions.length <= 1) return;
    setCopyExpiryOptions(copyExpiryOptions.filter(o => o !== option));
  };

  const isPreset = (option: CopyExpiryOption) => {
    return presetExpiryOptions.some(p => p.value === option);
  };

  const handleSave = () => {
    onSave({ allowGlobalCopy, copyExpiryOptions });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel bg-brand-950 rounded-2xl w-full max-w-md animate-slide-up shadow-2xl">
        <div className="p-6 border-b border-brand-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20 text-accent">
              <Icon name="settings" size={20}/>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">Pengaturan Copy</h2>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{script.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
          >
            <Icon name="x" size={20}/>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {!canEditSettings && (
            <div className="p-3 rounded-xl bg-amber/10 border border-amber/30 text-amber text-sm flex items-center gap-2">
              <Icon name="alert-triangle" size={16}/>
              <span>Anda tidak memiliki izin untuk mengubah pengaturan ini.</span>
            </div>
          )}

          {/* Global Copy Toggle */}
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
              canEditSettings 
                ? 'border-brand-800 hover:border-accent/50 cursor-pointer bg-brand-900/30' 
                : 'border-brand-800/50 opacity-60 cursor-not-allowed bg-brand-900/10'
            }`}
            onClick={() => canEditSettings && setAllowGlobalCopy(!allowGlobalCopy)}
          >
            <div className={`w-12 h-7 rounded-full p-1 transition-colors relative ${
              allowGlobalCopy ? 'bg-emerald-500' : 'bg-brand-700'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                allowGlobalCopy ? 'translate-x-5' : 'translate-x-0'
              }`}></div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">Izinkan Copy Global</div>
              <div className="text-[10px] text-muted-foreground">Pengguna lain bisa copy loadstring file ini</div>
            </div>
            <Icon 
              name="globe" 
              size={18} 
              className={allowGlobalCopy ? 'text-emerald-400' : 'text-muted-foreground'}
            />
          </div>

          {/* Expiry Options */}
          <div className="space-y-3">
            <label className="text-xs text-accent font-bold uppercase tracking-wide flex items-center gap-2">
              <Icon name="timer" size={14}/>
              Opsi Expiry yang Diizinkan
            </label>
            
            {/* Preset Options */}
            <div className="grid grid-cols-2 gap-2">
              {presetExpiryOptions.map(opt => {
                const isSelected = copyExpiryOptions.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!canEditSettings}
                    onClick={() => toggleOption(opt.value)}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                      !canEditSettings 
                        ? 'opacity-50 cursor-not-allowed border-brand-800/50 bg-brand-900/10'
                        : isSelected
                          ? 'bg-accent/20 text-accent border-accent/50'
                          : 'bg-brand-900/50 text-muted-foreground border-brand-800 hover:border-accent/30'
                    }`}
                  >
                    <Icon name={opt.icon} size={14}/>
                    {opt.label}
                    {isSelected && <Icon name="check" size={12} className="ml-auto"/>}
                  </button>
                );
              })}
            </div>

            {/* Custom Options List */}
            {copyExpiryOptions.filter(o => !isPreset(o)).length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] text-purple font-bold uppercase tracking-wide">Custom Options</label>
                <div className="flex flex-wrap gap-2">
                  {copyExpiryOptions.filter(o => !isPreset(o)).map(opt => (
                    <div
                      key={opt}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 bg-purple/20 text-purple border border-purple/50"
                    >
                      <Icon name="clock" size={12}/>
                      {getExpiryOptionLabel(opt)}
                      {canEditSettings && (
                        <button
                          onClick={() => removeCustomOption(opt)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <Icon name="x" size={12}/>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Option */}
            {canEditSettings && (
              <div className="pt-2">
                {showCustomInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-background/30 border border-purple/30 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-purple outline-none font-mono"
                      placeholder="contoh: 2h, 3d, 30min"
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCustomOption()}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={addCustomOption}
                      className="px-3 bg-purple hover:bg-purple/90 text-purple-foreground rounded-xl font-bold text-sm"
                    >
                      <Icon name="plus" size={16}/>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCustomInput(false); setCustomInput(""); }}
                      className="px-3 bg-brand-800 hover:bg-brand-700 text-foreground rounded-xl font-bold text-sm"
                    >
                      <Icon name="x" size={16}/>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-dashed border-purple/30 text-purple hover:bg-purple/10 hover:border-purple/50 transition-all"
                  >
                    <Icon name="plus" size={14}/>
                    Tambah Custom Expiry
                  </button>
                )}
                <p className="text-[9px] text-muted-foreground mt-2">
                  Format: 2h (2 jam), 3d (3 hari), 30min (30 menit), 2w (2 minggu)
                </p>
              </div>
            )}

            <p className="text-[9px] text-muted-foreground">
              Pilih opsi durasi yang tersedia saat pengguna lain copy loadstring.
              {isAdmin && <span className="text-primary ml-1">(Admin selalu bisa gunakan custom)</span>}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-brand-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-brand-800 hover:bg-brand-800 text-foreground rounded-xl font-bold transition-colors"
          >
            Batal
          </button>
          {canEditSettings && (
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="check" size={16}/>
              Simpan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
