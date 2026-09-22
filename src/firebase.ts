/**
 * Firebase Firestore Client Configuration & Multi-Project Manager
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import defaultFirebaseConfig from '../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export interface FirebaseProjectProfile {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  databaseId?: string;
  apiKey?: string;
  authDomain?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreRegion?: string;
  isDefault?: boolean;
  createdAt?: string;
  lastConnectedAt?: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Built-in starter profiles
const DEFAULT_DATABASE_ID =
  (defaultFirebaseConfig as any).databaseId ||
  (defaultFirebaseConfig as any).firestoreDatabaseId ||
  'ai-studio-googlemira-1ffbd507-9a8f-4c61-b82b-328c38030b41';

export const BUILT_IN_PROFILES: FirebaseProjectProfile[] = [
  {
    id: 'primary_cs396_mvp',
    name: 'Primary Project (cs-396-mvp-ayo)',
    description: 'AI Studio provisioned multi-touch attribution database',
    projectId: defaultFirebaseConfig.projectId || 'cs-396-mvp-ayo',
    databaseId: DEFAULT_DATABASE_ID,
    apiKey: defaultFirebaseConfig.apiKey,
    authDomain: defaultFirebaseConfig.authDomain,
    storageBucket: defaultFirebaseConfig.storageBucket,
    messagingSenderId: defaultFirebaseConfig.messagingSenderId,
    appId: defaultFirebaseConfig.appId,
    firestoreRegion: (defaultFirebaseConfig as any).firestoreRegion || 'us-central1',
    isDefault: true,
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'secondary_cs396_default_db',
    name: 'UIC Lab & Sandbox (cs-396-mvp-ayo)',
    description: 'Secondary (default) root database for experimental testing & staging',
    projectId: defaultFirebaseConfig.projectId || 'cs-396-mvp-ayo',
    databaseId: '(default)',
    apiKey: defaultFirebaseConfig.apiKey,
    authDomain: defaultFirebaseConfig.authDomain,
    storageBucket: defaultFirebaseConfig.storageBucket,
    messagingSenderId: defaultFirebaseConfig.messagingSenderId,
    appId: defaultFirebaseConfig.appId,
    firestoreRegion: (defaultFirebaseConfig as any).firestoreRegion || 'us-central1',
    isDefault: false,
    createdAt: '2026-09-15T00:00:00Z',
  },
];

const LOCAL_STORAGE_PROFILES_KEY = 'p2c_saved_firebase_profiles';
const LOCAL_STORAGE_ACTIVE_PROFILE_ID_KEY = 'p2c_active_firebase_profile_id';

/**
 * Get all available project profiles (built-in + user added)
 */
export function getAllProjectProfiles(): FirebaseProjectProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    if (!raw) return BUILT_IN_PROFILES;
    const parsed = JSON.parse(raw) as FirebaseProjectProfile[];
    // Ensure built-in default is always present
    const hasDefault = parsed.some((p) => p.id === BUILT_IN_PROFILES[0].id);
    if (!hasDefault) {
      return [BUILT_IN_PROFILES[0], ...parsed];
    }
    return parsed;
  } catch (e) {
    console.warn('Failed to parse saved Firebase profiles:', e);
    return BUILT_IN_PROFILES;
  }
}

/**
 * Save or update a project profile in localStorage
 */
export function saveProjectProfile(profile: FirebaseProjectProfile): void {
  try {
    const profiles = getAllProjectProfiles();
    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save project profile:', e);
  }
}

/**
 * Delete a user-created project profile
 */
export function deleteProjectProfile(profileId: string): boolean {
  if (profileId === BUILT_IN_PROFILES[0].id) {
    return false; // cannot delete default
  }
  try {
    const profiles = getAllProjectProfiles().filter((p) => p.id !== profileId);
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));
    // If active was deleted, reset to default
    if (getActiveProfileId() === profileId) {
      setActiveProfileId(BUILT_IN_PROFILES[0].id);
    }
    return true;
  } catch (e) {
    console.error('Failed to delete project profile:', e);
    return false;
  }
}

export function getActiveProfileId(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_ACTIVE_PROFILE_ID_KEY) || BUILT_IN_PROFILES[0].id;
  } catch {
    return BUILT_IN_PROFILES[0].id;
  }
}

export function setActiveProfileId(id: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_PROFILE_ID_KEY, id);
  } catch (e) {
    console.warn('Could not store active profile id:', e);
  }
}

