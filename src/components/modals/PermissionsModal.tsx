import { UserData, UserPermissions } from "@/types/script";
import { Icon } from "../Icon";

interface PermissionsModalProps {
  user: UserData;
  permissions: UserPermissions;
  onClose: () => void;
  onTogglePermission: (key: keyof UserPermissions) => void;
  onWhitelist: () => void;
  onBlacklist: () => void;
  onDeleteUser: () => void;
}

export const PermissionsModal = ({
  user,
  permissions,
  onClose,
  onTogglePermission,
  onWhitelist,
  onBlacklist,
  onDeleteUser
}: PermissionsModalProps) => {
  const permissionItems: { key: keyof UserPermissions; label: string; description: string; icon: string; color: string }[] = [
    {
      key: 'allowCopy',
      label: 'Copy Loadstring',
      description: 'Izinkan user copy loadstring Long encrypt',
      icon: 'copy',
      color: 'primary'
    },
    {
      key: 'allowCustomCopyExpiry',
      label: 'Custom Copy Expiry',
      description: 'Izinkan user mengatur durasi expiry kustom saat copy',
      icon: 'timer',
      color: 'accent'
    },
    {
      key: 'allowMediumEncrypt',
      label: 'Medium Encrypt',
      description: 'Izinkan akses opsi loadstring Medium encrypt',
      icon: 'shield-half',
      color: 'purple'
    },
    {
      key: 'allowShortEncrypt',
      label: 'Short Encrypt',
      description: 'Izinkan akses opsi loadstring Short encrypt',
      icon: 'minimize-2',
      color: 'accent'
    },
    {
      key: 'allowObfuscatedUpload',
      label: 'Upload Obfuscated',
      description: 'Izinkan upload konten yang sudah diobfuscate/encrypt',
      icon: 'file-lock-2',
      color: 'amber'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel bg-brand-950 rounded-2xl w-full max-w-md animate-slide-up shadow-2xl">
        <div className="p-6 border-b border-brand-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="w-12 h-12 rounded-lg border border-primary/30 object-cover"/>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-brand-800 border border-primary flex items-center justify-center text-xl font-bold text-foreground">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">{user.name}</h2>
              <p className="text-xs text-muted-foreground">Kelola Izin Akses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
          >
            <Icon name="x" size={20}/>
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {permissionItems.map(item => (
            <div
              key={item.key}
              onClick={() => onTogglePermission(item.key)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                permissions[item.key]
                  ? `bg-${item.color}/10 border-${item.color}/30 hover:bg-${item.color}/20`
                  : 'bg-brand-900/30 border-brand-800 hover:bg-brand-800/50'
              }`}
            >
              <div className={`w-12 h-7 rounded-full p-1 transition-colors relative ${
                permissions[item.key] ? 'bg-emerald-500' : 'bg-brand-700'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
                  permissions[item.key] ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </div>
              <div className="flex-1">
                <div className={`text-sm font-bold ${
                  permissions[item.key] ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </div>
                <div className="text-[10px] text-muted-foreground">{item.description}</div>
              </div>
              <Icon
                name={item.icon}
                size={18}
                className={permissions[item.key] ? 'text-emerald-400' : 'text-muted-foreground'}
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-brand-800 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onWhitelist}
              className="py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 border border-emerald-500/30 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="check-circle" size={16}/> Whitelist
            </button>
            <button
              onClick={onBlacklist}
              className="py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="ban" size={16}/> Blacklist
            </button>
          </div>
          
          <button
            onClick={onDeleteUser}
            className="w-full py-2.5 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="trash-2" size={16}/> Hapus Akun Permanen
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
