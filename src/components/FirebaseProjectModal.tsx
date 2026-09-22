import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Check,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Server,
  Zap,
  Loader2,
  Radio,
  ExternalLink,
  ShieldCheck,
  Flame,
  Layers,
  Copy,
} from 'lucide-react';
import {
  FirebaseProjectProfile,
  getAllProjectProfiles,
  getActiveProjectProfile,
  switchActiveProject,
  saveProjectProfile,
  deleteProjectProfile,
  testConnection,
  BUILT_IN_PROFILES,
} from '../firebase';

interface FirebaseProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectChanged?: (profile: FirebaseProjectProfile) => void;
  onShowToast?: (msg: string) => void;
  onSeedRequested?: () => void;
  touchpointsCount?: number;
}

export const FirebaseProjectModal: React.FC<FirebaseProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectChanged,
  onShowToast,
  onSeedRequested,
  touchpointsCount = 0,
}) => {
  const [profiles, setProfiles] = useState<FirebaseProjectProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<FirebaseProjectProfile>(getActiveProjectProfile());
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [switchingTargetId, setSwitchingTargetId] = useState<string | null>(null);

  // Testing connection state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ id: string; latencyMs: number; success: boolean } | null>(null);

  // Add new profile form state
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newProfileName, setNewProfileName] = useState<string>('');
  const [newProjectId, setNewProjectId] = useState<string>('');
  const [newDatabaseId, setNewDatabaseId] = useState<string>('(default)');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormTesting, setIsFormTesting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const all = getAllProjectProfiles();
      setProfiles(all);
      setActiveProfile(getActiveProjectProfile());
      setTestResult(null);
      setIsAddingNew(false);
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestActiveConnection = async (profile: FirebaseProjectProfile) => {
    try {
      setIsTesting(true);
      const res = await testConnection(profile);
      setTestResult({
        id: profile.id,
        latencyMs: res.latencyMs,
        success: res.success,
      });
      if (onShowToast) {
        onShowToast(`Connection verified: ${res.latencyMs}ms latency to ${profile.projectId}`);
      }
    } catch (err) {
      console.error('Test connection error:', err);
      setTestResult({
        id: profile.id,
        latencyMs: 0,
        success: false,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSwitch = async (profile: FirebaseProjectProfile) => {
    if (profile.id === activeProfile.id) return;

    try {
      setIsSwitching(true);
      setSwitchingTargetId(profile.id);

      const switched = await switchActiveProject(profile.id);
      setActiveProfile(switched);
      setProfiles(getAllProjectProfiles());

      if (onProjectChanged) {
        onProjectChanged(switched);
      }
      if (onShowToast) {
        onShowToast(`Switched active database to "${switched.name}"`);
      }
    } catch (err) {
      console.error('Failed to switch project:', err);
      if (onShowToast) {
        onShowToast('Failed to switch project. Please try again.');
      }
    } finally {
      setIsSwitching(false);
      setSwitchingTargetId(null);
    }
  };

  const handleDelete = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = deleteProjectProfile(profileId);
    if (success) {
      setProfiles(getAllProjectProfiles());
      setActiveProfile(getActiveProjectProfile());
      if (onShowToast) {
        onShowToast('Project profile deleted.');
      }
    }
  };

  const handleCreateAndSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newProjectId.trim()) {
      setFormError('Project ID is required (e.g. my-firebase-project)');
      return;
    }

    const cleanProjectId = newProjectId.trim();
    const cleanDatabaseId = newDatabaseId.trim() || '(default)';
    const cleanName = newProfileName.trim() || `Project (${cleanProjectId})`;

    const newProfile: FirebaseProjectProfile = {
      id: `custom_${cleanProjectId}_${Date.now()}`,
      name: cleanName,
      description: newDescription.trim() || `Custom Firestore target: ${cleanProjectId} [${cleanDatabaseId}]`,
      projectId: cleanProjectId,
      databaseId: cleanDatabaseId,
      apiKey: newApiKey.trim() || undefined,
      authDomain: `${cleanProjectId}.firebaseapp.com`,
      storageBucket: `${cleanProjectId}.firebasestorage.app`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    try {
      setIsFormTesting(true);
      // Verify connection to the new project
      const testRes = await testConnection(newProfile);

      saveProjectProfile(newProfile);
      setProfiles(getAllProjectProfiles());

      // Switch to it
      const switched = await switchActiveProject(newProfile.id);
      setActiveProfile(switched);
      setIsAddingNew(false);

      // Reset form
      setNewProfileName('');
      setNewProjectId('');
      setNewDatabaseId('(default)');
      setNewDescription('');
      setNewApiKey('');

      if (onProjectChanged) {
        onProjectChanged(switched);
      }
      if (onShowToast) {
        onShowToast(`Connected & switched to "${cleanName}" (${testRes.latencyMs}ms)!`);
      }
    } catch (err: any) {
      console.error('Failed to connect to new project:', err);
      setFormError(err.message || 'Failed to establish connection to this project.');
    } finally {
      setIsFormTesting(false);
    }
  };

  return (
    <div
      id="firebase-project-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="firebase-project-modal"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#f8fafd]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#feefe3] text-[#e37400] flex items-center justify-center shrink-0 shadow-2xs border border-[#fad2cf]/60">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 leading-snug">
                  Firebase &amp; Firestore Project Switcher
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Switch which Google Cloud project or Firestore database you are working from
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200/70 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Current Active Target Banner */}
          <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#1a73e8]/25 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#137333] animate-pulse" />
                <span className="text-[11px] font-bold text-[#1a73e8] uppercase tracking-wider">
                  Active Database Connection
                </span>
              </div>

              <div className="flex items-center gap-2">
                {testResult?.id === activeProfile.id && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      testResult.success ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'
                    }`}
                  >
                    {testResult.success ? `${testResult.latencyMs}ms latency` : 'Connection check failed'}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleTestActiveConnection(activeProfile)}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer disabled:opacity-50 transition-colors"
                  title="Ping Firestore to verify latency and read permissions"
                >
                  {isTesting ? (
                    <Loader2 className="w-3 h-3 animate-spin text-[#1a73e8]" />
                  ) : (
                    <Zap className="w-3 h-3 text-[#1a73e8]" />
                  )}
                  <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3">
              <div className="p-2.5 bg-white rounded-lg border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Project ID</span>
                <span className="font-mono font-bold text-gray-900 text-xs break-all">
                  {activeProfile.projectId}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Firestore Database ID</span>
                <span className="font-mono font-bold text-[#1a73e8] text-xs break-all">
                  {activeProfile.databaseId || '(default)'}
                </span>
              </div>
            </div>

            {/* Quick Status on Touchpoints in this active DB */}
            <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  Current Collection (<code>p2c_touchpoints</code>):{' '}
                  <strong className="text-gray-900">{touchpointsCount} touchpoints</strong>
                </span>
              </div>

              {touchpointsCount === 0 && onSeedRequested && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSeedRequested();
                  }}
                  className="text-[11px] font-bold text-[#1a73e8] hover:underline cursor-pointer"
                >
                  Seed 300 Journeys to this DB
                </button>
              )}
            </div>
          </div>

          {/* Project Profiles Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Configured Project Environments ({profiles.length})
              </h3>

              {!isAddingNew && (
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a73e8] hover:text-[#174ea6] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect Another Project</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {profiles.map((prof) => {
                const isActive = prof.id === activeProfile.id;
                const isBusy = isSwitching && switchingTargetId === prof.id;

                return (
                  <div
                    key={prof.id}
                    onClick={() => !isActive && !isSwitching && handleSwitch(prof)}
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                      isActive
                        ? 'border-[#1a73e8] bg-[#f8fafd] ring-1 ring-[#1a73e8]/30 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isActive ? (
                          <div className="w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-gray-900 text-xs">{prof.name}</span>

                          {prof.isDefault && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                              AI Studio Default
                            </span>
                          )}

                          {prof.id.includes('secondary') && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#feefe3] text-[#b06000] border border-[#fddfc7]">
                              Root Database
                            </span>
                          )}

                          {!prof.isDefault && !prof.id.includes('secondary') && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                              Custom Target
                            </span>
                          )}
                        </div>

                        {prof.description && (
                          <p className="text-xs text-gray-500 leading-normal">{prof.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600 font-mono pt-1">
                          <span>
                            project: <strong className="text-gray-800">{prof.projectId}</strong>
                          </span>
                          <span>&middot;</span>
                          <span>
                            db:{' '}
                            <strong className="text-gray-800">
                              {prof.databaseId === '(default)' ? '(default)' : prof.databaseId ? `${prof.databaseId.slice(0, 24)}...` : '(default)'}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isActive ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#137333] bg-[#e6f4ea] border border-[#ceead6]">
                          Active Target
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isSwitching}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwitch(prof);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isBusy ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin text-[#1a73e8]" />
                              <span>Switching...</span>
                            </>
                          ) : (
                            <>
                              <span>Switch</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                            </>
                          )}
                        </button>
                      )}

                      {!prof.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(prof.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete this project profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connect Another Project Form */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateAndSwitch}
              className="p-4 rounded-xl border border-[#1a73e8]/30 bg-[#f8fafd] space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#1a73e8]" />
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Add New Firebase / Firestore Target
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Profile Name (Friendly)</label>
                  <input
                    type="text"
                    placeholder="e.g. Staging Environment / UIC Research"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Google Cloud / Firebase Project ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. cs-396-mvp-ayo or my-app-prod"
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Firestore Database ID</label>
                  <input
                    type="text"
                    placeholder="(default) or custom database name"
                    value={newDatabaseId}
                    onChange={(e) => setNewDatabaseId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Class testing or regional multi-touch dataset"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isFormTesting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isFormTesting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying &amp; Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save &amp; Switch Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#137333]" />
            <span>Config persists in local browser cache. Multi-app instances supported.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
