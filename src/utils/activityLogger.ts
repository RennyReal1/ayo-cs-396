import { ActivityEvent } from '../types';

const STORAGE_KEY = 'mira_activity_log';

export function getActivityLog(): ActivityEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read activity log from storage:', err);
  }

  // Initial event if empty
  const initial: ActivityEvent[] = [
    {
      id: 'init_1',
      user: 'Ayomide Rilwan',
      avatarColor: '#1a73e8',
      initials: 'AR',
      action: 'Initialized Google Mira Engine',
      category: 'Upload',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details: 'Connected to Firestore p2c_touchpoints database and synchronized live attribution models.',
    },
  ];
  return initial;
}

export function logActivity(
  action: string,
  category: 'Upload' | 'Snapshot' | 'AI' | 'Slides' | 'Attribution',
  details: string,
  user = 'Ayomide Rilwan',
  avatarColor = '#1a73e8',
  initials = 'AR'
): ActivityEvent[] {
  const current = getActivityLog();
  const newEvent: ActivityEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user,
    avatarColor,
    initials,
    action,
    category,
    timestamp: 'Just now',
    details,
  };

  const updated = [newEvent, ...current].slice(0, 50); // keep last 50 events
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }

  return updated;
}
