import { Icon } from "../Icon";
import { Switch } from "../ui/switch";

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: { allowGlobalLoadstringCopy: boolean };
  onSave: (settings: { allowGlobalLoadstringCopy: boolean }) => void;
}

export const GlobalSettingsModal = ({ isOpen, onClose, settings, onSave }: GlobalSettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-background/90 backdrop-blur-md animate-fade-in">
      <div className="bg-brand-950 w-full max-w-lg rounded-2xl border border-primary/30 flex flex-col shadow-2xl relative overflow-hidden animate-slide-up">
        <div className="p-4 md:p-6 border-b border-brand-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Icon name="settings" size={20} />
            </div>
            <h2 className="text-lg font-bold text-foreground font-display">Global Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <label htmlFor="allowGlobalLoadstringCopy" className="text-foreground">Allow Global Loadstring Copy</label>
            <Switch
              id="allowGlobalLoadstringCopy"
              checked={settings.allowGlobalLoadstringCopy}
              onCheckedChange={(checked) => onSave({ ...settings, allowGlobalLoadstringCopy: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
