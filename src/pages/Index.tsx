import { useState, useEffect, useMemo } from "react";
import { User, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, onSnapshot, serverTimestamp, query, deleteDoc, doc, orderBy, updateDoc, Timestamp, setDoc, getDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db, googleProvider, appId } from "@/lib/firebase";
import { ADMIN_EMAILS, DEFAULT_COPY_EXPIRY_OPTIONS } from "@/lib/constants";
import { calculateExpiryDate } from "@/lib/helpers";
import { longLoadstringObfuscate, mediumLoadstringObfuscate, shortLoadstringObfuscate, nanoObfuscate, getExpiryCheckLua } from "@/lib/obfuscator";
import { isObfuscatedOrEncrypted } from "@/lib/detector";
import { Script, UserData, FormData, CopyModal as CopyModalType, Toast, UserPermissions, CopyExpiryOption } from "@/types/script";
import { RawViewer } from "@/components/RawViewer";
import { Navbar } from "@/components/Navbar";
import { ScriptCard } from "@/components/ScriptCard";
import { UserCard } from "@/components/UserCard";
import { ToastNotification } from "@/components/Toast";
import { Icon } from "@/components/Icon";
import { LoginModal } from "@/components/modals/LoginModal";
import { UnlockModal } from "@/components/modals/UnlockModal";
import { UploadModal } from "@/components/modals/UploadModal";
import { ViewModal } from "@/components/modals/ViewModal";
import { CopyModal } from "@/components/modals/CopyModal";
import { PermissionsModal } from "@/components/modals/PermissionsModal";
import { ScriptSettingsModal } from "@/components/modals/ScriptSettingsModal";
import { CaptchaModal } from "@/components/modals/CaptchaModal";
import { GlobalSettingsModal } from "@/components/modals/GlobalSettingsModal";

const firebaseConfig = { projectId: "pastexans" };
const defaultPermissions: UserPermissions = { allowCopy: true, allowMediumEncrypt: false, allowShortEncrypt: false, allowObfuscatedUpload: false, allowCustomCopyExpiry: true };

