import { useState } from "react";
import { Icon } from "../Icon";
import { FormData, CopyExpiryOption } from "@/types/script";
import { DEFAULT_COPY_EXPIRY_OPTIONS } from "@/lib/constants";
import { getExpiryOptionLabel } from "@/lib/helpers";

interface UploadModalProps {
  isAdmin: boolean;
  editingId: string | null;
  formData: FormData;
  setFormData: (data: FormData) => void;
  uploadType: 'text' | 'file' | 'link';
  setUploadType: (type: 'text' | 'file' | 'link') => void;
  uploading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent, file: File | null) => void;
}

const presetExpiryOptions: { value: CopyExpiryOption; label: string; icon: string }[] = [
  { value: 'permanent', label: 'Permanent', icon: 'infinity' },
  { value: '1h', label: '1 Jam', icon: 'clock' },
  { value: '1d', label: '1 Hari', icon: 'clock' },
  { value: '1w', label: '1 Minggu', icon: 'clock' },
];

export const UploadModal = ({
  isAdmin,
  editingId,
  formData,
  setFormData,
  uploadType,
  setUploadType,
  uploading,
  onClose,
  onSubmit
}: UploadModalProps) => {
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleCopyExpiryOption = (option: CopyExpiryOption) => {
    const current = formData.copyExpiryOptions || DEFAULT_COPY_EXPIRY_OPTIONS;
    if (current.includes(option)) {
      if (current.length <= 1) return;
      setFormData({ ...formData, copyExpiryOptions: current.filter(o => o !== option) });
    } else {
      setFormData({ ...formData, copyExpiryOptions: [...current, option] });
    }
  };

  const addCustomOption = () => {
    if (!customInput.trim()) return;
    const customVal = customInput.trim().toLowerCase();
    const validPattern = /^(\d+)(h|d|w|m|min|y)$/;
    if (!validPattern.test(customVal)) return;
    
    const current = formData.copyExpiryOptions || DEFAULT_COPY_EXPIRY_OPTIONS;
    if (!current.includes(customVal as CopyExpiryOption)) {
      setFormData({ ...formData, copyExpiryOptions: [...current, customVal as CopyExpiryOption] });
    }
    setCustomInput("");
    setShowCustomInput(false);
  };

  const removeCustomOption = (option: CopyExpiryOption) => {
    const current = formData.copyExpiryOptions || DEFAULT_COPY_EXPIRY_OPTIONS;
    if (current.length <= 1) return;
    setFormData({ ...formData, copyExpiryOptions: current.filter(o => o !== option) });
  };

  const isPreset = (option: CopyExpiryOption) => {
    return presetExpiryOptions.some(p => p.value === option);
  };

  const currentOptions = formData.copyExpiryOptions || DEFAULT_COPY_EXPIRY_OPTIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-panel bg-brand-950 rounded-2xl w-full max-w-xl animate-slide-up shadow-2xl my-auto">
        <div className="p-6 border-b border-brand-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Icon name={editingId ? "edit" : "upload"} size={20}/>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">{editingId ? "Edit Script" : "Deploy New Script"}</h2>
              <p className="text-xs text-muted-foreground">Buat atau modifikasi secure payload.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
            <Icon name="x" size={20}/>
          </button>
        </div>

        <form onSubmit={(e) => onSubmit(e, fileObj)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex bg-brand-950/80 rounded-xl border border-brand-800 p-1.5 gap-1">
            {(['text', 'file', 'link'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setUploadType(type)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  uploadType === type
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                }`}
              >
                <Icon name={type === 'text' ? 'file-text' : type === 'file' ? 'folder' : 'link'} size={14}/>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-primary font-bold uppercase tracking-wide ml-1">Title / Identifier</label>
            <input
              type="text"
              className="w-full bg-background/30 border border-brand-800 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-brand-700 focus:border-primary outline-none transition-all"
              placeholder="my-super-script"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-primary font-bold uppercase tracking-wide ml-1">Label (Optional)</label>
            <input
              type="text"
              className="w-full bg-background/30 border border-brand-800 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-brand-700 focus:border-primary outline-none transition-all"
              placeholder="e.g. V1, Beta, Testing"
              value={formData.label || ''}
              onChange={e => setFormData({...formData, label: e.target.value})}
              maxLength={20}
            />
          </div>

          {uploadType === 'file' ? (
            <div
              className="border-2 border-dashed border-brand-800 rounded-xl p-6 text-center hover:border-primary/50 transition-all cursor-pointer bg-brand-900/20"
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-primary'); }}
              onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('border-primary'); }}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-primary'); if(e.dataTransfer.files[0]) setFileObj(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input id="file-input" type="file" className="hidden" onChange={e => { if(e.target.files?.[0]) setFileObj(e.target.files[0]); }}/>
              {fileObj ? (
                <div className="flex items-center justify-center gap-3">
                  <Icon name="file-code" size={24} className="text-primary"/>
                  <div className="text-left">
                    <p className="text-foreground font-bold text-sm">{fileObj.name}</p>
                    <p className="text-muted-foreground text-xs">{(fileObj.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Icon name="upload" size={32} className="mx-auto text-brand-700 mb-2"/>
                  <p className="text-muted-foreground text-sm">Drop file atau klik untuk upload</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs text-primary font-bold uppercase tracking-wide ml-1">
                {uploadType === 'link' ? 'External URL' : 'Source Code'}
              </label>
              <textarea
                className="w-full bg-background/30 border border-brand-800 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-brand-700 focus:border-primary outline-none font-mono h-32 resize-y transition-all"
                placeholder={uploadType === 'link' ? 'https://...' : '-- Your Lua script here...'}
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-primary font-bold uppercase tracking-wide ml-1">Expiration</label>
              <div className="relative">
                <select
                  className="w-full bg-background/30 border border-brand-800 rounded-xl px-4 py-3 text-sm text-foreground outline-none appearance-none"
                  value={formData.expiryOption}
                  onChange={e => setFormData({...formData, expiryOption: e.target.value})}
                >
                  <option value="permanent">Permanent</option>
                  <option value="1h">1 Jam</option>
                  <option value="1d">1 Hari</option>
                  <option value="1w">1 Minggu</option>
                  <option value="1m">1 Bulan</option>
                  <option value="1y">1 Tahun</option>
                  <option value="custom">Custom</option>
                </select>
                <Icon name="chevron-down" size={16} className="absolute right-4 top-3.5 text-primary pointer-events-none"/>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-primary font-bold uppercase tracking-wide ml-1">Visibility</label>
              <div className="relative">
                <select
                  className="w-full bg-background/30 border border-brand-800 rounded-xl px-4 py-3 text-sm text-foreground outline-none appearance-none"
                  value={formData.visibility}
                  onChange={e => setFormData({...formData, visibility: e.target.value as 'public' | 'protected'})}
                >
                  <option value="public">Public Access</option>
                  <option value="protected">Protected (Key)</option>
                </select>
                <Icon name="chevron-down" size={16} className="absolute right-4 top-3.5 text-primary pointer-events-none"/>
              </div>
            </div>
          </div>

          {formData.expiryOption === 'custom' && (
            <div className="space-y-1">
              <label className="text-xs text-amber font-bold uppercase tracking-wide ml-1">Custom Duration</label>
              <input
                type="text"
                className="w-full bg-amber/10 border border-amber/30 rounded-xl px-4 py-3 text-sm text-amber placeholder:text-amber/50 focus:border-amber outline-none font-mono"
                placeholder="contoh: 2d, 3h, 12:30"
                value={formData.customExpiry}
                onChange={e => setFormData({...formData, customExpiry: e.target.value})}
              />
            </div>
          )}

          {formData.visibility === 'protected' && (
            <div className="space-y-1">
              <label className="text-xs text-amber font-bold uppercase tracking-wide ml-1">Encryption Key</label>
              <input
                type="text"
                className="w-full bg-amber/10 border border-amber/30 rounded-xl px-4 py-3 text-sm text-amber placeholder:text-amber/50 focus:border-amber outline-none"
                placeholder="Secret Key..."
                value={formData.key}
                onChange={e => setFormData({...formData, key: e.target.value})}
              />
            </div>
          )}

          {/* Copy Settings Section */}
          <div className="border border-accent/30 rounded-xl p-4 bg-accent/5 space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Icon name="share-2" size={16}/>
              <span className="text-sm font-bold">Pengaturan Copy Loadstring</span>
            </div>
            
            <div
              className="flex items-center gap-3 p-3 rounded-xl border border-brand-800 hover:border-accent/50 cursor-pointer transition-all bg-brand-900/30"
              onClick={() => setFormData({...formData, allowGlobalCopy: !formData.allowGlobalCopy})}
            >
              <div className={`w-10 h-6 rounded-full p-1 transition-colors relative ${formData.allowGlobalCopy ? 'bg-emerald-500' : 'bg-brand-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-foreground transition-transform ${formData.allowGlobalCopy ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-foreground">Izinkan Copy Global</div>
                <div className="text-[10px] text-muted-foreground">Pengguna lain bisa copy loadstring file ini</div>
              </div>
              <Icon name="globe" size={16} className={formData.allowGlobalCopy ? 'text-emerald-400' : 'text-muted-foreground'}/>
            </div>
            
            <div
              className="flex items-center gap-3 p-3 rounded-xl border border-brand-800 hover:border-accent/50 cursor-pointer transition-all bg-brand-900/30"
              onClick={() => setFormData({...formData, enableCaptcha: !formData.enableCaptcha})}
            >
              <div className={`w-10 h-6 rounded-full p-1 transition-colors relative ${formData.enableCaptcha ? 'bg-indigo-500' : 'bg-brand-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-foreground transition-transform ${formData.enableCaptcha ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-foreground">Wajibkan Captcha</div>
                <div className="text-[10px] text-muted-foreground">Verifikasi manusia sebelum copy</div>
              </div>
              <Icon name="bot" size={16} className={formData.enableCaptcha ? 'text-indigo-400' : 'text-muted-foreground'}/>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-accent font-bold uppercase tracking-wide">Opsi Expiry yang Diizinkan</label>
              
              {/* Preset Options */}
              <div className="flex flex-wrap gap-2">
                {presetExpiryOptions.map(opt => {
                  const isSelected = currentOptions.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleCopyExpiryOption(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                        isSelected
                          ? 'bg-accent/20 text-accent border-accent/50'
                          : 'bg-brand-900/50 text-muted-foreground border-brand-800 hover:border-accent/30'
                      }`}
                    >
                      <Icon name={opt.icon} size={12}/>
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Options */}
              {currentOptions.filter(o => !isPreset(o)).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentOptions.filter(o => !isPreset(o)).map(opt => (
                    <div
                      key={opt}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-purple/20 text-purple border border-purple/50"
                    >
                      <Icon name="clock" size={12}/>
                      {getExpiryOptionLabel(opt)}
                      <button
                        type="button"
                        onClick={() => removeCustomOption(opt)}
                        className="ml-1 hover:text-destructive transition-colors"
                      >
                        <Icon name="x" size={10}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom */}
              {showCustomInput ? (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    className="flex-1 bg-background/30 border border-purple/30 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-purple outline-none font-mono"
                    placeholder="contoh: 2h, 3d, 30min"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomOption())}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={addCustomOption}
                    className="px-2 bg-purple hover:bg-purple/90 text-purple-foreground rounded-lg text-xs"
                  >
                    <Icon name="plus" size={14}/>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCustomInput(false); setCustomInput(""); }}
                    className="px-2 bg-brand-800 hover:bg-brand-700 text-foreground rounded-lg text-xs"
                  >
                    <Icon name="x" size={14}/>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-dashed border-purple/30 text-purple hover:bg-purple/10 hover:border-purple/50 transition-all"
                >
                  <Icon name="plus" size={12}/>
                  Tambah Custom
                </button>
              )}
              
              <p className="text-[9px] text-muted-foreground">Pilih opsi durasi yang tersedia saat pengguna copy loadstring</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-purple/10 p-3 rounded-xl border border-purple/20">
              <div
                className="flex items-center gap-3 cursor-pointer mb-2"
                onClick={() => setFormData({...formData, obfuscate: !formData.obfuscate, obfuscateLevel: formData.obfuscate ? 1 : 1})}
              >
                <div className={`w-10 h-6 rounded-full p-1 transition-colors relative ${formData.obfuscate ? 'bg-purple' : 'bg-brand-800'}`}>
                  <div className={`w-4 h-4 rounded-full bg-foreground transition-transform ${formData.obfuscate ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <div>
                  <div className="text-xs font-bold text-purple">Auto-Obfuscate</div>
                  <div className="text-[10px] text-purple/50">Sembunyikan source code dari tampilan publik</div>
                </div>
                <Icon name="eye-off" size={16} className="ml-auto text-purple"/>
              </div>
              
              {formData.obfuscate && (
                <div className="flex gap-2 pl-12">
                  {[1, 2, 3].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, obfuscateLevel: level})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        (formData.obfuscateLevel || 1) === level
                          ? 'bg-purple text-purple-foreground border-purple'
                          : 'bg-purple/10 text-purple border-purple/30 hover:bg-purple/20'
                      }`}
                    >
                      {level}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAdmin && (
              <div
                className="flex items-center gap-3 bg-primary/10 p-3 rounded-xl border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setFormData({...formData, adminOnly: !formData.adminOnly})}
              >
                <div className={`w-10 h-6 rounded-full p-1 transition-colors relative ${formData.adminOnly ? 'bg-primary' : 'bg-brand-800'}`}>
                  <div className={`w-4 h-4 rounded-full bg-foreground transition-transform ${formData.adminOnly ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <div>
                  <div className="text-xs font-bold text-primary">Admin Only</div>
                  <div className="text-[10px] text-primary/50">Hanya terlihat untuk administrator</div>
                </div>
                <Icon name="shield-alert" size={16} className="ml-auto text-primary"/>
              </div>
            )}
          </div>

          <button
            disabled={uploading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {uploading ? <Icon name="loader-2" className="animate-spin"/> : <Icon name="rocket" />}
            {uploading ? "Deploying..." : (editingId ? "Commit Changes" : "Initialize Deploy")}
          </button>
        </form>
      </div>
    </div>
  );
};
