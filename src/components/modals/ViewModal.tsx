import { useState } from "react";
import { Icon } from "../Icon";
import { ExpiredView } from "../ExpiredView";
import { Script, UserPermissions } from "@/types/script";
import { formatBytes } from "@/lib/helpers";
import { simpleObfuscator } from "@/lib/obfuscator";

interface ViewModalProps {
  script: Script;
  isAdmin: boolean;
  viewMode: string;
  userPermissions?: UserPermissions;
  onClose: () => void;
  onCopy: (script: Script, type: 'long' | 'medium' | 'short' | 'nano') => void;
  onCopyContent: (script: Script, content: string) => void;
  onOpenRaw: (script: Script) => void;
}

const defaultPermissions: UserPermissions = {
  allowCopy: true,
  allowMediumEncrypt: false,
  allowShortEncrypt: false,
  allowObfuscatedUpload: false,
  allowCustomCopyExpiry: true,
};

export const ViewModal = ({
  script,
  isAdmin,
  viewMode,
  userPermissions,
  onClose,
  onCopy,
  onCopyContent,
  onOpenRaw
}: ViewModalProps) => {
  const [showGenMenu, setShowGenMenu] = useState(false);
  const perms = userPermissions || defaultPermissions;

  const isExpired = script.expiresAt && script.expiresAt.toDate() < new Date();

  if (isExpired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-background/90 backdrop-blur-md animate-fade-in">
        <div className="bg-brand-950 w-full max-w-lg rounded-2xl border border-destructive/50 flex flex-col shadow-2xl relative overflow-hidden animate-slide-up p-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <Icon name="x" size={24}/>
          </button>
          <ExpiredView />
        </div>
      </div>
    );
  }

  const displayContent = viewMode === 'trash' && script.preservedContent
    ? script.preservedContent
    : (script.obfuscate && !isAdmin ? simpleObfuscator(script.content, script.obfuscateLevel || 1) : script.content);

  const downloadFile = () => {
    const blob = new Blob([displayContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = script.fileName || 'script.lua';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-background/90 backdrop-blur-md animate-fade-in">
      <div className="bg-brand-950 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl border border-primary/30 flex flex-col shadow-2xl relative overflow-hidden animate-slide-up">
        <div className="p-4 md:p-6 border-b border-brand-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-primary/20 text-primary flex-shrink-0">
              <Icon name={script.isExternal ? "link" : "file-code"} size={20}/>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground font-display truncate">{script.title}</h2>
              {script.obfuscate && (
                <span className="text-[10px] bg-purple text-purple-foreground px-1.5 py-0.5 rounded ml-1 font-bold tracking-wide">
                  OBFUSCATOR {script.obfuscateLevel && `${script.obfuscateLevel}x`}
                </span>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
                <span>{script.authorName}</span>
                <span>•</span>
                <span>{script.createdAt?.toDate().toLocaleDateString() || 'Unknown Date'}</span>
                <span>•</span>
                <span>{formatBytes(script.fileSize)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
            <Icon name="x" size={20}/>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6 pb-0 sm:pb-6">
          <pre className="bg-brand-900/50 rounded-xl p-4 text-xs font-mono text-foreground/80 whitespace-pre-wrap break-all border border-brand-800 min-h-[200px] h-full sm:h-auto sm:max-h-[50vh] overflow-auto">
            {displayContent}
          </pre>
        </div>

        <div className="p-4 md:p-6 border-t border-brand-800 flex flex-wrap gap-2 flex-shrink-0 bg-brand-950">
          <button
            onClick={() => onCopyContent(script, displayContent)}
            className="flex-1 py-3 bg-brand-900 hover:bg-brand-800 text-foreground rounded-xl font-bold border border-brand-800 hover:border-primary/30 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="copy" size={16}/> Copy Raw
          </button>
          
          <button
            onClick={downloadFile}
            className="py-3 px-4 bg-brand-900 hover:bg-brand-800 text-foreground rounded-xl font-bold border border-brand-800 hover:border-primary/30 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="download" size={16}/>
          </button>

          <button
            onClick={() => onOpenRaw(script)}
            className="py-3 px-4 bg-brand-900 hover:bg-brand-800 text-foreground rounded-xl font-bold border border-brand-800 hover:border-primary/30 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="external-link" size={16}/>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowGenMenu(!showGenMenu)}
              className="py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Icon name="copy" size={16}/> Loadstring
              <Icon name="chevron-down" size={14}/>
            </button>
            
            {showGenMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-brand-950 border border-brand-800 rounded-xl shadow-2xl overflow-hidden z-10">
                {(isAdmin || perms.allowCopy) && (
                  <button onClick={() => { onCopy(script, 'long'); setShowGenMenu(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-primary/10 text-foreground flex items-center gap-2">
                    <Icon name="copy" size={14} className="text-primary"/> Long Encrypt
                  </button>
                )}
                {(isAdmin || perms.allowMediumEncrypt) && (
                  <button onClick={() => { onCopy(script, 'medium'); setShowGenMenu(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-purple/10 text-foreground flex items-center gap-2">
                    <Icon name="shield-half" size={14} className="text-purple"/> Medium Encrypt
                  </button>
                )}
                {(isAdmin || perms.allowShortEncrypt) && (
                  <button onClick={() => { onCopy(script, 'short'); setShowGenMenu(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-accent/10 text-foreground flex items-center gap-2">
                    <Icon name="minimize-2" size={14} className="text-accent"/> Short Encrypt
                  </button>
                )}
                 {(isAdmin || perms.allowShortEncrypt) && (
                  <button onClick={() => { onCopy(script, 'nano'); setShowGenMenu(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-green-500/10 text-foreground flex items-center gap-2">
                    <Icon name="zap" size={14} className="text-green-500"/> Nano Encrypt
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