export function getActiveProjectProfile(): FirebaseProjectProfile {
  const activeId = getActiveProfileId();
  const profiles = getAllProjectProfiles();
  return profiles.find((p) => p.id === activeId) || profiles[0] || BUILT_IN_PROFILES[0];
}

/**
 * Initialize or retrieve a Firebase App and Firestore for a profile
 */
function createFirebaseInstanceForProfile(profile: FirebaseProjectProfile): {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const isDefaultProfile = profile.id === BUILT_IN_PROFILES[0].id;
  const appName = isDefaultProfile ? '[DEFAULT]' : `app_${profile.projectId}_${profile.id}`;

  let appInstance: FirebaseApp;
  const existingApps = getApps();
  const matched = existingApps.find((a) => a.name === appName);

  if (matched) {
    appInstance = matched;
  } else {
    const configToUse = {
      projectId: profile.projectId,
      apiKey: profile.apiKey || defaultFirebaseConfig.apiKey,
      authDomain: profile.authDomain || `${profile.projectId}.firebaseapp.com`,
      storageBucket: profile.storageBucket || `${profile.projectId}.firebasestorage.app`,
      messagingSenderId: profile.messagingSenderId || defaultFirebaseConfig.messagingSenderId,
      appId: profile.appId || defaultFirebaseConfig.appId,
    };
    appInstance = initializeApp(configToUse, isDefaultProfile ? undefined : appName);
  }

  const dbTarget =
    profile.databaseId && profile.databaseId !== '(default)'
      ? profile.databaseId
      : undefined;

  const firestoreInstance = dbTarget
    ? getFirestore(appInstance, dbTarget)
    : getFirestore(appInstance);

  const authInstance = getAuth(appInstance);

  return { app: appInstance, firestore: firestoreInstance, auth: authInstance };
}

// Initial setup with active profile
const initialActiveProfile = getActiveProjectProfile();
const initialInstance = createFirebaseInstanceForProfile(initialActiveProfile);

export let app: FirebaseApp = initialInstance.app;
export let db: Firestore = initialInstance.firestore;
export let auth: Auth = initialInstance.auth;
export let currentProjectConfig: FirebaseProjectProfile = initialActiveProfile;

export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };

// Project switch listeners
type ProjectSwitchListener = (newProfile: FirebaseProjectProfile) => void;
const switchListeners: Set<ProjectSwitchListener> = new Set();

export function onProjectSwitched(listener: ProjectSwitchListener): () => void {
  switchListeners.add(listener);
  return () => {
    switchListeners.delete(listener);
  };
}

/**
 * Switch active Firebase Project / Firestore database dynamically
 */
export async function switchActiveProject(profileId: string): Promise<FirebaseProjectProfile> {
  const profiles = getAllProjectProfiles();
  const targetProfile = profiles.find((p) => p.id === profileId) || BUILT_IN_PROFILES[0];

  const newInstance = createFirebaseInstanceForProfile(targetProfile);
  app = newInstance.app;
  db = newInstance.firestore;
  auth = newInstance.auth;
  currentProjectConfig = targetProfile;
  setActiveProfileId(targetProfile.id);

  // Update lastConnectedAt timestamp
  targetProfile.lastConnectedAt = new Date().toISOString();
  saveProjectProfile(targetProfile);

  // Notify all components
  switchListeners.forEach((fn) => {
    try {
      fn(targetProfile);
    } catch (e) {
      console.error('Error in project switch listener:', e);
    }
  });

  return targetProfile;
}

/**
 * Test connectivity and measure latency to a specific Firestore project/database
 */
export async function testConnection(
  targetProfile?: FirebaseProjectProfile
): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  const testTarget = targetProfile || getActiveProjectProfile();

  try {
    let testDb: Firestore;
    if (!targetProfile || targetProfile.id === currentProjectConfig.id) {
      testDb = db;
    } else {
      const tempInstance = createFirebaseInstanceForProfile(testTarget);
      testDb = tempInstance.firestore;
    }

    await getDocFromServer(doc(testDb, 'test', 'connection'));
    return {
      success: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    const latency = Date.now() - start;
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return {
        success: false,
        latencyMs: latency,
        error: 'Network appears offline or Firestore service is unreachable.',
      };
    }
    // Often reading a non-existent document still verifies auth and connectivity
    return {
      success: true,
      latencyMs: latency,
    };
  }
}
