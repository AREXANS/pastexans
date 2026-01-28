import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
  name: string;
}

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  "clock-8": LucideIcons.Clock8,
  "alert-triangle": LucideIcons.AlertTriangle,
  "layers": LucideIcons.Layers,
  "trash": LucideIcons.Trash,
  "trash-2": LucideIcons.Trash2,
  "users": LucideIcons.Users,
  "home": LucideIcons.Home,
  "plus": LucideIcons.Plus,
  "log-in": LucideIcons.LogIn,
  "power": LucideIcons.Power,
  "search": LucideIcons.Search,
  "grid-3x3": LucideIcons.Grid3x3,
  "layout-grid": LucideIcons.LayoutGrid,
  "flame": LucideIcons.Flame,
  "loader-2": LucideIcons.Loader2,
  "file-code": LucideIcons.FileCode,
  "eye": LucideIcons.Eye,
  "chevron-right": LucideIcons.ChevronRight,
  "chevron-down": LucideIcons.ChevronDown,
  "link": LucideIcons.Link,
  "lock": LucideIcons.Lock,
  "unlock": LucideIcons.Unlock,
  "eye-off": LucideIcons.EyeOff,
  "file-lock-2": LucideIcons.FileLock2,
  "shield-lock": LucideIcons.ShieldCheck,
  "arrow-left": LucideIcons.ArrowLeft,
  "shield-alert": LucideIcons.ShieldAlert,
  "external-link": LucideIcons.ExternalLink,
  "copy": LucideIcons.Copy,
  "download": LucideIcons.Download,
  "check": LucideIcons.Check,
  "x": LucideIcons.X,
  "file-text": LucideIcons.FileText,
  "folder": LucideIcons.Folder,
  "edit": LucideIcons.Edit,
  "undo-2": LucideIcons.Undo2,
  "rocket": LucideIcons.Rocket,
  "gamepad-2": LucideIcons.Gamepad2,
  "shield-half": LucideIcons.Shield,
  "minimize-2": LucideIcons.Minimize2,
  "clock": LucideIcons.Clock,
  "upload": LucideIcons.Upload,
  "infinity": LucideIcons.Infinity,
  "user-check": LucideIcons.UserCheck,
  "user-x": LucideIcons.UserX,
  "settings": LucideIcons.Settings,
  "toggle-left": LucideIcons.ToggleLeft,
  "toggle-right": LucideIcons.ToggleRight,
  "globe": LucideIcons.Globe,
  "share-2": LucideIcons.Share2,
  "timer": LucideIcons.Timer,
  "pin": LucideIcons.Pin,
  "archive": LucideIcons.Archive,
  "bot": LucideIcons.Bot,
  "rotate-cw": LucideIcons.RotateCw,
  "maximize-2": LucideIcons.Maximize2,
  "minimize": LucideIcons.Minimize,
  "check-circle": LucideIcons.CheckCircle,
  "ban": LucideIcons.Ban,
  "chevron-up": LucideIcons.ChevronUp,
};

export const Icon = ({ name, size = 18, className = "", ...props }: IconProps) => {
  const IconComponent = iconMap[name] || LucideIcons.HelpCircle;
  return <IconComponent size={size} className={className} {...props} />;
};
