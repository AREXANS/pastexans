import { Timestamp } from "firebase/firestore";

export interface Script {
  id: string;
  title: string;
  content: string;
  visibility: 'public' | 'protected';
  type: 'text' | 'file' | 'link';
  accessKey?: string | null;
  fileName: string;
  isExternal: boolean;
  obfuscate: boolean;
  obfuscateLevel?: number; // 1, 2, or 3
  adminOnly: boolean;
  fileSize: number;
  expiresAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  author: string;
  authorName: string;
  authorPhoto: string;
  views: number;
  deleted: boolean;
  deletedAt?: Timestamp;
  deletedByAdmin?: boolean;
  preservedContent?: string;
  // New fields for loadstring copy settings
  allowGlobalCopy: boolean;
  copyExpiryOptions: CopyExpiryOption[];
  enableCaptcha?: boolean;
  // New features
  label?: string;
}

export type CopyExpiryOption = 'permanent' | '1h' | '1d' | '1w' | 'custom';

export interface ScriptCopySettings {
  allowGlobalCopy: boolean;
  copyExpiryOptions: CopyExpiryOption[];
}

export interface UserPermissions {
  allowCopy: boolean;
  allowMediumEncrypt: boolean;
  allowShortEncrypt: boolean;
  allowObfuscatedUpload: boolean;
  allowCustomCopyExpiry: boolean; // New: Allow user to set custom expiry (default true, admin can disable)
  isBlacklisted?: boolean; // New: If true, user cannot login
}

export interface UserData {
  uid: string;
  name: string;
  photo: string;
  email?: string;
  scripts: Script[];
  totalViews: number;
  permissions?: UserPermissions;
  pinnedScriptIds?: string[];
  archivedScriptIds?: string[];
}

export interface FormData {
  title: string;
  content: string;
  key: string;
  visibility: 'public' | 'protected';
  obfuscate: boolean;
  obfuscateLevel: number;
  expiryOption: string;
  customExpiry: string;
  adminOnly: boolean;
  // New fields
  allowGlobalCopy: boolean;
  copyExpiryOptions: CopyExpiryOption[];
  enableCaptcha: boolean;
  label?: string;
}

export interface CopyModal {
  script: Script;
  type: 'full' | 'short1' | 'short2';
}

export interface Toast {
  msg: string;
  type: 'info' | 'error' | 'success';
}
