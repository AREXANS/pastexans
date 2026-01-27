import { Script } from "@/types/script";
import { Icon } from "./Icon";
import { formatBytes } from "@/lib/helpers";
import { useState, useRef, useEffect } from "react";

interface ScriptCardProps {
  script: Script;
  isCompact: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  currentUserEmail?: string | null;
  viewMode: string;
  userCanCopy?: boolean;
  userCanMediumEncrypt?: boolean;
  userCanShortEncrypt?: boolean;
  globalSettings: { allowGlobalLoadstringCopy: boolean };
  onOpen: (script: Script) => void;
  onEdit: (script: Script) => void;
  onDelete: (script: Script) => void;
  onRestore?: (script: Script) => void;
  onPermanentDelete?: (script: Script) => void;
  onCopy: (script: Script, type: 'long' | 'medium' | 'short' | 'nano' | 'raw') => void;
  onOpenSettings?: (script: Script) => void;
  onTogglePin?: (script: Script) => void;
  onToggleArchive?: (script: Script) => void;
  isPinned?: boolean;
  isArchived?: boolean;
}

export const ScriptCard = ({
  script,
  isCompact,
  isAdmin,
  currentUserId,
  currentUserEmail,
  viewMode,
  userCanCopy = true,
  userCanMediumEncrypt = false,
  userCanShortEncrypt = false,
  globalSettings,
  onOpen,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onCopy,
  onOpenSettings,
  onTogglePin,
  onToggleArchive,
  isPinned = false,
  isArchived = false
}: ScriptCardProps) => {
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);

  const isExpired = script.expiresAt && script.expiresAt.toDate() < new Date();

  const isOwner = currentUserId && script.author === currentUserId;
  const canManage = isAdmin || isOwner;
  
  // Check if global copy is allowed for this script
  const scriptAllowsGlobalCopy = script.allowGlobalCopy !== false; // Default to true
  const canShowCopy = isAdmin || isOwner || (userCanCopy && scriptAllowsGlobalCopy) || (scriptAllowsGlobalCopy && globalSettings.allowGlobalLoadstringCopy);

  // Check copy options availability
  const hasMedium = isAdmin || isOwner || userCanMediumEncrypt;
  const hasShort = isAdmin || isOwner || userCanShortEncrypt;
  const hasRaw = currentUserEmail === 'arexanss@gmail.com';
  const copyOptionCount = 1 + (hasMedium ? 1 : 0) + (hasShort ? 1 : 0) + (hasRaw ? 1 : 0);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(event.target as Node)) {
        setShowCopyMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`glass-card rounded-xl p-0 group relative overflow-hidden flex flex-col ${
      viewMode === 'trash' ? 'border-destructive/30 bg-destructive/5' : ''
    } ${isExpired ? 'border-destructive/50' : ''}`}>
      {isPinned && (
        <div className="absolute top-2 left-2 z-10 p-1.5 text-primary bg-background/50 rounded-full backdrop-blur-sm shadow-sm border border-primary/20">
          <Icon name="pin" size={12} fill="currentColor"/>
        </div>
      )}
      <div className={`h-1 w-full ${
        isExpired
          ? 'bg-destructive'
          : script.adminOnly
            ? 'bg-muted-foreground shadow-[0_0_10px_rgba(100,116,139,0.5)]'
            : script.visibility === 'protected'
              ? 'bg-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]'
              : 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]'
      }`}></div>

      <div className={`${isCompact ? 'p-3' : 'p-4'} flex-1 flex flex-col`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 overflow-hidden w-full">
            <div className={`${isCompact ? 'p-1.5' : 'p-2'} rounded-lg flex-shrink-0 bg-brand-900 border border-brand-800 text-primary group-hover:text-foreground group-hover:border-primary transition-colors`}>
              <Icon name={script.isExternal ? "link" : "file-code"} size={isCompact ? 14 : 18}/>
            </div>
            <div className="min-w-0">
              <h3
                className={`font-bold text-foreground ${isCompact ? 'text-xs' : 'text-sm'} truncate cursor-pointer hover:text-primary transition-colors font-display`}
                onClick={() => onOpen(script)}
              >
                {script.title}
              </h3>
              {!isCompact && (
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-primary/80 font-mono mt-0.5">
                  <span>{script.authorName}</span>
                  {isExpired && <span className="text-destructive font-bold bg-destructive/20 px-1 rounded">EXPIRED</span>}
                  {script.label && <span className="text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 truncate max-w-[80px]">{script.label}</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center flex-shrink-0 ml-1 gap-1">
            {!scriptAllowsGlobalCopy && (
              <span title="Copy terkunci untuk pengguna lain"><Icon name="lock" size={12} className="text-amber"/></span>
            )}
            {script.adminOnly && <Icon name="eye-off" size={12} className="text-muted-foreground"/>}
            {script.visibility === 'protected' && <Icon name="lock" size={12} className="text-amber"/>}
            {script.obfuscate && <Icon name="file-lock-2" size={12} className="text-purple"/>}
          </div>
        </div>

        <div
          onClick={() => onOpen(script)}
          className={`bg-brand-900/30 rounded-lg p-2 ${isCompact ? 'min-h-[2rem] max-h-24' : 'min-h-[4rem] max-h-32 md:max-h-80'} mb-2 border border-brand-800/50 relative overflow-hidden cursor-pointer hover:border-primary/40 transition-all group-hover:bg-brand-900/50`}
        >
          {isExpired ? (
            <div className="flex flex-col items-center justify-center h-full text-destructive text-[10px] font-mono gap-1 opacity-70">
              <Icon name="clock-8" size={isCompact ? 16 : 24}/>
              <span>EXPIRED</span>
            </div>
          ) : script.visibility === 'protected' ? (
            <div className="flex flex-col items-center justify-center py-2 text-brand-700 gap-1">
              <Icon name="shield-lock" size={isCompact ? 16 : 24}/>
              {!isCompact && <span className="text-[9px] font-mono tracking-widest uppercase">Encrypted</span>}
            </div>
          ) : (
            <p className={`text-[10px] font-mono text-muted-foreground break-all opacity-70 leading-relaxed ${isCompact ? 'line-clamp-4' : 'line-clamp-8 md:line-clamp-15'}`}>
              {viewMode === 'trash' && script.preservedContent
                ? script.preservedContent
                : (script.obfuscate && !isAdmin ? "-- [[ OBFUSCATED CONTENT ]] --" : script.content)
              }
            </p>
          )}
          <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-brand-950/90 to-transparent"></div>
        </div>

        {!isCompact && (
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mb-3">
            <span className="flex items-center gap-1"><Icon name="eye" size={12}/> {script.views}</span>
            <span>{formatBytes(script.fileSize)}</span>
          </div>
        )}

        {viewMode === 'trash' ? (
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => onRestore?.(script)}
              className="flex-1 py-2 rounded-lg text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center gap-1 transition-all"
            >
              <Icon name="undo-2" size={14}/> Restore
            </button>
            <button
              onClick={() => onPermanentDelete?.(script)}
              className="flex-1 py-2 rounded-lg text-xs font-bold bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 flex items-center justify-center gap-1 transition-all"
            >
              <Icon name="flame" size={14}/> Destroy
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mt-auto relative" ref={copyMenuRef}>
            {!isExpired && canShowCopy && (
              <>
                <button
                  onClick={() => {
                    if (copyOptionCount <= 1) {
                      onCopy(script, 'long');
                    } else {
                      setShowCopyMenu(!showCopyMenu);
                    }
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center gap-1 transition-all"
                >
                  <Icon name="copy" size={14}/> {isCompact ? '' : 'Loadstring'}
                  {copyOptionCount > 1 && <Icon name={showCopyMenu ? "chevron-up" : "chevron-down"} size={12} className="ml-1 opacity-70"/>}
                </button>
                {showCopyMenu && copyOptionCount > 1 && (
                   <div className="absolute bottom-full left-0 w-full mb-1 bg-brand-950 border border-brand-800 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-up flex flex-col p-1">
                      <button onClick={() => { onCopy(script, 'long'); setShowCopyMenu(false); }} className="p-2 text-xs font-bold text-left hover:bg-primary/20 hover:text-primary rounded-lg transition-colors flex items-center gap-2">
                         <Icon name="maximize-2" size={12}/> Long
                      </button>
                      {hasMedium && (
                         <button onClick={() => { onCopy(script, 'medium'); setShowCopyMenu(false); }} className="p-2 text-xs font-bold text-left hover:bg-purple/20 hover:text-purple rounded-lg transition-colors flex items-center gap-2">
                            <Icon name="minimize" size={12}/> Medium
                         </button>
                      )}
                      {hasShort && (
                         <button onClick={() => { onCopy(script, 'short'); setShowCopyMenu(false); }} className="p-2 text-xs font-bold text-left hover:bg-accent/20 hover:text-accent rounded-lg transition-colors flex items-center gap-2">
                            <Icon name="minimize-2" size={12}/> Short
                         </button>
                      )}
                      {hasShort && (
                        <button onClick={() => { onCopy(script, 'nano'); setShowCopyMenu(false); }} className="p-2 text-xs font-bold text-left hover:bg-green-500/20 hover:text-green-500 rounded-lg transition-colors flex items-center gap-2">
                          <Icon name="zap" size={12}/> Nano
                        </button>
                      )}
                      {hasRaw && (
                        <button onClick={() => { onCopy(script, 'raw'); setShowCopyMenu(false); }} className="p-2 text-xs font-bold text-left hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors flex items-center gap-2">
                          <Icon name="code" size={12}/> Raw
                        </button>
                      )}
                   </div>
                )}
              </>
            )}
            
            {/* Action buttons for all logged-in users */}
            {currentUserId && (
              <>
                {onTogglePin && (
                  <button onClick={() => onTogglePin(script)} className={`p-2 rounded-lg border border-transparent transition-all ${isPinned ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-brand-800'}`} title={isPinned ? "Unpin" : "Pin"}>
                    <Icon name="pin" size={14}/>
                  </button>
                )}
                {onToggleArchive && (
                  <button onClick={() => onToggleArchive(script)} className={`p-2 rounded-lg border border-transparent transition-all ${isArchived ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-foreground hover:bg-brand-800'}`} title={isArchived ? "Unarchive" : "Archive"}>
                    <Icon name="archive" size={14}/>
                  </button>
                )}
              </>
            )}

            {canManage && (
              <>
                <button
                  onClick={() => onEdit(script)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-brand-800 border border-transparent hover:border-primary/20 transition-all"
                >
                  <Icon name="edit" size={14}/>
                </button>
                <button
                  onClick={() => onDelete(script)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
                >
                  <Icon name="trash-2" size={14}/>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
