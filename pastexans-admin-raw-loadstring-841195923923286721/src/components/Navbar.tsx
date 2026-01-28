import { User } from "firebase/auth";
import { Icon } from "./Icon";
import { LOGO_URL } from "@/lib/constants";

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
  viewMode: string;
  setViewMode: (mode: string) => void;
  setSelectedUser: (user: null) => void;
  openUploadModal: () => void;
  handleLogin: () => void;
  handleLogout: () => void;
  openGlobalSettings: () => void;
}

export const Navbar = ({
  user,
  isAdmin,
  viewMode,
  setViewMode,
  setSelectedUser,
  openUploadModal,
  handleLogin,
  handleLogout,
  openGlobalSettings,
}: NavbarProps) => (
  <nav className="sticky top-0 z-40 glass-panel border-b border-brand-800">
    <div className="max-w-7xl mx-auto px-4 lg:px-6 h-18 flex items-center justify-between py-3">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative group cursor-pointer" onClick={() => setViewMode('home')}>
          <div className="absolute inset-0 bg-primary rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
          <img src={LOGO_URL} className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl border border-primary/30 object-cover shadow-lg" alt="Logo"/>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg md:text-2xl font-bold tracking-tight text-foreground font-display neon-text leading-tight">
            Paste<span className="text-primary">Xans</span>
          </h1>
          <p className="text-[9px] md:text-[10px] text-primary font-mono tracking-widest uppercase hidden sm:block">Next Gen Storage</p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {isAdmin && (
          <>
            <button
              onClick={() => { setViewMode('users'); setSelectedUser(null); }}
              className={`p-2.5 rounded-xl transition-all border ${
                viewMode === 'users'
                  ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                  : 'text-muted-foreground hover:text-foreground border-transparent hover:bg-brand-800'
              }`}
              title="User Management"
            >
              <Icon name="users" size={20}/>
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'trash' ? 'home' : 'trash')}
              className={`p-2.5 rounded-xl transition-all border ${
                viewMode === 'trash'
                  ? 'bg-destructive/10 text-destructive border-destructive/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'text-muted-foreground hover:text-foreground border-transparent hover:bg-brand-800'
              }`}
              title="Trash Bin"
            >
              <Icon name={viewMode === 'trash' ? "home" : "trash-2"} size={20}/>
            </button>
            <button
              onClick={openGlobalSettings}
              className={`p-2.5 rounded-xl transition-all border text-muted-foreground hover:text-foreground border-transparent hover:bg-brand-800`}
              title="Global Settings"
            >
              <Icon name="settings" size={20}/>
            </button>
          </>
        )}
        {user && (
          <button
            onClick={openUploadModal}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95 border border-primary/20"
          >
            <Icon name="plus" size={16}/> <span className="hidden sm:inline">Upload</span>
          </button>
        )}
        {user ? (
          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l border-brand-800 ml-1 md:ml-2">
            <div className="text-right hidden md:block leading-tight">
              <p className="text-xs font-bold text-foreground max-w-[100px] truncate">{user.displayName}</p>
              <p className="text-[10px] text-primary font-mono">OPERATOR</p>
            </div>
            <div className="relative group">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-primary/50 object-cover shadow-md"/>
              ) : (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-brand-800 border border-primary flex items-center justify-center text-xs font-bold text-foreground">
                  {user.displayName?.charAt(0)}
                </div>
              )}
              <button onClick={handleLogout} className="absolute -bottom-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 border border-background shadow-sm">
                <Icon name="power" size={10}/>
              </button>
            </div>
          </div>
        ) : (
          <button onClick={handleLogin} className="ml-2 flex items-center gap-2 bg-brand-900/50 hover:bg-brand-800 text-foreground px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold border border-brand-700 hover:border-primary transition-all shadow-lg">
            <Icon name="log-in" size={16}/> Access
          </button>
        )}
      </div>
    </div>
  </nav>
);
