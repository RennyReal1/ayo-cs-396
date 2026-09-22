import React, { useState } from 'react';
import {
  Users,
  X,
  Check,
  UserPlus,
  ShieldCheck,
  Database,
  ExternalLink,
  Copy,
  LogOut,
  Mail,
  GraduationCap,
  Sparkles,
  Info,
} from 'lucide-react';
import { WorkspaceUser } from '../types';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';

interface SharedWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: WorkspaceUser[];
  activeUserId: string;
  onSwitchUser: (userId: string) => void;
  onAddCollaborator: (user: WorkspaceUser) => void;
  onShowToast: (msg: string) => void;
}

export const SharedWorkspaceModal: React.FC<SharedWorkspaceModalProps> = ({
  isOpen,
  onClose,
  collaborators,
  activeUserId,
  onSwitchUser,
  onAddCollaborator,
  onShowToast,
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Editor' | 'Viewer'>('Editor');
  const [isAdding, setIsAdding] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        // Check if user already exists
        const existing = collaborators.find((c) => c.email.toLowerCase() === user.email!.toLowerCase());
        if (existing) {
          onSwitchUser(existing.id);
          onShowToast(`Signed in as ${user.email}`);
        } else {
          const initials = user.displayName
            ? user.displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : user.email[0].toUpperCase();

          const newUser: WorkspaceUser = {
            id: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            role: 'Editor',
            initials,
            avatarColor: '#1a73e8',
            institution: user.email.endsWith('uic.edu') ? 'University of Illinois Chicago (UIC)' : undefined,
          };
          onAddCollaborator(newUser);
          onSwitchUser(newUser.id);
          onShowToast(`Connected ${user.email} to the shared workspace!`);
        }
      }
    } catch (err: any) {
      console.warn('Firebase Google Auth popup:', err);
      // Helpful fallback note if iframe blocks popup
      setAuthError(
        err.message?.includes('popup-blocked') || err.message?.includes('closed-by-user')
          ? 'Google Sign-In popup was closed or restricted in this browser frame. You can seamlessly switch to arilw@uic.edu directly below!'
          : err.message || 'Authentication failed. You can switch personas directly below.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const email = newEmail.trim().toLowerCase();
    const existing = collaborators.find((c) => c.email.toLowerCase() === email);
    if (existing) {
      onShowToast(`${email} is already in this workspace.`);
      return;
    }

    const initials = (newName.trim() || email)
      .slice(0, 2)
      .toUpperCase();

    const isUic = email.endsWith('uic.edu');
    const newUser: WorkspaceUser = {
      id: `user_${Date.now()}`,
      name: newName.trim() || email.split('@')[0],
      email,
      role: newRole,
      initials,
      avatarColor: isUic ? '#d9381e' : '#1a73e8',
      institution: isUic ? 'University of Illinois Chicago (UIC)' : undefined,
    };

    onAddCollaborator(newUser);
    setNewEmail('');
    setNewName('');
    setIsAdding(false);
    onShowToast(`Added ${email} to the shared workspace!`);
  };

  const copyWorkspaceId = () => {
    navigator.clipboard.writeText('cs-396-mvp-ayo : ai-studio-googlemira-1ffbd507-9a8f-4c61-b82b-328c38030b41');
    onShowToast('Project & Database ID copied to clipboard!');
  };

  const activeUser = collaborators.find((c) => c.id === activeUserId) || collaborators[0];

  return (
    <div
      id="shared-workspace-modal-overlay"
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
    >
      <div
        id="shared-workspace-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-gray-200/80 max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 bg-[#f8fafd]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Shared Team Workspace</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                  Live Synchronized
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Shared Firestore database access for <code>ayomide.rilwan4@gmail.com</code> &amp; <code>arilw@uic.edu</code>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Active Workspace Info Banner */}
          <div className="p-4 rounded-xl bg-[#e8f0fe]/60 border border-[#d2e3fc] space-y-2">
            <div className="flex items-start gap-2.5">
              <Database className="w-4 h-4 text-[#1a73e8] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 text-xs block">
                  Unified Cloud Firestore Workspace
                </span>
                <p className="text-gray-600 text-[11px] leading-relaxed mt-0.5">
                  Both accounts connect directly to the central Firestore collection (<code>p2c_touchpoints</code>). Any customer touchpoints uploaded or models analyzed by either account are automatically shared in real time.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#d2e3fc]/80 font-mono text-[10px] text-gray-600">
              <span className="truncate">Project: cs-396-mvp-ayo (UIC)</span>
              <button
                type="button"
                onClick={copyWorkspaceId}
                className="inline-flex items-center gap-1 text-[#1a73e8] hover:underline cursor-pointer ml-2 shrink-0 font-sans font-semibold text-[11px]"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Project &amp; DB ID</span>
              </button>
            </div>
          </div>

          {/* Connected Team Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px] text-gray-500">
                Connected Workspace Members ({collaborators.length})
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a73e8] hover:underline cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isAdding ? 'Cancel' : 'Add Collaborator'}</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {collaborators.map((user) => {
                const isActive = user.id === activeUserId;
                const isUic = user.email.toLowerCase().includes('uic.edu');

                return (
                  <div
                    key={user.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-[#1a73e8] bg-[#f8fafd] shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                        style={{ backgroundColor: user.avatarColor || (isUic ? '#d9381e' : '#1a73e8') }}
                      >
                        {user.initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-xs truncate">
                            {user.name}
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f0fe] text-[#1a73e8]">
                              Active Session
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                          <span className="truncate font-mono">{user.email}</span>
                          <span>•</span>
                          <span className="font-medium text-gray-700">{user.role}</span>
                          {isUic && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#d9381e] bg-red-50 px-1.5 py-0.2 rounded">
                              <GraduationCap className="w-3 h-3" />
                              UIC
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[#137333] font-semibold text-xs bg-[#e6f4ea] px-2.5 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchUser(user.id);
                            onShowToast(`Switched active workspace persona to ${user.name} (${user.email})`);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#1a73e8] hover:text-[#1a73e8] font-semibold text-gray-700 bg-white text-xs transition-colors cursor-pointer"
                        >
                          Switch to this account
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Form */}
            {isAdding && (
              <form onSubmit={handleAddMember} className="p-4 rounded-xl border border-gray-200 bg-[#f8fafd] space-y-3">
                <div className="font-bold text-gray-900 text-xs">Add New Workspace Collaborator</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Ayo UIC)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#1a73e8]/30 focus:outline-none bg-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email address (e.g. colleague@uic.edu)"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#1a73e8]/30 focus:outline-none bg-white"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-[11px]">Role:</span>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white"
                    >
                      <option value="Editor">Editor (Can upload, delete &amp; analyze)</option>
                      <option value="Viewer">Viewer (Read-only reports)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#1a73e8] hover:bg-[#174ea6] text-white rounded-lg text-xs font-semibold"
                    >
                      Add Member
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Firebase Google Sign-In Option */}
          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 text-xs block">
                  Authenticate with Google Account
                </span>
                <p className="text-gray-500 text-[11px]">
                  Sign in directly using your UIC Google account or personal Gmail via Firebase Auth.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold rounded-xl text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {/* Google 'G' icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSigningIn ? 'Opening Sign In...' : 'Sign in with Google'}</span>
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-[#f8fafd] flex items-center justify-between gap-4 shrink-0">
          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#137333]" />
            <span>Shared access enforced across all 6 attribution models</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#1a73e8] hover:bg-[#174ea6] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