const Index = () => {
  const [urlParams] = useState(new URLSearchParams(window.location.search));
  const rawId = urlParams.get('raw');
  if (rawId) return <RawViewer scriptId={rawId} />;

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [trashScripts, setTrashScripts] = useState<Script[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<string, UserPermissions>>({});
  const [globalSettings, setGlobalSettings] = useState({ allowGlobalLoadstringCopy: false });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('home');
  const [filterMode, setFilterMode] = useState('all'); // all, mine, archived
  const [toast, setToast] = useState<Toast | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'text' | 'file' | 'link'>('text');
  const [isCompact, setIsCompact] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<UserData | null>(null);
  const [settingsScript, setSettingsScript] = useState<Script | null>(null);
  const [formData, setFormData] = useState<FormData>({ title: '', content: '', key: '', visibility: 'public', obfuscate: false, expiryOption: 'permanent', customExpiry: '', adminOnly: false, allowGlobalCopy: true, copyExpiryOptions: DEFAULT_COPY_EXPIRY_OPTIONS, enableCaptcha: false, label: '' });
  const [copyModal, setCopyModal] = useState<CopyModalType | null>(null);
  const [captchaTarget, setCaptchaTarget] = useState<{ script: Script, type: 'long' | 'medium' | 'short' | 'nano' } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [unlockData, setUnlockData] = useState<Script | null>(null);
  const [viewData, setViewData] = useState<Script | null>(null);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);

  const showToast = (msg: string, type: 'info' | 'error' | 'success' = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleSaveGlobalSettings = async (settings: { allowGlobalLoadstringCopy: boolean }) => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'global_settings', 'settings'), settings, { merge: true });
      showToast("Global settings saved", "success");
    } catch (e) {
      showToast("Failed to save settings: " + (e as Error).message, "error");
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); if (u) { setFilterMode('mine'); setIsAdmin(u.email ? ADMIN_EMAILS.includes(u.email) : false); } else { setIsAdmin(false); setFilterMode('all'); } });
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'scripts'), orderBy('createdAt', 'desc'));
    const unsubDb = onSnapshot(q, (snap) => { const all = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Script[]; setScripts(all.filter(s => !s.deleted)); setTrashScripts(all.filter(s => s.deleted)); setLoading(false); });
    const unsubPerms = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'user_permissions'), (snap) => { const perms: Record<string, UserPermissions> = {}; snap.forEach(d => { perms[d.id] = { ...defaultPermissions, ...d.data() } as UserPermissions; }); setUserPermissions(perms); });
    const unsubUsers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), (snap) => { setAllUsers(snap.docs.map(d => ({ uid: d.id, ...d.data(), scripts: [], totalViews: 0, pinnedScriptIds: d.data().pinnedScriptIds || [], archivedScriptIds: d.data().archivedScriptIds || [] } as UserData))); });
    const unsubSettings = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'global_settings', 'settings'), (doc) => { if (doc.exists()) { setGlobalSettings(doc.data() as any); } });
    return () => { unsub(); unsubDb(); unsubPerms(); unsubUsers(); unsubSettings() };
  }, []);

  const handleLogin = async () => { 
    try { 
      const result = await signInWithPopup(auth, googleProvider); 
      
      const permDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_permissions', result.user.uid));
      if (permDoc.exists()) {
        const perms = permDoc.data() as UserPermissions;
        if (perms.isBlacklisted) {
          await signOut(auth);
          alert("Akun anda telah diblacklist silahkan hubungi owner wa.me/6289518030035");
          return;
        }
      }

      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', result.user.uid), { name: result.user.displayName || 'Anonymous', photo: result.user.photoURL || '', email: result.user.email, lastLogin: serverTimestamp() }, { merge: true }); 
      showToast("Autentikasi Berhasil", "success"); 
      setModalState(null); 
    } catch (e) { 
      showToast("Auth Gagal: " + (e as Error).message, "error"); 
    } 
  };
  const handleLogout = async () => { await signOut(auth); showToast("Sesi Ditutup"); setViewMode('home'); setSelectedUser(null); };
  
  useEffect(() => {
    if (user && userPermissions[user.uid]?.isBlacklisted) {
      signOut(auth).then(() => {
        alert("Akun anda telah diblacklist silahkan hubungi owner wa.me/6289518030035");
        setUser(null);
        setViewMode('home');
      });
    }
  }, [user, userPermissions]);

  const toggleUserPermission = async (uid: string, key: keyof UserPermissions) => { if (!isAdmin) return; const curr = userPermissions[uid] || defaultPermissions; try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_permissions', uid), { ...curr, [key]: !curr[key], updatedAt: serverTimestamp() }, { merge: true }); showToast("Izin diperbarui", "success"); } catch (e) { showToast("Gagal memperbarui: " + (e as Error).message, "error"); } };

  const handleWhitelistUser = async (uid: string) => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_permissions', uid), { isBlacklisted: false, updatedAt: serverTimestamp() }, { merge: true });
      showToast("User di-whitelist", "success");
    } catch (e) { showToast("Gagal whitelist: " + (e as Error).message, "error"); }
  };

  const handleBlacklistUser = async (uid: string) => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_permissions', uid), { isBlacklisted: true, updatedAt: serverTimestamp() }, { merge: true });
      showToast("User di-blacklist", "success");
    } catch (e) { showToast("Gagal blacklist: " + (e as Error).message, "error"); }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!isAdmin) return;
    if (!confirm("Hapus akun pengguna ini secara permanen? Data user dan permission akan dihapus.")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', uid));
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_permissions', uid));
      setPermissionsUser(null);
      setSelectedUser(null);
      showToast("Akun dihapus permanen", "success");
    } catch (e) { showToast("Gagal menghapus akun: " + (e as Error).message, "error"); }
  };

  const deleteAllTrash = async () => { if (!isAdmin || trashScripts.length === 0) return; if (!confirm("Hapus semua file di sampah secara permanen? Tindakan ini tidak dapat dibatalkan.")) return; setLoading(true); try { const deletePromises = trashScripts.map(script => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'scripts', script.id))); await Promise.all(deletePromises); showToast("Semua file sampah dihapus permanen", "success"); } catch (e) { showToast("Gagal menghapus: " + (e as Error).message, "error"); } finally { setLoading(false); } };

  const togglePin = async (script: Script) => {
    if (!user) return;
    // Find current user data
    const currentUserData = allUsers.find(u => u.uid === user.uid);
    const isPinned = currentUserData?.pinnedScriptIds?.includes(script.id);
    
    try {
      // Update USER document
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), { 
        pinnedScriptIds: isPinned ? arrayRemove(script.id) : arrayUnion(script.id) 
      });
      showToast(isPinned ? "Unpinned" : "Pinned", "success");
    } catch (e) { showToast("Gagal update pin: " + (e as Error).message, "error"); }
  };

  const toggleArchive = async (script: Script) => {
    if (!user) return;
    const currentUserData = allUsers.find(u => u.uid === user.uid);
    const isArchived = currentUserData?.archivedScriptIds?.includes(script.id);
    
    try {
      // Update USER document
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), { 
        archivedScriptIds: isArchived ? arrayRemove(script.id) : arrayUnion(script.id) 
      });
      showToast(isArchived ? "Unarchived" : "Archived", "success");
    } catch (e) { showToast("Gagal update archive: " + (e as Error).message, "error"); }
  };

  const openScript = async (script: Script, providedKey: string | null = null) => { if (!isAdmin && script.visibility === 'protected' && script.accessKey !== providedKey) { setUnlockData(script); setModalState('unlock'); return; } setViewData(script); setModalState('view'); };

  const handleSaveSettings = async (settings: { allowGlobalCopy: boolean; copyExpiryOptions: CopyExpiryOption[] }) => { if (!settingsScript) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'scripts', settingsScript.id), { allowGlobalCopy: settings.allowGlobalCopy, copyExpiryOptions: settings.copyExpiryOptions, updatedAt: serverTimestamp() }); showToast("Pengaturan disimpan", "success"); } catch (e) { showToast("Gagal menyimpan: " + (e as Error).message, "error"); } };

  const openUploadModal = (isEdit = false, scriptData?: Script) => {
    if (isEdit && scriptData) {
      setEditingId(scriptData.id);
      setUploadType(scriptData.type || 'text');
      setFormData({
        title: scriptData.title,
        content: scriptData.content,
        visibility: scriptData.visibility,
        key: scriptData.accessKey || '',
        obfuscate: scriptData.obfuscate || false,
        obfuscateLevel: scriptData.obfuscateLevel || 1,
        expiryOption: 'permanent',
        customExpiry: '',
        adminOnly: scriptData.adminOnly || false,
        allowGlobalCopy: scriptData.allowGlobalCopy !== false,
        copyExpiryOptions: scriptData.copyExpiryOptions || DEFAULT_COPY_EXPIRY_OPTIONS,
        enableCaptcha: scriptData.enableCaptcha || false,
        label: scriptData.label || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        content: '',
        key: '',
        visibility: 'public',
        obfuscate: false,
        obfuscateLevel: 1,
        expiryOption: 'permanent',
        customExpiry: '',
        adminOnly: false,
        allowGlobalCopy: true,
        copyExpiryOptions: DEFAULT_COPY_EXPIRY_OPTIONS,
        enableCaptcha: false,
        label: ''
      });
    }
    setModalState('upload');
  };

  const handleUpload = async (e: React.FormEvent, fileObj: File | null) => {
    e.preventDefault();
    if (!formData.title) return showToast("Judul diperlukan", "error");
    setUploading(true);
    try {
      let rawContent = uploadType === 'text' ? formData.content : uploadType === 'file' && fileObj ? await fileObj.text() : formData.content;
      if (!rawContent) throw new Error("Konten kosong");
      const hasPerm = user && (isAdmin || userPermissions[user.uid]?.allowObfuscatedUpload);
      if (!hasPerm && isObfuscatedOrEncrypted(rawContent)) throw new Error("Upload Ditolak: Konten terenkripsi dibatasi.");
      const expiresAt = calculateExpiryDate(formData.expiryOption, formData.customExpiry);
      const common = {
        title: formData.title,
        visibility: formData.visibility,
        type: uploadType,
        accessKey: formData.visibility === 'protected' ? formData.key : null,
        fileName: formData.title.replace(/[^a-zA-Z0-9]/g, '_'),
        content: rawContent,
        isExternal: uploadType === 'link',
        obfuscate: formData.obfuscate,
        obfuscateLevel: formData.obfuscateLevel || 1,
        adminOnly: formData.adminOnly,
        fileSize: new Blob([rawContent]).size,
        expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
        allowGlobalCopy: formData.allowGlobalCopy,
        copyExpiryOptions: formData.copyExpiryOptions,
        enableCaptcha: formData.enableCaptcha,
        label: formData.label
      };
      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'scripts', editingId), { ...common, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'scripts'), { ...common, createdAt: serverTimestamp(), author: user?.uid, authorName: user?.displayName || 'Unknown', authorPhoto: user?.photoURL, views: 0, deleted: false });
      }
      showToast(editingId ? "Script Diperbarui" : "Script Dideploy", "success");
      setModalState(null);
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setUploading(false);
    }
  };

  const initiateCopy = (script: Script, type: 'long' | 'medium' | 'short' | 'nano') => {
    if (script.expiresAt && script.expiresAt.toDate() < new Date()) return showToast("Script Kadaluarsa", "error");
    
    // Check for Captcha requirement
    // Bypass for admin and author
    const isOwner = user?.uid === script.author;
    if (script.enableCaptcha && !isAdmin && !isOwner) {
      setCaptchaTarget({ script, type });
      return;
    }

    setCopyModal({ script, type });
  };

  const handleCaptchaVerified = () => {
    if (!captchaTarget) return;
    setCopyModal({ script: captchaTarget.script, type: captchaTarget.type });
    setCaptchaTarget(null);
    showToast("Verifikasi Berhasil", "success");
  };

  const performCopy = (durationOption: string, customVal: string) => {
    if (!copyModal) return;
    const { script, type } = copyModal;
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/artifacts/${appId}/public/data/scripts/${script.id}`;
    const sessionExpiry = calculateExpiryDate(durationOption, customVal);
    const unixTime = sessionExpiry ? Math.floor(sessionExpiry.getTime() / 1000) : null;

    let finalLua = '';
    const loader = `loadstring(game:GetService("HttpService"):JSONDecode(game:HttpGet("${firestoreUrl}")).fields.content.stringValue)()`;
    const expiryLoader = `${getExpiryCheckLua(unixTime)}${loader}`;

    switch (type) {
      case 'long':
        finalLua = longLoadstringObfuscate(expiryLoader);
        break;
      case 'medium':
        finalLua = mediumLoadstringObfuscate(firestoreUrl, unixTime);
        break;
      case 'short':
        finalLua = shortLoadstringObfuscate(firestoreUrl, unixTime);
        break;
      case 'nano':
        finalLua = nanoObfuscate(firestoreUrl, unixTime);
        break;
    }
    navigator.clipboard.writeText(finalLua);
    showToast("Tersalin!", "success");
    setCopyModal(null);
  };

  const softDelete = async (script: Script) => { if (!confirm("Pindahkan ke Sampah?")) return; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'scripts', script.id), { deleted: true, deletedAt: serverTimestamp(), preservedContent: script.content, content: "-- DELETED --" }); showToast("Dipindahkan ke Sampah", "success"); };
  const restoreScript = async (script: Script) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'scripts', script.id), { deleted: false, content: script.preservedContent || script.content }); showToast("Dipulihkan", "success"); };
  
  const userList = useMemo(() => { if (viewMode !== 'users') return { withFiles: [], withoutFiles: [] }; const m: Record<string, UserData> = {}; allUsers.forEach(u => { m[u.uid] = { ...u, scripts: [], totalViews: 0 }; }); scripts.forEach(s => { if (!m[s.author]) m[s.author] = { uid: s.author, name: s.authorName, photo: s.authorPhoto, scripts: [], totalViews: 0 }; m[s.author].scripts.push(s); m[s.author].totalViews += (s.views || 0); }); const list = Object.values(m).sort((a, b) => b.scripts.length - a.scripts.length); return { withFiles: list.filter(u => u.scripts.length > 0), withoutFiles: list.filter(u => u.scripts.length === 0) }; }, [viewMode, scripts, allUsers]);
  
  const activeList = useMemo(() => { 
    if (viewMode === 'trash') return isAdmin ? trashScripts : trashScripts.filter(s => s.author === user?.uid); 
    
    let filtered = scripts.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Get current user's lists
    const currentUserData = user ? allUsers.find(u => u.uid === user.uid) : null;
    const archivedIds = currentUserData?.archivedScriptIds || [];
    const pinnedIds = currentUserData?.pinnedScriptIds || [];

    if (filterMode === 'archived') {
       // Show ONLY scripts archived by current user
       filtered = filtered.filter(s => archivedIds.includes(s.id));
    } else {
       // Normal views: exclude scripts archived by current user
       filtered = filtered.filter(s => !archivedIds.includes(s.id));

       if (filterMode === 'mine' && user) {
         // My Files: show only mine
         filtered = filtered.filter(s => s.author === user.uid);
       } else {
         // Global: show all except adminOnly
         filtered = filtered.filter(s => !s.adminOnly);
       }
    }
    
    // Sort by pinned then date
    return filtered.sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id);
      const bPinned = pinnedIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0; // Keep original sort (date desc)
    });
  }, [viewMode, trashScripts, scripts, searchTerm, isAdmin, user, filterMode, allUsers]);

  const currentUserPerms = user ? userPermissions[user.uid] || defaultPermissions : defaultPermissions;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-ambient"></div><div className="bg-grid"></div>
      <Navbar user={user} isAdmin={isAdmin} viewMode={viewMode} setViewMode={setViewMode} setSelectedUser={() => setSelectedUser(null)} openUploadModal={() => openUploadModal(false)} handleLogin={() => setModalState('login')} handleLogout={handleLogout} openGlobalSettings={() => setIsGlobalSettingsOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 md:py-8 flex-1 w-full">
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end">
          <div className="w-full flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-display flex items-center gap-3">
              <span className="bg-primary/20 p-2 rounded-lg text-primary border border-primary/30"><Icon name={viewMode === 'trash' ? "trash" : viewMode === 'users' ? "users" : "layers"} size={24}/></span>
              {viewMode === 'trash' ? "Tempat Sampah" : viewMode === 'users' ? (selectedUser ? `File oleh ${selectedUser.name}` : "Manajemen Pengguna") : "Library"}
              
              {user && viewMode === 'home' && (
                <div className="flex bg-brand-950/80 rounded-xl border border-brand-800 p-1 ml-4 shadow-lg shadow-black/20">
                  <button onClick={() => setFilterMode('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterMode === 'all' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-brand-900/50'}`}>Global</button>
                  <button onClick={() => setFilterMode('mine')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterMode === 'mine' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-brand-900/50'}`}>File Saya</button>
                  <button onClick={() => setFilterMode('archived')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterMode === 'archived' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-brand-900/50'}`}>Arsip</button>
                </div>
              )}
            </h2>
            <div className="flex gap-2">
              {viewMode === 'users' && selectedUser && <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 bg-brand-900/50 hover:bg-brand-800 text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold border border-brand-700"><Icon name="arrow-left" size={16}/> Kembali</button>}
              {viewMode === 'trash' && isAdmin && trashScripts.length > 0 && <button onClick={deleteAllTrash} className="flex items-center gap-2 bg-destructive/20 hover:bg-destructive/30 text-destructive px-4 py-2.5 rounded-xl text-sm font-bold border border-destructive/30 transition-colors"><Icon name="trash-2" size={16}/> Kosongkan Sampah</button>}
              <div className="relative flex-1 max-w-4xl"><input type="text" placeholder="Cari..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-brand-950/80 border border-brand-800 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder-brand-700 outline-none focus:border-primary"/><Icon name="search" size={18} className="absolute left-3 top-3.5 text-primary"/></div>
              <button onClick={() => setIsCompact(!isCompact)} className={`px-4 bg-brand-900/50 border ${isCompact ? 'border-primary text-primary' : 'border-brand-800 text-muted-foreground'} rounded-xl flex items-center justify-center`}><Icon name={isCompact ? "grid-3x3" : "layout-grid"} size={20}/></button>
            </div>
          </div>
        </div>
        {loading ? (<div className="flex flex-col items-center justify-center py-32"><Icon name="loader-2" className="animate-spin text-primary mb-4" size={40}/><p className="font-mono text-primary">Loading...</p></div>) : viewMode === 'users' && !selectedUser ? (<div className="flex flex-col gap-8 pb-20"><div><h3 className="text-xl font-bold text-foreground mb-4 font-display flex items-center gap-2"><Icon name="user-check" size={20} className="text-primary"/> Kontributor Aktif <span className="text-xs font-mono bg-brand-900 text-primary px-2 py-0.5 rounded ml-2">{userList.withFiles.length}</span></h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{userList.withFiles.map(u => <UserCard key={u.uid} user={u} onClick={() => setSelectedUser(u)} isAdmin={isAdmin} permissions={userPermissions[u.uid]} onOpenPermissions={() => setPermissionsUser(u)} />)}</div></div>{userList.withoutFiles.length > 0 && (<div><h3 className="text-xl font-bold text-foreground mb-4 font-display flex items-center gap-2 opacity-80"><Icon name="users" size={20} className="text-muted-foreground"/> Pengguna Terdaftar (Tanpa File) <span className="text-xs font-mono bg-brand-900 text-muted-foreground px-2 py-0.5 rounded ml-2">{userList.withoutFiles.length}</span></h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">{userList.withoutFiles.map(u => <UserCard key={u.uid} user={u} onClick={() => setSelectedUser(u)} isAdmin={isAdmin} permissions={userPermissions[u.uid]} onOpenPermissions={() => setPermissionsUser(u)} />)}</div></div>)}</div>) : (<div className={`gap-4 pb-20 grid ${isCompact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>{(viewMode === 'users' && selectedUser ? selectedUser.scripts : activeList).map(item => {
          const currentUserData = user ? allUsers.find(u => u.uid === user.uid) : null;
          const isPinned = currentUserData?.pinnedScriptIds?.includes(item.id) || false;
          const isArchived = currentUserData?.archivedScriptIds?.includes(item.id) || false;
          
          return (
            <ScriptCard 
              key={item.id} 
              script={item} 
              isCompact={isCompact} 
              isAdmin={isAdmin} 
              currentUserId={user?.uid} 
              viewMode={viewMode} 
              userCanCopy={currentUserPerms.allowCopy} 
              userCanMediumEncrypt={currentUserPerms.allowMediumEncrypt} 
              userCanShortEncrypt={currentUserPerms.allowShortEncrypt}
              globalSettings={globalSettings}
              onOpen={openScript} 
              onEdit={(s) => openUploadModal(true, s)} 
              onDelete={softDelete} 
              onRestore={restoreScript} 
              onTogglePin={togglePin} 
              onToggleArchive={toggleArchive} 
              onPermanentDelete={async (s) => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'scripts', s.id)); showToast("Dihapus Permanen", "success"); }} 
              onCopy={initiateCopy} 
              onOpenSettings={(s) => setSettingsScript(s)}
              isPinned={isPinned}
              isArchived={isArchived}
            />
          );
        })}</div>)}
      </main>
      {modalState === 'login' && <LoginModal onClose={() => setModalState(null)} onLogin={handleLogin} />}
      {modalState === 'unlock' && unlockData && <UnlockModal script={unlockData} onClose={() => setModalState(null)} onUnlock={openScript} showToast={showToast} />}
      {modalState === 'upload' && <UploadModal isAdmin={isAdmin} editingId={editingId} formData={formData} setFormData={setFormData} uploadType={uploadType} setUploadType={setUploadType} uploading={uploading} onClose={() => setModalState(null)} onSubmit={handleUpload} />}
      {modalState === 'view' && viewData && <ViewModal script={viewData} isAdmin={isAdmin} viewMode={viewMode} userPermissions={currentUserPerms} onClose={() => setModalState(null)} onCopy={initiateCopy} onCopyContent={(s, c) => { navigator.clipboard.writeText(c); showToast("Tersalin", "success"); }} onOpenRaw={(s) => window.open(`?raw=${s.id}`, '_blank')} />}
      {captchaTarget && <CaptchaModal onClose={() => setCaptchaTarget(null)} onVerify={handleCaptchaVerified} />}
      {copyModal && <CopyModal copyModal={copyModal} onClose={() => setCopyModal(null)} onCopy={performCopy} isAdmin={isAdmin} isOwner={user?.uid === copyModal.script.author} userPermissions={currentUserPerms} script={copyModal.script} />}
      {permissionsUser && <PermissionsModal user={permissionsUser} permissions={userPermissions[permissionsUser.uid] || defaultPermissions} onClose={() => setPermissionsUser(null)} onTogglePermission={(key) => toggleUserPermission(permissionsUser.uid, key)} onWhitelist={() => handleWhitelistUser(permissionsUser.uid)} onBlacklist={() => handleBlacklistUser(permissionsUser.uid)} onDeleteUser={() => handleDeleteUser(permissionsUser.uid)} />}
      {settingsScript && <ScriptSettingsModal script={settingsScript} isAdmin={isAdmin} isOwner={user?.uid === settingsScript.author} userPermissions={currentUserPerms} onClose={() => setSettingsScript(null)} onSave={handleSaveSettings} />}
      {isGlobalSettingsOpen && <GlobalSettingsModal isOpen={isGlobalSettingsOpen} onClose={() => setIsGlobalSettingsOpen(false)} settings={globalSettings} onSave={handleSaveGlobalSettings} />}
      {toast && <ToastNotification toast={toast} />}
    </div>
  );
};

export default Index;
