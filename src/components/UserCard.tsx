import { UserData, UserPermissions } from "@/types/script";
import { Icon } from "./Icon";

interface UserCardProps {
  user: UserData;
  onClick: () => void;
  isAdmin?: boolean;
  permissions?: UserPermissions;
  onOpenPermissions?: (e: React.MouseEvent) => void;
}

const defaultPermissions: UserPermissions = {
  allowCopy: true,
  allowMediumEncrypt: false,
  allowShortEncrypt: false,
  allowObfuscatedUpload: false,
  allowCustomCopyExpiry: true,
};

export const UserCard = ({ user, onClick, isAdmin, permissions, onOpenPermissions }: UserCardProps) => {
  const perms = permissions || defaultPermissions;
  const hasFiles = user.scripts.length > 0;

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-xl p-4 cursor-pointer hover:bg-brand-900/20 group relative ${
        !hasFiles ? 'opacity-80' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {user.photo ? (
          <img src={user.photo} alt={user.name} className="w-12 h-12 rounded-lg border border-primary/30 object-cover"/>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-brand-800 border border-primary flex items-center justify-center text-xl font-bold text-foreground">
            {user.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate font-display text-lg group-hover:text-primary transition-colors">
            {user.name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-1">
            <span className="flex items-center gap-1">
              <Icon name="file-code" size={12}/> {user.scripts.length} Files
            </span>
            <span className="flex items-center gap-1">
              <Icon name="eye" size={12}/> {user.totalViews} Views
            </span>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPermissions?.(e);
            }}
            className="p-2 rounded-lg bg-brand-900/50 text-muted-foreground hover:text-primary hover:bg-primary/10 border border-brand-800 hover:border-primary/30 transition-all"
            title="Manage Permissions"
          >
            <Icon name="settings" size={16}/>
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1.5 mt-3">
        <span className={`permission-badge ${perms.allowCopy ? 'permission-badge-allowed' : 'permission-badge-denied'}`}>
          <Icon name="copy" size={10}/> Copy
        </span>
        <span className={`permission-badge ${perms.allowCustomCopyExpiry ? 'permission-badge-allowed' : 'permission-badge-denied'}`}>
          <Icon name="timer" size={10}/> Custom Expiry
        </span>
        <span className={`permission-badge ${perms.allowMediumEncrypt ? 'permission-badge-allowed' : 'permission-badge-denied'}`}>
          <Icon name="shield-half" size={10}/> Medium
        </span>
        <span className={`permission-badge ${perms.allowShortEncrypt ? 'permission-badge-allowed' : 'permission-badge-denied'}`}>
          <Icon name="minimize-2" size={10}/> Short
        </span>
      </div>
    </div>
  );
};
